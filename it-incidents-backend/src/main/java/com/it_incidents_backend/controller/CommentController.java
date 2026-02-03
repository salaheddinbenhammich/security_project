package com.it_incidents_backend.controller;

import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.comment.UpdateCommentRequest;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.service.CommentService;
import com.it_incidents_backend.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final CurrentUserService currentUserService;

    public CommentController(CommentService commentService, CurrentUserService currentUserService) {
        this.commentService = commentService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public CommentResponse addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        return commentService.addComment(ticketId, request, user);
    }

    @PutMapping("/{commentId}")
    public CommentResponse updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        return commentService.updateComment(ticketId, commentId, request, user);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId
    ) {
        User user = currentUserService.getCurrentUser();
        commentService.deleteComment(ticketId, commentId, user);
    }
}
