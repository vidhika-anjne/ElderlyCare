package com.minor.elderlyCare.model;

/**
 * Lifecycle states of an Elder ↔ Child monitoring relationship.
 *
 * PENDING  — a connection request has been sent but not yet accepted.
 * ACTIVE   — the elder has approved; the child can view the elder's data.
 * REVOKED  — access was withdrawn by either party or an admin.
 *
 * Stored as a VARCHAR in PostgreSQL via @Enumerated(EnumType.STRING).
 */
public enum RelationshipStatus {
    PENDING,
    ACTIVE,
    REVOKED
}
