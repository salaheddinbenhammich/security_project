package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.comment.UpdateCommentRequest;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.service.CommentService;
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
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@Tag(
        name = "Comments",
        description = "Manage comments related to incident tickets"
)
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

    private final CommentService commentService;

    /**
     * Add comment to ticket (Authenticated users)
     * POST /api/tickets/{ticketId}/comments
     */
    @Operation(
            summary = "Add comment to a ticket",
            description = "Adds a new comment to a ticket. Accessible by authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Comment created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        Role userRole = SecurityUtils.getUserRole(authentication);

        CommentResponse comment = commentService.addComment(ticketId, request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * Get all comments for a ticket
     * GET /api/tickets/{ticketId}/comments
     */
    @Operation(
            summary = "Get ticket comments",
            description = "Returns all comments associated with a given ticket."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Comments retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getTicketComments(
            @PathVariable UUID ticketId,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        Role userRole = SecurityUtils.getUserRole(authentication);

        List<CommentResponse> comments = commentService.getTicketComments(ticketId, userId, userRole);
        return ResponseEntity.ok(comments);
    }

    /**
     * Update/Edit comment
     * PUT /api/tickets/{ticketId}/comments/{commentId}
     */
    @Operation(
            summary = "Update a comment",
            description = "Updates an existing comment. Allowed for the comment owner or administrators."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Comment updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.getUserId(authentication);
        Role userRole = SecurityUtils.getUserRole(authentication);

        CommentResponse comment = commentService.updateComment(commentId, request, userId, userRole);
        return ResponseEntity.ok(comment);
    }

    /**
     * Delete comment (ADMIN only)
     * DELETE /api/tickets/{ticketId}/comments/{commentId}
     */
    @Operation(
            summary = "(ADMIN) Delete a comment",
            description = "Deletes a comment. Accessible only by administrators."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId
    ) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

//    // Helper methods to extract user info from JWT
//    private Long extractUserId(Authentication authentication) {
//        // TODO: Extract userId from JWT claims
//        return 1L;
//    }
//
//    private Role extractUserRole(Authentication authentication) {
//        // TODO: Extract role from JWT claims
//        return Role.USER;
//    }
}