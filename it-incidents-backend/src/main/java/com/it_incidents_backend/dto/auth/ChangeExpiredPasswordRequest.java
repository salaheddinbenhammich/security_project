package com.it_incidents_backend.dto.auth;

import lombok.Data;

@Data
public class ChangeExpiredPasswordRequest {
    private String usernameOrEmail;
    private String currentPassword;
    private String newPassword;
}