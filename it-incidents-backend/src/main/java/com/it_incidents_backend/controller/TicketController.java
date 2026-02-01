package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.ticket.*;
import com.it_incidents_backend.entities.Priority;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.TicketStatus;
import com.it_incidents_backend.service.TicketService;
import com.it_incidents_backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(
        name = "Tickets",
        description = "Endpoints for ticket management"
)
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

    private final TicketService ticketService;

    /**
     * Create a new ticket (Authenticated users only)
     * POST /api/tickets
     */
    @Operation(
            summary = "Create a new ticket",
            description = "Authenticated users can create a new ticket."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Ticket created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketResponse.class)
                            )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        TicketResponse ticket = ticketService.createTicket(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    /**
     * Get all tickets - PUBLIC can see (limited info)
     * GET /api/tickets
     */
    @Operation(
            summary = "(ALL) Get all tickets",
            description = "Public endpoint: retrieves all tickets (limited info).")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tickets retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TicketResponse.class)
                    )
            )
    })
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get ticket by ID (Authenticated users)
     * - USER: Can only see their own tickets
     * - ADMIN: Can see all tickets
     * GET /api/tickets/{id}
     */
    @Operation(
            summary = "Get ticket by ID",
            description = "Returns a ticket. Users see only their tickets; admins see all.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Ticket retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketDetailResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailResponse> getTicketById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        Role userRole = SecurityUtils.getUserRole(authentication);

        TicketDetailResponse ticket = ticketService.getTicketById(id, userId, userRole);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Get current user's tickets
     * GET /api/tickets/my
     */
    @Operation(
            summary = "Get current user's tickets",
            description = "Authenticated user can retrieve their own tickets.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tickets retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketDetailResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @GetMapping("/my")
    public ResponseEntity<List<TicketDetailResponse>> getMyTickets(
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        List<TicketDetailResponse> tickets = ticketService.getMyTickets(userId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Update ticket status (ADMIN only)
     * PUT /api/tickets/{id}/status
     */
    @Operation(
            summary = "(ADMIN) Update ticket status",
            description = "Admin only: update the status of a ticket.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Ticket status updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketDetailResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDetailResponse> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication
    ) {
        String adminUsername = authentication.getName();
        TicketDetailResponse ticket = ticketService.updateTicketStatus(id, request, adminUsername);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Confirm resolution (USER confirms if ticket is really resolved)
     * POST /api/tickets/{id}/confirm-resolution
     */
    @Operation(
            summary = "(User) Confirm resolution",
            description = "Authenticated user confirms that the ticket is resolved.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Ticket confirmed successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketDetailResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/{id}/confirm-resolution")
    public ResponseEntity<TicketDetailResponse> confirmResolution(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmResolutionRequest request,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        TicketDetailResponse ticket = ticketService.confirmResolution(id, request, userId);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Get ticket statistics (ADMIN only)
     * GET /api/tickets/stats
     */
    @Operation(
            summary = "(ADMIN) Get ticket statistics",
            description = "Admin only: returns statistics about tickets."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketStatsResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketStatsResponse> getTicketStats() {
        TicketStatsResponse stats = ticketService.getTicketStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get tickets by status (ADMIN only)
     * GET /api/tickets/filter/status/{status}
     */
    @Operation(
            summary = "(ADMIN) Get tickets by status",
            description = "Admin only: filter tickets by status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tickets retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/filter/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getTicketsByStatus(
            @PathVariable TicketStatus status
    ) {
        List<TicketResponse> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets by priority (ADMIN only)
     * GET /api/tickets/filter/priority/{priority}
     */
    @Operation(
            summary = "(ADMIN) Get tickets by priority",
            description = "Admin only: filter tickets by priority.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tickets retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TicketResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/filter/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getTicketsByPriority(
            @PathVariable Priority priority
    ) {
        List<TicketResponse> tickets = ticketService.getTicketsByPriority(priority);
        return ResponseEntity.ok(tickets);
    }

//    // Helper methods to extract user info from JWT
//    private Long extractUserId(Authentication authentication) {
//        // TODO: Extract userId from JWT claims
//        // For now, return a placeholder - you'll implement this when UserService is ready
//        return 1L;
//    }
//
//    private Role extractUserRole(Authentication authentication) {
//        // TODO: Extract role from JWT claims
//        // For now, return USER - you'll implement this when UserService is ready
//        return Role.USER;
//    }
}