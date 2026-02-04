package com.it_incidents_backend.service;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.ticket.*;
import com.it_incidents_backend.entities.*;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.CommentMapper;
import com.it_incidents_backend.mapper.TicketMapper;
import com.it_incidents_backend.repository.TicketCommentRepository;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketMapper ticketMapper;
    private final CommentMapper commentMapper;

    /**
     * Create a new ticket (USER role)
     */
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, UUID userId) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Map DTO to Entity
        Ticket ticket = ticketMapper.toEntity(request);

        // Set required fields
        ticket.setTicketNumber(generateTicketNumber());
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreatedBy(user);
        ticket.setLastUpdatedBy(user.getUsername());

        // Save ticket
        Ticket savedTicket = ticketRepository.save(ticket);

        return ticketMapper.toResponse(savedTicket);
    }

    /**
     * Get all tickets (PUBLIC can see list with limited info)
     */
    public List<TicketResponse> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        return ticketMapper.toResponseList(tickets);
    }

    /**
     * Get all tickets for ADMIN (includes creator username)
     */
    @Transactional(readOnly = true)
    public List<TicketAdminResponse> getAllTicketsForAdmin() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        return ticketMapper.toAdminResponseList(tickets);
    }

    /**
     * Get ticket details by ID
     * - PUBLIC: Cannot access
     * - USER: Can see their own tickets
     * - ADMIN: Can see all tickets
     */
    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketById(UUID ticketId, UUID userId, Role userRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        // Check permissions
        if (userRole == Role.USER && !ticket.getCreatedBy().getId().equals(userId)) {
            throw new AppException("You don't have permission to view this ticket", HttpStatus.FORBIDDEN);
        }

        // Map to detailed response
        TicketDetailResponse response = ticketMapper.toDetailResponse(ticket);

        // Filter comments based on role
        if (userRole == Role.USER) {
            // Users see only public comments
            List<CommentResponse> publicComments = ticket.getComments().stream()
                    .filter(comment -> !comment.getIsInternal())
                    .map(commentMapper::toResponse)
                    .collect(Collectors.toList());
            response.setComments(publicComments);
        } else if (userRole == Role.ADMIN) {
            // Admins see all comments (public + internal)
            List<CommentResponse> allComments = ticket.getComments().stream()
                    .map(commentMapper::toResponse)
                    .collect(Collectors.toList());
            response.setComments(allComments);
        }

        return response;
    }

    /**
     * Get user's own tickets
     */
    @Transactional
    public List<TicketDetailResponse> getMyTickets(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<Ticket> tickets = ticketRepository.findByCreatedByOrderByCreatedAtDesc(user);

        // Map to detailed response with public comments only
        return tickets.stream()
                .map(ticket -> {
                    TicketDetailResponse response = ticketMapper.toDetailResponse(ticket);
                    // Filter to show only public comments
                    List<CommentResponse> publicComments = ticket.getComments().stream()
                            .filter(comment -> !comment.getIsInternal())
                            .map(commentMapper::toResponse)
                            .collect(Collectors.toList());
                    response.setComments(publicComments);
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Update ticket status (ADMIN only)
     */
    @Transactional
    public TicketDetailResponse updateTicketStatus(UUID ticketId, UpdateTicketStatusRequest request, String adminUsername) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        // Update status
        ticket.setStatus(request.getStatus());
        ticket.setLastUpdatedBy(adminUsername);

        // If status is RESOLVED, set resolution and timestamp
        if (request.getStatus() == TicketStatus.RESOLVED) {
            if (request.getResolution() == null || request.getResolution().isBlank()) {
                throw new AppException("Resolution is required when resolving a ticket", HttpStatus.BAD_REQUEST);
            }
            ticket.setResolution(request.getResolution());
            ticket.setResolvedAt(LocalDateTime.now());
        }

        // If status is CLOSED, set closed timestamp
        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        // Save
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toDetailResponse(updatedTicket);
    }

    /**
     * Confirm resolution (USER confirms if issue is really resolved)
     */
    @Transactional
    public TicketDetailResponse confirmResolution(UUID ticketId, ConfirmResolutionRequest request, UUID userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        // Check if user owns this ticket
        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new AppException("You can only confirm resolution for your own tickets", HttpStatus.FORBIDDEN);
        }

        // Check if ticket is in RESOLVED status
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new AppException("Ticket must be in RESOLVED status to confirm", HttpStatus.BAD_REQUEST);
        }

        if (request.getConfirmed()) {
            // User confirms resolution → close ticket
            ticket.close();
        } else {
            // User rejects resolution → reopen ticket
            ticket.reopen();

            // Add comment if provided
            if (request.getComment() != null && !request.getComment().isBlank()) {
                TicketComment comment = TicketComment.builder()
                        .ticket(ticket)
                        .author(ticket.getCreatedBy())
                        .content(request.getComment())
                        .isInternal(false)
                        .build();
                commentRepository.save(comment);
            }
        }

        ticket.setLastUpdatedBy(ticket.getCreatedBy().getUsername());
        Ticket updatedTicket = ticketRepository.save(ticket);

        return ticketMapper.toDetailResponse(updatedTicket);
    }

    /**
     * Get ticket statistics (ADMIN dashboard)
     */
    public TicketStatsResponse getTicketStats() {
        long totalTickets = ticketRepository.count();
        long pendingTickets = ticketRepository.countByStatus(TicketStatus.PENDING);
        long inProgressTickets = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closedTickets = ticketRepository.countByStatus(TicketStatus.CLOSED);

        return TicketStatsResponse.builder()
                .totalTickets(totalTickets)
                .pendingTickets(pendingTickets)
                .inProgressTickets(inProgressTickets)
                .resolvedTickets(resolvedTickets)
                .closedTickets(closedTickets)
                .build();
    }

    /**
     * Get tickets by status (ADMIN filtering)
     */
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {
        List<Ticket> tickets = ticketRepository.findByStatusOrderByCreatedAtDesc(status);
        return ticketMapper.toResponseList(tickets);
    }

    /**
     * Get tickets by priority (ADMIN filtering)
     */
    public List<TicketResponse> getTicketsByPriority(Priority priority) {
        List<Ticket> tickets = ticketRepository.findByPriorityOrderByCreatedAtDesc(priority);
        return ticketMapper.toResponseList(tickets);
    }

    /**
     * Generate unique ticket number (e.g., INC-2025-0001)
     */
    private String generateTicketNumber() {
        int year = Year.now().getValue();
        long count = ticketRepository.count() + 1;
        return String.format("INC-%d-%04d", year, count);
    }
}