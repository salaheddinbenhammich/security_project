package com.it_incidents_backend.services.users;


import com.it_incidents_backend.dto.user.*;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.UserMapper;
import com.it_incidents_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServicesImp implements UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServicesImp(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return this.userRepository.findAll(pageable).map(userMapper::toResponseDto);
    }

    @Override
    public UserDetailResponse getUserById(Long id) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return this.userMapper.toDetailDto(user);
    }

    @Override
    public UserResponse createUser(UserCreateRequest createUserRequest) {
        if (this.userRepository.existsByUsername(createUserRequest.username())) {
            throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
        }
        if (this.userRepository.existsByEmail(createUserRequest.email())) {
            throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
        }
        User user = this.userMapper.toEntity(createUserRequest);
        user.setPassword(passwordEncoder.encode(createUserRequest.password()));
        user.setCredentialsNonExpired(false);
        user = this.userRepository.save(user);
        return this.userMapper.toResponseDto(user);
    }

    @Override
    public void updatePassword(Long id, PasswordChangeRequest passwordChangeRequest) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(passwordChangeRequest.currentPassword(), user.getPassword())) {
            throw new AppException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        this.userRepository.save(user);
    }

    @Override
    public void updateUserByAdmin(Long id, UserUpdateRequest updateUserRequest) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        if (updateUserRequest.username() != null && !updateUserRequest.username().equals(user.getUsername())) {
            if (this.userRepository.existsByUsername(updateUserRequest.username())) {
                throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
            }
            user.setUsername(updateUserRequest.username());
        }
        if (updateUserRequest.email() != null && !updateUserRequest.email().equals(user.getEmail())) {
            if (this.userRepository.existsByEmail(updateUserRequest.email())) {
                throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(updateUserRequest.email());
        }
        user = this.userMapper.partialUpdate(updateUserRequest, user);
        this.userRepository.save(user);
    }

    @Override
    public void updateUser(Long id, UserSelfUpdateRequest userSelfUpdateRequest) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        if (userSelfUpdateRequest.username() != null && !userSelfUpdateRequest.username().equals(user.getUsername())) {
            if (this.userRepository.existsByUsername(userSelfUpdateRequest.username())) {
                throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
            }
            user.setUsername(userSelfUpdateRequest.username());
        }
        if (userSelfUpdateRequest.email() != null && !userSelfUpdateRequest.email().equals(user.getEmail())) {
            if (this.userRepository.existsByEmail(userSelfUpdateRequest.email())) {
                throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(userSelfUpdateRequest.email());
        }
        user = this.userMapper.partialUpdate(userSelfUpdateRequest, user);
        this.userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        this.userRepository.delete(user);
    }
}
