package com.it_incidents_backend.mapper;

import com.it_incidents_backend.dto.user.*;
import com.it_incidents_backend.entities.User;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    User toEntity(UserResponse userResponse);

    UserResponse toResponseDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserResponse userResponse, @MappingTarget User user);

    User toEntity(UserCreateRequest userCreateRequest);

    UserCreateRequest toCreateDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserCreateRequest userCreateRequest, @MappingTarget User user);

    User toEntity(UserDetailResponse userDetailResponse);

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
}