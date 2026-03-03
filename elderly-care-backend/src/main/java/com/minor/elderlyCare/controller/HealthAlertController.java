package com.minor.elderlyCare.controller;

import com.minor.elderlyCare.dto.response.HealthAlertResponse;
import com.minor.elderlyCare.security.CustomUserPrincipal;
import com.minor.elderlyCare.service.HealthAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for health alerts.
 *
 * Alerts are auto-generated when abnormal vitals are recorded.
 * Guardians can view, acknowledge, and resolve alerts.
 *
 * <h3>Endpoints:</h3>
 * <pre>
 * GET    /api/health-alerts/elder/{elderId}           — All alerts (paginated)
 * GET    /api/health-alerts/elder/{elderId}/active    — Active alerts only
 * GET    /api/health-alerts/elder/{elderId}/count     — Count of active alerts
 * PATCH  /api/health-alerts/{id}/acknowledge          — Acknowledge alert
 * PATCH  /api/health-alerts/{id}/resolve              — Resolve alert
 * </pre>
 */
@RestController
@RequestMapping("/api/health-alerts")
@RequiredArgsConstructor
public class HealthAlertController {

    private final HealthAlertService healthAlertService;

    /** Get all alerts for an elder (paginated, newest first). */
    @GetMapping("/elder/{elderId}")
    public ResponseEntity<Page<HealthAlertResponse>> getAlerts(
            @PathVariable UUID elderId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                healthAlertService.getAlerts(elderId, principal.getUser(), pageable));
    }

    /** Get active (unresolved) alerts only. */
    @GetMapping("/elder/{elderId}/active")
    public ResponseEntity<List<HealthAlertResponse>> getActiveAlerts(
            @PathVariable UUID elderId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                healthAlertService.getActiveAlerts(elderId, principal.getUser()));
    }

    /** Count of active alerts (useful for badge/notification count). */
    @GetMapping("/elder/{elderId}/count")
    public ResponseEntity<Map<String, Long>> countActiveAlerts(
            @PathVariable UUID elderId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        long count = healthAlertService.countActiveAlerts(elderId, principal.getUser());
        return ResponseEntity.ok(Map.of("activeAlertCount", count));
    }

    /**
     * Acknowledge an alert.
     *
     * Example: PATCH /api/health-alerts/{id}/acknowledge
     * Response: the updated alert with status = ACKNOWLEDGED
     */
    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<HealthAlertResponse> acknowledgeAlert(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                healthAlertService.acknowledgeAlert(id, principal.getUser()));
    }

    /**
     * Resolve an alert.
     *
     * Example: PATCH /api/health-alerts/{id}/resolve
     * Response: the updated alert with status = RESOLVED
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<HealthAlertResponse> resolveAlert(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                healthAlertService.resolveAlert(id, principal.getUser()));
    }
}
