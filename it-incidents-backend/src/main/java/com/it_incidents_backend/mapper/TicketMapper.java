package com.it_incidents_backend.mapper;

import com.it_incidents_backend.dto.ticket.CreateTicketRequest;
import com.it_incidents_backend.dto.ticket.TicketDetailResponse;
import com.it_incidents_backend.dto.ticket.TicketResponse;
import com.it_incidents_backend.entities.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {UserMapper.class, CommentMapper.class})
public interface TicketMapper {

    // Entity → Simple Response (for list/dashboard)
    TicketResponse toResponse(Ticket ticket);

    // Entity → Detailed Response (for ticket details)
    @Mapping(target = "commentCount", expression = "java(ticket.getComments() != null ? ticket.getComments().size() : 0)")
    TicketDetailResponse toDetailResponse(Ticket ticket);

    // List conversion
    List<TicketResponse> toResponseList(List<Ticket> tickets);
    List<TicketDetailResponse> toDetailResponseList(List<Ticket> tickets);

    // CreateTicketRequest → Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ticketNumber", ignore = true) // Generated in service
    @Mapping(target = "status", ignore = true)       // Set to PENDING in service
    @Mapping(target = "createdBy", ignore = true)    // Set in service
    @Mapping(target = "resolution", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "closedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastUpdatedBy", ignore = true)
    @Mapping(target = "comments", ignore = true)
    Ticket toEntity(CreateTicketRequest request);
}