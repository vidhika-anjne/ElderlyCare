-- =============================================================================
-- Elderly Care Monitoring System — Database Schema
-- Database : PostgreSQL
-- Scope    : User management, relationships, vitals, lab reports,
--            medications, and health alerts
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid() — available in PostgreSQL 13+
-- (UUID generation is built-in via gen_random_uuid() in pg13+; no extension needed)

-- =============================================================================
-- 1.  ENUM TYPES
--     Stored as plain VARCHARs with CHECK constraints so Hibernate can map them
--     as Java String enums without requiring a custom PostgreSQL enum type.
-- =============================================================================

-- No CREATE TYPE needed; constraints are defined inline on the columns.

-- =============================================================================
-- 2.  USERS TABLE
--
--  Design decisions:
--  • UUID primary key  — avoids sequential id enumeration attacks, safe for
--    distributed / multi-instance deployments.
--  • role column       — single table for both Elders and Children keeps queries
--    simple, avoids JOIN overhead on authentication, and simplifies Spring
--    Security principal loading (one UserDetails source).
--  • password_hash     — only the bcrypt hash is stored, never the plaintext.
--  • phone             — required for push-notification fallback and OTP login
--    (common in mobile apps).
--  • push_token        — stores the device FCM/APNs token so the server can
--    send push notifications to the React Native app.
--  • is_active         — soft-delete flag; keeps historical relationship records
--    intact without hard-deleting user rows.
--  • timestamps use TIMESTAMPTZ (timezone-aware) so UTC is stored and the React
--    Native client can display times in the device's local timezone.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    name                VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    phone               VARCHAR(20),                          -- optional but recommended
    role                VARCHAR(10)     NOT NULL,
    date_of_birth       DATE,
    profile_picture_url VARCHAR(500),
    push_token          VARCHAR(500),                         -- FCM / APNs device token
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- ── Primary Key ─────────────────────────────────────────────────────────
    CONSTRAINT pk_users PRIMARY KEY (id),

    -- ── Unique Constraints ──────────────────────────────────────────────────
    CONSTRAINT uq_users_email   UNIQUE (email),
    CONSTRAINT uq_users_phone   UNIQUE (phone),               -- one account per phone number

    -- ── Check Constraints ───────────────────────────────────────────────────
    CONSTRAINT chk_users_role
        CHECK (role IN ('ELDER', 'CHILD')),

    CONSTRAINT chk_users_email_format
        CHECK (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),

    CONSTRAINT chk_users_name_length
        CHECK (char_length(name) >= 2)
);

-- ── Indexes on users ─────────────────────────────────────────────────────────
-- email index is already created by the UNIQUE constraint above.
-- Additional covering indexes for common query patterns:

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);                                          -- filter elders or children

CREATE INDEX IF NOT EXISTS idx_users_is_active
    ON users (is_active)
    WHERE is_active = TRUE;                                   -- partial index: active users only

CREATE INDEX IF NOT EXISTS idx_users_role_active
    ON users (role, is_active);                               -- combined filter (most common)


-- =============================================================================
-- 3.  ELDER_CHILD_RELATIONSHIP TABLE
--
--  Design decisions:
--  • Many-to-many junction table — one elder can have multiple children and one
--    child can monitor multiple elders.
--  • UNIQUE(elder_id, child_id) — strictly prevents duplicate relationships at
--    the database level, regardless of application logic.
--  • status column    — models a connection lifecycle:
--      PENDING  → child sent a monitoring request, waiting for elder's approval
--      ACTIVE   → elder approved; child can see elder's data
--      REVOKED  → elder or admin revoked the access
--    This is important for a mobile app where relationship consent matters.
--  • requested_by     — records which party initiated the relationship for
--    audit / notification purposes.
--  • CHECK (elder_id <> child_id) — prevents a user from being their own
--    elder/child (self-reference guard).
--  • ON DELETE CASCADE — if a user account is deleted (hard delete), all their
--    relationships are cleaned up automatically.
-- =============================================================================

