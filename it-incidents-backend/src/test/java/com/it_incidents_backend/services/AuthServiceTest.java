package com.it_incidents_backend.services;

import com.it_incidents_backend.configuration.JwtUtil;
import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.RefreshTokenRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.repository.UserRepository;
import com.it_incidents_backend.services.auth.AuthServiceImp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.assertj.core.api.Assertions.assertThat;


import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * tests for authentication service - focuses on security vulnerabilities
 *
 * security concerns tested:
 *   - weak password validation (brute force protection)
 *   - account lockout after failed attempts (brute force protection)
 *   - disabled account login prevention
 *   - token generation and refresh security
 *   - credential validation
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Authentication Service - Security Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImp authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private RefreshTokenRequest refreshRequest;
    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        signupRequest = new SignupRequest(
                "testuser",
                "test@example.com",
                "StrongPass1!",  // Valid password: 8+ chars, uppercase, lowercase, digit, special char
                "Test",
                "User",
                "123456789"
        );

        loginRequest = new LoginRequest("testuser", "StrongPass1!");
        refreshRequest = new RefreshTokenRequest("valid.refresh.token");

        testUser = User.builder()
                .id(testUserId)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPass")
                .role(Role.USER)
                .enabled(true)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .build();
    }

    // ========== signup security tests ==========

    @Test
    @DisplayName("signup with valid data should create user and return tokens")
    void whenSignUp_withValidData_thenSuccess() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass1!")).thenReturn("encodedPass");

        // mock save to return user with id
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(testUserId);
            return savedUser;
        });

        when(jwtUtil.generateToken(eq("testuser"), eq(testUserId), eq(Role.USER)))
                .thenReturn("access.token");
        when(jwtUtil.generateRefreshToken(eq("testuser"), eq(testUserId)))
                .thenReturn("refresh.token");

        AuthResponse response = authService.signUp(signupRequest);

        assertThat(response.getToken()).isEqualTo("access.token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("signup with weak password should fail (brute force protection)")
    void whenSignUp_withWeakPassword_thenThrowsException() {
        SignupRequest weakPassRequest = new SignupRequest(
                "testuser",
                "test@example.com",
                "weak",  // Invalid: too short, no uppercase, no special char
                "Test",
                "User",
                "123456789"
        );

        assertThatThrownBy(() -> authService.signUp(weakPassRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("signup with existing username should fail")
    void whenSignUp_withExistingUsername_thenThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.signUp(signupRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Username is already taken");  // FIXED: matches actual message
    }

    @Test
    @DisplayName("signup with existing email should fail")
    void whenSignUp_withExistingEmail_thenThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signUp(signupRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Email is already registered");  // FIXED: matches actual message
    }

    // ========== authentication security tests ==========

    @Test
    @DisplayName("login with valid credentials should succeed")
    void whenAuthenticate_withValidCredentials_thenSuccess() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("access.token");
        when(jwtUtil.generateRefreshToken(anyString(), any(UUID.class)))
                .thenReturn("refresh.token");

        AuthResponse response = authService.authenticate(loginRequest);

        assertThat(response.getToken()).isEqualTo("access.token");
        assertThat(testUser.getFailedLoginAttempts()).isZero();
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    @DisplayName("login with invalid password should fail and increment failed attempts")
    void whenAuthenticate_withInvalidPassword_thenThrowsException() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid credentials");

        // verify failed attempts were incremented
        verify(userRepository).save(argThat(user ->
                user.getFailedLoginAttempts() > 0
        ));
    }

    @Test
    @DisplayName("account should lock after 5 failed login attempts (brute force protection)")
    void fiveFailedLogins_shouldLockAccount() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // simulate 5 failed login attempts
        for (int i = 0; i < 5; i++) {
            try {
                authService.authenticate(loginRequest);
            } catch (AppException e) {
                // expected exception
            }
        }

        // verify account is locked
        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(testUser.getLockedUntil()).isNotNull();
        assertThat(testUser.isAccountNonLocked()).isFalse();
    }

    @Test
    @DisplayName("successful login should reset failed attempts counter")
    void successfulLogin_shouldResetFailedAttempts() {
        testUser.setFailedLoginAttempts(3);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("token");
        when(jwtUtil.generateRefreshToken(anyString(), any(UUID.class)))
                .thenReturn("refresh");

        authService.authenticate(loginRequest);

        assertThat(testUser.getFailedLoginAttempts()).isZero();
        assertThat(testUser.getLockedUntil()).isNull();
    }

    @Test
    @DisplayName("disabled account should not be able to login (account security)")
    void disabledAccount_shouldNotAuthenticate() {
        testUser.setEnabled(false);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Account is disabled");
    }

    @Test
    @DisplayName("locked account should not be able to login (brute force protection)")
    void lockedAccount_shouldNotAuthenticate() {
        testUser.setAccountNonLocked(false);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Account is locked");
    }

    // ========== refresh token security tests ==========

    @Test
    @DisplayName("valid refresh token should generate new tokens")
    void whenRefreshToken_withValidToken_thenSuccess() {
        when(jwtUtil.validateToken("valid.refresh.token")).thenReturn(true);
        when(jwtUtil.isTokenExpired("valid.refresh.token")).thenReturn(false);  // ADDED: needed for validation
        when(jwtUtil.getTokenType("valid.refresh.token")).thenReturn("refresh");
        when(jwtUtil.getUsernameFromToken("valid.refresh.token")).thenReturn("testuser");
        when(jwtUtil.getUserIdFromToken("valid.refresh.token")).thenReturn(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));  // FIXED: uses findById not findByUsername
        when(jwtUtil.generateToken(eq("testuser"), eq(testUserId), eq(Role.USER)))
                .thenReturn("new.access.token");
        when(jwtUtil.generateRefreshToken(eq("testuser"), eq(testUserId)))
                .thenReturn("new.refresh.token");

        AuthResponse response = authService.refreshToken(refreshRequest);

        assertThat(response.getToken()).isEqualTo("new.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("new.refresh.token");
    }

    @Test
    @DisplayName("expired refresh token should be rejected (token security)")
    void whenRefreshToken_withExpiredToken_thenThrowsException() {
        when(jwtUtil.validateToken(anyString())).thenReturn(true);
        when(jwtUtil.isTokenExpired(anyString())).thenReturn(true);  // ADDED: token is expired

        assertThatThrownBy(() -> authService.refreshToken(refreshRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid or expired refresh token");
    }

    @Test
    @DisplayName("access token used as refresh token should be rejected (token type security)")
    void whenRefreshToken_withAccessToken_thenThrowsException() {
        when(jwtUtil.validateToken("valid.refresh.token")).thenReturn(true);
        when(jwtUtil.isTokenExpired("valid.refresh.token")).thenReturn(false);  // ADDED
        when(jwtUtil.getTokenType("valid.refresh.token")).thenReturn("access");

        assertThatThrownBy(() -> authService.refreshToken(refreshRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid token type");
    }

    // ========== sql injection and enumeration protection tests ==========

    @Test
    @DisplayName("sql injection attempt in login should not bypass authentication")
    void sqlInjectionInLogin_shouldNotBypassAuthentication() {
        // try classic sql injection payloads
        LoginRequest sqlInjectionRequest = new LoginRequest("admin' OR '1'='1", "anypassword");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticate(sqlInjectionRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid credentials");

        // verify repository was called with the malicious string as-is (parameterized queries protect us)
        verify(userRepository).findByUsernameOrEmail(eq("admin' OR '1'='1"), eq("admin' OR '1'='1"));
    }

    @Test
    @DisplayName("login with non-existent user should return same error as wrong password")
    void loginWithNonExistentUser_shouldReturnSameErrorAsWrongPassword() {
        // this prevents username enumeration attacks
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.empty());

        AppException exception = catchThrowableOfType(
                () -> authService.authenticate(loginRequest),
                AppException.class
        );

        // same generic message, doesn't reveal if user exists or not
        assertThat(exception.getMessage()).isEqualTo("Invalid credentials");
        assertThat(exception.getMessage()).doesNotContain("User not found");
        assertThat(exception.getMessage()).doesNotContain("username");
    }

    @Test
    @DisplayName("signup with password containing only spaces should fail")
    void signUpWithSpacesOnlyPassword_shouldFail() {
        SignupRequest spacesPassword = new SignupRequest(
                "testuser",
                "test@example.com",
                "        ",  // just spaces
                "Test",
                "User",
                "123456789"
        );

        assertThatThrownBy(() -> authService.signUp(spacesPassword))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("login should be case-insensitive for username")
    void loginWithDifferentCase_shouldWork() {
        // usernames should be treated case-insensitively to avoid confusion
        LoginRequest upperCaseLogin = new LoginRequest("TESTUSER", "StrongPass1!");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("access.token");
        when(jwtUtil.generateRefreshToken(anyString(), any(UUID.class)))
                .thenReturn("refresh.token");

        AuthResponse response = authService.authenticate(upperCaseLogin);

        assertThat(response).isNotNull();
        verify(userRepository).findByUsernameOrEmail("TESTUSER", "TESTUSER");
    }

    @Test
    @DisplayName("locked account should return error immediately without checking password")
    void lockedAccount_shouldFailBeforePasswordCheck() {
        // prevents timing attacks to discover valid usernames
        testUser.setAccountNonLocked(false);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Account is locked");

        // password check should never happen for locked account
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("disabled account should return error before password check")
    void disabledAccount_shouldFailBeforePasswordCheck() {
        // prevents timing attacks
        testUser.setEnabled(false);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Account is disabled");

        // password should not be checked for disabled accounts
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("soft deleted user should appear as non-existent")
    void softDeletedUser_shouldReturnInvalidCredentials() {
        // deleted users should appear as if they never existed
        testUser.setDeleted(true);

        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid credentials");

        // should not reveal that account was deleted
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("multiple rapid failed login attempts should all increment counter")
    void rapidFailedAttempts_shouldAllBeCountedIndependently() {
        // simulates concurrent attack attempts
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // rapid fire 3 failed attempts
        for (int i = 0; i < 3; i++) {
            try {
                authService.authenticate(loginRequest);
            } catch (AppException e) {
                // expected
            }
        }

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(3);
    }
}