package com.it_incidents_backend.service;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.comment.UpdateCommentRequest;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketComment;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.CommentMapper;
import com.it_incidents_backend.repository.TicketCommentRepository;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    /**
     * Add comment to ticket
     * - USER can add public comments to their own tickets
     * - ADMIN can add public or internal comments to any ticket
     */
    @Transactional
    public CommentResponse addComment(Long ticketId, CreateCommentRequest request, UUID userId, Role userRole) {
        // Find ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Check permissions
        if (userRole == Role.USER) {
            // User can only comment on their own tickets
            if (!ticket.getCreatedBy().getId().equals(userId)) {
                throw new AppException("You can only comment on your own tickets", HttpStatus.FORBIDDEN);
            }
            // User cannot create internal comments
            if (request.getIsInternal()) {
                throw new AppException("Only admins can create internal comments", HttpStatus.FORBIDDEN);
            }
        }

        // Create comment
        TicketComment comment = commentMapper.toEntity(request);
        comment.setTicket(ticket);
        comment.setAuthor(user);

        // Save
        TicketComment savedComment = commentRepository.save(comment);

        // Update ticket's last updated timestamp
        ticket.setLastUpdatedBy(user.getUsername());
        ticketRepository.save(ticket);

        return commentMapper.toResponse(savedComment);
    }

    /**
     * Get all comments for a ticket
     * - USER sees only public comments on their tickets
     * - ADMIN sees all comments (public + internal)
     */
    public List<CommentResponse> getTicketComments(Long ticketId, UUID userId, Role userRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        // Check permissions
        if (userRole == Role.USER && !ticket.getCreatedBy().getId().equals(userId)) {
            throw new AppException("You don't have permission to view comments on this ticket", HttpStatus.FORBIDDEN);
        }

        List<TicketComment> comments;

        if (userRole == Role.ADMIN) {
            // Admin sees all comments
            comments = commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
        } else {
            // User sees only public comments
            comments = commentRepository.findByTicketAndIsInternalFalseOrderByCreatedAtDesc(ticket);
        }

        return commentMapper.toResponseList(comments);
    }

    /**
     * Update/Edit comment
     * - USER can edit their own public comments
     * - ADMIN can edit any comment
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, UpdateCommentRequest request, UUID userId, Role userRole) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException("Comment not found", HttpStatus.NOT_FOUND));

        // Check permissions
        if (userRole == Role.USER && !comment.getAuthor().getId().equals(userId)) {
            throw new AppException("You can only edit your own comments", HttpStatus.FORBIDDEN);
        }

        // Update comment content
        comment.setContent(request.getContent());
        comment.setEdited(true);
        comment.setEditedAt(LocalDateTime.now());

        // Save
        TicketComment updatedComment = commentRepository.save(comment);

        return commentMapper.toResponse(updatedComment);
    }

    /**
     * Delete comment (ADMIN only)
     */
    @Transactional
    public void deleteComment(Long commentId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException("Comment not found", HttpStatus.NOT_FOUND));

        commentRepository.delete(comment);
    }
}