CREATE TABLE IF NOT EXISTS elder_child_relationship (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    elder_id        UUID        NOT NULL,
    child_id        UUID        NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    requested_by    UUID        NOT NULL,                     -- FK to users(id)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ── Primary Key ─────────────────────────────────────────────────────────
    CONSTRAINT pk_elder_child_relationship PRIMARY KEY (id),

    -- ── Foreign Keys ────────────────────────────────────────────────────────
    CONSTRAINT fk_ecr_elder
        FOREIGN KEY (elder_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ecr_child
        FOREIGN KEY (child_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ecr_requested_by
        FOREIGN KEY (requested_by)
        REFERENCES users (id)
        ON DELETE RESTRICT,                                   -- don't silently lose audit trail

    -- ── Unique Constraint — prevents duplicate pairs ─────────────────────────
    CONSTRAINT uq_ecr_elder_child UNIQUE (elder_id, child_id),

    -- ── Check Constraints ───────────────────────────────────────────────────
    CONSTRAINT chk_ecr_status
        CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')),

    CONSTRAINT chk_ecr_no_self_reference
        CHECK (elder_id <> child_id),                        -- a user cannot monitor themselves

    CONSTRAINT chk_ecr_requested_by_is_participant
        CHECK (requested_by = elder_id OR requested_by = child_id)
);

-- ── Indexes on elder_child_relationship ──────────────────────────────────────
-- The UNIQUE constraint on (elder_id, child_id) creates a composite index.
-- Add individual indexes so single-column lookups also use an index:

CREATE INDEX IF NOT EXISTS idx_ecr_elder_id
    ON elder_child_relationship (elder_id);                   -- "find all children of this elder"

CREATE INDEX IF NOT EXISTS idx_ecr_child_id
    ON elder_child_relationship (child_id);                   -- "find all elders of this child"

CREATE INDEX IF NOT EXISTS idx_ecr_status
    ON elder_child_relationship (status);                     -- filter by PENDING / ACTIVE

CREATE INDEX IF NOT EXISTS idx_ecr_elder_status
    ON elder_child_relationship (elder_id, status);           -- "active children of an elder"

CREATE INDEX IF NOT EXISTS idx_ecr_child_status
    ON elder_child_relationship (child_id, status);           -- "active elders of a child"


-- =============================================================================
-- 4.  VITAL_RECORDS TABLE
--
--  Stores individual vital-sign measurements for elders.
--  For BLOOD_PRESSURE, 'value' = systolic and 'secondary_value' = diastolic.
--  The 'is_abnormal' flag is set by the application layer when a reading
--  falls outside the normal range for the vital type.
-- =============================================================================

CREATE TABLE IF NOT EXISTS vital_records (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    elder_id        UUID            NOT NULL,
    vital_type      VARCHAR(25)     NOT NULL,
    value           DOUBLE PRECISION NOT NULL,
    secondary_value DOUBLE PRECISION,                        -- diastolic for blood pressure
    unit            VARCHAR(20)     NOT NULL,
    notes           VARCHAR(500),
    recorded_at     TIMESTAMPTZ     NOT NULL,                -- when the measurement was taken
    is_abnormal     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_vital_records PRIMARY KEY (id),

    CONSTRAINT fk_vr_elder
        FOREIGN KEY (elder_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_vr_vital_type
        CHECK (vital_type IN ('BLOOD_SUGAR', 'BLOOD_PRESSURE', 'HEART_RATE',
                               'OXYGEN_SATURATION', 'TEMPERATURE'))
);

CREATE INDEX IF NOT EXISTS idx_vr_elder_id
    ON vital_records (elder_id);

CREATE INDEX IF NOT EXISTS idx_vr_vital_type
    ON vital_records (vital_type);

CREATE INDEX IF NOT EXISTS idx_vr_elder_type
    ON vital_records (elder_id, vital_type);

CREATE INDEX IF NOT EXISTS idx_vr_recorded_at
    ON vital_records (recorded_at);


-- =============================================================================
-- 5.  LAB_REPORTS TABLE
--
--  Stores lab test reports with results and optional PDF file URL.
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_reports (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    elder_id        UUID            NOT NULL,
    test_name       VARCHAR(200)    NOT NULL,
    result          VARCHAR(500)    NOT NULL,
    test_date       DATE            NOT NULL,
    file_url        VARCHAR(1000),                           -- URL to uploaded PDF/image
    notes           VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_lab_reports PRIMARY KEY (id),

    CONSTRAINT fk_lr_elder
        FOREIGN KEY (elder_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lr_elder_id
    ON lab_reports (elder_id);

CREATE INDEX IF NOT EXISTS idx_lr_test_date
    ON lab_reports (test_date);


-- =============================================================================
-- 6.  MEDICATIONS TABLE
--
--  Tracks prescribed medications including dosage, frequency, reminder time,
--  and active/inactive status for history retention.
-- =============================================================================

CREATE TABLE IF NOT EXISTS medications (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    elder_id        UUID            NOT NULL,
    medicine_name   VARCHAR(200)    NOT NULL,
    dosage          VARCHAR(100)    NOT NULL,
    frequency       VARCHAR(100)    NOT NULL,
    reminder_time   TIME,                                    -- local time for reminders
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    start_date      DATE,
    end_date        DATE,
    notes           VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_medications PRIMARY KEY (id),

    CONSTRAINT fk_med_elder
        FOREIGN KEY (elder_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_med_elder_id
    ON medications (elder_id);

CREATE INDEX IF NOT EXISTS idx_med_elder_active
    ON medications (elder_id, is_active);


-- =============================================================================
-- 7.  HEALTH_ALERTS TABLE
--
--  Auto-generated alerts when vital readings are abnormal.
--  Lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED
-- =============================================================================

CREATE TABLE IF NOT EXISTS health_alerts (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    elder_id            UUID            NOT NULL,
    vital_record_id     UUID,                                -- may be null for manual alerts
    message             VARCHAR(1000)   NOT NULL,
    severity            VARCHAR(10)     NOT NULL,
    status              VARCHAR(15)     NOT NULL DEFAULT 'ACTIVE',
    acknowledged_by     UUID,                                -- FK to users(id)
    acknowledged_at     TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_health_alerts PRIMARY KEY (id),

    CONSTRAINT fk_ha_elder
        FOREIGN KEY (elder_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ha_vital_record
        FOREIGN KEY (vital_record_id)
        REFERENCES vital_records (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_ha_acknowledged_by
        FOREIGN KEY (acknowledged_by)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_ha_severity
        CHECK (severity IN ('WARNING', 'CRITICAL')),

    CONSTRAINT chk_ha_status
        CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'))
);

CREATE INDEX IF NOT EXISTS idx_ha_elder_id
    ON health_alerts (elder_id);

CREATE INDEX IF NOT EXISTS idx_ha_status
    ON health_alerts (status);

CREATE INDEX IF NOT EXISTS idx_ha_elder_status
    ON health_alerts (elder_id, status);

CREATE INDEX IF NOT EXISTS idx_ha_created_at
    ON health_alerts (created_at);
