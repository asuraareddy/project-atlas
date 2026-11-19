-- =========================================================================
-- Project Atlas — B2B White-Label SaaS & Modular Addon Engine DDL
-- Migration: 20261104_b2b_whitelabel_schema.sql
-- Enforces: Multi-tenancy, custom domains, dynamic branding, addon registry,
-- provider configuration, entitlements, and strict tenant isolation.
-- =========================================================================

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    package_code VARCHAR(64) DEFAULT 'COMPLETE_PRO_SUITE' NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tenant Domains Table
CREATE TABLE IF NOT EXISTS tenant_domains_v2 (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hostname VARCHAR(255) UNIQUE NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'VERIFIED' NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    ssl_status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_host ON tenant_domains_v2(hostname);

-- 3. Tenant Branding Table
CREATE TABLE IF NOT EXISTS tenant_branding (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    logo_url VARCHAR(512) DEFAULT '/icons/icon-192.png' NOT NULL,
    favicon_url VARCHAR(512) DEFAULT '/favicon.ico',
    primary_color VARCHAR(32) DEFAULT '#7e0ac2' NOT NULL,
    primary_color_hover VARCHAR(32) DEFAULT '#9a13e6' NOT NULL,
    secondary_color VARCHAR(32) DEFAULT '#b45df0' NOT NULL,
    background_color VARCHAR(32) DEFAULT '#18181b' NOT NULL,
    text_color VARCHAR(32) DEFAULT '#ffffff' NOT NULL,
    accent_glow_color VARCHAR(64) DEFAULT 'rgba(126,10,194,0.35)' NOT NULL,
    hero_heading VARCHAR(255) NOT NULL,
    hero_subheading TEXT NOT NULL,
    footer_text VARCHAR(255) NOT NULL,
    support_email VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tenant Users Table (Data Isolation)
CREATE TABLE IF NOT EXISTS tenant_users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'PLAYER' NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_user UNIQUE(tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_email ON tenant_users(tenant_id, email);

-- 5. Tenant Roles Table
CREATE TABLE IF NOT EXISTS tenant_roles (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_key VARCHAR(64) NOT NULL,
    role_name VARCHAR(128) NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_role UNIQUE(tenant_id, role_key)
);

-- 6. Addon Registry Table
CREATE TABLE IF NOT EXISTS addon_registry (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    version VARCHAR(32) DEFAULT '1.0.0' NOT NULL,
    category VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(64) NOT NULL,
    route_prefix VARCHAR(128) NOT NULL,
    routes JSONB DEFAULT '[]'::jsonb NOT NULL,
    required_permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
    dependent_services JSONB DEFAULT '[]'::jsonb NOT NULL,
    configuration_schema JSONB DEFAULT '{}'::jsonb NOT NULL,
    health_check_endpoint VARCHAR(255) NOT NULL,
    provider_requirements JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Addon Versions Table
CREATE TABLE IF NOT EXISTS addon_versions (
    id VARCHAR(64) PRIMARY KEY,
    addon_id VARCHAR(64) NOT NULL REFERENCES addon_registry(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    changelog TEXT,
    release_status VARCHAR(32) DEFAULT 'STABLE' NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_addon_version UNIQUE(addon_id, version)
);

-- 8. Addon Dependencies Table
CREATE TABLE IF NOT EXISTS addon_dependencies (
    id VARCHAR(64) PRIMARY KEY,
    addon_id VARCHAR(64) NOT NULL REFERENCES addon_registry(id) ON DELETE CASCADE,
    dependent_service_id VARCHAR(64) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE NOT NULL,
    minimum_version VARCHAR(32),
    CONSTRAINT uq_addon_dep UNIQUE(addon_id, dependent_service_id)
);

-- 9. Tenant Addons Table (Entitlements)
CREATE TABLE IF NOT EXISTS tenant_addons (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    addon_id VARCHAR(64) NOT NULL REFERENCES addon_registry(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INT DEFAULT 1 NOT NULL,
    version VARCHAR(32) DEFAULT '1.0.0' NOT NULL,
    custom_config JSONB,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_addon UNIQUE(tenant_id, addon_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_addons_enabled ON tenant_addons(tenant_id, is_enabled);

-- 10. Provider Registry Table
CREATE TABLE IF NOT EXISTS provider_registry (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    adapter_class VARCHAR(128) NOT NULL,
    credential_schema JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Tenant Provider Config Table
CREATE TABLE IF NOT EXISTS tenant_provider_config (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) NOT NULL REFERENCES provider_registry(id) ON DELETE CASCADE,
    is_live BOOLEAN DEFAULT FALSE NOT NULL,
    encrypted_credentials JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_provider UNIQUE(tenant_id, provider_id)
);

-- 12. Tenant Subscriptions Table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    package_code VARCHAR(64) NOT NULL,
    billing_cycle VARCHAR(32) DEFAULT 'MONTHLY' NOT NULL,
    monthly_price_minor INT NOT NULL,
    currency VARCHAR(8) DEFAULT 'GBP' NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. Tenant Entitlements Table
CREATE TABLE IF NOT EXISTS tenant_entitlements (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    is_entitled BOOLEAN DEFAULT TRUE NOT NULL,
    quota_limit INT,
    current_usage INT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_feature UNIQUE(tenant_id, feature_key)
);

-- 14. Audit Logs Table (Tenant Scoped)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);

-- 15. Tenant Usage Table
CREATE TABLE IF NOT EXISTS tenant_usage (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE NOT NULL,
    active_users_count INT DEFAULT 0 NOT NULL,
    total_turnover_minor BIGINT DEFAULT 0 NOT NULL,
    ggr_minor BIGINT DEFAULT 0 NOT NULL,
    api_calls_count INT DEFAULT 0 NOT NULL,
    CONSTRAINT uq_tenant_usage_day UNIQUE(tenant_id, metric_date)
);

-- 16. Integration Health Table
CREATE TABLE IF NOT EXISTS integration_health (
    id VARCHAR(64) PRIMARY KEY,
    provider_id VARCHAR(64) NOT NULL REFERENCES provider_registry(id) ON DELETE CASCADE,
    endpoint_checked VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'HEALTHY' NOT NULL,
    latency_ms INT NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details JSONB
);
CREATE INDEX IF NOT EXISTS idx_health_provider_checked ON integration_health(provider_id, checked_at);

-- =========================================================================
-- Row Level Security (RLS) Policy Blueprint
-- =========================================================================
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation_policy ON tenant_users
--     USING (tenant_id = current_setting('app.current_tenant_id', true));

