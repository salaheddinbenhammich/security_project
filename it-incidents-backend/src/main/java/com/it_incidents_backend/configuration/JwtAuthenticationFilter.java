package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.repository.UserRepository;
import com.it_incidents_backend.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // Skip JWT filter for these paths
        return path.startsWith("/v3/api-docs") ||
                path.startsWith("/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.equals("/swagger-ui.html") ||
                path.startsWith("/api/auth") ||
                path.equals("/api/health");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        SecurityContextHolder.clearContext();

        try {
            String jwt = extractJwtFromRequest(request);

            logger.info("JWT Token: " + (jwt != null ? "Present" : "Missing"));

            if (jwt != null && jwtUtil.validateToken(jwt) && !jwtUtil.isTokenExpired(jwt)) {
                String username = jwtUtil.getUsernameFromToken(jwt);
                UUID userId = jwtUtil.getUserIdFromToken(jwt);
                Role role = jwtUtil.getRoleFromToken(jwt);

                logger.info("Extracted from JWT - Username: " + username
                        + ", UserId: " + userId
                        + ", Role: " + role);

                // Validate that userId is not null
                if (userId == null) {
                    logger.error("UserId is null in JWT token");
                    filterChain.doFilter(request, response);
                    return;
                }

                // ========== CRITICAL: VERIFY ACCOUNT STATUS ==========
                User user = userRepository.findById(userId).orElse(null);

                if (user == null) {
                    logger.warn("User not found in database: " + userId);
                    sendAccountDisabledResponse(response, "ACCOUNT_NOT_FOUND");
                    return;
                }

                // Check if account is deleted
                if (user.getDeleted() != null && user.getDeleted()) {
                    logger.warn("Account is deleted: " + username);
                    sendAccountDisabledResponse(response, "ACCOUNT_DELETED");
                    return;
                }

                // Check if account is disabled
                if (user.getEnabled() != null && !user.getEnabled()) {
                    logger.warn("Account is disabled: " + username);
                    sendAccountDisabledResponse(response, "ACCOUNT_DISABLED");
                    return;
                }

                // Check if account is locked
                if (user.getAccountNonLocked() != null && !user.getAccountNonLocked()) {
                    logger.warn("Account is locked: " + username);
                    sendAccountDisabledResponse(response, "ACCOUNT_LOCKED");
                    return;
                }

                // Check temporary lock (failed login attempts)
                if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
                    logger.warn("Account is temporarily locked: " + username);
                    sendAccountDisabledResponse(response, "ACCOUNT_LOCKED");
                    return;
                }

                // Check if account is approved (if your system requires approval)
                if (user.getIsApproved() != null && !user.getIsApproved()) {
                    logger.warn("Account is not approved: " + username);
                    sendAccountDisabledResponse(response, "ACCOUNT_NOT_APPROVED");
                    return;
                }

                // ========== ALL CHECKS PASSED - CREATE AUTHENTICATION ==========
                UserPrincipal userPrincipal = new UserPrincipal(userId, username, role);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                userPrincipal.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
            logger.error("JWT Authentication error: ", e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    /**
     * Send 403 response with specific error code
     */
    private void sendAccountDisabledResponse(HttpServletResponse response, String errorCode) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", errorCode);
        errorResponse.put("message", getErrorMessage(errorCode));

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }

    /**
     * Get human-readable error message
     */
    private String getErrorMessage(String errorCode) {
        return switch (errorCode) {
            case "ACCOUNT_DISABLED" -> "Your account has been disabled by an administrator";
            case "ACCOUNT_DELETED" -> "Your account has been deleted";
            case "ACCOUNT_LOCKED" -> "Your account has been locked";
            case "ACCOUNT_NOT_APPROVED" -> "Your account is pending approval";
            case "ACCOUNT_NOT_FOUND" -> "Account not found";
            default -> "Account access denied";
        };
    }
}