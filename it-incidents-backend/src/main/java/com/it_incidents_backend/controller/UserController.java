package com.it_incidents_backend.controller;


import com.it_incidents_backend.dto.user.*;
import com.it_incidents_backend.services.users.UserServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(
        name = "Users",
        description = "User management operations (Admin and User actions)"
)
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserServices userServices;

    @Autowired
    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    @Operation(
            summary = "(ADMIN) Get all users",
            description = "Returns a paginated list of all users. (Only ADMINS)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Users retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    Page<UserResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return userServices.getAllUsers(page, size);
    }

    @Operation(
            summary = "Get user by ID",
            description = "Returns detailed information about a user by their ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User found",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserDetailResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    UserDetailResponse getUserById(
            @PathVariable UUID id
    ) {
        return userServices.getUserById(id);
    }

    @Operation(
            summary = "(ADMIN) Create a new user",
            description = "Admin Creates a new user manually."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Invalid user data"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    UserResponse createUser(
            @RequestBody UserCreateRequest userCreateRequest
    ) {
        return userServices.createUser(userCreateRequest);
    }

    @Operation(
            summary = "(ADMIN) Update user",
            description = "Updates a user profile by ID. Accessible only by administrators."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> updateUser(
            @PathVariable UUID id,
            @RequestBody UserUpdateRequest userUpdateRequest
    ) {
        userServices.updateUserByAdmin(id, userUpdateRequest);
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "Update own profile",
            description = "Allows a user to update their own profile information."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/me/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    ResponseEntity<Void> updateOwnUser(
            @PathVariable UUID id,
            @RequestBody UserSelfUpdateRequest userUpdateRequest
    ) {
        userServices.updateUser(id, userUpdateRequest);
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "Change user password",
            description = "Changes the password of a user."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Password updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid password format"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    ResponseEntity<Void> updatePassword(
            @PathVariable UUID id,
            @RequestBody PasswordChangeRequest passwordChangeRequest
    ) {
        userServices.updatePassword(id, passwordChangeRequest);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "(ADMIN) Delete user",
            description = "Deletes a user by ID. Accessible only by administrators."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> deleteUser(
            @PathVariable UUID id
    ) {
        userServices.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
