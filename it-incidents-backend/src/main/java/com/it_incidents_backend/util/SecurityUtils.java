package com.it_incidents_backend.util;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public class SecurityUtils {

    /**
     * Extract userId from Authentication
     */
    public static UUID getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }

    /**
     * Extract role from Authentication
     */
    public static Role getUserRole(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getRole();
    }

    /**
     * Get username from Authentication
     */
    public static String getUsername(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUsername();
    }

    /**
     * Get full UserPrincipal
     */
    public static UserPrincipal getUserPrincipal(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }

        return (UserPrincipal) authentication.getPrincipal();
    }
}