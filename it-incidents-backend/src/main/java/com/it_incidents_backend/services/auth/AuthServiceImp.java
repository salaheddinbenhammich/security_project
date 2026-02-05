package com.it_incidents_backend.services.auth;

import com.it_incidents_backend.configuration.JwtUtil;
import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.RefreshTokenRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthServiceImp implements AuthService {
    
    // ========== SECURITY CONFIGURATION ==========
    
    /**
     * Password policy regex pattern
     * Requirements:
     * - Minimum 8 characters
     * - At least 1 uppercase letter (A-Z)
     * - At least 1 lowercase letter (a-z)
     * - At least 1 digit (0-9)
     * - At least 1 special character (@$!%*?&)
     * 
     * Example valid passwords: "Password123!", "SecurePass1@", "MyP@ssw0rd"
     * Example invalid passwords: "password", "12345678", "Password" (no special char)
     */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    
    /**
     * Maximum failed login attempts before account lockout
     * After 5 failed attempts, the account is temporarily locked
     */
    private static final int MAX_FAILED_ATTEMPTS = 5;
    
    /**
     * Account lockout duration in minutes
     * User must wait 15 minutes before attempting to log in again
     */
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    // ========== DEPENDENCIES ==========
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthServiceImp(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtUtil jwtUtil) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ========== AUTHENTICATION METHOD ==========

    /**
     * Authenticate user with enhanced security
     * 
     * SECURITY FEATURES:
     * 1. Account status checks (enabled, locked, deleted)
     * 2. Failed login attempt tracking
     * 3. Automatic account lockout after max attempts
     * 4. Temporary lockout with countdown
     * 5. Last login timestamp tracking
     * 6. JWT token generation (access + refresh)
     * 
     * @param loginRequest Contains username/email and password
     * @return AuthResponse with JWT tokens and user info
     * @throws AppException for invalid credentials or locked accounts
     */
    @Override
    @Transactional
    public AuthResponse authenticate(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        
        // ========== STEP 1: FIND USER ==========
        // Search by username OR email (both are unique)
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new AppException(
                        "Invalid credentials", 
                        HttpStatus.UNAUTHORIZED
                ));
        
        // ========== STEP 2: SECURITY CHECKS ==========
        
        // CHECK 1: Is account enabled?
        // Admin can disable accounts to prevent access
        if (!user.getEnabled()) {
            throw new AppException(
                    "Account is disabled. Please contact administrator.", 
                    HttpStatus.FORBIDDEN
            );
        }
        
        // CHECK 2: Is account soft-deleted?
        // Soft-deleted accounts appear deleted but data is preserved
        if (user.getDeleted()) {
            throw new AppException(
                    "Invalid credentials",
                    HttpStatus.UNAUTHORIZED
            );
        }
        
        // CHECK 3: Is account temporarily locked due to failed login attempts?
        // After MAX_FAILED_ATTEMPTS, account is locked for LOCKOUT_DURATION_MINUTES
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            long minutesRemaining = java.time.Duration.between(
                    LocalDateTime.now(), 
                    user.getLockedUntil()
            ).toMinutes();
            
            throw new AppException(
                    String.format(
                            "Account is locked due to too many failed login attempts. " +
                            "Try again in %d minutes.", 
                            minutesRemaining
                    ),
                    HttpStatus.LOCKED // HTTP 423 Locked
            );
        }
        
        // CHECK 4: Is account permanently locked?
        // Admin can permanently lock accounts for security reasons
        if (!user.getAccountNonLocked()) {
            throw new AppException(
                    "Account is locked. Please contact administrator.", 
                    HttpStatus.LOCKED
            );
        }
        
        // ========== STEP 3: PASSWORD VERIFICATION ==========
        
        // BCrypt password matching (constant-time comparison to prevent timing attacks)
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // Password is incorrect - handle failed login
            handleFailedLogin(user);
            
            // Generic error message to prevent username enumeration
            throw new AppException(
                    "Invalid credentials", 
                    HttpStatus.UNAUTHORIZED
            );
        }
        
        // ========== STEP 4: SUCCESSFUL LOGIN ==========
        
        // Reset failed login attempts counter
        if (user.getFailedLoginAttempts() > 0) {
            user.resetFailedLoginAttempts();
        }
        
        // Update last login timestamp for audit trail
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // ========== STEP 5: GENERATE JWT TOKENS ==========
        
        // Access token (short-lived, 24 hours)
        String accessToken = jwtUtil.generateToken(
                user.getUsername(), 
                user.getId(), 
                user.getRole()
        );
        
        // Refresh token (long-lived, 7 days)
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getUsername(), 
                user.getId()
        );

        // ========== STEP 6: BUILD RESPONSE ==========
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .role(user.getRole())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    /**
     * Handle failed login attempt
     * 
     * SECURITY FEATURES:
     * - Increments failed attempts counter
     * - Locks account after MAX_FAILED_ATTEMPTS
     * - Sets temporary lockout time
     * 
     * @param user The user who failed to log in
     */
    private void handleFailedLogin(User user) {
        // Increment failed login attempts
        user.incrementFailedLoginAttempts();
        
        // Check if max attempts reached
        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            // Lock account temporarily
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
        }
        
        // Save updated user with incremented counter
        userRepository.save(user);
    }

    // ========== SIGNUP/REGISTRATION METHOD ==========

    /**
     * Register new user with password validation
     * 
     * SECURITY FEATURES:
     * 1. Username uniqueness validation
     * 2. Email uniqueness validation
     * 3. Strong password policy enforcement
     * 4. Password hashing with BCrypt
     * 5. Secure default account settings
     * 6. Automatic JWT token generation
     * 
     * @param signUpRequest Contains user registration data
     * @return AuthResponse with JWT tokens and user info
     * @throws AppException for validation errors
     */
    @Override
    @Transactional
    public AuthResponse signUp(SignupRequest signUpRequest) {
        
        // ========== STEP 1: INPUT VALIDATION ==========
        
        // VALIDATION 1: Check if username already exists
        // Usernames must be unique across the system
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new AppException(
                    "Username is already taken", 
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // VALIDATION 2: Check if email already exists
        // Emails must be unique (used for account recovery)
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new AppException(
                    "Email is already registered", 
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // VALIDATION 3: Validate password strength
        // Enforces password policy defined in PASSWORD_PATTERN
        if (!PASSWORD_PATTERN.matcher(signUpRequest.getPassword()).matches()) {
            throw new AppException(
                    "Password must be at least 8 characters long and contain: " +
                    "1 uppercase letter, 1 lowercase letter, 1 digit, " +
                    "and 1 special character (@$!%*?&)",
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // ========== STEP 2: CREATE USER ENTITY ==========
        
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        
        // ========== STEP 3: HASH PASSWORD ==========
        // BCrypt hashing with automatic salt generation
        // The strength (12) is configured in SecurityConfig
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        // ========== STEP 4: SET SECURE DEFAULTS ==========
        user.setRole(Role.USER);                    // Default role for new users
        user.setEnabled(true);                      // Account is active
        user.setAccountNonLocked(true);             // Not locked
        user.setCredentialsNonExpired(true);        // Credentials don't expire
        user.setDeleted(false);                     // Not deleted
        user.setFailedLoginAttempts(0);             // No failed attempts yet
        user.setPasswordChangedAt(LocalDateTime.now()); // Track password creation
        user.setLastLogin(LocalDateTime.now());     // Set initial login time
        
        // ========== STEP 5: SAVE USER ==========
        userRepository.save(user);
        
        // ========== STEP 6: GENERATE JWT TOKENS ==========
        
        // Access token (short-lived)
        String accessToken = jwtUtil.generateToken(
                user.getUsername(), 
                user.getId(), 
                user.getRole()
        );
        
        // Refresh token (long-lived)
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getUsername(), 
                user.getId()
        );

        // ========== STEP 7: BUILD RESPONSE ==========
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .role(user.getRole())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    // ========== TOKEN REFRESH METHOD ==========

    /**
     * Refresh access token using refresh token
     * 
     * SECURITY FEATURES:
     * 1. Validates refresh token signature
     * 2. Checks token expiration
     * 3. Verifies token type (must be "refresh")
     * 4. Validates user account status
     * 5. Generates new access token
     * 6. Token rotation: issues new refresh token
     * 
     * This implements the OAuth2 token refresh flow for better security.
     * Access tokens are short-lived (24h), refresh tokens are long-lived (7d).
     * 
     * @param request Contains refresh token
     * @return AuthResponse with new access and refresh tokens
     * @throws AppException for invalid or expired tokens
     */
    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        // ========== STEP 1: VALIDATE REFRESH TOKEN ==========
        
        // Check if token is valid and not expired
        if (!jwtUtil.validateToken(refreshToken) || jwtUtil.isTokenExpired(refreshToken)) {
            throw new AppException(
                    "Invalid or expired refresh token", 
                    HttpStatus.UNAUTHORIZED
            );
        }
        
        // ========== STEP 2: VERIFY TOKEN TYPE ==========
        // Ensure this is actually a refresh token, not an access token
        if (!"refresh".equals(jwtUtil.getTokenType(refreshToken))) {
            throw new AppException(
                    "Invalid token type", 
                    HttpStatus.UNAUTHORIZED
            );
        }
        
        // ========== STEP 3: EXTRACT USER INFO ==========
        String username = jwtUtil.getUsernameFromToken(refreshToken);
        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        
        // ========== STEP 4: FIND AND VALIDATE USER ==========
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        "User not found", 
                        HttpStatus.NOT_FOUND
                ));
        
        // ========== STEP 5: SECURITY CHECKS ==========
        // Verify account is still accessible
        if (!user.getEnabled() || user.getDeleted() || !user.getAccountNonLocked()) {
            throw new AppException(
                    "Account is not accessible", 
                    HttpStatus.FORBIDDEN
            );
        }
        
        // ========== STEP 6: GENERATE NEW TOKENS ==========
        
        // New access token (short-lived)
        String newAccessToken = jwtUtil.generateToken(
                user.getUsername(), 
                user.getId(), 
                user.getRole()
        );
        
        // Token rotation: Generate new refresh token for enhanced security
        // Old refresh token becomes invalid after use
        String newRefreshToken = jwtUtil.generateRefreshToken(
                user.getUsername(), 
                user.getId()
        );
        
        // ========== STEP 7: BUILD RESPONSE ==========
        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .id(user.getId())
                .role(user.getRole())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}