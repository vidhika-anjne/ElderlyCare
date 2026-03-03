package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.VitalRecord;
import com.minor.elderlyCare.model.VitalType;
import lombok.*;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for a vital-sign record.
 *
 * Example JSON:
 * {
 *   "id": "...",
 *   "elderId": "...",
 *   "elderName": "John Doe",
 *   "vitalType": "BLOOD_PRESSURE",
 *   "vitalTypeDisplayName": "Blood Pressure",
 *   "value": 145.0,
 *   "secondaryValue": 92.0,
 *   "unit": "mmHg",
 *   "notes": "Measured after lunch",
 *   "recordedAt": "2026-03-03T10:30:00Z",
 *   "isAbnormal": true,
 *   "createdAt": "2026-03-03T10:31:00+00:00"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalRecordResponse {

    private UUID id;
    private UUID elderId;
    private String elderName;
    private VitalType vitalType;
    private String vitalTypeDisplayName;
    private Double value;
    private Double secondaryValue;
    private String unit;
    private String notes;
    private Instant recordedAt;
    private boolean isAbnormal;
    private OffsetDateTime createdAt;

    public static VitalRecordResponse from(VitalRecord vr) {
        return VitalRecordResponse.builder()
                .id(vr.getId())
                .elderId(vr.getElder().getId())
                .elderName(vr.getElder().getName())
                .vitalType(vr.getVitalType())
                .vitalTypeDisplayName(vr.getVitalType().getDisplayName())
                .value(vr.getValue())
                .secondaryValue(vr.getSecondaryValue())
                .unit(vr.getUnit())
                .notes(vr.getNotes())
                .recordedAt(vr.getRecordedAt())
                .isAbnormal(vr.isAbnormal())
                .createdAt(vr.getCreatedAt())
                .build();
    }
}
