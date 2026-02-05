    package com.it_incidents_backend.services.auth;

    import com.it_incidents_backend.dto.auth.*;

    public interface AuthService {
        AuthResponse authenticate(LoginRequest loginRequest);
        AuthResponse signUp(SignupRequest signUpRequest);
        AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
        AuthResponse changeExpiredPassword(ChangeExpiredPasswordRequest request);
    }
