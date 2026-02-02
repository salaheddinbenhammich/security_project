package com.it_incidents_backend.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private UUID id;
    private String content;
    private Boolean isInternal;
    private LocalDateTime createdAt;
    private Boolean edited;
    private LocalDateTime editedAt;

    // Author info (limited)
    private UUID authorId;
    private String authorUsername;
    private String authorFullName; // firstName + lastName
}