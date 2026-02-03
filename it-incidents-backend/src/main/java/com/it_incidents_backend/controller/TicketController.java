package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.ticket.CreateTicketRequest;
import com.it_incidents_backend.dto.ticket.TicketDetailResponse;
import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.dto.ticket.TicketUserResponse;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.service.CurrentUserService;
import com.it_incidents_backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    public TicketController(TicketService ticketService, CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/public")
    public List<TicketResponse> getPublicTickets() {
        return ticketService.getPublicTickets();
    }

    @GetMapping("/my")
    public List<TicketUserResponse> getMyTickets() {
        User user = currentUserService.getCurrentUser();
        return ticketService.getMyTickets(user);
    }

    @GetMapping("/{id}")
    public TicketDetailResponse getMyTicketDetail(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        return ticketService.getMyTicketDetail(id, user);
    }

    @PostMapping
    public TicketDetailResponse createTicket(@Valid @RequestBody CreateTicketRequest request) {
        User user = currentUserService.getCurrentUser();
        return ticketService.createTicket(request, user);
    }
}
