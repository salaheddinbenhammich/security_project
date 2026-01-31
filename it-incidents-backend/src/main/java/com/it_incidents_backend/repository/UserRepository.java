package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by username (for login)
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if username already exists (for signup validation)
    boolean existsByUsername(String username);

    // Check if email already exists (for signup validation)
    boolean existsByEmail(String email);

    // Find all users by role (excluding soft-deleted)
    List<User> findByRoleAndDeletedFalse(Role role);

    // Find all non-deleted users
    List<User> findByDeletedFalse();

    // Find user by ID excluding deleted ones
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deleted = false")
    Optional<User> findByIdAndNotDeleted(@Param("id") Long id);

    // Count users by role
    long countByRoleAndDeletedFalse(Role role);
}