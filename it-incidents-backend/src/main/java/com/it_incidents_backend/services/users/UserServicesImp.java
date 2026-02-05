package com.it_incidents_backend.services.users;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.dto.user.PasswordChangeRequest;
import com.it_incidents_backend.dto.user.UserCreateRequest;
import com.it_incidents_backend.dto.user.UserDetailResponse;
import com.it_incidents_backend.dto.user.UserResponse;
import com.it_incidents_backend.dto.user.UserSelfUpdateRequest;
import com.it_incidents_backend.dto.user.UserUpdateRequest;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.TicketMapper;
import com.it_incidents_backend.mapper.UserMapper;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.it_incidents_backend.util.SecurityUtils;

@Service
public class UserServicesImp implements UserServices {
    
    // ========== SECURITY: PASSWORD POLICY CONFIGURATION ==========
    /**
     * Password policy regex pattern
     * Requirements:
     * - Minimum 8 characters
     * - At least 1 uppercase letter (A-Z)
     * - At least 1 lowercase letter (a-z)
     * - At least 1 digit (0-9)
     * - At least 1 special character (@$!%*?&)
     * 
     * This prevents weak passwords like "password", "123456", "admin123"
     */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    // ========== DEPENDENCIES ==========
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;

    @Autowired
    public UserServicesImp(
            UserRepository userRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            TicketRepository ticketRepository,
            TicketMapper ticketMapper
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.ticketRepository = ticketRepository;
        this.ticketMapper = ticketMapper;
    }

    // ========== USER RETRIEVAL METHODS ==========

