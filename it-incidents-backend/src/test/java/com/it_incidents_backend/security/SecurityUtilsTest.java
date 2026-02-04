package com.it_incidents_backend.security;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.security.UserPrincipal;
import com.it_incidents_backend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SecurityUtilsTest {

    private UUID testUserId;
    private String testUsername;
    private Role testRole;
    private UserPrincipal userPrincipal;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUsername = "testuser";
        testRole = Role.USER;

        userPrincipal = new UserPrincipal(testUserId, testUsername, testRole);
        authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal,
                null,
                userPrincipal.getAuthorities()
        );
    }

    @Test
    void whenGetUserId_withValidAuthentication_thenReturnsUserId() {
        UUID userId = SecurityUtils.getUserId(authentication);

        assertThat(userId).isEqualTo(testUserId);
    }

    @Test
    void whenGetUserId_withNullAuthentication_thenThrowsException() {
        assertThatThrownBy(() -> SecurityUtils.getUserId(null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not authenticated");
    }

    @Test
    void whenGetUserId_withNullPrincipal_thenThrowsException() {
        Authentication nullPrincipalAuth = new UsernamePasswordAuthenticationToken(null, null);

        assertThatThrownBy(() -> SecurityUtils.getUserId(nullPrincipalAuth))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not authenticated");
    }

    @Test
    void whenGetUserRole_withValidAuthentication_thenReturnsRole() {
        Role role = SecurityUtils.getUserRole(authentication);

        assertThat(role).isEqualTo(testRole);
    }

    @Test
    void whenGetUserRole_withAdminRole_thenReturnsAdmin() {
        UserPrincipal adminPrincipal = new UserPrincipal(testUserId, "admin", Role.ADMIN);
        Authentication adminAuth = new UsernamePasswordAuthenticationToken(
                adminPrincipal,
                null,
                adminPrincipal.getAuthorities()
        );

        Role role = SecurityUtils.getUserRole(adminAuth);

        assertThat(role).isEqualTo(Role.ADMIN);
    }

    @Test
    void whenGetUserRole_withNullAuthentication_thenThrowsException() {
        assertThatThrownBy(() -> SecurityUtils.getUserRole(null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not authenticated");
    }

    @Test
    void whenGetUsername_withValidAuthentication_thenReturnsUsername() {
        String username = SecurityUtils.getUsername(authentication);

        assertThat(username).isEqualTo(testUsername);
    }

    @Test
    void whenGetUsername_withNullAuthentication_thenThrowsException() {
        assertThatThrownBy(() -> SecurityUtils.getUsername(null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not authenticated");
    }

    @Test
    void whenGetUserPrincipal_withValidAuthentication_thenReturnsPrincipal() {
        UserPrincipal principal = SecurityUtils.getUserPrincipal(authentication);

        assertThat(principal).isNotNull();
        assertThat(principal.getUserId()).isEqualTo(testUserId);
        assertThat(principal.getUsername()).isEqualTo(testUsername);
        assertThat(principal.getRole()).isEqualTo(testRole);
    }

    @Test
    void whenGetUserPrincipal_withNullAuthentication_thenThrowsException() {
        assertThatThrownBy(() -> SecurityUtils.getUserPrincipal(null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not authenticated");
    }
}
