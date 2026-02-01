package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.it_incidents_backend.entities.User}
 */
public record UserUpdateRequest(
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role,
        Boolean enabled,
        Boolean accountNonLocked,
        Boolean credentialsNonExpired,
        Integer failedLoginAttempts,
        LocalDateTime lockedUntil
    ) implements Serializable {
}