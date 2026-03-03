package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.LabReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LabReportRepository extends JpaRepository<LabReport, UUID> {

    /** All lab reports for an elder, newest test date first. */
    Page<LabReport> findByElderIdOrderByTestDateDesc(UUID elderId, Pageable pageable);

    /** Search lab reports by test name (case-insensitive partial match). */
    Page<LabReport> findByElderIdAndTestNameContainingIgnoreCaseOrderByTestDateDesc(
            UUID elderId, String testName, Pageable pageable);
}
