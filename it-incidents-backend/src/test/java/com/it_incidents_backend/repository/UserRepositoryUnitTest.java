package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserRepositoryUnitTest {

    @Mock
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .firstName("Test")
                .lastName("User")
                .role(Role.USER)
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .deleted(false)
                .failedLoginAttempts(0)
                .build();
    }

    @Test
    void whenSaveUser_thenUserIsReturned() {
        when(userRepository.save(testUser)).thenReturn(testUser);

        User saved = userRepository.save(testUser);

        assertThat(saved.getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void whenFindByUsername_thenReturnUser() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        Optional<User> found = userRepository.findByUsername("testuser");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void whenFindByUsername_notExists_thenReturnEmpty() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        Optional<User> found = userRepository.findByUsername("nonexistent");

        assertThat(found).isEmpty();
        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    @Test
    void whenExistsByUsername_thenReturnTrue() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        boolean exists = userRepository.existsByUsername("testuser");

        assertThat(exists).isTrue();
        verify(userRepository, times(1)).existsByUsername("testuser");
    }

    @Test
    void whenExistsByUsername_notExists_thenReturnFalse() {
        when(userRepository.existsByUsername("nonexistent")).thenReturn(false);

        boolean exists = userRepository.existsByUsername("nonexistent");

        assertThat(exists).isFalse();
        verify(userRepository, times(1)).existsByUsername("nonexistent");
    }

    @Test
    void whenFindByRoleAndDeletedFalse_thenReturnUsers() {
        User admin = User.builder()
                .username("admin")
                .role(Role.ADMIN)
                .deleted(false)
                .build();
        when(userRepository.findByRoleAndDeletedFalse(Role.USER)).thenReturn(List.of(testUser));

        List<User> users = userRepository.findByRoleAndDeletedFalse(Role.USER);

        assertThat(users).hasSize(1);
        assertThat(users.get(0).getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).findByRoleAndDeletedFalse(Role.USER);
    }

    @Test
    void whenSoftDelete_thenUserMarkedAsDeleted() {
        testUser.softDelete("admin");

        assertThat(testUser.getDeleted()).isTrue();
        assertThat(testUser.getDeletedBy()).isEqualTo("admin");
        assertThat(testUser.getEnabled()).isFalse();
    }

    @Test
    void whenIncrementFailedLoginAttempts_thenCountIncreases() {
        testUser.incrementFailedLoginAttempts();
        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(1);
    }

    @Test
    void whenIncrementFailedLoginAttempts_fiveTimes_thenAccountLocked() {
        for (int i = 0; i < 5; i++) testUser.incrementFailedLoginAttempts();

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(testUser.isAccountNonLocked()).isFalse();
        assertThat(testUser.getLockedUntil()).isNotNull();
    }

    @Test
    void whenResetFailedLoginAttempts_thenCountResetAndUnlocked() {
        testUser.setFailedLoginAttempts(5);
        testUser.resetFailedLoginAttempts();

        assertThat(testUser.getFailedLoginAttempts()).isZero();
        assertThat(testUser.getLockedUntil()).isNull();
    }
}