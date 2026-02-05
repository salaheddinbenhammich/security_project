package com.it_incidents_backend.security;

import com.it_incidents_backend.entities.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserPrincipalTest {

    private UUID testUserId;
    private String testUsername;
    private Role testRole;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUsername = "testuser";
        testRole = Role.USER;
        userPrincipal = new UserPrincipal(testUserId, testUsername, testRole);
    }

    @Test
    void whenCreateUserPrincipal_thenFieldsAreSet() {
        assertThat(userPrincipal.getUserId()).isEqualTo(testUserId);
        assertThat(userPrincipal.getUsername()).isEqualTo(testUsername);
        assertThat(userPrincipal.getRole()).isEqualTo(testRole);
    }

    @Test
    void whenGetAuthorities_thenReturnsCorrectRole() {
        Collection<? extends GrantedAuthority> authorities = userPrincipal.getAuthorities();

        assertThat(authorities).hasSize(1);
        assertThat(authorities.iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    void whenGetAuthorities_forAdmin_thenReturnsAdminRole() {
        UserPrincipal adminPrincipal = new UserPrincipal(testUserId, "admin", Role.ADMIN);

        Collection<? extends GrantedAuthority> authorities = adminPrincipal.getAuthorities();

        assertThat(authorities).hasSize(1);
        assertThat(authorities.iterator().next().getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    void whenGetPassword_thenReturnsNull() {
        assertThat(userPrincipal.getPassword()).isNull();
    }

    @Test
    void whenGetUsername_thenReturnsUsername() {
        assertThat(userPrincipal.getUsername()).isEqualTo(testUsername);
    }

    @Test
    void whenIsAccountNonExpired_thenReturnsTrue() {
        assertThat(userPrincipal.isAccountNonExpired()).isTrue();
    }

    @Test
    void whenIsAccountNonLocked_thenReturnsTrue() {
        assertThat(userPrincipal.isAccountNonLocked()).isTrue();
    }

    @Test
    void whenIsCredentialsNonExpired_thenReturnsTrue() {
        assertThat(userPrincipal.isCredentialsNonExpired()).isTrue();
    }

    @Test
    void whenIsEnabled_thenReturnsTrue() {
        assertThat(userPrincipal.isEnabled()).isTrue();
    }
}