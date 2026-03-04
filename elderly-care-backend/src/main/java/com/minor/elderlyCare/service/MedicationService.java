package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.request.MedicationRequest;
import com.minor.elderlyCare.dto.response.MedicationResponse;
import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.model.Medication;
import com.minor.elderlyCare.model.User;
import com.minor.elderlyCare.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final ElderAccessService elderAccessService;

    /** Create a new medication entry. */
    @Transactional
    public MedicationResponse createMedication(MedicationRequest request, User currentUser) {
        User elder = elderAccessService.validateAccessAndGetElder(request.getElderId(), currentUser);

        Medication medication = Medication.builder()
                .elder(elder)
                .medicineName(request.getMedicineName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .reminderTime(request.getReminderTime())
                .isActive(Boolean.TRUE.equals(request.getIsActive()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .build();

        return MedicationResponse.from(medicationRepository.save(medication));
    }

    /** Update an existing medication. */
    @Transactional
    public MedicationResponse updateMedication(UUID medicationId, MedicationRequest request, User currentUser) {
        Medication medication = findMedicationOrThrow(medicationId);
        elderAccessService.validateAccessAndGetElder(medication.getElder().getId(), currentUser);

        medication.setMedicineName(request.getMedicineName());
        medication.setDosage(request.getDosage());
        medication.setFrequency(request.getFrequency());
        medication.setReminderTime(request.getReminderTime());
        medication.setActive(Boolean.TRUE.equals(request.getIsActive()));
        medication.setStartDate(request.getStartDate());
        medication.setEndDate(request.getEndDate());
        medication.setNotes(request.getNotes());

        return MedicationResponse.from(medicationRepository.save(medication));
    }

    /** Toggle a medication's active status. */
    @Transactional
    public MedicationResponse toggleActive(UUID medicationId, User currentUser) {
        Medication medication = findMedicationOrThrow(medicationId);
        elderAccessService.validateAccessAndGetElder(medication.getElder().getId(), currentUser);

        medication.setActive(!medication.isActive());
        return MedicationResponse.from(medicationRepository.save(medication));
    }

    /** Get all medications for an elder (paginated). */
    @Transactional(readOnly = true)
    public Page<MedicationResponse> getMedications(UUID elderId, User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return medicationRepository.findByElderIdOrderByIsActiveDescCreatedAtDesc(elderId, pageable)
                .map(MedicationResponse::from);
    }

    /** Get active medications only. */
    @Transactional(readOnly = true)
    public List<MedicationResponse> getActiveMedications(UUID elderId, User currentUser) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return medicationRepository.findByElderIdAndIsActiveTrueOrderByReminderTimeAsc(elderId)
                .stream()
                .map(MedicationResponse::from)
                .toList();
    }

    /** Delete a medication. */
    @Transactional
    public void deleteMedication(UUID medicationId, User currentUser) {
        Medication medication = findMedicationOrThrow(medicationId);
        elderAccessService.validateAccessAndGetElder(medication.getElder().getId(), currentUser);
        medicationRepository.delete(medication);
    }

    private Medication findMedicationOrThrow(UUID id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found: " + id));
    }
}
