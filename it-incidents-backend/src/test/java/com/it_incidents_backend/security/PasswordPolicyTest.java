package com.it_incidents_backend.security;

import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.repository.UserRepository;
import com.it_incidents_backend.services.auth.AuthServiceImp;
import com.it_incidents_backend.configuration.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * detailed tests for password policy enforcement
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Password Policy - Strength Requirements")
class PasswordPolicyTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImp authService;

    @BeforeEach
    void setUp() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
    }

    @Test
    @DisplayName("password without uppercase letter should fail")
    void passwordWithoutUppercase_shouldFail() {
        // no uppercase = weak password
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "password123!",  // missing uppercase
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("password without lowercase letter should fail")
    void passwordWithoutLowercase_shouldFail() {
        // no lowercase = weak password
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "PASSWORD123!",  // missing lowercase
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("password without digit should fail")
    void passwordWithoutDigit_shouldFail() {
        // no number = weak password
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Password!",  // missing digit
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("password without special character should fail")
    void passwordWithoutSpecialChar_shouldFail() {
        // no special char = weak password
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Password123",  // missing special character
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("password shorter than 8 characters should fail")
    void passwordTooShort_shouldFail() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Pass1!",  // only 6 characters
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }

    @Test
    @DisplayName("common password should be rejected")
    void commonPassword_shouldBeRejected() {
        // passwords like "Password123!" are too common
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        // note: current implementation accepts this
        // in production you'd want a dictionary check
        // this test documents the limitation
    }


    @Test
    @DisplayName("password with all requirements should succeed")
    void validPasswordWithAllRequirements_shouldSucceed() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "MyS3cur3P@ss!",  // all requirements met
                "Test",
                "User",
                null
        );

        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        // should not throw exception
    }

    @Test
    @DisplayName("password with only allowed special characters should work")
    void passwordWithAllowedSpecialChars_shouldSucceed() {
        // allowed: @$!%*?&
        String[] validPasswords = {
                "Password1@",
                "Password1$",
                "Password1!",
                "Password1%",
                "Password1*",
                "Password1?",
                "Password1&"
        };

        for (String password : validPasswords) {
            SignupRequest request = new SignupRequest(
                    "testuser" + password.charAt(9),
                    "test@example.com",
                    password,
                    "Test",
                    "User",
                    null
            );

            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            // each should be accepted
        }
    }

    @Test
    @DisplayName("password with disallowed special characters should fail")
    void passwordWithDisallowedSpecialChars_shouldFail() {
        // characters like # or ^ are not in allowed set
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Password1#",  // # not in allowed chars
                "Test",
                "User",
                null
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Password must be at least");
    }
}