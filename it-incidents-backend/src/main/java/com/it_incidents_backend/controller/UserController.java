    package com.it_incidents_backend.controller;
    
    import com.it_incidents_backend.dto.user.*;
    import com.it_incidents_backend.services.users.UserServices;
    import com.it_incidents_backend.util.SecurityUtils;
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

    import java.util.HashMap;
    import java.util.Map;
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
                summary = "(ADMIN) Get user by ID",
                description = "(ONLY FOR ADMINS) Returns detailed information about a user by their ID."
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
        @PreAuthorize("hasRole('ADMIN')")
        UserDetailResponse getUserById(
                @PathVariable UUID id
        ) {
            return userServices.getUserById(id);
        }

        @Operation(
                summary = "Get current user's profile",
                description = "Returns the authenticated user's own profile information."
        )
        @ApiResponses({
                @ApiResponse(
                        responseCode = "200",
                        description = "Profile retrieved successfully",
                        content = @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = UserDetailResponse.class)
                        )
                ),
                @ApiResponse(responseCode = "401", description = "Not authenticated")
        })
        @GetMapping("/me")
        @PreAuthorize("isAuthenticated()")
        public UserDetailResponse getCurrentUser() {
            UUID currentUserId = SecurityUtils.getCurrentUserId();
            return userServices.getUserById(currentUserId);
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
                summary = "Change own password",
                description = "Allows authenticated user to change their own password."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "Password updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid password format"),
                @ApiResponse(responseCode = "401", description = "Not authenticated")
        })
        @PutMapping("/me/password")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<Void> updateMyPassword(
                @RequestBody PasswordChangeRequest passwordChangeRequest
        ) {
            UUID currentUserId = SecurityUtils.getCurrentUserId();
            userServices.updatePassword(currentUserId, passwordChangeRequest);
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
        @PutMapping("/me")
        @PreAuthorize("isAuthenticated()")
        ResponseEntity<Void> updateOwnUser(
                @RequestBody UserSelfUpdateRequest userUpdateRequest
        ) {
            userServices.updateCurrentUser(userUpdateRequest);
            return ResponseEntity.noContent().build();
        }

        @Operation(
                summary = "(ADMIN) Change user password",
                description = "(ONLY FOR ADMINS) Changes the password of a user."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "Password updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid password format"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @PutMapping("/{id}/password")
        @PreAuthorize("hasRole('ADMIN')")
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
    
        // ========== NEW ENDPOINTS FOR ACCOUNT MANAGEMENT ==========
    
        @Operation(
                summary = "(ADMIN) Enable user account",
                description = "Enables a disabled user account. Accessible only by administrators."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "User account enabled successfully"),
                @ApiResponse(responseCode = "404", description = "User not found"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @PutMapping("/{id}/enable")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<Void> enableUser(
                @PathVariable UUID id
        ) {
            userServices.enableUser(id);
            return ResponseEntity.noContent().build();
        }
    
        @Operation(
                summary = "(ADMIN) Disable user account",
                description = "Disables a user account. Accessible only by administrators."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "User account disabled successfully"),
                @ApiResponse(responseCode = "404", description = "User not found"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @PutMapping("/{id}/disable")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<Void> disableUser(
                @PathVariable UUID id
        ) {
            userServices.disableUser(id);
            return ResponseEntity.noContent().build();
        }
    
        @Operation(
                summary = "(ADMIN) Unlock user account",
                description = "Unlocks a locked user account. Accessible only by administrators."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "User account unlocked successfully"),
                @ApiResponse(responseCode = "404", description = "User not found"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @PutMapping("/{id}/unlock")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<Void> unlockUser(
                @PathVariable UUID id
        ) {
            userServices.unlockUser(id);
            return ResponseEntity.noContent().build();
        }
    
        @Operation(
                summary = "(ADMIN) Get user's tickets",
                description = "Returns all tickets created by a specific user. Accessible only by administrators."
        )
        @ApiResponses({
                @ApiResponse(
                        responseCode = "200",
                        description = "User tickets retrieved successfully"
                ),
                @ApiResponse(responseCode = "404", description = "User not found"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @GetMapping("/{id}/tickets")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<?> getUserTickets(
                @PathVariable UUID id
        ) {
            return ResponseEntity.ok(userServices.getUserTickets(id));
        }

        @Operation(
                summary = "(ADMIN) Approve user account",
                description = "Approves a pending user account, allowing them to create tickets. Accessible only by administrators."
        )
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "User account approved successfully"),
                @ApiResponse(responseCode = "404", description = "User not found"),
                @ApiResponse(responseCode = "403", description = "Access denied")
        })
        @PutMapping("/{id}/approve")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<Void> approveUser(
                @PathVariable UUID id
        ) {
            userServices.approveUser(id);
            return ResponseEntity.noContent().build();
        }

        @Operation(
                summary = "Check account status",
                description = "Lightweight endpoint to verify if the current user's account is still active"
        )
        @GetMapping("/me/status")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<Map<String, String>> checkAccountStatus() {
            // The JwtAuthenticationFilter already validated the account status
            // If we reach here, the account is active
            Map<String, String> status = new HashMap<>();
            status.put("status", "ACTIVE");
            return ResponseEntity.ok(status);
        }
    }