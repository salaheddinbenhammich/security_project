package com.it_incidents_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordEncodingTest {

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void whenEncodePassword_thenPasswordIsHashed() {
        String rawPassword = "password123";

        String encodedPassword = passwordEncoder.encode(rawPassword);

        assertThat(encodedPassword).isNotEqualTo(rawPassword);
        assertThat(encodedPassword).startsWith("$2a$");
        assertThat(encodedPassword.length()).isGreaterThan(50);
    }

    @Test
    void whenEncodePassword_multipleTimes_thenDifferentHashes() {
        String rawPassword = "password123";

        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void whenMatchPassword_withCorrectPassword_thenReturnsTrue() {
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);

        assertThat(matches).isTrue();
    }

    @Test
    void whenMatchPassword_withIncorrectPassword_thenReturnsFalse() {
        String rawPassword = "password123";
        String wrongPassword = "wrongpassword";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        boolean matches = passwordEncoder.matches(wrongPassword, encodedPassword);

        assertThat(matches).isFalse();
    }

    @Test
    void whenEncodeEmptyPassword_thenHashIsCreated() {
        String emptyPassword = "";

        String encodedPassword = passwordEncoder.encode(emptyPassword);

        assertThat(encodedPassword).isNotEmpty();
        assertThat(passwordEncoder.matches(emptyPassword, encodedPassword)).isTrue();
    }

    @Test
    void whenEncodeLongPassword_thenHashIsCreated() {
        String longPassword = "a".repeat(100);

        String encodedPassword = passwordEncoder.encode(longPassword);

        assertThat(passwordEncoder.matches(longPassword, encodedPassword)).isTrue();
    }

    @Test
    void whenEncodeSpecialCharacters_thenHashIsCreated() {
        String specialPassword = "P@ssw0rd!#$%^&*()";

        String encodedPassword = passwordEncoder.encode(specialPassword);

        assertThat(passwordEncoder.matches(specialPassword, encodedPassword)).isTrue();
    }

    @Test
    void whenCompareHashPerformance_thenReasonableTime() {
        String password = "password123";
        String encoded = passwordEncoder.encode(password);

        long startTime = System.currentTimeMillis();
        passwordEncoder.matches(password, encoded);
        long endTime = System.currentTimeMillis();

        long duration = endTime - startTime;
        assertThat(duration).isLessThan(1000); // Should complete in less than 1 second
    }
}