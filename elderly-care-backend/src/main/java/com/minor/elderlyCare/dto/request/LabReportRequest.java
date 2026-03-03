package com.minor.elderlyCare.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for creating a lab report.
 *
 * Example JSON:
 * {
 *   "elderId": "550e8400-e29b-41d4-a716-446655440000",
 *   "testName": "Complete Blood Count",
 *   "result": "Hemoglobin: 13.2 g/dL, WBC: 7800/mcL",
 *   "testDate": "2026-03-01",
 *   "fileUrl": "https://storage.example.com/reports/cbc-20260301.pdf",
 *   "notes": "All values normal"
 * }
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReportRequest {

    @NotNull(message = "Elder ID is required")
    private UUID elderId;

    @NotBlank(message = "Test name is required")
    @Size(max = 200)
    private String testName;

    @NotBlank(message = "Result is required")
    @Size(max = 500)
    private String result;

    @NotNull(message = "Test date is required")
    private LocalDate testDate;

    /** URL of the uploaded PDF. Can be null if no file was uploaded. */
    private String fileUrl;

    private String notes;
}
