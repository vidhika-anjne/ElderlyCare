package com.minor.elderlyCare.controller;

import com.minor.elderlyCare.dto.request.MedicationRequest;
import com.minor.elderlyCare.dto.response.MedicationResponse;
import com.minor.elderlyCare.security.CustomUserPrincipal;
import com.minor.elderlyCare.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for medication management.
 *
 * <h3>Endpoints:</h3>
 * <pre>
 * POST   /api/medications                           — Create medication
 * PUT    /api/medications/{id}                      — Update medication
 * PATCH  /api/medications/{id}/toggle               — Toggle active/inactive
 * GET    /api/medications/elder/{elderId}           — All medications (paginated)
 * GET    /api/medications/elder/{elderId}/active    — Active medications only
 * DELETE /api/medications/{id}                      — Delete medication
 * </pre>
 */
@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    /**
     * Create a new medication.
     *
     * Example request:
     * POST /api/medications
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
    @PostMapping
    public ResponseEntity<MedicationResponse> createMedication(
            @Valid @RequestBody MedicationRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicationService.createMedication(request, principal.getUser()));
    }

    /** Update an existing medication. */
    @PutMapping("/{id}")
    public ResponseEntity<MedicationResponse> updateMedication(
            @PathVariable UUID id,
            @Valid @RequestBody MedicationRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                medicationService.updateMedication(id, request, principal.getUser()));
    }

    /** Toggle medication active/inactive status. */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<MedicationResponse> toggleMedication(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                medicationService.toggleActive(id, principal.getUser()));
    }

    /** Get all medications for an elder (paginated, active first). */
    @GetMapping("/elder/{elderId}")
    public ResponseEntity<Page<MedicationResponse>> getMedications(
            @PathVariable UUID elderId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                medicationService.getMedications(elderId, principal.getUser(), pageable));
    }

    /** Get active medications only (for reminder scheduling). */
    @GetMapping("/elder/{elderId}/active")
    public ResponseEntity<List<MedicationResponse>> getActiveMedications(
            @PathVariable UUID elderId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        return ResponseEntity.ok(
                medicationService.getActiveMedications(elderId, principal.getUser()));
    }

    /** Delete a medication. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        medicationService.deleteMedication(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}
