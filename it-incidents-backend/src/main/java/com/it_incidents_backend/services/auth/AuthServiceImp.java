package com.it_incidents_backend.services.auth;

import com.it_incidents_backend.dto.auth.AuthResponse;
import com.it_incidents_backend.dto.auth.LoginRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import org.springframework.stereotype.Service;


@Service
public class AuthServiceImp implements AuthService{
    @Override
    public AuthResponse authenticate(LoginRequest loginRequest) {
        return null;
    }

    @Override
    public AuthResponse signUp(SignupRequest signUpRequest) {
        return null;
    }
}
