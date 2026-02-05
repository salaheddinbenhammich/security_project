package com.it_incidents_backend.exceptions;

import com.it_incidents_backend.dto.exception.ErrorDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for REST API
 *
 * Handles all exceptions thrown by controllers and services,
 * converting them into appropriate HTTP responses with error messages.
 *
 * SECURITY BEST PRACTICES:
 * - Generic error messages to prevent information leakage
 * - Specific error codes for frontend handling
 * - Proper HTTP status codes for each error type
 */
@RestControllerAdvice
public class RestExceptionHandler {

    /**
     * Handle generic application exceptions
     *
     * These are business logic errors with custom messages and HTTP status codes.
     * Examples: Invalid credentials, user not found, account disabled, etc.
     *
     * @param e The AppException thrown by the service layer
     * @return ResponseEntity with error message and appropriate status code
     */
    @ExceptionHandler(value = {AppException.class})
    @ResponseBody
    public ResponseEntity<ErrorDto> handleAppException(AppException e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(new ErrorDto(e.getMessage()));
    }

    /**
     * Handle password expiration exceptions
     *
     * This is a special case where we need to return additional data (userId)
     * to help the frontend redirect to the password change page.
     *
     * SECURITY NOTE:
     * - Only thrown AFTER successful password verification
     * - This prevents attackers from knowing which accounts have expired passwords
     * - The userId is safe to expose here since the user has already proven they know the password
     *
     * FRONTEND FLOW:
     * 1. User tries to login -> Backend validates credentials
     * 2. Password is correct but expired -> Throws PasswordExpiredException
     * 3. Frontend receives this error with userId
     * 4. Frontend stores temporary data in sessionStorage
     * 5. Frontend redirects to /change-expired-password page
     * 6. User changes password -> Backend validates and returns new tokens
     * 7. User is automatically logged in with new credentials
     *
     * @param ex The PasswordExpiredException thrown during authentication
     * @return ResponseEntity with error code, message, and userId for frontend routing
     */
    @ExceptionHandler(PasswordExpiredException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handlePasswordExpiredException(PasswordExpiredException ex) {
        Map<String, Object> errorResponse = new HashMap<>();

        // Error code for frontend to identify this specific error type
        errorResponse.put("error", "PASSWORD_EXPIRED");

        // User-friendly message in French
        errorResponse.put("message", ex.getMessage());

        // UserId needed for password change endpoint
        errorResponse.put("userId", ex.getUserId());

        // HTTP 403 Forbidden - valid credentials but action not allowed due to expired password
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);
    }

    /**
     * Handle all other uncaught exceptions
     *
     * This is a catch-all handler for any unexpected errors.
     * Returns a generic error message to prevent information leakage.
     *
     * PRODUCTION SECURITY:
     * - Never expose internal error details to users
     * - Log the full exception server-side for debugging
     * - Return generic message to frontend
     *
     * @param e Any unhandled exception
     * @return ResponseEntity with generic error message and 500 status
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<ErrorDto> handleGenericException(Exception e) {
        // TODO: Add logging here for production
        // log.error("Unhandled exception", e);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorDto("An unexpected error occurred. Please try again later."));
    }
}