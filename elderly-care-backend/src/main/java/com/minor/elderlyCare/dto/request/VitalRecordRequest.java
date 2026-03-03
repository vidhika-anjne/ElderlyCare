package com.minor.elderlyCare.dto.request;

import com.minor.elderlyCare.model.VitalType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Request body for recording a new vital sign.
 *
 * Example JSON (blood pressure):
 * {
 *   "elderId": "550e8400-e29b-41d4-a716-446655440000",
 *   "vitalType": "BLOOD_PRESSURE",
 *   "value": 145.0,
 *   "secondaryValue": 92.0,
 *   "unit": "mmHg",
 *   "notes": "Measured after lunch",
 *   "recordedAt": "2026-03-03T10:30:00Z"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalRecordRequest {

    @NotNull(message = "Elder ID is required")
    private UUID elderId;

    @NotNull(message = "Vital type is required")
    private VitalType vitalType;

    @NotNull(message = "Value is required")
    private Double value;

    /** Required only for BLOOD_PRESSURE (diastolic reading). */
    private Double secondaryValue;

    @NotBlank(message = "Unit is required")
    private String unit;

    private String notes;

    @NotNull(message = "Recorded-at timestamp is required")
    private Instant recordedAt;
}
