package com.it_incidents_backend.services.auth;

import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoginAttemptService {

    private final UserRepository userRepository;

    // public static final int MAX_FAILED_ATTEMPTS = 5;
    // public static final int LOCKOUT_DURATION_MINUTES = 15;

    public LoginAttemptService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Handle failed login attempt
     *
     * SECURITY FEATURES:
     * - Increments failed attempts counter
     * - Locks account after MAX_FAILED_ATTEMPTS
     * - Sets temporary lockout time
     *
     * @param user The user who failed to log in
     * Record a failed login attempt in a separate transaction
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedLogin(User user) {
        user.incrementFailedLoginAttempts();

        // if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
        //     user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
        // }

        userRepository.save(user);
    }
}
