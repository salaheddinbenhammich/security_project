package com.it_incidents_backend.dto;

import com.it_incidents_backend.model.Category;
import com.it_incidents_backend.model.IncidentStatus;
import com.it_incidents_backend.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {
    private Long id;
    private String title;
    private String description;
    private IncidentStatus status;
    private Priority priority;
    private Category category;
    private UserSummary createdBy;
    private UserSummary assignedTo;
    private String resolution;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}

