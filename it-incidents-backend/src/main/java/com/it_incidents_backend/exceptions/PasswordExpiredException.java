package com.it_incidents_backend.exceptions;

import lombok.Getter;
import java.util.UUID;

@Getter
public class PasswordExpiredException extends RuntimeException {
    private final UUID userId;

    public PasswordExpiredException(String message, UUID userId) {
        super(message);
        this.userId = userId;
    }
}