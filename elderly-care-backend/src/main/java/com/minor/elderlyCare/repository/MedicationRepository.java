package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.Medication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    /** All medications for an elder, active ones first, then by creation date. */
    Page<Medication> findByElderIdOrderByIsActiveDescCreatedAtDesc(UUID elderId, Pageable pageable);

    /** Active medications only (for reminder scheduling). */
    List<Medication> findByElderIdAndIsActiveTrueOrderByReminderTimeAsc(UUID elderId);

    /** Count active medications for an elder. */
    long countByElderIdAndIsActiveTrue(UUID elderId);
}
