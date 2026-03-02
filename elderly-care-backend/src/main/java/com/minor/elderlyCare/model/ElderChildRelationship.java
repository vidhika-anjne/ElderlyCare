package com.minor.elderlyCare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Junction table that maps the many-to-many monitoring relationship
 * between an ELDER and a CHILD (guardian).
 *
 * Relationship lifecycle:
 *   1. Child sends a request   → status = PENDING
 *   2. Elder approves          → status = ACTIVE
 *   3. Either party revokes    → status = REVOKED
 *
 * Database-level duplicate prevention:
 *   UNIQUE constraint on (elder_id, child_id) ensures each pair
 *   can exist only once, regardless of application logic.
 *
 * Table: elder_child_relationship
 */
@Entity
@Table(
    name = "elder_child_relationship",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_ecr_elder_child",
            columnNames = {"elder_id", "child_id"}
        )
    },
    indexes = {
        @Index(name = "idx_ecr_elder_id",    columnList = "elder_id"),
        @Index(name = "idx_ecr_child_id",    columnList = "child_id"),
        @Index(name = "idx_ecr_status",      columnList = "status"),
        @Index(name = "idx_ecr_elder_status",columnList = "elder_id, status"),
        @Index(name = "idx_ecr_child_status",columnList = "child_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElderChildRelationship {

    // ── Primary Key ──────────────────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // ── Participants ──────────────────────────────────────────────────────────
    /**
     * The elderly person whose data is being monitored.
     * FK → users(id) ON DELETE CASCADE
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "elder_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ecr_elder")
    )
    private User elder;

    /**
     * The child / guardian doing the monitoring.
     * FK → users(id) ON DELETE CASCADE
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "child_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ecr_child")
    )
    private User child;

    /**
     * The user who initiated the relationship request.
     * Either the child (most common) or the elder can send the invite.
     * FK → users(id) ON DELETE RESTRICT — keeps the audit trail intact.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "requested_by",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ecr_requested_by")
    )
    private User requestedBy;

    // ── Status ────────────────────────────────────────────────────────────────
    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private RelationshipStatus status = RelationshipStatus.PENDING;

    // ── Audit Timestamps ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
