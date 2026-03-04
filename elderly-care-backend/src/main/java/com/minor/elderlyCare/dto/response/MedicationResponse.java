package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.Medication;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for a medication.
 *
 * Example JSON:
 * {
 *   "id": "...",
 *   "elderId": "...",
 *   "elderName": "John Doe",
 *   "medicineName": "Metformin",
 *   "dosage": "500mg",
 *   "frequency": "Twice daily",
 *   "reminderTime": "08:00",
 *   "isActive": true,
 *   "startDate": "2026-01-15",
 *   "endDate": "2026-06-15",
 *   "notes": "Take with meals",
 *   "createdAt": "2026-01-15T09:00:00+00:00"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationResponse {

    private UUID id;
    private UUID elderId;
    private String elderName;
    private String medicineName;
    private String dosage;
    private String frequency;
    private LocalTime reminderTime;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private OffsetDateTime createdAt;

    public static MedicationResponse from(Medication m) {
        return MedicationResponse.builder()
                .id(m.getId())
                .elderId(m.getElder().getId())
                .elderName(m.getElder().getName())
                .medicineName(m.getMedicineName())
                .dosage(m.getDosage())
                .frequency(m.getFrequency())
                .reminderTime(m.getReminderTime())
                .isActive(m.isActive())  // entity returns primitive boolean, autoboxed to Boolean
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
