package com.it_incidents_backend.dto.ticket;

import com.it_incidents_backend.entities.Category;
import com.it_incidents_backend.entities.Priority;
import com.it_incidents_backend.entities.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketUserResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private Category category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
