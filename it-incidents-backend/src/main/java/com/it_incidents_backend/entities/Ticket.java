package com.it_incidents_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_priority", columnList = "priority"),
        @Index(name = "idx_created_by", columnList = "created_by_id"),
        //@Index(name = "idx_assigned_to", columnList = "assigned_to_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ticketNumber; // e.g., INC-2025-0001

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    // User who created the ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

//    // Technician/Admin assigned to handle the ticket
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "assigned_to_id")
//    private User assignedTo;

//    @Column(name = "assigned_at")
//    private LocalDateTime assignedAt;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

//    @Column(name = "due_date")
//    private LocalDateTime dueDate;

    // Audit trail
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_updated_by")
    private String lastUpdatedBy;

    // Comments/Activity history
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private Set<TicketComment> comments = new HashSet<>();

//    // Soft delete
//    @Column(name = "deleted", nullable = false)
//    @Builder.Default
//    private Boolean deleted = false;
//
//    @Column(name = "deleted_at")
//    private LocalDateTime deletedAt;
//
//    @Column(name = "deleted_by")
//    private String deletedBy;


//    // Attachments (if needed in future)
//    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
//    @Builder.Default
//    private Set<TicketAttachment> attachments = new HashSet<>();

//    // Helper method for soft delete
//    public void softDelete(String deletedBy) {
//        this.deleted = true;
//        this.deletedAt = LocalDateTime.now();
//        this.deletedBy = deletedBy;
//    }

//    // Business logic helpers
//    public void assignTo(User technician) {
//        this.assignedTo = technician;
//        this.assignedAt = LocalDateTime.now();
//        if (this.status == TicketStatus.PENDING) {
//            this.status = TicketStatus.ASSIGNED;
//        }
//    }

    public void resolve(String resolution) {
        this.resolution = resolution;
        this.resolvedAt = LocalDateTime.now();
        this.status = TicketStatus.RESOLVED;
    }

    public void close() {
        this.closedAt = LocalDateTime.now();
        this.status = TicketStatus.CLOSED;
    }

    public void reopen() {
        this.status = TicketStatus.PENDING;
        this.closedAt = null;
        this.resolvedAt = null;
        this.resolution = null;
    }
}
