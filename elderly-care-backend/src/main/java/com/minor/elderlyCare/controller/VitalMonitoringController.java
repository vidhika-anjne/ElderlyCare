package com.minor.elderlyCare.controller;

import com.minor.elderlyCare.dto.request.VitalRecordRequest;
import com.minor.elderlyCare.dto.response.VitalRecordResponse;
import com.minor.elderlyCare.model.VitalType;
import com.minor.elderlyCare.security.CustomUserPrincipal;
import com.minor.elderlyCare.service.VitalMonitoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for vital-sign monitoring.
 *
 * All endpoints require JWT authentication.
 * Access is validated per elder — the caller must be the elder themselves
 * or a linked CHILD with an ACTIVE relationship.
 *
 * <h3>Endpoints:</h3>
 * <pre>
 * POST   /api/vitals                                       — Record a vital sign
 * GET    /api/vitals/elder/{elderId}                       — All vitals (paginated)
 * GET    /api/vitals/elder/{elderId}/type/{type}           — Vitals by type (paginated)
 * GET    /api/vitals/elder/{elderId}/latest                — Latest reading per type
 * GET    /api/vitals/elder/{elderId}/trend?type=...&from=...&to=... — Trend data
 * </pre>
 */
@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalMonitoringController {

    private final VitalMonitoringService vitalMonitoringService;

    /**
     * Record a new vital sign.
     *
     * Example request:
     * POST /api/vitals
     * {
     *   "elderId": "550e8400-e29b-41d4-a716-446655440000",
     *   "vitalType": "BLOOD_PRESSURE",
     *   "value": 145.0,
     *   "secondaryValue": 92.0,
     *   "unit": "mmHg",
     *   "notes": "After lunch",
     *   "recordedAt": "2026-03-03T10:30:00Z"
     * }
     */
    @PostMapping
    public ResponseEntity<VitalRecordResponse> recordVital(
            @Valid @RequestBody VitalRecordRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        VitalRecordResponse response = vitalMonitoringService.recordVital(
                request, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Get all vitals for an elder (paginated, default 20 per page). */
    @GetMapping("/elder/{elderId}")
    public ResponseEntity<Page<VitalRecordResponse>> getVitals(
            @PathVariable UUID elderId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                vitalMonitoringService.getVitals(elderId, principal.getUser(), pageable));
    }

    /** Get vitals filtered by type. */
    @GetMapping("/elder/{elderId}/type/{type}")
    public ResponseEntity<Page<VitalRecordResponse>> getVitalsByType(
            @PathVariable UUID elderId,
            @PathVariable VitalType type,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                vitalMonitoringService.getVitalsByType(elderId, type, principal.getUser(), pageable));
    }

    /** Latest reading per vital type (dashboard summary). */
    @GetMapping("/elder/{elderId}/latest")
    public ResponseEntity<List<VitalRecordResponse>> getLatestVitals(
            @PathVariable UUID elderId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                vitalMonitoringService.getLatestVitals(elderId, principal.getUser()));
    }

    /**
     * Trend data for a specific vital type within a date range.
     *
     * Example: GET /api/vitals/elder/{elderId}/trend?type=HEART_RATE&from=2026-02-01T00:00:00Z&to=2026-03-03T23:59:59Z
     */
    @GetMapping("/elder/{elderId}/trend")
    public ResponseEntity<List<VitalRecordResponse>> getVitalsTrend(
            @PathVariable UUID elderId,
            @RequestParam VitalType type,
            @RequestParam Instant from,
            @RequestParam Instant to,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                vitalMonitoringService.getVitalsTrend(elderId, type, from, to, principal.getUser()));
    }
}
