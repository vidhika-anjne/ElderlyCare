package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.ElderChildRelationship;
import com.minor.elderlyCare.model.RelationshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for the {@link ElderChildRelationship} entity.
 *
 * All queries are scoped to the elder_child_relationship table.
 * The unique constraint (elder_id, child_id) is enforced at the DB level,
 * but the existence check methods below let the service layer give a
 * cleaner error message before attempting an insert.
 */
@Repository
public interface ElderChildRelationshipRepository
        extends JpaRepository<ElderChildRelationship, UUID> {

    // ── Existence / Duplicate Prevention ────────────────────────────────────

    /** Returns true if ANY relationship (regardless of status) already exists. */
    boolean existsByElderIdAndChildId(UUID elderId, UUID childId);

    /** Returns the relationship record for a specific elder-child pair. */
    Optional<ElderChildRelationship> findByElderIdAndChildId(UUID elderId, UUID childId);

    // ── Elder-centric queries (used by the Child's monitoring screen) ────────

    /** All relationships for a given elder, filtered by status. */
    List<ElderChildRelationship> findByElderIdAndStatus(UUID elderId, RelationshipStatus status);

    /** All relationships for a given elder (any status). */
    List<ElderChildRelationship> findByElderId(UUID elderId);

    // ── Child-centric queries (used by the Child's "My Elders" screen) ───────

    /** All relationships for a given child, filtered by status. */
    List<ElderChildRelationship> findByChildIdAndStatus(UUID childId, RelationshipStatus status);

    /** All relationships for a given child (any status). */
    List<ElderChildRelationship> findByChildId(UUID childId);
}
