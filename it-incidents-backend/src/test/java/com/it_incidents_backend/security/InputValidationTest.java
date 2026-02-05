package com.it_incidents_backend.security;

import com.it_incidents_backend.dto.auth.SignupRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * tests for input validation - protection against xss, injection, and malformed data
 */
@DisplayName("Input Validation - XSS and Injection Protection")
class InputValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("xss attempt in username should be rejected")
    void xssInUsername_shouldBeRejected() {
        // script tags should not be allowed in username
        SignupRequest request = new SignupRequest(
                "<script>alert('xss')</script>",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        // should violate pattern constraint (assuming improved signuprequest)
        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("excessively long username should be rejected")
    void excessivelyLongUsername_shouldBeRejected() {
        // dos protection - very long usernames
        String longUsername = "a".repeat(500);

        SignupRequest request = new SignupRequest(
                longUsername,
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations.iterator().next().getMessage())
                .contains("Username must be between 3 and 20 characters");
    }

    @Test
    @DisplayName("excessively long email should be rejected")
    void excessivelyLongEmail_shouldBeRejected() {
        String longEmail = "a".repeat(200) + "@example.com";

        SignupRequest request = new SignupRequest(
                "testuser",
                longEmail,
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("email with multiple @ symbols should be rejected")
    void malformedEmailMultipleAt_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("email without @ should be rejected")
    void emailWithoutAt_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "notanemail.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("username with spaces should be rejected")
    void usernameWithSpaces_shouldBeRejected() {
        // usernames should not contain spaces
        SignupRequest request = new SignupRequest(
                "test user",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        // assuming improved signuprequest with pattern validation
        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("username starting with number should be rejected")
    void usernameStartingWithNumber_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "123user",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("username with special characters should be rejected")
    void usernameWithSpecialChars_shouldBeRejected() {
        // only alphanumeric and underscore allowed
        SignupRequest request = new SignupRequest(
                "user@123",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("sql injection in email should be rejected by format validation")
    void sqlInjectionInEmail_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "admin' OR '1'='1'@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        // email format validation should catch this
        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("html entities in firstname should be rejected")
    void htmlEntitiesInFirstname_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "testuser",
                "test@example.com",
                "Password123!",
                "&lt;script&gt;",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        // pattern should reject special characters
        assertThat(violations).isNotEmpty();
    }

    @Test
    @DisplayName("null bytes in username should be rejected")
    void nullByteInUsername_shouldBeRejected() {
        SignupRequest request = new SignupRequest(
                "test\u0000user",
                "test@example.com",
                "Password123!",
                "Test",
                "User",
                null
        );

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
    }
}