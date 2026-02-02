package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketComment;
import com.it_incidents_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, UUID> {

    // Find all comments for a specific ticket (ordered by creation date, newest first)
    List<TicketComment> findByTicketOrderByCreatedAtDesc(Ticket ticket);

    // Find all comments by a specific author
    List<TicketComment> findByAuthorOrderByCreatedAtDesc(User author);

    // Find public comments only for a ticket (exclude internal notes)
    List<TicketComment> findByTicketAndIsInternalFalseOrderByCreatedAtDesc(Ticket ticket);

    // Find internal comments only for a ticket (admin notes)
    List<TicketComment> findByTicketAndIsInternalTrueOrderByCreatedAtDesc(Ticket ticket);

    // Count comments for a ticket
    long countByTicket(Ticket ticket);

    // Count public comments for a ticket
    long countByTicketAndIsInternalFalse(Ticket ticket);

    // Find all comments for a specific ticket by ID
    @Query("SELECT c FROM TicketComment c WHERE c.ticket.id = :ticketId ORDER BY c.createdAt DESC")
    List<TicketComment> findByTicketId(@Param("ticketId") Long ticketId);

    // Find public comments for a ticket by ID
    @Query("SELECT c FROM TicketComment c WHERE c.ticket.id = :ticketId AND c.isInternal = false ORDER BY c.createdAt DESC")
    List<TicketComment> findPublicCommentsByTicketId(@Param("ticketId") Long ticketId);
}