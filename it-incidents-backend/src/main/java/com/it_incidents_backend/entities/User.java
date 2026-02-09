package com.it_incidents_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_username", columnList = "username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password; // Will be BCrypt hashed

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = false;

//    @Column(nullable = false)
//    @Builder.Default
//    private Boolean accountNonExpired = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean accountNonLocked = true;

//    @Column(nullable = false)
//    @Builder.Default
//    private Boolean credentialsNonExpired = true;

    // Soft delete
    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private Boolean deleted= false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    // Failed login attempts tracking (security feature)
    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    // Relationship with tickets
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Ticket> createdTickets;

//    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @Builder.Default
//    private Set<Ticket> assignedTickets = new HashSet<>();

    @PrePersist
    private void onCreate() {
        this.enabled = true;
        this.accountNonLocked = true;
        // this.isApproved = false;
        if (this.isApproved == null) {
            this.isApproved = false;  // Only set default if not already set
        }
        this.createdAt = LocalDateTime.now();
        this.passwordChangedAt = LocalDateTime.now();
        this.lastLogin = LocalDateTime.now();
        this.deleted = false;
        this.failedLoginAttempts = 0;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Spring Security UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Check if account is temporarily locked due to failed login attempts
        if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
            return false;
        }
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        if (passwordChangedAt == null) {
            return true; // First login or legacy accounts
        }

        // Password expires after 90 days
        LocalDateTime expirationDate = passwordChangedAt.plusDays(90);
        return LocalDateTime.now().isBefore(expirationDate);
    }

    // helper method:
    public boolean isPasswordExpired() {
        return !isCredentialsNonExpired();
    }

    public long getDaysUntilPasswordExpires() {
        if (passwordChangedAt == null) return 90;
        LocalDateTime expirationDate = passwordChangedAt.plusDays(90);
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), expirationDate);
    }

    @Override
    public boolean isEnabled() {
        return enabled && !deleted;
    }

    // Helper method for soft delete
    public void softDelete(String deletedBy) {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
        this.enabled = false;
    }

    // Helper method to reset failed login attempts
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    // Helper method to increment failed login attempts
    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        // Lock account for 15 minutes after 5 failed attempts
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(15);
        }
    }
}
