package com.it_incidents_backend.security;

import com.it_incidents_backend.configuration.JwtUtil;
import com.it_incidents_backend.entities.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "test-secret-key-for-testing-purposes-only-minimum-256-bits-required-for-hs256";
    private final long testExpiration = 3600000L; // 1 hour
    private UUID testUserId;
    private String testUsername;
    private Role testRole;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", testSecret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", testExpiration);

        testUserId = UUID.randomUUID();
        testUsername = "testuser";
        testRole = Role.USER;
    }

    @Test
    void whenGenerateToken_thenTokenIsCreated() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    void whenGenerateToken_thenContainsCorrectClaims() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.getSubject()).isEqualTo(testUsername);
        assertThat(claims.get("userId", String.class)).isEqualTo(testUserId.toString());
        assertThat(claims.get("role", String.class)).isEqualTo(testRole.name());
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
    }

    @Test
    void whenExtractUsername_thenCorrectUsernameReturned() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        String extractedUsername = jwtUtil.getUsernameFromToken(token);

        assertThat(extractedUsername).isEqualTo(testUsername);
    }

    @Test
    void whenExtractUserId_thenCorrectUserIdReturned() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        UUID extractedUserId = jwtUtil.getUserIdFromToken(token);

        assertThat(extractedUserId).isEqualTo(testUserId);
    }

    @Test
    void whenExtractRole_thenCorrectRoleReturned() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        Role extractedRole = jwtUtil.getRoleFromToken(token);

        assertThat(extractedRole).isEqualTo(testRole);
    }

    @Test
    void whenValidateToken_withValidToken_thenReturnsTrue() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        boolean isValid = jwtUtil.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void whenValidateToken_withInvalidToken_thenReturnsFalse() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtUtil.validateToken(invalidToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void whenValidateToken_withTamperedToken_thenReturnsFalse() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);
        String tamperedToken = token.substring(0, token.length() - 10) + "tampered";

        boolean isValid = jwtUtil.validateToken(tamperedToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void whenIsTokenExpired_withValidToken_thenReturnsFalse() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        boolean isExpired = jwtUtil.isTokenExpired(token);

        assertThat(isExpired).isFalse();
    }

    @Test
    void whenIsTokenExpired_withExpiredToken_thenReturnsTrue() {
        // Create expired token (expiration in the past)
        JwtUtil expiredJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(expiredJwtUtil, "secret", testSecret);
        ReflectionTestUtils.setField(expiredJwtUtil, "expiration", -1000L); // Negative = expired

        String expiredToken = expiredJwtUtil.generateToken(testUsername, testUserId, testRole);

        boolean isExpired = jwtUtil.isTokenExpired(expiredToken);

        assertThat(isExpired).isTrue();
    }

    @Test
    void whenGenerateTokenForAdmin_thenRoleIsAdmin() {
        String token = jwtUtil.generateToken("admin", testUserId, Role.ADMIN);

        Role extractedRole = jwtUtil.getRoleFromToken(token);

        assertThat(extractedRole).isEqualTo(Role.ADMIN);
    }

    @Test
    void whenGenerateMultipleTokens_thenEachIsUnique() {
        String token1 = jwtUtil.generateToken(testUsername, testUserId, testRole);

        try {
            Thread.sleep(10); // Ensure different timestamp
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String token2 = jwtUtil.generateToken(testUsername, testUserId, testRole);

        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void whenTokenExpirationTime_thenMatchesConfiguration() {
        String token = jwtUtil.generateToken(testUsername, testUserId, testRole);

        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        long actualExpiration = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();

        assertThat(actualExpiration).isEqualTo(testExpiration);
    }
}