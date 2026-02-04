package com.it_incidents_backend.service;

import com.it_incidents_backend.configuration.JwtUtil;
import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.repository.UserRepository;
import com.it_incidents_backend.services.auth.AuthServiceImp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImp authService;

    private User testUser;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        testUser = User.builder()
                .id(testUserId)
                .username("testuser")
                .email("test@example.com")
                .password("$2a$10$hashedPassword")
                .firstName("Test")
                .lastName("User")
                .role(Role.USER)
                .enabled(true)
                .deleted(false)
                .build();

        loginRequest = new LoginRequest("testuser", "password123");

        signupRequest = new SignupRequest(
                "newuser",
                "new@example.com",
                "password123",
                "New",
                "User",
                "+1234567890"
        );
    }

    @Test
    void whenAuthenticate_withValidCredentials_thenReturnsAuthResponse() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("mock.jwt.token");
        when(userRepository.save(any(User.class)))
                .thenReturn(testUser);

        AuthResponse response = authService.authenticate(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo(Role.USER);

        verify(userRepository, times(1)).findByUsernameOrEmail(anyString(), anyString());
        verify(passwordEncoder, times(1)).matches(anyString(), anyString());
        verify(jwtUtil, times(1)).generateToken(anyString(), any(UUID.class), any(Role.class));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void whenAuthenticate_withInvalidUsername_thenThrowsException() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid credentials");

        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void whenAuthenticate_withInvalidPassword_thenThrowsException() {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(false);

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid credentials");

        verify(jwtUtil, never()).generateToken(anyString(), any(UUID.class), any(Role.class));
    }

    @Test
    void whenSignUp_withValidData_thenCreatesUserAndReturnsAuthResponse() {
        when(passwordEncoder.encode(anyString()))
                .thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class)))
                .thenReturn(testUser);
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("mock.jwt.token");

        AuthResponse response = authService.signUp(signupRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getRole()).isEqualTo(Role.USER);

        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtil, times(1)).generateToken(anyString(), any(UUID.class), any(Role.class));
    }

    @Test
    void whenSignUp_thenPasswordIsHashed() {
        when(passwordEncoder.encode(anyString()))
                .thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("mock.jwt.token");

        authService.signUp(signupRequest);

        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    void whenSignUp_thenUserRoleIsUSER() {
        when(passwordEncoder.encode(anyString()))
                .thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User savedUser = invocation.getArgument(0);
                    assertThat(savedUser.getRole()).isEqualTo(Role.USER);
                    return savedUser;
                });
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("mock.jwt.token");

        authService.signUp(signupRequest);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void whenSignUp_thenUserIsEnabled() {
        when(passwordEncoder.encode(anyString()))
                .thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User savedUser = invocation.getArgument(0);
                    assertThat(savedUser.getEnabled()).isTrue();
                    return savedUser;
                });
        when(jwtUtil.generateToken(anyString(), any(UUID.class), any(Role.class)))
                .thenReturn("mock.jwt.token");

        authService.signUp(signupRequest);

        verify(userRepository, times(1)).save(any(User.class));
    }
}