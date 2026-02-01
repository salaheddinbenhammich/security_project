package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

/**
 * DTO for {@link com.it_incidents_backend.entities.User}
 */
public record UserCreateRequest(
        @NotBlank
        String username,
        @NotBlank
        String email,
        @NotBlank
        String password,
        @NotBlank
        String firstName,
        @NotBlank
        String lastName,
        @NotBlank
        String phoneNumber,
        @NotNull
        Role role
    ) implements Serializable {
}