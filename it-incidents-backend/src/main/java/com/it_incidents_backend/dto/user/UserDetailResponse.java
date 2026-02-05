package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.it_incidents_backend.entities.User}
 */
public record UserDetailResponse(
        UUID id,
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role,
        Boolean enabled,
        Boolean accountNonLocked,
        Boolean isApproved,
//        Boolean credentialsNonExpired,
        Long daysUntilPasswordExpires,
        Boolean deleted,
        LocalDateTime deletedAt,
        String deletedBy,
        Integer failedLoginAttempts,
        LocalDateTime lockedUntil,
        LocalDateTime lastLogin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime passwordChangedAt,
        Boolean isCurrentlyLocked
    ) implements Serializable {
}