package com.it_incidents_backend.services.users;

import java.util.List;
import java.util.UUID; // ⭐ ADD THIS IMPORT

import org.springframework.data.domain.Page;

import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.dto.user.PasswordChangeRequest;
import com.it_incidents_backend.dto.user.UserCreateRequest;
import com.it_incidents_backend.dto.user.UserDetailResponse;
import com.it_incidents_backend.dto.user.UserResponse;
import com.it_incidents_backend.dto.user.UserSelfUpdateRequest;
import com.it_incidents_backend.dto.user.UserUpdateRequest;

public interface UserServices {
    Page<UserResponse> getAllUsers(int page, int size);

    UserDetailResponse getUserById(UUID id);

    UserResponse createUser(UserCreateRequest createUserRequest);

    void updateUserByAdmin(UUID id, UserUpdateRequest updateUserRequest);

    void updateCurrentUser(UserSelfUpdateRequest request);

    void updatePassword(UUID id, PasswordChangeRequest passwordChangeRequest);

    void deleteUser(UUID id);

    // ========== NEW METHODS FOR ACCOUNT MANAGEMENT ==========

    /**
     * Enable a disabled user account
     */
    void enableUser(UUID id);

    /**
     * Disable a user account
     */
    void disableUser(UUID id);

    /**
     * Unlock a locked user account and reset failed login attempts
     */
    void unlockUser(UUID id);

    /**
     * Approve a pending user account (ADMIN only)
     */
    void approveUser(UUID id);

    /**
     * Get all tickets created by a specific user
     */
    List<TicketResponse> getUserTickets(UUID userId); // ⭐ CHANGED FROM List<?> TO List<TicketResponse>
}