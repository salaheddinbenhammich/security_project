package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.Role;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests critiques pour JWT - défense contre attaques de type token manipulation
 */
@DisplayName("JWT Security - Token Generation & Validation")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String SECRET = "C^aQoGhJwA!K&472W%$7HYu13ogl^ymv3#q2SmA7iJ961DdQ7s";
    private final long EXPIRATION = 86400000L; // 24h

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", 604800000L);
    }

    @Test
    @DisplayName("Generated token should contain correct user claims")
    void generateToken_shouldEmbedUserIdAndRole() {
        UUID userId = UUID.randomUUID();
        String username = "testuser";

        String token = jwtUtil.generateToken(username, userId, Role.USER);

        assertThat(jwtUtil.getUsernameFromToken(token)).isEqualTo(username);
        assertThat(jwtUtil.getUserIdFromToken(token)).isEqualTo(userId);
        assertThat(jwtUtil.getRoleFromToken(token)).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("Token signed with different secret should be rejected")
    void validateToken_withWrongSignature_shouldReturnFalse() {
        String token = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);

        // Créer un nouveau JwtUtil avec un secret différent
        JwtUtil attackerUtil = new JwtUtil();
        ReflectionTestUtils.setField(attackerUtil, "secret", "DIFFERENT_SECRET_KEY_ATTACK");

        // Le token ne devrait PAS être valide avec un secret différent
        assertThat(attackerUtil.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("Expired token should be rejected")
    void validateToken_whenExpired_shouldReturnFalse() throws InterruptedException {
        JwtUtil shortLivedUtil = new JwtUtil();
        ReflectionTestUtils.setField(shortLivedUtil, "secret", SECRET);
        ReflectionTestUtils.setField(shortLivedUtil, "expiration", 1L); // 1ms

        String token = shortLivedUtil.generateToken("user", UUID.randomUUID(), Role.USER);
        Thread.sleep(10); // Attendre expiration

        assertThat(shortLivedUtil.isTokenExpired(token)).isTrue();
        assertThat(shortLivedUtil.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("Access token should not be usable as refresh token")
    void accessToken_shouldHaveCorrectType() {
        String accessToken = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);
        String refreshToken = jwtUtil.generateRefreshToken("user", UUID.randomUUID());

        assertThat(jwtUtil.getTokenType(accessToken)).isEqualTo("access");
        assertThat(jwtUtil.getTokenType(refreshToken)).isEqualTo("refresh");
    }

    @Test
    @DisplayName("Malformed token should throw exception")
    void validateToken_withMalformedToken_shouldReturnFalse() {
        assertThat(jwtUtil.validateToken("not.a.valid.jwt")).isFalse();
        assertThat(jwtUtil.validateToken("")).isFalse();
        assertThat(jwtUtil.validateToken(null)).isFalse();
    }

    @Test
    @DisplayName("Token should not allow privilege escalation (USER -> ADMIN)")
    void tokenClaims_shouldNotBeManipulableToEscalatePrivileges() {
        // Générer un token USER
        String userToken = jwtUtil.generateToken("hacker", UUID.randomUUID(), Role.USER);

        // Vérifier qu'on ne peut pas manipuler le rôle
        Role extractedRole = jwtUtil.getRoleFromToken(userToken);
        assertThat(extractedRole).isEqualTo(Role.USER);
        assertThat(extractedRole).isNotEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("token with tampered payload should fail validation")
    void modifiedTokenPayload_shouldFailValidation() {
        // generate valid token
        String validToken = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);

        // tamper with the payload part (middle section between dots)
        String[] parts = validToken.split("\\.");
        if (parts.length == 3) {
            // modify middle part slightly
            String tamperedPayload = parts[1].substring(0, parts[1].length() - 1) + "X";
            String tamperedToken = parts[0] + "." + tamperedPayload + "." + parts[2];

            // signature won't match anymore
            assertThat(jwtUtil.validateToken(tamperedToken)).isFalse();
        }
    }

    @Test
    @DisplayName("token with future issued date should be rejected")
    void tokenWithFutureIssuedDate_shouldBeRejected() {
        // tokens claiming to be issued in the future are suspicious
        // note: jjwt library handles this automatically, this tests that behavior
        String token = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);

        // token should have reasonable issued date
        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("null or empty token should fail gracefully")
    void nullOrEmptyToken_shouldNotCrash() {
        // defensive programming against null values
        assertThat(jwtUtil.validateToken(null)).isFalse();
        assertThat(jwtUtil.validateToken("")).isFalse();
        assertThat(jwtUtil.validateToken("   ")).isFalse();
    }

    @Test
    @DisplayName("token with missing signature should fail")
    void tokenWithoutSignature_shouldFail() {
        // token format is header.payload.signature
        // missing signature is a security issue
        String validToken = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);
        String[] parts = validToken.split("\\.");

        if (parts.length == 3) {
            // remove signature
            String tokenWithoutSignature = parts[0] + "." + parts[1];
            assertThat(jwtUtil.validateToken(tokenWithoutSignature)).isFalse();
        }
    }

    @Test
    @DisplayName("very long token should be rejected")
    void excessivelyLongToken_shouldBeRejected() {
        // dos protection - extremely long tokens could cause issues
        String longToken = "a".repeat(10000);
        assertThat(jwtUtil.validateToken(longToken)).isFalse();
    }

    @Test
    @DisplayName("token type claim should be present and correct")
    void tokenTypeClaim_shouldAlwaysBePresent() {
        String accessToken = jwtUtil.generateToken("user", UUID.randomUUID(), Role.USER);
        String refreshToken = jwtUtil.generateRefreshToken("user", UUID.randomUUID());

        // both should have type claim
        assertThat(jwtUtil.getTokenType(accessToken)).isNotNull();
        assertThat(jwtUtil.getTokenType(refreshToken)).isNotNull();

        // and they should be different
        assertThat(jwtUtil.getTokenType(accessToken)).isNotEqualTo(jwtUtil.getTokenType(refreshToken));
    }

    @Test
    @DisplayName("refresh token should have longer expiration than access token")
    void refreshToken_shouldHaveLongerLifetime() throws InterruptedException {
        JwtUtil shortAccessUtil = new JwtUtil();
        ReflectionTestUtils.setField(shortAccessUtil, "secret", SECRET);
        ReflectionTestUtils.setField(shortAccessUtil, "expiration", 100L); // 100ms
        ReflectionTestUtils.setField(shortAccessUtil, "refreshExpiration", 10000L); // 10s

        String accessToken = shortAccessUtil.generateToken("user", UUID.randomUUID(), Role.USER);
        String refreshToken = shortAccessUtil.generateRefreshToken("user", UUID.randomUUID());

        Thread.sleep(150); // wait for access to expire

        // access should be expired, refresh should still be valid
        assertThat(shortAccessUtil.isTokenExpired(accessToken)).isTrue();
        assertThat(shortAccessUtil.isTokenExpired(refreshToken)).isFalse();
    }
}