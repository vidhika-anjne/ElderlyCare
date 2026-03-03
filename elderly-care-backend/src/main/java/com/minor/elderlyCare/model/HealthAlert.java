package com.minor.elderlyCare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Auto-generated alert when a vital reading falls outside normal range.
 *
 * Linked guardians (CHILD users) can view and acknowledge alerts.
 * Lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED.
 */
@Entity
@Table(
    name = "health_alerts",
    indexes = {
        @Index(name = "idx_ha_elder_id",        columnList = "elder_id"),
        @Index(name = "idx_ha_status",          columnList = "status"),
        @Index(name = "idx_ha_elder_status",    columnList = "elder_id, status"),
        @Index(name = "idx_ha_created_at",      columnList = "created_at")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_ha_elder"))
    private User elder;

    /** The vital record that triggered this alert (nullable for manual alerts). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vital_record_id",
                foreignKey = @ForeignKey(name = "fk_ha_vital_record"))
    private VitalRecord vitalRecord;

    @NotBlank
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 10)
    private AlertSeverity severity;

    @Builder.Default
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private AlertStatus status = AlertStatus.ACTIVE;

    /** The child/guardian who acknowledged the alert. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acknowledged_by",
                foreignKey = @ForeignKey(name = "fk_ha_acknowledged_by"))
    private User acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    // ── Audit Timestamps ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
