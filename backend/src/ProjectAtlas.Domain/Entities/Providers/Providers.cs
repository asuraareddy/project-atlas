namespace ProjectAtlas.Domain.Entities.Providers;

public class ApiProviderConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProviderKey { get; set; } = string.Empty; // prov_sattaapi_matka, prov_betfair_exchange, prov_1stake_casino, prov_evolution_live, prov_polygon_rpc
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "custom"; // sports_odds, sports_data, casino, live_casino, lottery_matka, payment_crypto, custom
    public string CategoryLabel { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "v1.0";
    public string AuthMethod { get; set; } = "API_KEY_HEADER"; // API_KEY_HEADER, BEARER_TOKEN, BASIC_AUTH, HMAC_SHA1, CUSTOM
    public string Environment { get; set; } = "SANDBOX"; // SANDBOX, PRODUCTION
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE, MAINTENANCE
    public string Notes { get; set; } = string.Empty;
    public string EncryptedCredentialsJson { get; set; } = "{}";
    public List<string> AssignedTenantIds { get; set; } = new(); // list of tenant IDs or ["*"] for global fallback
    public bool IsDefaultFallback { get; set; }
    public string LastHealthCheckStatus { get; set; } = "HEALTHY"; // HEALTHY, DEGRADED, DOWN, UNTESTED
    public int LastHealthCheckLatencyMs { get; set; } = 80;
    public int LastHealthCheckStatusCode { get; set; } = 200;
    public string LastHealthCheckMessage { get; set; } = "Operational";
    public DateTime? LastHealthCheckAt { get; set; } = DateTime.UtcNow;
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProviderCredentials
{
    public string? ClientId { get; set; }
    public string? ApiKey { get; set; }
    public string? ApiSecret { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? AccessToken { get; set; }
    public string? CertFile { get; set; }
    public string? KeyFile { get; set; }
    public Dictionary<string, string>? CustomHeaders { get; set; }
    public Dictionary<string, string>? AdditionalParams { get; set; }
}

public class MaskedProviderCredentials
{
    public string? ClientId { get; set; }
    public bool HasApiKey { get; set; }
    public string? MaskedApiKey { get; set; }
    public bool HasApiSecret { get; set; }
    public string? MaskedApiSecret { get; set; }
    public bool HasUsername { get; set; }
    public string? MaskedUsername { get; set; }
    public bool HasPassword { get; set; }
    public bool HasAccessToken { get; set; }
    public string? MaskedAccessToken { get; set; }
    public string AuthMethod { get; set; } = "API_KEY_HEADER";
}

public class MaskedProviderDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string CategoryLabel { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = string.Empty;
    public string AuthMethod { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public MaskedProviderCredentials MaskedCredentials { get; set; } = new();
    public List<string> AssignedTenantIds { get; set; } = new();
    public bool IsDefaultFallback { get; set; }
    public object? LastHealthCheck { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Version { get; set; }
}

public class ProviderSnapshot
{
    public int Version { get; set; }
    public DateTime SnapshotAt { get; set; }
    public string SavedBy { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = string.Empty;
    public string AuthMethod { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string EncryptedCredentialsJson { get; set; } = "{}";
}

public class ProviderAuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // CREATE_PROVIDER, UPDATE_CONFIG, UPDATE_CREDENTIALS, TEST_CONNECTION, ASSIGN_TENANTS, ROLLBACK_VERSION
    public string ProviderId { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string ChangesSummary { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
}
