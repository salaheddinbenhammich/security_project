package com.it_incidents_backend.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketStatsResponse {
    private Long totalTickets;
    private Long pendingTickets;
    private Long inProgressTickets;
    private Long resolvedTickets;
    private Long closedTickets;
}