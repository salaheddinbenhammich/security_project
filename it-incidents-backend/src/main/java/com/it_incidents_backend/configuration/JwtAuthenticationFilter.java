package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.security.UserPrincipal;
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
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

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

        try {
            String jwt = extractJwtFromRequest(request);

            logger.info("JWT Token: " + (jwt != null ? "Present" : "Missing"));
            //logger.info("JWT Token: {}", jwt != null ? "Present" : "Missing");

            if (jwt != null && jwtUtil.validateToken(jwt) && !jwtUtil.isTokenExpired(jwt)) {
                String username = jwtUtil.getUsernameFromToken(jwt);
                //String userIdStr = jwtUtil.getUserIdFromToken(jwt);
                //Long userId = Long.parseLong(userIdStr);
                UUID userId = jwtUtil.getUserIdFromToken(jwt);
                Role role = jwtUtil.getRoleFromToken(jwt);

                //logger.info("Extracted from JWT - Username: {}, UserId: {}, Role: {}", username, userId, role);
                logger.info("Extracted from JWT - Username: " + username
                        + ", UserId: " + userId
                        + ", Role: " + role);
                // Valider que userId n'est pas null
                if (userId == null) {
                    logger.error("UserId is null in JWT token");
                    filterChain.doFilter(request, response);
                    return;
                }

                // Create UserPrincipal with all user info
                UserPrincipal userPrincipal = new UserPrincipal(userId, username, role);

                // Create authentication token
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                userPrincipal.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Set authentication in security context
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
}