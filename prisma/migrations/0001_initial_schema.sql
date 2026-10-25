-- Project Atlas — 0001_initial_schema.sql
-- Direct PostgreSQL DDL with Foreign Keys, Enums, Constraints, Indexes & Audit Rules

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations & Branches
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    default_currency CHAR(3) NOT NULL DEFAULT 'GBP',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/London',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users, Profiles, RBAC
CREATE TYPE account_type_enum AS ENUM ('PLAYER', 'STAFF');
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'EXCLUDED', 'LOCKED');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    email_normalized VARCHAR(255) NOT NULL UNIQUE,
    phone_normalized VARCHAR(50),
    password_hash_or_idp_ref VARCHAR(255) NOT NULL,
    account_type account_type_enum NOT NULL DEFAULT 'PLAYER',
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    date_of_birth_ref VARCHAR(255),
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    country CHAR(2) NOT NULL DEFAULT 'GB',
    contact_preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    staff_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    active_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active_until TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
    scope_id UUID,
    granted_by VARCHAR(255) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_hint VARCHAR(255),
    ip_hash_or_minimised VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- 3. Compliance & Safer Gambling
CREATE TABLE IF NOT EXISTS account_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL DEFAULT 'ALL',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMPTZ,
    reason_code VARCHAR(100) NOT NULL,
    created_by VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    assigned_to VARCHAR(255),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ
);

-- 4. Double-Entry Ledger & Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_type VARCHAR(50) NOT NULL DEFAULT 'PLAYER_PRIMARY',
    currency CHAR(3) NOT NULL DEFAULT 'GBP',
    cash_available_minor BIGINT NOT NULL DEFAULT 0,
    cash_reserved_minor BIGINT NOT NULL DEFAULT 0,
    bonus_minor BIGINT NOT NULL DEFAULT 0,
    points_balance BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_currency UNIQUE (user_id, currency)
);

CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    account_code VARCHAR(100) NOT NULL UNIQUE,
    account_type VARCHAR(50) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    source_type VARCHAR(100) NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'POSTED',
    reason_code VARCHAR(100) NOT NULL,
    actor_id VARCHAR(255),
    correlation_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE entry_direction_enum AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE CASCADE,
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    direction entry_direction_enum NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'GBP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Direct Crypto QR Deposits (No PSP) & Withdrawals
CREATE TYPE crypto_intent_status_enum AS ENUM ('PENDING', 'DETECTED', 'CONFIRMING', 'COMPLETED', 'EXPIRED', 'FAILED', 'RISK_HOLD');

CREATE TABLE IF NOT EXISTS crypto_deposit_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset VARCHAR(20) NOT NULL,
    network VARCHAR(50) NOT NULL,
    receiving_address VARCHAR(255) NOT NULL,
    expected_amount_crypto NUMERIC(36, 18) NOT NULL,
    quoted_rate_gbp NUMERIC(18, 6) NOT NULL,
    credited_gbp_minor BIGINT NOT NULL,
    qr_payload TEXT NOT NULL,
    status crypto_intent_status_enum NOT NULL DEFAULT 'PENDING',
    tx_hash VARCHAR(255),
    observed_confirmations INT NOT NULL DEFAULT 0,
    required_confirmations INT NOT NULL DEFAULT 12,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE withdrawal_status_enum AS ENUM ('REQUESTED', 'RISK_HOLD', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'GBP',
    destination_type VARCHAR(50) NOT NULL,
    destination_reference VARCHAR(255) NOT NULL,
    status withdrawal_status_enum NOT NULL DEFAULT 'REQUESTED',
    maker_id VARCHAR(255),
    checker_id VARCHAR(255),
    risk_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMPTZ
);

-- 6. Games, Providers & Participations
CREATE TABLE IF NOT EXISTS game_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    integration_type VARCHAR(100) NOT NULL DEFAULT 'CLIENT_MATKA_API',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    provider_id UUID NOT NULL REFERENCES game_providers(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- MATKA, CARROM, LUDO, OTHER_GAMES
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    real_money_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_session_ref VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS game_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES game_sessions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    round_id VARCHAR(255) NOT NULL,
    stake_minor BIGINT NOT NULL CHECK (stake_minor >= 0),
    payout_minor BIGINT NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'GBP',
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin Maker-Checker Dual Control & Immutable Audit
CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    requested_by VARCHAR(255) NOT NULL, -- Maker ID
    requested_payload_hash VARCHAR(255) NOT NULL,
    status approval_status_enum NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(255),           -- Checker ID (Must !== Maker ID)
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMPTZ,
    CONSTRAINT chk_maker_checker_distinct CHECK (approved_by IS NULL OR approved_by <> requested_by)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    actor_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    reason TEXT,
    ip_hint VARCHAR(255),
    correlation_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_users_org_branch ON users(organization_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_crypto_intents_status ON crypto_deposit_intents(status, receiving_address);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tx ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_events(organization_id, created_at);
