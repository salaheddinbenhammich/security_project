package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.auth.AuthResponse;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(
        name = "Authentication",
        description = "Endpoints for user authentication and registration"
)
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
            summary = "User login",
            description = "Authenticates a user using username/email and password and returns a JWT token"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {
        return authService.authenticate(loginRequest);
    }

    @Operation(
            summary = "User sign up",
            description = "Sign up a new user and return authentication information"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User registered successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Invalid registration data")
    })
    @PostMapping("/register")
    public AuthResponse register(@RequestBody SignupRequest signupRequest) {
        return authService.signUp(signupRequest);
    }

    @Operation(
            summary = "Refresh access token",
            description = "Use refresh token to obtain a new access token"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Token refreshed successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public AuthResponse refreshToken(@RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }
}
