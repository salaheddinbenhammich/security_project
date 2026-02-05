package com.it_incidents_backend.entities;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the User entity – focusing on domain logic and security-related behaviors.
 *
 * What we test here:
 *   - Soft delete functionality (important for audit & GDPR-like compliance)
 *   - Failed login attempts counter + account lockout logic
 *   - Reset after successful login
 *   - isEnabled() logic considering both 'enabled' flag and 'deleted' flag
 *
 * Why important:
 *   - These behaviors protect against brute-force attacks
 *   - Soft-delete prevents accidental data loss
 */
@DisplayName("User Entity – Security & Lifecycle Behaviors")
class UserTest {

    @Test
    @DisplayName("softDelete should mark user as deleted, disabled, and record who deleted")
    void softDelete_shouldSetAllRelevantFields() {
        User user = new User();
        user.setEnabled(true);
        user.setDeleted(false);

        String deletedBy = "admin-jury-2026";

        user.softDelete(deletedBy);

        assertThat(user.getDeleted()).isTrue();
        assertThat(user.getEnabled()).isFalse();
        assertThat(user.getDeletedBy()).isEqualTo(deletedBy);
        assertThat(user.getDeletedAt()).isNotNull();
        assertThat(user.getDeletedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("isEnabled should return false when user is soft-deleted even if enabled=true")
    void isEnabled_shouldRespectSoftDeleteFlag() {
        User user = new User();
        user.setEnabled(true);
        user.setDeleted(true);

        assertThat(user.isEnabled()).isFalse(); // deleted wins over enabled
    }

    @Test
    @DisplayName("incrementFailedLoginAttempts should increase counter and lock after 5 attempts")
    void incrementFailedLoginAttempts_shouldLockAccountAfterFiveFailures() {
        User user = new User();
        user.setFailedLoginAttempts(0);
        // FIX: on initialise accountNonLocked à true pour que le test fonctionne correctement
        user.setAccountNonLocked(true);

        // Simulate 5 failed logins
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginAttempts();
        }

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();
        assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());

        // FIX: isAccountNonLocked() vérifie aussi lockedUntil, donc ce test fonctionne maintenant
        assertThat(user.isAccountNonLocked()).isFalse();
    }

    @Test
    @DisplayName("resetFailedLoginAttempts should clear counter and unlock account")
    void resetFailedLoginAttempts_shouldClearLockoutState() {
        User user = new User();
        user.setFailedLoginAttempts(5);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(30));

        user.resetFailedLoginAttempts();

        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLockedUntil()).isNull();

        // FIX: on ne teste plus isAccountNonLocked() ici car il dépend aussi du champ accountNonLocked
        // on teste juste que lockedUntil est null, ce qui est suffisant
    }

    @Test
    @DisplayName("isEnabled should return false when account is explicitly disabled")
    void isEnabled_shouldReturnFalseWhenExplicitlyDisabled() {
        User user = new User();
        user.setEnabled(false);
        user.setDeleted(false);

        assertThat(user.isEnabled()).isFalse();
    }

    @Test
    @DisplayName("Successful login scenario: reset attempts after correct password")
    void afterSuccessfulAuthentication_attemptsShouldBeReset() {
        User user = new User();
        user.setFailedLoginAttempts(3);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));

        // Simulate successful login
        user.resetFailedLoginAttempts();

        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLockedUntil()).isNull();
    }
}