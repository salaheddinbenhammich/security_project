package com.it_incidents_backend.dto.auth;

import com.it_incidents_backend.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;           // JWT access token (short-lived)
    private String refreshToken;    // JWT refresh token (long-lived)

    @Builder.Default
    private String type = "Bearer"; // Token type
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}