    /**
     * Get all users (paginated)
     * SECURITY: Only accessible by ADMIN (enforced in controller)
     */
    @Override
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return this.userRepository.findAll(pageable).map(userMapper::toResponseDto);
    }

    /**
     * Get user by ID with detailed information
     * SECURITY: Users can only view their own profile, admins can view all
     */
    @Override
    public UserDetailResponse getUserById(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return this.userMapper.toDetailDto(user);
    }

    // ========== USER CREATION METHOD ==========

    /**
     * Create new user (ADMIN only)
     * SECURITY: 
     * - Validates username and email uniqueness
     * - Enforces password policy
     * - Hashes password with BCrypt
     * - Sets secure defaults for account status
     */
    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest createUserRequest) {
        // ========== VALIDATION: CHECK DUPLICATE USERNAME ==========
        if (this.userRepository.existsByUsername(createUserRequest.username())) {
            throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
        }
        
        // ========== VALIDATION: CHECK DUPLICATE EMAIL ==========
        if (this.userRepository.existsByEmail(createUserRequest.email())) {
            throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
        }
        
        // ========== SECURITY: VALIDATE PASSWORD STRENGTH ==========
        if (!PASSWORD_PATTERN.matcher(createUserRequest.password()).matches()) {
            throw new AppException(
                    "Password must be at least 8 characters long and contain: " +
                    "1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (@$!%*?&)",
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // ========== CREATE USER ENTITY ==========
        User user = this.userMapper.toEntity(createUserRequest);
        
        // ========== SECURITY: HASH PASSWORD WITH BCRYPT ==========
        // BCrypt automatically generates a salt and hashes the password
        // The strength (12) is configured in SecurityConfig
        user.setPassword(passwordEncoder.encode(createUserRequest.password()));
        
        // ========== SECURITY: SET SECURE ACCOUNT DEFAULTS ==========
        user.setCredentialsNonExpired(true);   // Credentials don't expire
        user.setEnabled(true);                  // Account is active
        user.setAccountNonLocked(true);         // Account is not locked
        user.setDeleted(false);                 // Not soft-deleted
        user.setFailedLoginAttempts(0);         // No failed login attempts
        user.setPasswordChangedAt(LocalDateTime.now()); // Track password creation date
        
        // ========== SAVE USER ==========
        user = this.userRepository.save(user);
        
        return this.userMapper.toResponseDto(user);
    }

    // ========== PASSWORD UPDATE METHOD ==========

    /**
     * Update user password
     * SECURITY:
     * - Verifies current password before allowing change
     * - Enforces password policy on new password
     * - Prevents password reuse
     * - Resets failed login attempts on successful change
     * - Tracks password change timestamp
     */
    @Override
    @Transactional
    public void updatePassword(UUID id, PasswordChangeRequest passwordChangeRequest) {
        // ========== FIND USER ==========
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== SECURITY: VERIFY CURRENT PASSWORD ==========
        // This prevents unauthorized password changes
        // Even if someone steals a JWT token, they can't change the password without knowing it
        if (!passwordEncoder.matches(passwordChangeRequest.currentPassword(), user.getPassword())) {
            throw new AppException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        
        // ========== SECURITY: VALIDATE NEW PASSWORD STRENGTH ==========
        if (!PASSWORD_PATTERN.matcher(passwordChangeRequest.newPassword()).matches()) {
            throw new AppException(
                    "Password must be at least 8 characters long and contain: " +
                    "1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (@$!%*?&)",
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // ========== SECURITY: PREVENT PASSWORD REUSE ==========
        // User cannot use the same password they currently have
        if (passwordEncoder.matches(passwordChangeRequest.newPassword(), user.getPassword())) {
            throw new AppException(
                    "New password must be different from current password",
                    HttpStatus.BAD_REQUEST
            );
        }
        
        // ========== UPDATE PASSWORD ==========
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        
        // ========== SECURITY: RESET FAILED LOGIN ATTEMPTS ==========
        // After successful password change, reset any failed login attempts
        // This helps users who were locked out and changed their password
        user.resetFailedLoginAttempts();
        
        this.userRepository.save(user);
    }

    // ========== USER UPDATE METHODS ==========

    /**
     * Update user by admin
     * SECURITY:
     * - Admin can update any user
     * - Validates username and email uniqueness
     * - Cannot change password (use separate endpoint)
     */
    @Override
    @Transactional
    public void updateUserByAdmin(UUID id, UserUpdateRequest updateUserRequest) {
        // ========== FIND USER ==========
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== VALIDATION: CHECK USERNAME UNIQUENESS ==========
        if (updateUserRequest.username() != null && 
            !updateUserRequest.username().equals(user.getUsername())) {
            if (this.userRepository.existsByUsername(updateUserRequest.username())) {
                throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
            }
            user.setUsername(updateUserRequest.username());
        }
        
        // ========== VALIDATION: CHECK EMAIL UNIQUENESS ==========
        if (updateUserRequest.email() != null && 
            !updateUserRequest.email().equals(user.getEmail())) {
            if (this.userRepository.existsByEmail(updateUserRequest.email())) {
                throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(updateUserRequest.email());
        }
        
        // ========== UPDATE USER FIELDS ==========
        // MapStruct will only update non-null fields
        user = this.userMapper.partialUpdate(updateUserRequest, user);
        
        this.userRepository.save(user);
    }

    /**
     * Update user's own profile (self-update)
     * SECURITY:
     * - User can only update their own profile
     * - Cannot change role or account status
     * - Validates username and email uniqueness
     */
    @Override
    @Transactional
    public void updateUser(UUID id, UserSelfUpdateRequest userSelfUpdateRequest) {
        // ========== FIND USER ==========
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== VALIDATION: CHECK USERNAME UNIQUENESS ==========
        if (userSelfUpdateRequest.username() != null && 
            !userSelfUpdateRequest.username().equals(user.getUsername())) {
            if (this.userRepository.existsByUsername(userSelfUpdateRequest.username())) {
                throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
            }
            user.setUsername(userSelfUpdateRequest.username());
        }
        
        // ========== VALIDATION: CHECK EMAIL UNIQUENESS ==========
        if (userSelfUpdateRequest.email() != null && 
            !userSelfUpdateRequest.email().equals(user.getEmail())) {
            if (this.userRepository.existsByEmail(userSelfUpdateRequest.email())) {
                throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(userSelfUpdateRequest.email());
        }
        
        // ========== UPDATE USER FIELDS ==========
        // Only allows updating: username, email, firstName, lastName, phoneNumber
        // Cannot update: role, enabled, locked status (security limitation)
        user = this.userMapper.partialUpdate(userSelfUpdateRequest, user);
        
        this.userRepository.save(user);
    }

    // ========== USER DELETION METHOD ==========

    /**
     * Delete user (ADMIN only)
     * SECURITY: 
     * - Hard delete (can be changed to soft delete if needed)
     * - All user's tickets will be cascaded based on JPA configuration
     */
    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // ========== GET CURRENT ADMIN USERNAME ==========
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentAdminUsername = SecurityUtils.getUsername(authentication);

        // ========== SOFT DELETE ==========
        user.softDelete(currentAdminUsername);
        this.userRepository.save(user);
    }

    // ========== ACCOUNT MANAGEMENT METHODS ==========

    /**
     * Enable user account (ADMIN only)
     * SECURITY:
     * - Reactivates disabled account
     * - Unmarks soft-deleted accounts
     * - User can log in after this
     */
    @Override
    @Transactional
    public void enableUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== ENABLE ACCOUNT ==========
        user.setEnabled(true);          // Enable login
        user.setDeleted(false);         // Unmark as deleted
        
        this.userRepository.save(user);
    }

    /**
     * Disable user account (ADMIN only)
     * SECURITY:
     * - Prevents user from logging in
     * - Existing sessions remain valid until token expires
     * - Does not delete user data (soft disable)
     */
    @Override
    @Transactional
    public void disableUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== DISABLE ACCOUNT ==========
        user.setEnabled(false);         // Prevent login
        
        this.userRepository.save(user);
    }

    /**
     * Unlock user account (ADMIN only)
     * SECURITY:
     * - Resets failed login attempts counter
     * - Removes temporary lockout
     * - Unlocks permanently locked accounts
     * - User can attempt to log in immediately
     */
    @Override
    @Transactional
    public void unlockUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== UNLOCK ACCOUNT ==========
        // This method is defined in User entity
        // It sets: failedLoginAttempts = 0, lockedUntil = null
        user.resetFailedLoginAttempts();
        
        // Remove permanent lock
        user.setAccountNonLocked(true);
        
        this.userRepository.save(user);
    }

    // ========== USER TICKETS RETRIEVAL ==========

    /**
     * Get all tickets created by a user
     * SECURITY:
     * - ADMIN can view any user's tickets
     * - Returns DTO instead of entity to prevent circular references
     */
    @Override
    public List<TicketResponse> getUserTickets(UUID userId) {
        // ========== FIND USER ==========
        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // ========== GET USER'S TICKETS ==========
        List<Ticket> tickets = ticketRepository.findByCreatedByOrderByCreatedAtDesc(user);
        
        // ========== CONVERT TO DTO ==========
        // This prevents circular reference serialization issues
        // Ticket -> User -> Tickets -> User (infinite loop)
        // TicketResponse is a DTO that doesn't have bidirectional references
        return tickets.stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ========== HELPER METHODS ==========

    /**
     * Validate password strength (private helper)
     * Returns true if password meets all requirements
     */
    private boolean isPasswordStrong(String password) {
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}