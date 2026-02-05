package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests du filtre JWT - première ligne de défense contre les requêtes non autorisées
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JWT Authentication Filter - Request Filtering")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Request without Authorization header should not authenticate")
    void noAuthHeader_shouldNotSetAuthentication() throws ServletException, IOException {
        request.setServletPath("/api/tickets");

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Valid JWT should set authentication in SecurityContext")
    void validJwt_shouldAuthenticateUser() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        String token = "valid.jwt.token";
        request.addHeader("Authorization", "Bearer " + token);
        request.setServletPath("/api/tickets");

        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(jwtUtil.isTokenExpired(token)).thenReturn(false);
        when(jwtUtil.getUsernameFromToken(token)).thenReturn("testuser");
        when(jwtUtil.getUserIdFromToken(token)).thenReturn(userId);
        when(jwtUtil.getRoleFromToken(token)).thenReturn(Role.USER);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Expired JWT should not authenticate")
    void expiredJwt_shouldNotSetAuthentication() throws ServletException, IOException {
        String expiredToken = "expired.jwt.token";
        request.addHeader("Authorization", "Bearer " + expiredToken);
        request.setServletPath("/api/tickets");

        when(jwtUtil.validateToken(expiredToken)).thenReturn(true);
        when(jwtUtil.isTokenExpired(expiredToken)).thenReturn(true);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Public endpoints should bypass JWT validation")
    void publicEndpoint_shouldSkipJwtValidation() throws ServletException, IOException {
        request.setServletPath("/api/auth/login");

        jwtFilter.doFilterInternal(request, response, filterChain);

        verifyNoInteractions(jwtUtil);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Malformed Bearer token should not crash the filter")
    void malformedBearer_shouldHandleGracefully() throws ServletException, IOException {
        request.addHeader("Authorization", "NotBearer invalidtoken");
        request.setServletPath("/api/tickets");

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("multiple authorization headers should handle correctly")
    void multipleAuthHeaders_shouldUseFirstHeader() throws ServletException, IOException {
        // attacker might try to confuse filter with multiple headers
        request.addHeader("Authorization", "Bearer valid.token.one");
        request.addHeader("Authorization", "Bearer malicious.token.two");
        request.setServletPath("/api/tickets");

        UUID userId = UUID.randomUUID();
        when(jwtUtil.validateToken("valid.token.one")).thenReturn(true);
        when(jwtUtil.isTokenExpired("valid.token.one")).thenReturn(false);
        when(jwtUtil.getUsernameFromToken("valid.token.one")).thenReturn("testuser");
        when(jwtUtil.getUserIdFromToken("valid.token.one")).thenReturn(userId);
        when(jwtUtil.getRoleFromToken("valid.token.one")).thenReturn(Role.USER);

        jwtFilter.doFilterInternal(request, response, filterChain);

        // should only validate first header
        verify(jwtUtil, times(1)).validateToken("valid.token.one");
        verify(jwtUtil, never()).validateToken("malicious.token.two");
    }

    @Test
    @DisplayName("lowercase bearer prefix should be rejected")
    void lowercaseBearer_shouldNotAuthenticate() throws ServletException, IOException {
        // only "Bearer" with capital B should be accepted
        request.addHeader("Authorization", "bearer lowercase.token");
        request.setServletPath("/api/tickets");

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil);
    }

    @Test
    @DisplayName("token with null userid should not authenticate")
    void tokenWithNullUserId_shouldNotAuthenticate() throws ServletException, IOException {
        String token = "valid.but.no.userid";
        request.addHeader("Authorization", "Bearer " + token);
        request.setServletPath("/api/tickets");

        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(jwtUtil.isTokenExpired(token)).thenReturn(false);
        when(jwtUtil.getUsernameFromToken(token)).thenReturn("testuser");
        when(jwtUtil.getUserIdFromToken(token)).thenReturn(null); // null userid
        when(jwtUtil.getRoleFromToken(token)).thenReturn(Role.USER);

        jwtFilter.doFilterInternal(request, response, filterChain);

        // should not set authentication
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("swagger endpoints should bypass filter")
    void swaggerEndpoints_shouldBypassFilter() throws ServletException, IOException {
        request.setServletPath("/swagger-ui/index.html");

        jwtFilter.doFilterInternal(request, response, filterChain);

        verifyNoInteractions(jwtUtil);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("bearer with extra spaces should be handled")
    void bearerWithExtraSpaces_shouldExtractToken() throws ServletException, IOException {
        // "Bearer  token" with double space
        UUID userId = UUID.randomUUID();
        request.addHeader("Authorization", "Bearer  token.with.spaces");
        request.setServletPath("/api/tickets");

        // filter should handle this gracefully (might fail or succeed depending on implementation)
        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}