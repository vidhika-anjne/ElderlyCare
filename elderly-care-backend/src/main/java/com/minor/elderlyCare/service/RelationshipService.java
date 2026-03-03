package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.request.RelationshipRequest;
import com.minor.elderlyCare.dto.response.RelationshipResponse;
import com.minor.elderlyCare.exception.DuplicateResourceException;
import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.model.ElderChildRelationship;
import com.minor.elderlyCare.model.RelationshipStatus;
import com.minor.elderlyCare.model.Role;
import com.minor.elderlyCare.model.User;
import com.minor.elderlyCare.repository.ElderChildRelationshipRepository;
import com.minor.elderlyCare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelationshipService {

    private final UserRepository                   userRepository;
    private final ElderChildRelationshipRepository relationshipRepository;

    // ── Request a monitoring connection ───────────────────────────────────────

    @Transactional
    public RelationshipResponse requestRelationship(UUID currentUserId,
                                                     RelationshipRequest req) {

        User currentUser = loadActiveUser(currentUserId);
        User targetUser  = userRepository
                .findByEmailIgnoreCase(req.getTargetEmail())
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active user found with email: " + req.getTargetEmail()));

        // Cannot connect with yourself
        if (currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalStateException(
                    "You cannot send a monitoring request to yourself.");
        }

        // Roles must be complementary
        if (currentUser.getRole() == targetUser.getRole()) {
            throw new IllegalStateException(
                    "Both users have the same role (" + currentUser.getRole() + "). "
                    + "A relationship must connect one ELDER and one CHILD.");
        }

        // Resolve who is elder and who is child
        User elder = currentUser.getRole() == Role.ELDER ? currentUser : targetUser;
        User child = currentUser.getRole() == Role.CHILD ? currentUser : targetUser;

        if (relationshipRepository.existsByElderIdAndChildId(elder.getId(), child.getId())) {
            throw new DuplicateResourceException(
                    "A monitoring relationship between these two users already exists.");
        }

        ElderChildRelationship relationship = ElderChildRelationship.builder()
                .elder(elder)
                .child(child)
                .requestedBy(currentUser)
                .status(RelationshipStatus.PENDING)
                .build();

        return RelationshipResponse.from(relationshipRepository.save(relationship));
    }

    // ── Accept a PENDING request ──────────────────────────────────────────────

    @Transactional
    public RelationshipResponse acceptRelationship(UUID currentUserId, UUID relationshipId) {
        ElderChildRelationship relationship = loadRelationship(relationshipId);

        ensureParticipant(currentUserId, relationship);

        // Only the recipient (non-requester) can accept
        if (relationship.getRequestedBy().getId().equals(currentUserId)) {
            throw new IllegalStateException(
                    "You cannot accept a request that you sent.");
        }

        if (relationship.getStatus() != RelationshipStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING relationships can be accepted. Current status: "
                    + relationship.getStatus());
        }

        relationship.setStatus(RelationshipStatus.ACTIVE);
        return RelationshipResponse.from(relationshipRepository.save(relationship));
    }

    // ── Revoke an ACTIVE or PENDING relationship ──────────────────────────────

    @Transactional
    public RelationshipResponse revokeRelationship(UUID currentUserId, UUID relationshipId) {
        ElderChildRelationship relationship = loadRelationship(relationshipId);

        ensureParticipant(currentUserId, relationship);

        if (relationship.getStatus() == RelationshipStatus.REVOKED) {
            throw new IllegalStateException("Relationship is already revoked.");
        }

        relationship.setStatus(RelationshipStatus.REVOKED);
        return RelationshipResponse.from(relationshipRepository.save(relationship));
    }

    // ── Read queries ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RelationshipResponse> getMyChildren(UUID elderId) {
        return relationshipRepository
                .findByElderIdAndStatus(elderId, RelationshipStatus.ACTIVE)
                .stream()
                .map(RelationshipResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelationshipResponse> getMyElders(UUID childId) {
        return relationshipRepository
                .findByChildIdAndStatus(childId, RelationshipStatus.ACTIVE)
                .stream()
                .map(RelationshipResponse::from)
                .collect(Collectors.toList());
    }

    // ── Pending-request queries (for in-app notifications) ─────────────────

    /**
     * Returns PENDING relationships where the given user is the recipient
     * (i.e. they did NOT send the request). These are "incoming" requests
     * the user should see as notifications they can accept or reject.
     */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getIncomingPendingRequests(UUID userId) {
        User user = loadActiveUser(userId);
        List<ElderChildRelationship> incoming;

        if (user.getRole() == Role.ELDER) {
            incoming = relationshipRepository
                    .findByElderIdAndStatusAndRequestedByIdNot(
                            userId, RelationshipStatus.PENDING, userId);
        } else {
            incoming = relationshipRepository
                    .findByChildIdAndStatusAndRequestedByIdNot(
                            userId, RelationshipStatus.PENDING, userId);
        }

        return incoming.stream()
                .map(RelationshipResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Returns PENDING relationships where the given user IS the requester.
     * These are "sent" requests, so the user can see their outgoing status.
     */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getSentPendingRequests(UUID userId) {
        return relationshipRepository
                .findByStatusAndRequestedById(RelationshipStatus.PENDING, userId)
                .stream()
                .map(RelationshipResponse::from)
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private User loadActiveUser(UUID userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + userId));
    }

    private ElderChildRelationship loadRelationship(UUID id) {
        return relationshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Relationship not found: " + id));
    }

    private void ensureParticipant(UUID userId, ElderChildRelationship r) {
        boolean isElder = r.getElder().getId().equals(userId);
        boolean isChild = r.getChild().getId().equals(userId);
        if (!isElder && !isChild) {
            throw new IllegalStateException(
                    "You are not a participant in this relationship.");
        }
    }
}
