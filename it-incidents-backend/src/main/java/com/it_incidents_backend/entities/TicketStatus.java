package com.it_incidents_backend.entities;

public enum TicketStatus {
    PENDING,
    IN_PROGRESS,    // Being worked on
    RESOLVED,       // Issue resolved, waiting for user confirmation
    CLOSED,         // Ticket closed
    CANCELLED       // Ticket cancelled
}
