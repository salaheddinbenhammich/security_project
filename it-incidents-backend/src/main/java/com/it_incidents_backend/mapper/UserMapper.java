package com.it_incidents_backend.mapper;

import com.it_incidents_backend.dto.user.*;
import com.it_incidents_backend.entities.User;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    User toEntity(UserResponse userResponse);

    @Mapping(target = "isCurrentlyLocked", expression = "java(isCurrentlyLocked(user))")
    UserResponse toResponseDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserResponse userResponse, @MappingTarget User user);

    User toEntity(UserCreateRequest userCreateRequest);

    UserCreateRequest toCreateDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserCreateRequest userCreateRequest, @MappingTarget User user);

    User toEntity(UserDetailResponse userDetailResponse);

    @Mapping(target = "isCurrentlyLocked", expression = "java(isCurrentlyLocked(user))")
    @Mapping(target = "daysUntilPasswordExpires", expression = "java(user.getDaysUntilPasswordExpires())")
    UserDetailResponse toDetailDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserDetailResponse userDetailResponse, @MappingTarget User user);

    User toEntity(UserUpdateRequest userUpdateRequest);

    UserUpdateRequest toUpdateDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserUpdateRequest userUpdateRequest, @MappingTarget User user);

    User toEntity(UserSelfUpdateRequest userSelfUpdateRequest);

    UserSelfUpdateRequest toSelfUpdateDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserSelfUpdateRequest userSelfUpdateRequest, @MappingTarget User user);

    // ========== Helper method to compute isCurrentlyLocked ==========
    default boolean isCurrentlyLocked(User user) {
        return user.getLockedUntil() != null &&
                LocalDateTime.now().isBefore(user.getLockedUntil());
    }
}