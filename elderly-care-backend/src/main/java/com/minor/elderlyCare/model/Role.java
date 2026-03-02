package com.minor.elderlyCare.model;

/**
 * Represents the role of a user in the Elderly Care system.
 *
 * ELDER — the person being monitored (the elderly individual).
 * CHILD — the guardian / family member doing the monitoring.
 *
 * Stored as a VARCHAR in PostgreSQL via @Enumerated(EnumType.STRING).
 */
public enum Role {
    ELDER,
    CHILD
}
