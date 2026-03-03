package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.AlertSeverity;
import com.minor.elderlyCare.model.AlertStatus;
import com.minor.elderlyCare.model.HealthAlert;
import lombok.*;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for a health alert.
 *
 * Example JSON:
 * {
 *   "id": "...",
 *   "elderId": "...",
 *   "elderName": "John Doe",
 *   "vitalRecordId": "...",
 *   "message": "CRITICAL: Blood Pressure reading 185/120 mmHg is dangerously high!",
 *   "severity": "CRITICAL",
 *   "status": "ACTIVE",
 *   "acknowledgedByName": null,
 *   "acknowledgedAt": null,
 *   "resolvedAt": null,
 *   "createdAt": "2026-03-03T10:31:00+00:00"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthAlertResponse {

    private UUID id;
    private UUID elderId;
    private String elderName;
    private UUID vitalRecordId;
    private String message;
    private AlertSeverity severity;
    private AlertStatus status;
    private UUID acknowledgedById;
    private String acknowledgedByName;
    private Instant acknowledgedAt;
    private Instant resolvedAt;
    private OffsetDateTime createdAt;

    public static HealthAlertResponse from(HealthAlert ha) {
        HealthAlertResponseBuilder builder = HealthAlertResponse.builder()
                .id(ha.getId())
                .elderId(ha.getElder().getId())
                .elderName(ha.getElder().getName())
                .message(ha.getMessage())
                .severity(ha.getSeverity())
                .status(ha.getStatus())
                .acknowledgedAt(ha.getAcknowledgedAt())
                .resolvedAt(ha.getResolvedAt())
                .createdAt(ha.getCreatedAt());

        if (ha.getVitalRecord() != null) {
            builder.vitalRecordId(ha.getVitalRecord().getId());
        }
        if (ha.getAcknowledgedBy() != null) {
            builder.acknowledgedById(ha.getAcknowledgedBy().getId())
                   .acknowledgedByName(ha.getAcknowledgedBy().getName());
        }

        return builder.build();
    }
}
