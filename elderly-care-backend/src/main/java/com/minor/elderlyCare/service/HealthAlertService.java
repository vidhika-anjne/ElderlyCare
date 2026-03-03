package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.response.HealthAlertResponse;
import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.model.*;
import com.minor.elderlyCare.repository.HealthAlertRepository;
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
 * Service for managing health alerts.
 *
 * Alerts are auto-created by {@link VitalMonitoringService} when abnormal
 * readings are detected.  Linked guardians (CHILD users) can view,
 * acknowledge, and resolve alerts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HealthAlertService {

    private final HealthAlertRepository healthAlertRepository;
    private final ElderAccessService elderAccessService;

    /**
     * Called internally by VitalMonitoringService to create an alert
     * from an abnormal vital reading.
     */
    @Transactional
    public HealthAlert createAlertFromVital(VitalRecord vitalRecord,
                                             AlertSeverity severity,
                                             String message) {
        HealthAlert alert = HealthAlert.builder()
                .elder(vitalRecord.getElder())
                .vitalRecord(vitalRecord)
                .message(message)
                .severity(severity)
                .status(AlertStatus.ACTIVE)
                .build();

        HealthAlert saved = healthAlertRepository.save(alert);

        // Notify linked guardians
        List<User> guardians = elderAccessService.getLinkedGuardians(vitalRecord.getElder().getId());
        for (User guardian : guardians) {
            log.info("ALERT NOTIFICATION → Guardian '{}' ({}): {}",
                    guardian.getName(), guardian.getEmail(), message);
            // TODO: integrate with FCM/APNs push notification service
            // pushNotificationService.send(guardian.getPushToken(), message, severity);
        }

        return saved;
    }

    /** Get all alerts for an elder (paginated). */
    @Transactional(readOnly = true)
    public Page<HealthAlertResponse> getAlerts(UUID elderId, User currentUser, Pageable pageable) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return healthAlertRepository.findByElderIdOrderByCreatedAtDesc(elderId, pageable)
                .map(HealthAlertResponse::from);
    }

    /** Get active (unresolved) alerts for an elder. */
    @Transactional(readOnly = true)
    public List<HealthAlertResponse> getActiveAlerts(UUID elderId, User currentUser) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return healthAlertRepository
                .findByElderIdAndStatusOrderByCreatedAtDesc(elderId, AlertStatus.ACTIVE)
                .stream()
                .map(HealthAlertResponse::from)
                .toList();
    }

    /** Acknowledge an alert (typically by a guardian). */
    @Transactional
    public HealthAlertResponse acknowledgeAlert(UUID alertId, User currentUser) {
        HealthAlert alert = findAlertOrThrow(alertId);
        elderAccessService.validateAccessAndGetElder(alert.getElder().getId(), currentUser);

        if (alert.getStatus() != AlertStatus.ACTIVE) {
            throw new IllegalStateException("Alert is already " + alert.getStatus());
        }

        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedBy(currentUser);
        alert.setAcknowledgedAt(Instant.now());

        return HealthAlertResponse.from(healthAlertRepository.save(alert));
    }

    /** Resolve an alert. */
    @Transactional
    public HealthAlertResponse resolveAlert(UUID alertId, User currentUser) {
        HealthAlert alert = findAlertOrThrow(alertId);
        elderAccessService.validateAccessAndGetElder(alert.getElder().getId(), currentUser);

        if (alert.getStatus() == AlertStatus.RESOLVED) {
            throw new IllegalStateException("Alert is already resolved");
        }

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(Instant.now());

        // If not previously acknowledged, set the resolver as acknowledger too
        if (alert.getAcknowledgedBy() == null) {
            alert.setAcknowledgedBy(currentUser);
            alert.setAcknowledgedAt(Instant.now());
        }

        return HealthAlertResponse.from(healthAlertRepository.save(alert));
    }

    /** Count active alerts for an elder (badge count for UI). */
    @Transactional(readOnly = true)
    public long countActiveAlerts(UUID elderId, User currentUser) {
        elderAccessService.validateAccessAndGetElder(elderId, currentUser);
        return healthAlertRepository.countByElderIdAndStatus(elderId, AlertStatus.ACTIVE);
    }

    private HealthAlert findAlertOrThrow(UUID id) {
        return healthAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health alert not found: " + id));
    }
}
