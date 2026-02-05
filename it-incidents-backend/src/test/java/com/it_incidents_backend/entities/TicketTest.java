package com.it_incidents_backend.entities;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the Ticket entity – focusing on its lifecycle and state transition logic.
 *
 * Why we test this:
 *   - Tickets are the core of our application -> wrong state transitions = broken business rules
 *   - Status changes (PENDING -> RESOLVED -> CLOSED) affect visibility, notifications, etc.
 *   - Resolution field and timestamps are important for audit trail and user confirmation flow
 *   - These tests help prove that domain logic is correct independently of controllers/services
 */
@DisplayName("Ticket Entity – Lifecycle & State Transitions")
class TicketTest {

    @Test
    @DisplayName("resolve() should set RESOLVED status, store resolution text and timestamp")
    void resolve_shouldUpdateStatusAndResolutionFields() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setResolution(null);
        ticket.setResolvedAt(null);

        String resolutionText = "Reinstalled Windows and updated drivers – issue fixed";

        ticket.resolve(resolutionText);

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(ticket.getResolution()).isEqualTo(resolutionText);
        assertThat(ticket.getResolvedAt()).isNotNull();
        assertThat(ticket.getResolvedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("close() should mark ticket as CLOSED and set closed timestamp")
    void close_shouldFinalizeTicketWithTimestamp() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setClosedAt(null);

        ticket.close();

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(ticket.getClosedAt()).isNotNull();
        assertThat(ticket.getClosedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("reopen() should reset ticket to PENDING and clear resolution/closed fields")
    void reopen_shouldResetTicketToInitialState() {
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setResolution("Was fixed but user reports same issue again");
        ticket.setResolvedAt(LocalDateTime.now().minusDays(2));
        ticket.setClosedAt(LocalDateTime.now().minusDays(1));

        ticket.reopen();

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.PENDING);
        assertThat(ticket.getResolution()).isNull();
        assertThat(ticket.getResolvedAt()).isNull();
        assertThat(ticket.getClosedAt()).isNull();
        // createdAt and other audit fields should remain unchanged (not tested here)
    }

    @Test
    @DisplayName("After resolve + close, reopen should allow new resolution cycle")
    void fullCycle_resolveCloseReopen_shouldAllowNewResolution() {
        Ticket ticket = new Ticket();

        ticket.resolve("Temporary workaround applied");
        ticket.close();

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.CLOSED);

        ticket.reopen();

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.PENDING);
        assertThat(ticket.getResolution()).isNull();

        // Simulate new resolution after reopen
        ticket.resolve("Root cause found: faulty network cable – replaced");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(ticket.getResolution()).contains("Root cause found");
    }
}