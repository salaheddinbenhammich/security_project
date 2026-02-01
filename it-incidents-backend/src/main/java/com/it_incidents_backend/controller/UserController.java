package com.it_incidents_backend.controller;


import com.it_incidents_backend.dto.user.*;
import com.it_incidents_backend.services.users.UserServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserServices userServices;

    @Autowired
    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    Page<UserResponse> getAllUsers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size) {
        return userServices.getAllUsers(page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    UserResponse createUser(@RequestBody UserCreateRequest userCreateRequest) {
        return userServices.createUser(userCreateRequest);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest userUpdateRequest) {
        userServices.updateUserByAdmin(id, userUpdateRequest);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    ResponseEntity<Void> updateOwnUser(@PathVariable Long id, @RequestBody UserSelfUpdateRequest userUpdateRequest) {
        userServices.updateUser(id, userUpdateRequest);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    ResponseEntity<Void> updatePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest passwordChangeRequest) {
        userServices.updatePassword(id, passwordChangeRequest);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userServices.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
