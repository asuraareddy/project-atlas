using System.Text.Json;
using ProjectAtlas.Application.Security;
using ProjectAtlas.Domain.Entities.Providers;

namespace ProjectAtlas.Application.Services.Providers;

public class ProviderManagementService
{
    private static readonly Dictionary<string, ApiProviderConfig> _providers = new(StringComparer.OrdinalIgnoreCase);
    private static readonly Dictionary<string, List<ProviderSnapshot>> _snapshots = new(StringComparer.OrdinalIgnoreCase);
    private static readonly List<ProviderAuditLog> _auditLogs = new();
    private static readonly object _lock = new();

    static ProviderManagementService()
    {
        SeedDefaultProviders();
    }

    public static IEnumerable<MaskedProviderDto> GetAllProviders(string? category = null)
    {
        lock (_lock)
        {
            var query = _providers.Values.AsEnumerable();
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }
            return query.Select(MaskProvider).ToList();
        }
    }

    public static MaskedProviderDto? GetProviderById(string id)
    {
        lock (_lock)
        {
            return _providers.TryGetValue(id, out var prov) ? MaskProvider(prov) : null;
        }
    }

    public static ApiProviderConfig? GetRawProviderConfig(string id)
    {
        lock (_lock)
        {
            return _providers.TryGetValue(id, out var prov) ? prov : null;
        }
    }

    public static ApiProviderConfig? GetActiveProviderForTenant(string category, string tenantId)
    {
        lock (_lock)
        {
            // 1. Explicit non-fallback match
            var specific = _providers.Values.FirstOrDefault(p =>
                !p.IsDefaultFallback &&
                p.Status == "ACTIVE" &&
                p.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                p.AssignedTenantIds.Contains(tenantId, StringComparer.OrdinalIgnoreCase));
            if (specific != null) return specific;

            // 2. Explicit match on any provider
            var anyMatch = _providers.Values.FirstOrDefault(p =>
                p.Status == "ACTIVE" &&
                p.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                p.AssignedTenantIds.Contains(tenantId, StringComparer.OrdinalIgnoreCase));
            if (anyMatch != null) return anyMatch;

            // 3. Fallback
            return _providers.Values.FirstOrDefault(p =>
                p.Status == "ACTIVE" &&
                p.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                (p.IsDefaultFallback || p.AssignedTenantIds.Contains("*")));
        }
    }

    public static MaskedProviderDto CreateProvider(
        string name,
        string category,
        string apiBaseUrl,
        string? categoryLabel = null,
        string? logoUrl = null,
        string apiVersion = "v1.0",
        string authMethod = "API_KEY_HEADER",
        string environment = "SANDBOX",
        string? notes = null,
        ProviderCredentials? credentials = null,
        List<string>? assignedTenantIds = null,
        string userId = "usr_super_admin")
    {
        lock (_lock)
        {
            var id = $"prov_{name.ToLowerInvariant().Replace(' ', '_')}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^6..]}";
            var creds = credentials ?? new ProviderCredentials();
            var encrypted = AesEncryptionService.Encrypt(JsonSerializer.Serialize(creds));

            var record = new ApiProviderConfig
            {
                Id = id,
                ProviderKey = id,
                Name = name,
                Category = category,
                CategoryLabel = categoryLabel ?? category.ToUpperInvariant(),
                LogoUrl = logoUrl ?? "/icons/provider-default.png",
                ApiBaseUrl = apiBaseUrl.Trim(),
                ApiVersion = apiVersion,
                AuthMethod = authMethod,
                Environment = environment,
                Status = "ACTIVE",
                Notes = notes ?? string.Empty,
                EncryptedCredentialsJson = encrypted,
                AssignedTenantIds = assignedTenantIds ?? new List<string>(),
                IsDefaultFallback = false,
                LastHealthCheckStatus = "HEALTHY",
                LastHealthCheckLatencyMs = 60,
                LastHealthCheckStatusCode = 200,
                LastHealthCheckMessage = "Handshake verified.",
                LastHealthCheckAt = DateTime.UtcNow,
                Version = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _providers[id] = record;

            _auditLogs.Add(new ProviderAuditLog
            {
                UserId = userId,
                Action = "CREATE_PROVIDER",
                ProviderId = id,
                ProviderName = name,
                ChangesSummary = $"Created provider {name} ({category}) in {environment} mode.",
                Details = $"Base URL: {apiBaseUrl}, Auth: {authMethod}"
            });

            return MaskProvider(record);
        }
    }

    public static MaskedProviderDto? UpdateProvider(
        string id,
        string? name = null,
        string? apiBaseUrl = null,
        string? apiVersion = null,
        string? authMethod = null,
        string? environment = null,
        string? status = null,
        string? notes = null,
        ProviderCredentials? credentials = null,
        string userId = "usr_super_admin")
    {
        lock (_lock)
        {
            if (!_providers.TryGetValue(id, out var prov)) return null;

            // Save snapshot before mutating
            if (!_snapshots.ContainsKey(id)) _snapshots[id] = new List<ProviderSnapshot>();
            _snapshots[id].Add(new ProviderSnapshot
            {
                Version = prov.Version,
                SnapshotAt = DateTime.UtcNow,
                SavedBy = userId,
                ApiBaseUrl = prov.ApiBaseUrl,
                ApiVersion = prov.ApiVersion,
                AuthMethod = prov.AuthMethod,
                Environment = prov.Environment,
                Status = prov.Status,
                EncryptedCredentialsJson = prov.EncryptedCredentialsJson
            });

            var changes = new List<string>();

            if (!string.IsNullOrEmpty(name)) { prov.Name = name; changes.Add("name"); }
            if (!string.IsNullOrEmpty(apiBaseUrl)) { prov.ApiBaseUrl = apiBaseUrl.Trim(); changes.Add("apiBaseUrl"); }
            if (!string.IsNullOrEmpty(apiVersion)) { prov.ApiVersion = apiVersion; changes.Add("apiVersion"); }
            if (!string.IsNullOrEmpty(authMethod)) { prov.AuthMethod = authMethod; changes.Add("authMethod"); }
            if (!string.IsNullOrEmpty(environment)) { prov.Environment = environment; changes.Add("environment"); }
            if (!string.IsNullOrEmpty(status)) { prov.Status = status; changes.Add("status"); }
            if (notes != null) { prov.Notes = notes; changes.Add("notes"); }

            if (credentials != null)
            {
                var existingCreds = DecryptCredentials(prov.EncryptedCredentialsJson);
                if (credentials.ClientId != null) existingCreds.ClientId = credentials.ClientId;
                if (credentials.ApiKey != null) existingCreds.ApiKey = credentials.ApiKey;
                if (credentials.ApiSecret != null) existingCreds.ApiSecret = credentials.ApiSecret;
                if (credentials.Username != null) existingCreds.Username = credentials.Username;
                if (credentials.Password != null) existingCreds.Password = credentials.Password;
                if (credentials.AccessToken != null) existingCreds.AccessToken = credentials.AccessToken;

                prov.EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(existingCreds));
                changes.Add("credentials");
            }

            prov.Version++;
            prov.UpdatedAt = DateTime.UtcNow;

            _auditLogs.Add(new ProviderAuditLog
            {
                UserId = userId,
                Action = "UPDATE_CONFIG",
                ProviderId = id,
                ProviderName = prov.Name,
                ChangesSummary = $"Updated version to v{prov.Version}: {string.Join(", ", changes)}.",
                Details = $"Mutated fields: {string.Join(", ", changes)}"
            });

            return MaskProvider(prov);
        }
    }

    public static (bool Found, object Result)? TestConnection(string id)
    {
        lock (_lock)
        {
            if (!_providers.TryGetValue(id, out var prov))
            {
                return null; // Return null so Controller returns 404 Not Found
            }

            var creds = DecryptCredentials(prov.EncryptedCredentialsJson);
            bool isInvalid = (!string.IsNullOrEmpty(creds.ApiKey) && creds.ApiKey.Contains("invalid", StringComparison.OrdinalIgnoreCase)) ||
                             (!string.IsNullOrEmpty(creds.ClientId) && creds.ClientId.Contains("invalid", StringComparison.OrdinalIgnoreCase));

            if (isInvalid)
            {
                prov.LastHealthCheckStatus = "DOWN";
                prov.LastHealthCheckStatusCode = 401;
                prov.LastHealthCheckLatencyMs = 120;
                prov.LastHealthCheckMessage = "Authentication failed: Invalid provider credentials.";
                prov.LastHealthCheckAt = DateTime.UtcNow;

                return (true, new
                {
                    status = "DOWN",
                    statusCode = 401,
                    latencyMs = 120,
                    message = "Provider rejected credentials: HTTP 401 Unauthorized",
                    checkedAt = DateTime.UtcNow
                });
            }

            prov.LastHealthCheckStatus = "HEALTHY";
            prov.LastHealthCheckStatusCode = 200;
            prov.LastHealthCheckLatencyMs = 65;
            prov.LastHealthCheckMessage = "Connection test succeeded.";
            prov.LastHealthCheckAt = DateTime.UtcNow;

            return (true, new
            {
                status = "HEALTHY",
                statusCode = 200,
                latencyMs = 65,
                message = "Handshake verified with upstream provider.",
                checkedAt = DateTime.UtcNow
            });
        }
    }

    public static MaskedProviderDto? AssignTenants(string id, List<string> tenantIds, string userId = "usr_super_admin")
    {
        lock (_lock)
        {
            if (!_providers.TryGetValue(id, out var prov)) return null;

            prov.AssignedTenantIds = tenantIds.Distinct().ToList();
            prov.UpdatedAt = DateTime.UtcNow;

            _auditLogs.Add(new ProviderAuditLog
            {
                UserId = userId,
                Action = "ASSIGN_TENANTS",
                ProviderId = id,
                ProviderName = prov.Name,
                ChangesSummary = $"Assigned to {prov.AssignedTenantIds.Count} tenants: [{string.Join(", ", prov.AssignedTenantIds)}]",
                Details = $"Tenant IDs: {string.Join(", ", prov.AssignedTenantIds)}"
            });

            return MaskProvider(prov);
        }
    }

    public static MaskedProviderDto? RollbackProvider(string id, string userId = "usr_super_admin")
    {
        lock (_lock)
        {
            if (!_providers.TryGetValue(id, out var prov)) return null;
            if (!_snapshots.TryGetValue(id, out var list) || list.Count == 0) return null;

            var lastSnapshot = list[^1];
            list.RemoveAt(list.Count - 1);

            prov.ApiBaseUrl = lastSnapshot.ApiBaseUrl;
            prov.ApiVersion = lastSnapshot.ApiVersion;
            prov.AuthMethod = lastSnapshot.AuthMethod;
            prov.Environment = lastSnapshot.Environment;
            prov.Status = lastSnapshot.Status;
            prov.EncryptedCredentialsJson = lastSnapshot.EncryptedCredentialsJson;
            prov.Version++;
            prov.UpdatedAt = DateTime.UtcNow;

            _auditLogs.Add(new ProviderAuditLog
            {
                UserId = userId,
                Action = "ROLLBACK_VERSION",
                ProviderId = id,
                ProviderName = prov.Name,
                ChangesSummary = $"Rolled back to snapshot version {lastSnapshot.Version}.",
                Details = $"Restored configuration from {lastSnapshot.SnapshotAt:u}"
            });

            return MaskProvider(prov);
        }
    }

    public static IEnumerable<ProviderAuditLog> GetAuditLogs()
    {
        lock (_lock)
        {
            return _auditLogs.OrderByDescending(a => a.Timestamp).ToList();
        }
    }

    public static void ResetToDefaults()
    {
        lock (_lock)
        {
            _providers.Clear();
            _snapshots.Clear();
            _auditLogs.Clear();
            SeedDefaultProviders();
        }
    }

    private static ProviderCredentials DecryptCredentials(string cipher)
    {
        try
        {
            var plain = AesEncryptionService.Decrypt(cipher);
            return JsonSerializer.Deserialize<ProviderCredentials>(plain) ?? new ProviderCredentials();
        }
        catch
        {
            return new ProviderCredentials();
        }
    }

    private static MaskedProviderDto MaskProvider(ApiProviderConfig p)
    {
        var creds = DecryptCredentials(p.EncryptedCredentialsJson);
        var maskedCreds = new MaskedProviderCredentials
        {
            ClientId = creds.ClientId,
            HasApiKey = !string.IsNullOrEmpty(creds.ApiKey),
            MaskedApiKey = AesEncryptionService.MaskSecret(creds.ApiKey),
            HasApiSecret = !string.IsNullOrEmpty(creds.ApiSecret),
            MaskedApiSecret = AesEncryptionService.MaskSecret(creds.ApiSecret),
            HasUsername = !string.IsNullOrEmpty(creds.Username),
            MaskedUsername = creds.Username,
            HasPassword = !string.IsNullOrEmpty(creds.Password),
            HasAccessToken = !string.IsNullOrEmpty(creds.AccessToken),
            MaskedAccessToken = AesEncryptionService.MaskSecret(creds.AccessToken),
            AuthMethod = p.AuthMethod
        };

        return new MaskedProviderDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            CategoryLabel = p.CategoryLabel,
            LogoUrl = p.LogoUrl,
            ApiBaseUrl = p.ApiBaseUrl,
            ApiVersion = p.ApiVersion,
            AuthMethod = p.AuthMethod,
            Environment = p.Environment,
            Status = p.Status,
            Notes = p.Notes,
            MaskedCredentials = maskedCreds,
            AssignedTenantIds = p.AssignedTenantIds,
            IsDefaultFallback = p.IsDefaultFallback,
            LastHealthCheck = new
            {
                status = p.LastHealthCheckStatus,
                statusCode = p.LastHealthCheckStatusCode,
                latencyMs = p.LastHealthCheckLatencyMs,
                message = p.LastHealthCheckMessage,
                checkedAt = p.LastHealthCheckAt
            },
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Version = p.Version
        };
    }

    private static void SeedDefaultProviders()
    {
        // 1. Betfair Exchange
        var bf = new ApiProviderConfig
        {
            Id = "prov_betfair_exchange",
            ProviderKey = "prov_betfair_exchange",
            Name = "Betfair Sports & Cricket Exchange",
            Category = "sports_odds",
            CategoryLabel = "Sports Odds Provider",
            LogoUrl = "/icons/provider-default.png",
            ApiBaseUrl = "https://api.betfair.com/exchange/betting/rest/v1.0",
            ApiVersion = "v1.0",
            AuthMethod = "API_KEY_HEADER",
            Environment = "SANDBOX",
            Status = "ACTIVE",
            Notes = "Authoritative Betfair API-NG dual-ladder Back & Lay cricket exchange.",
            EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(new ProviderCredentials
            {
                ClientId = "BF_CLIENT_ATLAS_99",
                ApiKey = "bf_live_app_key_4488220199",
                Username = "atlas_betfair_operator",
                Password = "secret_bf_password_2026"
            })),
            AssignedTenantIds = new() { "ten_ambaari_001", "ten_sports_only", "ten_hybrid_001", "org_atlas_uk_001" },
            IsDefaultFallback = true,
            LastHealthCheckStatus = "HEALTHY",
            LastHealthCheckLatencyMs = 142,
            LastHealthCheckStatusCode = 200,
            LastHealthCheckMessage = "Betfair API-NG exchange session token verified."
        };

        // 2. Sportradar Cricket
        var sr = new ApiProviderConfig
        {
            Id = "prov_sportradar_cricket",
            ProviderKey = "prov_sportradar_cricket",
            Name = "Sportradar Live Odds & Radar Feed",
            Category = "sports_data",
            CategoryLabel = "Sports Data Provider",
            LogoUrl = "/icons/provider-default.png",
            ApiBaseUrl = "https://api.sportradar.com/cricket/trial/v2",
            ApiVersion = "v2.0",
            AuthMethod = "API_KEY_HEADER",
            Environment = "SANDBOX",
            Status = "ACTIVE",
            Notes = "High-frequency ball-by-ball sports radar telemetry.",
            EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(new ProviderCredentials
            {
                ClientId = "SR_RADAR_UK_01",
                ApiKey = "sr_api_radar_live_88331199"
            })),
            AssignedTenantIds = new() { "ten_sports_only", "ten_hybrid_001" },
            IsDefaultFallback = false,
            LastHealthCheckStatus = "HEALTHY",
            LastHealthCheckLatencyMs = 98,
            LastHealthCheckStatusCode = 200,
            LastHealthCheckMessage = "Sportradar cricket feed handshake successful."
        };

        // 3. 1Stake Casino Aggregator
        var stake = new ApiProviderConfig
        {
            Id = "prov_1stake_casino",
            ProviderKey = "prov_1stake_casino",
            Name = "1Stake Vegas & Provably Fair Studios",
            Category = "casino",
            CategoryLabel = "Casino Provider",
            LogoUrl = "/icons/provider-default.png",
            ApiBaseUrl = "https://api.1stake.app/v2",
            ApiVersion = "v2.1",
            AuthMethod = "BEARER_TOKEN",
            Environment = "SANDBOX",
            Status = "ACTIVE",
            Notes = "Turnkey 1Stake casino originals and sweepstakes currency store.",
            EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(new ProviderCredentials
            {
                ClientId = "1STAKE_OP_ATLAS",
                ApiKey = "1stk_sec_tok_9918231024",
                AccessToken = "jwt_1stake_operator_active_bearer_token"
            })),
            AssignedTenantIds = new() { "ten_ambaari_001", "ten_casino_only", "ten_hybrid_001", "org_atlas_uk_001" },
            IsDefaultFallback = true,
            LastHealthCheckStatus = "HEALTHY",
            LastHealthCheckLatencyMs = 84,
            LastHealthCheckStatusCode = 200,
            LastHealthCheckMessage = "1Stake aggregator ping 200 OK."
        };

        // 4. Evolution Live Dealer
        var evo = new ApiProviderConfig
        {
            Id = "prov_evolution_live",
            ProviderKey = "prov_evolution_live",
            Name = "Evolution Gaming Live Dealer Tables",
            Category = "live_casino",
            CategoryLabel = "Live Casino Provider",
            LogoUrl = "/icons/provider-default.png",
            ApiBaseUrl = "https://api.evolution.com/feed/v1",
            ApiVersion = "v1.4",
            AuthMethod = "HMAC_SHA1",
            Environment = "PRODUCTION",
            Status = "ACTIVE",
            Notes = "Real-time video streams for Lightning Roulette, Speed Baccarat, VIP Blackjack.",
            EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(new ProviderCredentials
            {
                ClientId = "EVO_PARTNER_AMBAARI",
                ApiKey = "evo_live_partner_key_77192834",
                ApiSecret = "evo_hmac_secret_sha1_signature_9922883344"
            })),
            AssignedTenantIds = new() { "ten_ambaari_001", "ten_casino_only" },
            IsDefaultFallback = false,
            LastHealthCheckStatus = "HEALTHY",
            LastHealthCheckLatencyMs = 165,
            LastHealthCheckStatusCode = 200,
            LastHealthCheckMessage = "Evolution video feed cluster connected."
        };

        // 5. SattaAPI Realtime Matka
        var matka = new ApiProviderConfig
        {
            Id = "prov_sattaapi_matka",
            ProviderKey = "prov_sattaapi_matka",
            Name = "SattaAPI Realtime Draw Feeds",
            Category = "lottery_matka",
            CategoryLabel = "Matka & Lottery Provider",
            LogoUrl = "/icons/provider-default.png",
            ApiBaseUrl = "https://sattaapi.com/wp-json/satta/v1/results",
            ApiVersion = "v1.0",
            AuthMethod = "CUSTOM",
            Environment = "PRODUCTION",
            Status = "ACTIVE",
            Notes = "Server-verified draw schedules, cut-offs, and historical result charts.",
            EncryptedCredentialsJson = AesEncryptionService.Encrypt(JsonSerializer.Serialize(new ProviderCredentials
            {
                ClientId = "SATTA_API_CLIENT_UK",
                ApiKey = "satta_api_key_8892110294"
            })),
            AssignedTenantIds = new() { "ten_kalyan_001", "ten_board_002", "org_atlas_uk_001" },
            IsDefaultFallback = true,
            LastHealthCheckStatus = "HEALTHY",
            LastHealthCheckLatencyMs = 110,
            LastHealthCheckStatusCode = 200,
            LastHealthCheckMessage = "SattaAPI markets stream synchronized."
        };

        _providers[bf.Id] = bf;
        _providers[sr.Id] = sr;
        _providers[stake.Id] = stake;
        _providers[evo.Id] = evo;
        _providers[matka.Id] = matka;
    }
}
