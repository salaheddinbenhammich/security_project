package com.it_incidents_backend.dto.user;

import com.it_incidents_backend.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    private String username;

    @Email(message = "Email should be valid")
    private String email;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private Role role; // Admin can change role

    private Boolean enabled; // Admin can enable/disable account

    private Boolean accountNonLocked; // Admin can lock/unlock account
}