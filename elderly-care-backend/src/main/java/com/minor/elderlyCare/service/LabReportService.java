package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.request.LabReportRequest;
import com.minor.elderlyCare.dto.response.LabReportResponse;
import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.model.LabReport;
import com.minor.elderlyCare.model.User;
import com.minor.elderlyCare.repository.LabReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabReportService {

    private final LabReportRepository labReportRepository;
    private final ElderAccessService elderAccessService;

    /** Create a new lab report for an elder. */
    @Transactional
    public LabReportResponse createLabReport(LabReportRequest request, User currentUser) {
        User elder = elderAccessService.validateAccessAndGetElder(request.getElderId(), currentUser);

        LabReport report = LabReport.builder()
                .elder(elder)
                .testName(request.getTestName())
                .result(request.getResult())
                .testDate(request.getTestDate())
                .fileUrl(request.getFileUrl())
                .notes(request.getNotes())
                .build();

        return LabReportResponse.from(labReportRepository.save(report));
    }

    /** Get all lab reports for an elder (paginated). */
    @Transactional(readOnly = true)
    public Page<LabReportResponse> getLabReports(UUID elderId, User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return labReportRepository.findByElderIdOrderByTestDateDesc(elderId, pageable)
                .map(LabReportResponse::from);
    }

    /** Search lab reports by test name. */
    @Transactional(readOnly = true)
    public Page<LabReportResponse> searchLabReports(UUID elderId, String testName,
                                                     User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return labReportRepository
                .findByElderIdAndTestNameContainingIgnoreCaseOrderByTestDateDesc(elderId, testName, pageable)
                .map(LabReportResponse::from);
    }

    /** Get a single lab report by ID. */
    @Transactional(readOnly = true)
    public LabReportResponse getLabReport(UUID reportId, User currentUser) {
        LabReport report = labReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found: " + reportId));
        elderAccessService.validateAccessAndGetElder(report.getElder().getId(), currentUser);
        return LabReportResponse.from(report);
    }

    /** Delete a lab report. Only the elder or linked child can delete. */
    @Transactional
    public void deleteLabReport(UUID reportId, User currentUser) {
        LabReport report = labReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found: " + reportId));
        elderAccessService.validateAccessAndGetElder(report.getElder().getId(), currentUser);
        labReportRepository.delete(report);
    }
}
