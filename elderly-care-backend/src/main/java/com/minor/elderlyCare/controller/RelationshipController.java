package com.minor.elderlyCare.controller;

import com.minor.elderlyCare.dto.request.RelationshipRequest;
import com.minor.elderlyCare.dto.response.RelationshipResponse;
import com.minor.elderlyCare.security.CustomUserPrincipal;
import com.minor.elderlyCare.service.RelationshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/relationships")
@RequiredArgsConstructor
public class RelationshipController {

    private final RelationshipService relationshipService;

    /**
     * POST /api/relationships/request
     *
     * Send a monitoring connection request to another user by their email.
     * Either an ELDER or a CHILD can initiate.
     * The server resolves which side is elder/child from the two users' roles.
     */
    @PostMapping("/request")
    public ResponseEntity<RelationshipResponse> request(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody RelationshipRequest req) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(relationshipService.requestRelationship(
                        principal.getUser().getId(), req));
    }

    /**
     * PATCH /api/relationships/{id}/accept
     *
     * Accept a PENDING request.
     * Only the non-initiating participant can accept.
     * Sets status → ACTIVE.
     */
    @PatchMapping("/{id}/accept")
    public ResponseEntity<RelationshipResponse> accept(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                relationshipService.acceptRelationship(
                        principal.getUser().getId(), id));
    }

    /**
     * PATCH /api/relationships/{id}/revoke
     *
     * Revoke a PENDING or ACTIVE relationship.
     * Either participant (elder or child) can revoke.
     * Sets status → REVOKED.
     */
    @PatchMapping("/{id}/revoke")
    public ResponseEntity<RelationshipResponse> revoke(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                relationshipService.revokeRelationship(
                        principal.getUser().getId(), id));
    }

    /**
     * GET /api/relationships/my-children
     *
     * [ELDER] Returns all children (ACTIVE status) who are monitoring this elder.
     */
    @GetMapping("/my-children")
    public ResponseEntity<List<RelationshipResponse>> getMyChildren(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(
                relationshipService.getMyChildren(principal.getUser().getId()));
    }

    /**
     * GET /api/relationships/my-elders
     *
     * [CHILD] Returns all elders (ACTIVE status) that this child is monitoring.
     */
    @GetMapping("/my-elders")
    public ResponseEntity<List<RelationshipResponse>> getMyElders(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(
                relationshipService.getMyElders(principal.getUser().getId()));
    }

    /**
     * GET /api/relationships/pending/incoming
     *
     * Returns all PENDING requests where the current user is the recipient
     * (not the requester). These are shown as "accept" notifications.
     */
    @GetMapping("/pending/incoming")
    public ResponseEntity<List<RelationshipResponse>> getIncomingPendingRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(
                relationshipService.getIncomingPendingRequests(
                        principal.getUser().getId()));
    }

    /**
     * GET /api/relationships/pending/sent
     *
     * Returns all PENDING requests where the current user IS the requester.
     * These are shown as "awaiting acceptance" status notifications.
     */
    @GetMapping("/pending/sent")
    public ResponseEntity<List<RelationshipResponse>> getSentPendingRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(
                relationshipService.getSentPendingRequests(
                        principal.getUser().getId()));
    }
}
