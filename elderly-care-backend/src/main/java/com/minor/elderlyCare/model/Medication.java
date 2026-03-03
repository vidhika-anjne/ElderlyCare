package com.minor.elderlyCare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Tracks a medication prescribed to an elder.
 *
 * Includes dosage, frequency, reminder time, and an active/inactive toggle
 * so completed or paused prescriptions are retained for history.
 */
@Entity
@Table(
    name = "medications",
    indexes = {
        @Index(name = "idx_med_elder_id",        columnList = "elder_id"),
        @Index(name = "idx_med_elder_active",    columnList = "elder_id, is_active")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_med_elder"))
    private User elder;

    @NotBlank
    @Size(max = 200)
    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage;

    @NotBlank
    @Size(max = 100)
    @Column(name = "frequency", nullable = false, length = 100)
    private String frequency;

    /** Time of day the reminder should fire (in the elder's local timezone). */
    @Column(name = "reminder_time")
    private LocalTime reminderTime;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "notes", length = 500)
    private String notes;

    // ── Audit Timestamps ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
