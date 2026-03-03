package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.LabReport;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for a lab report.
 *
 * Example JSON:
 * {
 *   "id": "...",
 *   "elderId": "...",
 *   "elderName": "John Doe",
 *   "testName": "Complete Blood Count",
 *   "result": "Hemoglobin: 13.2 g/dL",
 *   "testDate": "2026-03-01",
 *   "fileUrl": "https://storage.example.com/reports/cbc.pdf",
 *   "notes": "All values normal",
 *   "createdAt": "2026-03-01T14:00:00+00:00"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReportResponse {

    private UUID id;
    private UUID elderId;
    private String elderName;
    private String testName;
    private String result;
    private LocalDate testDate;
    private String fileUrl;
    private String notes;
    private OffsetDateTime createdAt;

    public static LabReportResponse from(LabReport lr) {
        return LabReportResponse.builder()
                .id(lr.getId())
                .elderId(lr.getElder().getId())
                .elderName(lr.getElder().getName())
                .testName(lr.getTestName())
                .result(lr.getResult())
                .testDate(lr.getTestDate())
                .fileUrl(lr.getFileUrl())
                .notes(lr.getNotes())
                .createdAt(lr.getCreatedAt())
                .build();
    }
}
