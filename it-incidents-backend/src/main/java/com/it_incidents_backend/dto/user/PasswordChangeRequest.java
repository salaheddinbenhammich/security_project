package com.it_incidents_backend.dto.user;

public record PasswordChangeRequest(String currentPassword, String newPassword) {
}
