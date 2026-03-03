package com.minor.elderlyCare.model;

/**
 * Lifecycle states of a health alert.
 *
 * ACTIVE       — alert was generated and has not been addressed.
 * ACKNOWLEDGED — a guardian has seen the alert.
 * RESOLVED     — the condition has been addressed / normalized.
 */
public enum AlertStatus {
    ACTIVE,
    ACKNOWLEDGED,
    RESOLVED
}
