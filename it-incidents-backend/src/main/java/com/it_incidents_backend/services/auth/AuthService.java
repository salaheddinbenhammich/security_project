package com.it_incidents_backend.services.auth;

import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.RefreshTokenRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;

public interface AuthService {
    AuthResponse authenticate(LoginRequest loginRequest);
    AuthResponse signUp(SignupRequest signUpRequest);
    AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
}
