package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.ChangeExpiredPasswordRequest;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.RefreshTokenRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.services.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(
        name = "Authentication",
        description = "Endpoints for user authentication, registration, and password management"
)
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ========== LOGIN ENDPOINT ==========

    @Operation(
            summary = "User login",
            description = "Authenticates a user using username/email and password. Returns JWT tokens if successful. " +
                    "May throw PASSWORD_EXPIRED error if password is older than 90 days."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful - returns access and refresh tokens",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials - username/email or password is incorrect"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Password expired - user must change password using /change-expired-password endpoint"
            ),
            @ApiResponse(
                    responseCode = "423",
                    description = "Account locked - too many failed login attempts or locked by administrator"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload - missing or malformed data"
            )
    })
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.authenticate(loginRequest);
    }

    // ========== REGISTRATION ENDPOINT ==========

    @Operation(
            summary = "User registration",
            description = "Registers a new user account with strong password policy enforcement. " +
                    "Password must be at least 8 characters with uppercase, lowercase, digit, and special character. " +
                    "Automatically logs in the user after successful registration."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User registered successfully - returns access and refresh tokens",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid registration data - username/email already exists or password doesn't meet requirements"
            )
    })
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody SignupRequest signupRequest) {
        return authService.signUp(signupRequest);
    }

    // ========== TOKEN REFRESH ENDPOINT ==========

    @Operation(
            summary = "Refresh access token",
            description = "Uses a valid refresh token to obtain a new access token and refresh token. " +
                    "Implements token rotation for enhanced security - old refresh token becomes invalid after use. " +
                    "Access tokens expire after 24 hours, refresh tokens after 7 days."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Token refreshed successfully - returns new access and refresh tokens",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid or expired refresh token - user must login again"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Account is not accessible - disabled, locked, or deleted"
            )
    })
    @PostMapping("/refresh")
    public AuthResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }

    // ========== CHANGE EXPIRED PASSWORD ENDPOINT ==========

    @Operation(
            summary = "Change expired password",
            description = "Allows users with expired passwords (90+ days old) to change their password without being authenticated. " +
                    "This is a special endpoint for users who cannot login due to password expiration. " +
                    "Validates current password, enforces strong password policy, prevents password reuse, " +
                    "and returns new JWT tokens for immediate login after successful password change."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Password changed successfully - returns access and refresh tokens for immediate login",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials - current password is incorrect or user not found"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid new password - doesn't meet strength requirements or is same as current password"
            )
    })
    @PostMapping("/change-expired-password")
    public AuthResponse changeExpiredPassword(@Valid @RequestBody ChangeExpiredPasswordRequest request) {
        return authService.changeExpiredPassword(request);
    }
}