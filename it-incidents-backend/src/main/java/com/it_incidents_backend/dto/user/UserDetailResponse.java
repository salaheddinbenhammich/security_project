package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Role role;
    private Boolean enabled;
    private Boolean accountNonLocked;

    // Additional info for admin
    private LocalDateTime lastLogin;
    private Integer failedLoginAttempts;
    private LocalDateTime lockedUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Stats
    private Long ticketCount; // Number of tickets created by this user

    // Don't expose: password, deleted, deletedAt, deletedBy
}