package com.it_incidents_backend.mapper;

import com.it_incidents_backend.dto.comment.CreateCommentRequest;
import com.it_incidents_backend.dto.comment.CommentResponse;
import com.it_incidents_backend.dto.comment.UpdateCommentRequest;
import com.it_incidents_backend.entities.TicketComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CommentMapper {

    // Entity → Response
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "authorFullName", expression = "java(comment.getAuthor().getFirstName() + \" \" + comment.getAuthor().getLastName())")
    CommentResponse toResponse(TicketComment comment);

    // List conversion
    List<CommentResponse> toResponseList(List<TicketComment> comments);

    // CreateCommentRequest → Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ticket", ignore = true)  // Set in service
    @Mapping(target = "author", ignore = true)  // Set in service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "edited", ignore = true)
    @Mapping(target = "editedAt", ignore = true)
    TicketComment toEntity(CreateCommentRequest request);

    // Update comment content (for editing)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ticket", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isInternal", ignore = true)
    @Mapping(target = "edited", ignore = true)
    @Mapping(target = "editedAt", ignore = true)
    void updateEntityFromRequest(UpdateCommentRequest request, @MappingTarget TicketComment comment);
}