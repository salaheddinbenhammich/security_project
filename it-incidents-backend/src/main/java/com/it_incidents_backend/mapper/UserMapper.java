package com.it_incidents_backend.mapper;

import com.it_incidents_backend.dto.user.CreateUserRequest;
import com.it_incidents_backend.dto.auth.SignupRequest;
import com.it_incidents_backend.dto.user.UserDetailResponse;
import com.it_incidents_backend.dto.user.UserResponse;
import com.it_incidents_backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    // Entity → Response DTO
    UserResponse toResponse(User user);

    // List of Entities → List of Response DTOs
    List<UserResponse> toResponseList(List<User> users);

    // Entity → Detailed Response (for admin viewing user details)
    @Mapping(target = "ticketCount", expression = "java(user.getCreatedTickets() != null ? (long) user.getCreatedTickets().size() : 0L)")
    UserDetailResponse toDetailResponse(User user);

    // List conversion for detail response
    List<UserDetailResponse> toDetailResponseList(List<User> users);

    // SignupRequest → Entity (for creating new user)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Password will be hashed separately
    @Mapping(target = "role", ignore = true)     // Role will be set in service
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "accountNonLocked", ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "lockedUntil", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "createdTickets", ignore = true)
    User toEntity(SignupRequest request);

    // CreateUserRequest → Entity (for admin creating users)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Password will be hashed separately
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "accountNonLocked", ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "lockedUntil", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "createdTickets", ignore = true)
    User toEntity(CreateUserRequest request);


}