package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.Priority;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketStatus;
import com.it_incidents_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Find ticket by ticket number
    Optional<Ticket> findByTicketNumber(String ticketNumber);

    // Check if ticket number already exists
    boolean existsByTicketNumber(String ticketNumber);

    // Find all tickets created by a specific user
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    // Find tickets by status
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    // Find tickets by priority
    List<Ticket> findByPriorityOrderByCreatedAtDesc(Priority priority);

    // Find all tickets ordered by creation date (most recent first)
    List<Ticket> findAllByOrderByCreatedAtDesc();

    // Find tickets by status for a specific user
    List<Ticket> findByCreatedByAndStatusOrderByCreatedAtDesc(User createdBy, TicketStatus status);

    // Count tickets by status
    long countByStatus(TicketStatus status);

    // Count tickets created by a user
    long countByCreatedBy(User createdBy);

    // Find tickets created within a date range
    @Query("SELECT t FROM Ticket t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Ticket> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    // Find unresolved tickets (PENDING or IN_PROGRESS)
    @Query("SELECT t FROM Ticket t WHERE t.status IN ('PENDING', 'IN_PROGRESS') ORDER BY t.priority DESC, t.createdAt ASC")
    List<Ticket> findUnresolvedTickets();

    // Get ticket statistics by status
    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> getTicketStatsByStatus();

    // Find recent tickets (last 7 days)
    @Query("SELECT t FROM Ticket t WHERE t.createdAt >= :date ORDER BY t.createdAt DESC")
    List<Ticket> findRecentTickets(@Param("date") LocalDateTime date);
}