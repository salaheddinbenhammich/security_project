package com.it_incidents_backend.services.users;

import com.it_incidents_backend.dto.user.*;
import org.springframework.data.domain.Page;

public interface UserServices {
    Page<UserResponse> getAllUsers(int page, int size);

    UserDetailResponse getUserById(Long id);

    UserResponse createUser(UserCreateRequest createUserRequest);

    void updateUserByAdmin(Long id, UserUpdateRequest updateUserRequest);

    void updateUser(Long id, UserSelfUpdateRequest userSelfUpdateRequest);

    void updatePassword(Long id, PasswordChangeRequest passwordChangeRequest);

    void deleteUser(Long id);
}
