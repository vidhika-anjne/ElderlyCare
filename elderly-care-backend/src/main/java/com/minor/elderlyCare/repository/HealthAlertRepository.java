package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.AlertStatus;
import com.minor.elderlyCare.model.HealthAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HealthAlertRepository extends JpaRepository<HealthAlert, UUID> {

    /** All alerts for an elder, newest first. */
    Page<HealthAlert> findByElderIdOrderByCreatedAtDesc(UUID elderId, Pageable pageable);

    /** Alerts filtered by status. */
    List<HealthAlert> findByElderIdAndStatusOrderByCreatedAtDesc(UUID elderId, AlertStatus status);

    /** Count active (unresolved) alerts for an elder. */
    long countByElderIdAndStatus(UUID elderId, AlertStatus status);

    /** Active alerts across all elders linked to a child (used for child dashboard). */
    List<HealthAlert> findByElderIdInAndStatusOrderByCreatedAtDesc(
            List<UUID> elderIds, AlertStatus status);
}
