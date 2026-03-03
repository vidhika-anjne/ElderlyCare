package com.minor.elderlyCare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Stores lab test reports for an elder.
 *
 * The actual PDF / image file is stored in object storage (S3 / Azure Blob);
 * this entity keeps only the URL pointer ({@code fileUrl}).
 */
@Entity
@Table(
    name = "lab_reports",
    indexes = {
        @Index(name = "idx_lr_elder_id",   columnList = "elder_id"),
        @Index(name = "idx_lr_test_date",  columnList = "test_date")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_lr_elder"))
    private User elder;

    @NotBlank
    @Size(max = 200)
    @Column(name = "test_name", nullable = false, length = 200)
    private String testName;

    @NotBlank
    @Size(max = 500)
    @Column(name = "result", nullable = false, length = 500)
    private String result;

    @NotNull
    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    /** URL of the uploaded PDF / image stored in object storage. */
    @Column(name = "file_url", length = 1000)
    private String fileUrl;

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
