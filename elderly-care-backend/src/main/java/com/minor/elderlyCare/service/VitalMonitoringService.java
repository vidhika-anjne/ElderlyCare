package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.request.VitalRecordRequest;
import com.minor.elderlyCare.dto.response.VitalRecordResponse;
import com.minor.elderlyCare.model.*;
import com.minor.elderlyCare.repository.VitalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for recording and querying vital signs.
 *
 * Automatically detects abnormal readings and triggers health alerts
 * via {@link HealthAlertService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VitalMonitoringService {

    private final VitalRecordRepository vitalRecordRepository;
    private final ElderAccessService elderAccessService;
    private final HealthAlertService healthAlertService;

    // ── Abnormal Thresholds ──────────────────────────────────────────────────
    // Critical thresholds (beyond these → CRITICAL alert)
    private static final double BP_SYSTOLIC_CRISIS    = 180.0;
    private static final double BP_DIASTOLIC_CRISIS   = 120.0;
    private static final double BLOOD_SUGAR_CRITICAL_LOW  = 54.0;
    private static final double BLOOD_SUGAR_CRITICAL_HIGH = 300.0;
    private static final double HEART_RATE_CRITICAL_LOW   = 40.0;
    private static final double HEART_RATE_CRITICAL_HIGH  = 150.0;
    private static final double O2_CRITICAL               = 90.0;
    private static final double TEMP_CRITICAL_HIGH        = 103.0;

    /**
     * Record a new vital sign measurement.
     * If the reading is abnormal, a {@link HealthAlert} is auto-generated.
     */
    @Transactional
    public VitalRecordResponse recordVital(VitalRecordRequest request, User currentUser) {
        User elder = elderAccessService.validateAccessAndGetElder(request.getElderId(), currentUser);

        // Validate blood-pressure has diastolic value
        if (request.getVitalType() == VitalType.BLOOD_PRESSURE && request.getSecondaryValue() == null) {
            throw new IllegalStateException("Diastolic value (secondaryValue) is required for blood pressure");
        }

        VitalRecord record = VitalRecord.builder()
                .elder(elder)
                .vitalType(request.getVitalType())
                .value(request.getValue())
                .secondaryValue(request.getSecondaryValue())
                .unit(request.getUnit())
                .notes(request.getNotes())
                .recordedAt(request.getRecordedAt())
                .build();

        // Check for abnormal values
        AbnormalResult abnormalResult = checkAbnormal(request.getVitalType(),
                request.getValue(), request.getSecondaryValue());
        record.setAbnormal(abnormalResult.isAbnormal);

        VitalRecord saved = vitalRecordRepository.save(record);

        // Auto-generate alert if abnormal
        if (abnormalResult.isAbnormal) {
            log.warn("Abnormal vital detected for elder {}: {} = {} {}",
                    elder.getId(), request.getVitalType(),
                    request.getValue(), request.getUnit());

            healthAlertService.createAlertFromVital(saved, abnormalResult.severity, abnormalResult.message);
        }

        return VitalRecordResponse.from(saved);
    }

    /** Get all vitals for an elder (paginated). */
    @Transactional(readOnly = true)
    public Page<VitalRecordResponse> getVitals(UUID elderId, User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return vitalRecordRepository.findByElderIdOrderByRecordedAtDesc(elderId, pageable)
                .map(VitalRecordResponse::from);
    }

    /** Get vitals filtered by type (paginated). */
    @Transactional(readOnly = true)
    public Page<VitalRecordResponse> getVitalsByType(UUID elderId, VitalType type,
                                                      User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return vitalRecordRepository
                .findByElderIdAndVitalTypeOrderByRecordedAtDesc(elderId, type, pageable)
                .map(VitalRecordResponse::from);
    }

    /** Latest reading per vital type (dashboard summary). */
    @Transactional(readOnly = true)
    public List<VitalRecordResponse> getLatestVitals(UUID elderId, User currentUser) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return vitalRecordRepository.findLatestByElderIdGroupedByType(elderId)
                .stream()
                .map(VitalRecordResponse::from)
                .toList();
    }

    /** Vitals in a date range (for trend graphs). */
    @Transactional(readOnly = true)
    public List<VitalRecordResponse> getVitalsTrend(UUID elderId, VitalType type,
                                                     Instant from, Instant to,
                                                     User currentUser) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return vitalRecordRepository
                .findByElderIdAndVitalTypeAndRecordedAtBetweenOrderByRecordedAtAsc(elderId, type, from, to)
                .stream()
                .map(VitalRecordResponse::from)
                .toList();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Abnormal value detection
    // ══════════════════════════════════════════════════════════════════════════

    private AbnormalResult checkAbnormal(VitalType type, double value, Double secondaryValue) {
        return switch (type) {
            case BLOOD_SUGAR      -> checkBloodSugar(value);
            case BLOOD_PRESSURE   -> checkBloodPressure(value, secondaryValue != null ? secondaryValue : 0);
            case HEART_RATE       -> checkHeartRate(value);
            case OXYGEN_SATURATION -> checkOxygenSaturation(value);
            case TEMPERATURE      -> checkTemperature(value);
        };
    }

    private AbnormalResult checkBloodSugar(double value) {
        if (value < BLOOD_SUGAR_CRITICAL_LOW) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Blood Sugar %.0f mg/dL — severe hypoglycemia! Immediate attention required.", value));
        }
        if (value > BLOOD_SUGAR_CRITICAL_HIGH) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Blood Sugar %.0f mg/dL — dangerously high! Seek medical help.", value));
        }
        if (value < 70) {
            return AbnormalResult.warning(
                    String.format("WARNING: Blood Sugar %.0f mg/dL — low (hypoglycemia).", value));
        }
        if (value > 140) {
            return AbnormalResult.warning(
                    String.format("WARNING: Blood Sugar %.0f mg/dL — elevated (hyperglycemia).", value));
        }
        return AbnormalResult.normal();
    }

    private AbnormalResult checkBloodPressure(double systolic, double diastolic) {
        if (systolic >= BP_SYSTOLIC_CRISIS || diastolic >= BP_DIASTOLIC_CRISIS) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Blood Pressure %.0f/%.0f mmHg — hypertensive crisis! Seek emergency care.", systolic, diastolic));
        }
        if (systolic >= 140 || diastolic >= 90) {
            return AbnormalResult.warning(
                    String.format("WARNING: Blood Pressure %.0f/%.0f mmHg — Stage 2 hypertension.", systolic, diastolic));
        }
        if (systolic >= 130 || diastolic >= 80) {
            return AbnormalResult.warning(
                    String.format("WARNING: Blood Pressure %.0f/%.0f mmHg — Stage 1 hypertension.", systolic, diastolic));
        }
        if (systolic < 90 || diastolic < 60) {
            return AbnormalResult.warning(
                    String.format("WARNING: Blood Pressure %.0f/%.0f mmHg — low blood pressure (hypotension).", systolic, diastolic));
        }
        return AbnormalResult.normal();
    }

    private AbnormalResult checkHeartRate(double bpm) {
        if (bpm < HEART_RATE_CRITICAL_LOW) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Heart Rate %.0f bpm — severe bradycardia! Immediate attention required.", bpm));
        }
        if (bpm > HEART_RATE_CRITICAL_HIGH) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Heart Rate %.0f bpm — severe tachycardia! Immediate attention required.", bpm));
        }
        if (bpm < 60) {
            return AbnormalResult.warning(
                    String.format("WARNING: Heart Rate %.0f bpm — bradycardia (low heart rate).", bpm));
        }
        if (bpm > 100) {
            return AbnormalResult.warning(
                    String.format("WARNING: Heart Rate %.0f bpm — tachycardia (high heart rate).", bpm));
        }
        return AbnormalResult.normal();
    }

    private AbnormalResult checkOxygenSaturation(double spo2) {
        if (spo2 < O2_CRITICAL) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Oxygen Saturation %.0f%% — severely low! Seek emergency care.", spo2));
        }
        if (spo2 < 95) {
            return AbnormalResult.warning(
                    String.format("WARNING: Oxygen Saturation %.0f%% — below normal range.", spo2));
        }
        return AbnormalResult.normal();
    }

    private AbnormalResult checkTemperature(double tempF) {
        if (tempF >= TEMP_CRITICAL_HIGH) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Temperature %.1f°F — high fever! Immediate medical attention needed.", tempF));
        }
        if (tempF >= 100.4) {
            return AbnormalResult.warning(
                    String.format("WARNING: Temperature %.1f°F — fever detected.", tempF));
        }
        if (tempF < 95.0) {
            return AbnormalResult.critical(
                    String.format("CRITICAL: Temperature %.1f°F — hypothermia! Immediate attention required.", tempF));
        }
        if (tempF < 97.0) {
            return AbnormalResult.warning(
                    String.format("WARNING: Temperature %.1f°F — below normal range.", tempF));
        }
        return AbnormalResult.normal();
    }

    /** Internal result holder for abnormal-value checks. */
    private record AbnormalResult(boolean isAbnormal, AlertSeverity severity, String message) {
        static AbnormalResult normal() {
            return new AbnormalResult(false, null, null);
        }
        static AbnormalResult warning(String msg) {
            return new AbnormalResult(true, AlertSeverity.WARNING, msg);
        }
        static AbnormalResult critical(String msg) {
            return new AbnormalResult(true, AlertSeverity.CRITICAL, msg);
        }
    }
}
