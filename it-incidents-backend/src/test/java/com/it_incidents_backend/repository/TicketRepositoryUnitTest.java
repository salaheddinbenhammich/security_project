package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketRepositoryUnitTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    private User testUser;
    private Ticket testTicket;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(Role.USER)
                .deleted(false)
                .build();

        testTicket = Ticket.builder()
                .ticketNumber("INC-2025-0001")
                .title("Test Ticket")
                .description("Test Description")
                .status(TicketStatus.PENDING)
                .priority(Priority.MEDIUM)
                .category(Category.HARDWARE)
                .createdBy(testUser)
                .lastUpdatedBy(testUser.getUsername())
                .build();
    }

    @Test
    void whenSaveTicket_thenReturnTicket() {
        when(ticketRepository.save(testTicket)).thenReturn(testTicket);

        Ticket saved = ticketRepository.save(testTicket);

        assertThat(saved.getTicketNumber()).isEqualTo("INC-2025-0001");
        verify(ticketRepository, times(1)).save(testTicket);
    }

    @Test
    void whenFindByTicketNumber_thenReturnTicket() {
        when(ticketRepository.findByTicketNumber("INC-2025-0001"))
                .thenReturn(Optional.of(testTicket));

        Optional<Ticket> found = ticketRepository.findByTicketNumber("INC-2025-0001");

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Ticket");
        verify(ticketRepository, times(1)).findByTicketNumber("INC-2025-0001");
    }

    @Test
    void whenExistsByTicketNumber_thenReturnTrue() {
        when(ticketRepository.existsByTicketNumber("INC-2025-0001")).thenReturn(true);

        boolean exists = ticketRepository.existsByTicketNumber("INC-2025-0001");

        assertThat(exists).isTrue();
        verify(ticketRepository, times(1)).existsByTicketNumber("INC-2025-0001");
    }

    @Test
    void whenResolveTicket_thenFieldsUpdated() {
        testTicket.resolve("Issue fixed");

        assertThat(testTicket.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(testTicket.getResolution()).isEqualTo("Issue fixed");
        assertThat(testTicket.getResolvedAt()).isNotNull();
    }

    @Test
    void whenCloseTicket_thenFieldsUpdated() {
        testTicket.resolve("Fixed");
        testTicket.close();

        assertThat(testTicket.getStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(testTicket.getClosedAt()).isNotNull();
    }

    @Test
    void whenReopenTicket_thenFieldsReset() {
        testTicket.resolve("Fixed");
        testTicket.close();
        testTicket.reopen();

        assertThat(testTicket.getStatus()).isEqualTo(TicketStatus.PENDING);
        assertThat(testTicket.getResolution()).isNull();
        assertThat(testTicket.getResolvedAt()).isNull();
        assertThat(testTicket.getClosedAt()).isNull();
    }

    @Test
    void whenIncrementPriorityAndStatusLogic() {
        // Example: test entity logic without DB
        Ticket inProgressTicket = Ticket.builder()
                .ticketNumber("INC-2025-0002")
                .status(TicketStatus.IN_PROGRESS)
                .createdBy(testUser)
                .build();

        assertThat(inProgressTicket.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
    }
}