package com.minor.elderlyCare.service;

import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.model.RelationshipStatus;
import com.minor.elderlyCare.model.Role;
import com.minor.elderlyCare.model.User;
import com.minor.elderlyCare.repository.ElderChildRelationshipRepository;
import com.minor.elderlyCare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Shared service for validating that the current user has permission
 * to access an elder's medical data.
 *
 * Access rules:
 *   • The elder themselves  → always allowed.
 *   • A CHILD with an ACTIVE relationship to the elder → allowed.
 *   • Anyone else → denied.
 */
@Service
@RequiredArgsConstructor
public class ElderAccessService {

    private final UserRepository userRepository;
    private final ElderChildRelationshipRepository relationshipRepository;

    /**
     * Validates that {@code currentUser} can access data belonging to
     * the elder identified by {@code elderId}.
     *
     * @return the elder User entity (pre-fetched for convenience)
     * @throws ResourceNotFoundException if elderId does not exist
     * @throws AccessDeniedException     if the caller has no access
     */
    public User validateAccessAndGetElder(UUID elderId, User currentUser) {
        User elder = userRepository.findById(elderId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Elder not found: " + elderId));

        if (elder.getRole() != Role.ELDER) {
            throw new IllegalStateException("User " + elderId + " is not an elder");
        }

        // Elder accessing their own data
        if (currentUser.getId().equals(elderId)) {
            return elder;
        }

        // Child with an ACTIVE relationship
        if (currentUser.getRole() == Role.CHILD) {
            boolean hasAccess = relationshipRepository
                    .findByElderIdAndChildId(elderId, currentUser.getId())
                    .filter(r -> r.getStatus() == RelationshipStatus.ACTIVE)
                    .isPresent();

            if (hasAccess) {
                return elder;
            }
        }

        throw new AccessDeniedException(
                "You do not have permission to access this elder's data");
    }

    /**
     * Returns IDs of all CHILD users who have an ACTIVE relationship
     * with the given elder.  Used for sending alert notifications.
     */
    public List<User> getLinkedGuardians(UUID elderId) {
        return relationshipRepository
                .findByElderIdAndStatus(elderId, RelationshipStatus.ACTIVE)
                .stream()
                .map(r -> r.getChild())
                .collect(Collectors.toList());
    }
}
