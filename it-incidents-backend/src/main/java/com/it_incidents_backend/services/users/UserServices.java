package com.it_incidents_backend.services.users;

import com.it_incidents_backend.dto.user.*;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface UserServices {
    Page<UserResponse> getAllUsers(int page, int size);

    UserDetailResponse getUserById(UUID id);

    UserResponse createUser(UserCreateRequest createUserRequest);

    void updateUserByAdmin(UUID id, UserUpdateRequest updateUserRequest);

    void updateUser(UUID id, UserSelfUpdateRequest userSelfUpdateRequest);

    void updatePassword(UUID id, PasswordChangeRequest passwordChangeRequest);

    void deleteUser(UUID id);
}
