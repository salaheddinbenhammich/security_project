package com.it_incidents_backend.repository;

import com.it_incidents_backend.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketCommentRepositoryUnitTest {

    @Mock
    private TicketCommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    private User testUser;
    private Ticket testTicket;
    private TicketComment testComment;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(Role.USER)
                .deleted(false)
                .build();

        testTicket = Ticket.builder()
                .ticketNumber("INC-2025-0001")
                .title("Test Ticket")
                .description("Test")
                .status(TicketStatus.PENDING)
                .priority(Priority.MEDIUM)
                .category(Category.HARDWARE)
                .createdBy(testUser)
                .lastUpdatedBy(testUser.getUsername())
                .build();

        testComment = TicketComment.builder()
                .ticket(testTicket)
                .author(testUser)
                .content("Test comment")
                .isInternal(false)
                .build();
    }

    @Test
    void whenSaveComment_thenReturnComment() {
        when(commentRepository.save(testComment)).thenReturn(testComment);

        TicketComment saved = commentRepository.save(testComment);

        assertThat(saved.getContent()).isEqualTo("Test comment");
        verify(commentRepository, times(1)).save(testComment);
    }

    @Test
    void whenFindByTicket_thenReturnComments() {
        when(commentRepository.findByTicketOrderByCreatedAtDesc(testTicket))
                .thenReturn(List.of(testComment));

        List<TicketComment> comments = commentRepository.findByTicketOrderByCreatedAtDesc(testTicket);

        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).getContent()).isEqualTo("Test comment");
        verify(commentRepository, times(1)).findByTicketOrderByCreatedAtDesc(testTicket);
    }

    @Test
    void whenFindByAuthor_thenReturnAuthorComments() {
        when(commentRepository.findByAuthorOrderByCreatedAtDesc(testUser))
                .thenReturn(List.of(testComment));

        List<TicketComment> comments = commentRepository.findByAuthorOrderByCreatedAtDesc(testUser);

        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).getAuthor().getUsername()).isEqualTo("testuser");
    }

    @Test
    void whenFindByTicketAndIsInternalFalse_thenReturnPublicComments() {
        when(commentRepository.findByTicketAndIsInternalFalseOrderByCreatedAtDesc(testTicket))
                .thenReturn(List.of(testComment));

        List<TicketComment> publicComments = commentRepository.findByTicketAndIsInternalFalseOrderByCreatedAtDesc(testTicket);

        assertThat(publicComments).hasSize(1);
        assertThat(publicComments.get(0).getIsInternal()).isFalse();
    }

    @Test
    void whenFindByTicketAndIsInternalTrue_thenReturnInternalComments() {
        TicketComment internalComment = TicketComment.builder()
                .ticket(testTicket)
                .author(testUser)
                .content("Internal note")
                .isInternal(true)
                .build();

        when(commentRepository.findByTicketAndIsInternalTrueOrderByCreatedAtDesc(testTicket))
                .thenReturn(List.of(internalComment));

        List<TicketComment> internalComments = commentRepository.findByTicketAndIsInternalTrueOrderByCreatedAtDesc(testTicket);

        assertThat(internalComments).hasSize(1);
        assertThat(internalComments.get(0).getIsInternal()).isTrue();
    }

    @Test
    void whenCountByTicket_thenReturnCorrectCount() {
        when(commentRepository.countByTicket(testTicket)).thenReturn(2L);

        long count = commentRepository.countByTicket(testTicket);

        assertThat(count).isEqualTo(2);
    }

    @Test
    void whenCountByTicketAndIsInternalFalse_thenReturnPublicCount() {
        when(commentRepository.countByTicketAndIsInternalFalse(testTicket)).thenReturn(1L);

        long count = commentRepository.countByTicketAndIsInternalFalse(testTicket);

        assertThat(count).isEqualTo(1);
    }

    @Test
    void whenEditComment_thenEditedFlagSet() {
        testComment.setContent("Edited content");
        testComment.setEdited(true);

        when(commentRepository.save(testComment)).thenReturn(testComment);
        when(commentRepository.findById(testComment.getId())).thenReturn(Optional.of(testComment));

        commentRepository.save(testComment);
        TicketComment edited = commentRepository.findById(testComment.getId()).orElseThrow();

        assertThat(edited.getEdited()).isTrue();
        assertThat(edited.getContent()).isEqualTo("Edited content");
    }
}