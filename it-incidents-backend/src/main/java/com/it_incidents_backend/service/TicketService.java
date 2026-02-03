package com.it_incidents_backend.service;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.ticket.CreateTicketRequest;
import com.it_incidents_backend.dto.ticket.TicketDetailResponse;
import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.dto.ticket.TicketUserResponse;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketStatus;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.exceptions.AppException;
import com.it_incidents_backend.mapper.CommentMapper;
import com.it_incidents_backend.mapper.TicketMapper;
import com.it_incidents_backend.repository.TicketCommentRepository;
import com.it_incidents_backend.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketMapper ticketMapper;
    private final CommentMapper commentMapper;

    public TicketService(
            TicketRepository ticketRepository,
            TicketCommentRepository commentRepository,
            TicketMapper ticketMapper,
            CommentMapper commentMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.ticketMapper = ticketMapper;
        this.commentMapper = commentMapper;
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getPublicTickets() {
        return ticketMapper.toResponseList(ticketRepository.findAllByOrderByCreatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<TicketUserResponse> getMyTickets(User user) {
        return ticketMapper.toUserResponseList(ticketRepository.findByCreatedByOrderByCreatedAtDesc(user));
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getMyTicketDetail(Long id, User user) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new AppException("Ticket not found", HttpStatus.NOT_FOUND));

        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN);
        }

        TicketDetailResponse detail = ticketMapper.toDetailResponse(ticket);
        List<CommentResponse> comments = commentMapper.toResponseList(
                commentRepository.findByTicketOrderByCreatedAtDesc(ticket)
        );
        detail.setComments(comments);
        detail.setCommentCount(comments.size());
        return detail;
    }

    @Transactional
    public TicketDetailResponse createTicket(CreateTicketRequest request, User user) {
        Ticket ticket = ticketMapper.toEntity(request);
        ticket.setCreatedBy(user);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setTicketNumber(generateTicketNumber());

        Ticket saved = ticketRepository.save(ticket);
        TicketDetailResponse detail = ticketMapper.toDetailResponse(saved);
        detail.setComments(List.of());
        detail.setCommentCount(0);
        return detail;
    }

    private String generateTicketNumber() {
        String year = String.valueOf(Year.now().getValue());
        return "INC-" + year + "-" + System.currentTimeMillis();
    }
}
