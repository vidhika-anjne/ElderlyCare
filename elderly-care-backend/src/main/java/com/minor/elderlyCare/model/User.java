package com.minor.elderlyCare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a system user — either an ELDER or a CHILD (guardian).
 *
 * Single-table design: both roles share the same users table.
 * The 'role' column differentiates behaviour at the application layer.
 *
 * Table: users
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uq_users_phone", columnNames = "phone")
    },
    indexes = {
        @Index(name = "idx_users_role",        columnList = "role"),
        @Index(name = "idx_users_is_active",   columnList = "is_active"),
        @Index(name = "idx_users_role_active", columnList = "role, is_active")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "passwordHash")          // never print the password hash
public class User {

    // ── Primary Key ──────────────────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // ── Core Fields ──────────────────────────────────────────────────────────
    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank
    @Email
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Stores the BCrypt hash of the user's password.
     * The plaintext password is NEVER persisted.
     */
    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number format")
    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    /**
     * Role determines what the user can do:
     *   ELDER → their data is monitored
     *   CHILD → they monitor an elder
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    private Role role;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    /** URL pointing to the profile image stored in object storage (S3 / Azure Blob). */
    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    /**
     * Device push token (FCM for Android / APNs for iOS) used by the
     * React Native app to receive push notifications.
     * Updated on each login from a new device.
     */
    @Column(name = "push_token", length = 500)
    private String pushToken;

    // ── Soft Delete ──────────────────────────────────────────────────────────
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // ── Audit Timestamps ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
