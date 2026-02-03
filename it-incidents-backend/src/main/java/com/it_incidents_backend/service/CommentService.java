package com.it_incidents_backend.service;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.comment.UpdateCommentRequest;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketComment;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.CommentMapper;
import com.it_incidents_backend.repository.TicketCommentRepository;
import com.it_incidents_backend.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public CommentService(
            TicketRepository ticketRepository,
            TicketCommentRepository commentRepository,
            CommentMapper commentMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CreateCommentRequest request, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        TicketComment comment = commentMapper.toEntity(request);
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setIsInternal(false);

        TicketComment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    @Transactional
    public CommentResponse updateComment(Long ticketId, Long commentId, UpdateCommentRequest request, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException("Comment not found", HttpStatus.NOT_FOUND));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new AppException("Comment does not belong to this ticket", HttpStatus.BAD_REQUEST);
        }

        if (!comment.getTicket().getCreatedBy().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        commentMapper.updateEntityFromRequest(request, comment);
        comment.setEdited(true);
        comment.setEditedAt(LocalDateTime.now());

        TicketComment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException("Comment not found", HttpStatus.NOT_FOUND));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new AppException("Comment does not belong to this ticket", HttpStatus.BAD_REQUEST);
        }

        if (!comment.getTicket().getCreatedBy().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        commentRepository.delete(comment);
    }
}
