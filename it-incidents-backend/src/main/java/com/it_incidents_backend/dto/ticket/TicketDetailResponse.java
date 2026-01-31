package com.it_incidents_backend.dto.ticket;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.user.UserResponse;
import com.it_incidents_backend.entities.Category;
import com.it_incidents_backend.entities.Priority;
import com.it_incidents_backend.entities.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDetailResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private Category category;

    // Creator info
    private UserResponse createdBy;

    // Resolution info
    private String resolution;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Comments (public or all depending on user role)
    private List<CommentResponse> comments;

    // Comment count
    private Integer commentCount;
}