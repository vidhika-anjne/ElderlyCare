package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.VitalRecord;
import com.minor.elderlyCare.model.VitalType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface VitalRecordRepository extends JpaRepository<VitalRecord, UUID> {

    /** All vitals for an elder, newest first. */
    Page<VitalRecord> findByElderIdOrderByRecordedAtDesc(UUID elderId, Pageable pageable);

    /** Vitals for a specific type, newest first. */
    Page<VitalRecord> findByElderIdAndVitalTypeOrderByRecordedAtDesc(
            UUID elderId, VitalType vitalType, Pageable pageable);

    /** Latest reading per vital type for an elder (dashboard summary). */
    @Query("""
        SELECT vr FROM VitalRecord vr
        WHERE vr.elder.id = :elderId
          AND vr.recordedAt = (
              SELECT MAX(vr2.recordedAt) FROM VitalRecord vr2
              WHERE vr2.elder.id = :elderId AND vr2.vitalType = vr.vitalType
          )
        ORDER BY vr.vitalType
    """)
    List<VitalRecord> findLatestByElderIdGroupedByType(@Param("elderId") UUID elderId);

    /** Vitals within a date range (for graphs / trends). */
    List<VitalRecord> findByElderIdAndVitalTypeAndRecordedAtBetweenOrderByRecordedAtAsc(
            UUID elderId, VitalType vitalType, Instant from, Instant to);

    /** Count abnormal readings for an elder (stats). */
    long countByElderIdAndIsAbnormalTrue(UUID elderId);
}
