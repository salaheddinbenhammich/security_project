package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Refresh token has longer expiration (7 days)
    @Value("${jwt.refresh-expiration:604800000}") // Default: 7 days
    private long refreshExpiration;

    /**
     * Generate signing key from secret
     * - Uses HMAC-SHA algorithm for JWT signing
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate access token (short-lived)
     * - Contains user identity and role
     * - Expires in 24 hours by default
     */
    public String generateToken(String username, UUID userId, Role role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId.toString())
                .claim("role", role.name())
                .claim("type", "access") // Token type
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Generate refresh token (long-lived)
     * - Used to obtain new access tokens
     * - Expires in 7 days by default
     */
    public String generateRefreshToken(String username, UUID userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId.toString())
                .claim("type", "refresh") // Token type
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract username from token
     */
    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract userId from token
     */
    public UUID getUserIdFromToken(String token) {
        String userIdStr = getClaims(token).get("userId", String.class);
        return userIdStr != null ? UUID.fromString(userIdStr) : null;
    }

    /**
     * Extract role from token
     */
    public Role getRoleFromToken(String token) {
        String roleName = getClaims(token).get("role", String.class);
        return Role.valueOf(roleName);
    }

    /**
     * Get token type (access or refresh)
     */
    public String getTokenType(String token) {
        return getClaims(token).get("type", String.class);
    }

    /**
     * Validate token
     * - Checks signature, expiration, and structure
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    /**
     * Extract all claims from token
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}