package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;

import java.io.Serializable;
import java.util.UUID;

/**
 * DTO for {@link com.it_incidents_backend.entities.User}
 */
public record UserResponse(
        UUID id,
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role
    ) implements Serializable {
}