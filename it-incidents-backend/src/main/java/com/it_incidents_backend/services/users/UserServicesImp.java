package com.it_incidents_backend.services.users;

import java.time.LocalDateTime;
import java.util.List; // ⭐ ADD THIS
import java.util.UUID;
import java.util.stream.Collectors; // ⭐ ADD THIS

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // ⭐ ADD THIS
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.dto.user.PasswordChangeRequest;
import com.it_incidents_backend.dto.user.UserCreateRequest;
import com.it_incidents_backend.dto.user.UserDetailResponse;
import com.it_incidents_backend.dto.user.UserResponse;
import com.it_incidents_backend.dto.user.UserSelfUpdateRequest;
import com.it_incidents_backend.dto.user.UserUpdateRequest;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.User; // ⭐ ADD THIS
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.TicketMapper;
import com.it_incidents_backend.mapper.UserMapper;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;

@Service
public class UserServicesImp implements UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper; // ⭐ ADD THIS FIELD

    @Autowired
    public UserServicesImp(
            UserRepository userRepository, 
            UserMapper userMapper, 
            PasswordEncoder passwordEncoder,
            TicketRepository ticketRepository,
            TicketMapper ticketMapper // ⭐ ADD THIS PARAMETER
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.ticketRepository = ticketRepository;
        this.ticketMapper = ticketMapper; // ⭐ ADD THIS LINE
    }

    @Override
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        return this.userRepository.findAll(pageable).map(userMapper::toResponseDto);
    }

    @Override
    public UserDetailResponse getUserById(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return this.userMapper.toDetailDto(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest createUserRequest) {
        if (this.userRepository.existsByUsername(createUserRequest.username())) {
            throw new AppException("Username already taken", HttpStatus.BAD_REQUEST);
        }
        if (this.userRepository.existsByEmail(createUserRequest.email())) {
            throw new AppException("Email already in use", HttpStatus.BAD_REQUEST);
        }
        User user = this.userMapper.toEntity(createUserRequest);
        user.setPassword(passwordEncoder.encode(createUserRequest.password()));
        user.setCredentialsNonExpired(true);
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user = this.userRepository.save(user);
        return this.userMapper.toResponseDto(user);
    }

    @Override
    @Transactional
    public void updatePassword(UUID id, PasswordChangeRequest passwordChangeRequest) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(passwordChangeRequest.currentPassword(), user.getPassword())) {
            throw new AppException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        this.userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserByAdmin(UUID id, UserUpdateRequest updateUserRequest) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
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
    @Transactional
    public void updateUser(UUID id, UserSelfUpdateRequest userSelfUpdateRequest) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
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
    @Transactional
    public void deleteUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        this.userRepository.delete(user);
    }

    // ========== NEW METHOD IMPLEMENTATIONS ==========

    @Override
    @Transactional
    public void enableUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        user.setEnabled(true);
        user.setDeleted(false);
        this.userRepository.save(user);
    }

    @Override
    @Transactional
    public void disableUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        user.setEnabled(false);
        this.userRepository.save(user);
    }

    @Override
    @Transactional
    public void unlockUser(UUID id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        user.resetFailedLoginAttempts(); // This method exists in User entity
        user.setAccountNonLocked(true);
        this.userRepository.save(user);
    }

    // ⭐⭐⭐ THE FIX IS HERE ⭐⭐⭐
    @Override
    public List<TicketResponse> getUserTickets(UUID userId) {
        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        List<Ticket> tickets = ticketRepository.findByCreatedByOrderByCreatedAtDesc(user);
        
        // Convert Ticket entities to TicketResponse DTOs
        // This prevents circular reference serialization issues
        return tickets.stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }
}