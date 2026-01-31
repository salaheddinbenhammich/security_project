package com.it_incidents_backend.entities;

public enum TicketStatus {
    NEW,            // Newly created, not yet assigned
    ASSIGNED,       // Assigned to a technician
    IN_PROGRESS,    // Being worked on
    PENDING,        // Waiting for user response or external dependency
    RESOLVED,       // Issue resolved, waiting for user confirmation
    CLOSED,         // Ticket closed
    CANCELLED       // Ticket cancelled
}
