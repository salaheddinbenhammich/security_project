package com.it_incidents_backend.dto.user;

import java.io.Serializable;

/**
 * DTO for {@link com.it_incidents_backend.entities.User}
 */
public record UserSelfUpdateRequest(String username, String email, String firstName, String lastName,
                                    String phoneNumber) implements Serializable {
}