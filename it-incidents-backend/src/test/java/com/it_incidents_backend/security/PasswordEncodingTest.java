package com.it_incidents_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests focused on password hashing behavior using BCryptPasswordEncoder.
 * 
 * Why this class exists:
 *   - Your project uses BCrypt to store passwords securely.
 *   - We want to make sure encoding + matching works correctly.
 *   - We also verify that even very long / special-character passwords are handled well.
 *   - Important for security module: wrong hashing = huge vulnerability.
 */
@DisplayName("Password Encoding – BCrypt behavior")
class PasswordEncodingTest {

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // We use the real encoder – no mocking here because we want to test actual crypto behavior
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    @DisplayName("Encoded password should never be equal to the raw password")
    void encodedPassword_shouldNeverMatchRawPassword() {
        String rawPassword = "MySuperSecurePass2026!";

        String encoded = passwordEncoder.encode(rawPassword);

        // Very important security property: hash should NEVER be reversible or equal to input
        assertThat(encoded).isNotEqualTo(rawPassword);
        assertThat(encoded).startsWith("$2"); // BCrypt prefix
        assertThat(encoded.length()).isGreaterThan(50); // typical BCrypt length
    }

    @Test
    @DisplayName("matches() should return true when correct password is provided")
    void matches_shouldSucceedWithCorrectPassword() {
        String raw = "Etudiant@2026Securite";
        String encoded = passwordEncoder.encode(raw);

        boolean matches = passwordEncoder.matches(raw, encoded);

        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("matches() should return false for wrong password")
    void matches_shouldFailWithIncorrectPassword() {
        String real = "correct123!";
        String wrong = "wrong456!";
        String encoded = passwordEncoder.encode(real);

        boolean matches = passwordEncoder.matches(wrong, encoded);

        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("Same password encoded twice should produce DIFFERENT hashes (salting)")
    void encodingSamePasswordTwice_shouldProduceDifferentResults() {
        String password = "repeatedPassword999";

        String hash1 = passwordEncoder.encode(password);
        String hash2 = passwordEncoder.encode(password);

        // This is the whole point of salting: same input → different output
        assertThat(hash1).isNotEqualTo(hash2);
        // But both should still match the original password
        assertThat(passwordEncoder.matches(password, hash1)).isTrue();
        assertThat(passwordEncoder.matches(password, hash2)).isTrue();
    }

    @Test
    @DisplayName("Very long password with many special characters should still work")
    void longComplexPassword_shouldBeCorrectlyHashedAndVerified() {
        // BCrypt has a 72-byte limit, so we use a long but valid password
        String longPassword = "P@ssw0rd!#$%^&*()_+-=[]{}|;'<>?abcdef1234567890";

        String encoded = passwordEncoder.encode(longPassword);

        assertThat(passwordEncoder.matches(longPassword, encoded)).isTrue();
        assertThat(passwordEncoder.matches(longPassword + "x", encoded)).isFalse();
    }

    @Test
    @DisplayName("Encoding performance should be reasonable (BCrypt is intentionally slow)")
    void encoding_shouldTakeReasonableTime() {
        String password = "performanceTest2026";

        long start = System.currentTimeMillis();
        passwordEncoder.encode(password);
        long duration = System.currentTimeMillis() - start;

        // BCrypt is designed to be slow (good against brute-force)
        // But it should not take crazy long in tests
        assertThat(duration).isLessThan(1000); // usually 100–400 ms on modern hardware
    }
}