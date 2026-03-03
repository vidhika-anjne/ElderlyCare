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
 * Records a single vital-sign measurement for an elder.
 *
 * For BLOOD_PRESSURE the primary {@code value} stores the systolic reading
 * and {@code secondaryValue} stores the diastolic reading.
 * For all other vital types only {@code value} is used.
 */
@Entity
@Table(
    name = "vital_records",
    indexes = {
        @Index(name = "idx_vr_elder_id",        columnList = "elder_id"),
        @Index(name = "idx_vr_vital_type",      columnList = "vital_type"),
        @Index(name = "idx_vr_elder_type",       columnList = "elder_id, vital_type"),
        @Index(name = "idx_vr_recorded_at",     columnList = "recorded_at")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** The elder whose vital sign is being recorded. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_vr_elder"))
    private User elder;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vital_type", nullable = false, length = 25)
    private VitalType vitalType;

    /** Primary measurement value (e.g. blood-sugar level, systolic pressure). */
    @NotNull
    @Column(name = "value", nullable = false)
    private Double value;

    /** Secondary value — used only for diastolic in blood-pressure readings. */
    @Column(name = "secondary_value")
    private Double secondaryValue;

    @NotBlank
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "notes", length = 500)
    private String notes;

    /** When the measurement was actually taken (may differ from DB insert time). */
    @NotNull
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    /** Whether this reading was flagged as abnormal by the system. */
    @Builder.Default
    @Column(name = "is_abnormal", nullable = false)
    private boolean isAbnormal = false;

    // ── Audit Timestamps ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
