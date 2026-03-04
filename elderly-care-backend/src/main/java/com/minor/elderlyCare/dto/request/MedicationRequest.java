package com.minor.elderlyCare.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request body for creating or updating a medication.
 *
 * Example JSON:
 * {
 *   "elderId": "550e8400-e29b-41d4-a716-446655440000",
 *   "medicineName": "Metformin",
 *   "dosage": "500mg",
 *   "frequency": "Twice daily",
 *   "reminderTime": "08:00",
 *   "isActive": true,
 *   "startDate": "2026-01-15",
 *   "endDate": "2026-06-15",
 *   "notes": "Take with meals"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationRequest {

    @NotNull(message = "Elder ID is required")
    private UUID elderId;

    @NotBlank(message = "Medicine name is required")
    @Size(max = 200)
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    @Size(max = 100)
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100)
    private String frequency;

    private LocalTime reminderTime;

    /** Defaults to true when not supplied. */
    private Boolean isActive = Boolean.TRUE;

    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}
