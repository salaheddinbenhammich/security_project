package com.it_incidents_backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    /**
     * Username validation:
     * - 3 to 20 characters
     * - Only alphanumeric characters and underscores
     * - No spaces allowed
     * - Must start with a letter
     */
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(
            regexp = "^[a-zA-Z][a-zA-Z0-9_]*$",
            message = "Username must start with a letter and contain only letters, numbers, and underscores (no spaces)"
    )
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    /**
     * Password validation is done in the service layer
     * Requirements enforced in AuthServiceImp:
     * - Minimum 8 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 digit
     * - At least 1 special character (@$!%*?&)
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    @Pattern(
            regexp = "^[a-zA-ZÀ-ÿ\\s'-]+$",
            message = "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    @Pattern(
            regexp = "^[a-zA-ZÀ-ÿ\\s'-]+$",
            message = "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    private String lastName;

    /**
     * Phone number
     */
    @Pattern(
            regexp = "^(\\+\\d{1,3}[- ]?)?\\(?\\d{1,4}\\)?[- ]?\\d{1,4}[- ]?\\d{1,9}$",
            message = "Phone number format is invalid"
    )
    private String phoneNumber;
}