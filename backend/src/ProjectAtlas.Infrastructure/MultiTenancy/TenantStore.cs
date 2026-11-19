using ProjectAtlas.Domain.Entities.Tenancy;

namespace ProjectAtlas.Infrastructure.MultiTenancy;

public class TenantStore
{
    private static readonly Dictionary<string, Tenant> _tenants = new(StringComparer.OrdinalIgnoreCase);
    private static readonly Dictionary<string, string> _domainIndex = new(StringComparer.OrdinalIgnoreCase);

    static TenantStore()
    {
        SeedTenants();
    }

    public static Tenant? GetTenantById(string id)
    {
        return _tenants.TryGetValue(id, out var tenant) ? tenant : null;
    }

    public static Tenant? GetTenantBySlug(string slug)
    {
        return _tenants.Values.FirstOrDefault(t => t.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
    }

    public static IEnumerable<Tenant> GetAllTenants() => _tenants.Values;

    public static TenantContext ResolveTenant(string host, string? requestedTenant = null)
    {
        Tenant? tenant = null;

        if (!string.IsNullOrEmpty(requestedTenant))
        {
            tenant = _tenants.Values.FirstOrDefault(t => t.Id.Equals(requestedTenant, StringComparison.OrdinalIgnoreCase) ||
                                                         t.Slug.Equals(requestedTenant, StringComparison.OrdinalIgnoreCase));
        }

        if (tenant == null && !string.IsNullOrEmpty(host))
        {
            var cleanHost = host.Split(':')[0].Trim().ToLowerInvariant();
            if (_domainIndex.TryGetValue(cleanHost, out var tenantId))
            {
                tenant = GetTenantById(tenantId);
            }
        }

        // Fallback to default Project Atlas tenant
        tenant ??= _tenants["org_atlas_uk_001"];

        var enabledGames = tenant.GameEntitlements
            .Where(e => e.IsEnabled)
            .OrderBy(e => e.DisplayOrder)
            .Select(e => e.GameKey)
            .ToList();

        return new TenantContext
        {
            TenantId = tenant.Id,
            TenantSlug = tenant.Slug,
            TenantName = tenant.Name,
            Branding = tenant.Branding,
            PointConfig = tenant.PointConfig,
            EnabledGames = enabledGames
        };
    }

    public static bool UpdateTenantPointConfig(string tenantId, decimal rate, string? currencyCode = null, string? unitName = null)
    {
        var tenant = GetTenantById(tenantId) ?? GetTenantBySlug(tenantId);
        if (tenant == null) return false;

        tenant.PointConfig.PointToCurrencyRate = rate > 0 ? rate : 1.0m;
        if (!string.IsNullOrEmpty(currencyCode))
        {
            tenant.PointConfig.CurrencyCode = currencyCode.ToUpperInvariant();
        }
        if (!string.IsNullOrEmpty(unitName))
        {
            tenant.PointConfig.PointUnitName = unitName.ToUpperInvariant();
        }
        tenant.UpdatedAt = DateTime.UtcNow;
        return true;
    }

    public static void SaveTenant(Tenant tenant)
    {
        _tenants[tenant.Id] = tenant;
        if (tenant.Domains != null)
        {
            foreach (var dom in tenant.Domains)
            {
                if (!string.IsNullOrEmpty(dom.Hostname))
                {
                    _domainIndex[dom.Hostname.ToLowerInvariant()] = tenant.Id;
                }
            }
        }
    }

    private static void SeedTenants()
    {
        // 1. Default Tenant: Project Atlas Global Ltd (Full Suite)
        var atlas = new Tenant
        {
            Id = "org_atlas_uk_001",
            Slug = "atlas",
            Name = "Project Atlas Global Ltd",
            PackageCode = "COMPLETE_PRO_SUITE",
            ContactEmail = "admin@atlasgaming.uk",
            Branding = new TenantBranding
            {
                BrandName = "PROJECT ATLAS",
                Tagline = "Multi-Gaming B2B Enterprise Platform",
                PrimaryColor = "#7e0ac2",
                PrimaryColorHover = "#9a13e6",
                SecondaryColor = "#b45df0",
                BackgroundColor = "#1f1f1f",
                TextColor = "#ffffff",
                HeroHeading = "Next-Gen Multi-Gaming & Skill Lounge",
                HeroSubheading = "Certified transparent gameplay, instant crypto QR deposits, and double-entry settlements."
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "matka", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
                new() { GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
                new() { GameKey = "sports", IsEnabled = true, DisplayOrder = 3, CustomBadge = "Category 3" },
                new() { GameKey = "other-games", IsEnabled = true, DisplayOrder = 4, CustomBadge = "Category 4" },
                new() { GameKey = "carrom", IsEnabled = true, DisplayOrder = 5, CustomBadge = "Category 4" },
                new() { GameKey = "ludo", IsEnabled = true, DisplayOrder = 6, CustomBadge = "Category 4" },
                new() { GameKey = "pool", IsEnabled = true, DisplayOrder = 7, CustomBadge = "Category 4" }
            }
        };

        // 2. Ambaari999 (Sports & Casino Exclusively)
        var ambaari = new Tenant
        {
            Id = "ten_ambaari_001",
            Slug = "ambaari999",
            Name = "Ambaari 999 Entertainment Ltd",
            PackageCode = "CUSTOM",
            ContactEmail = "support@ambaari999.com",
            Branding = new TenantBranding
            {
                BrandName = "AMBAARI999",
                Tagline = "Premium Sports Exchange & Live Casino",
                PrimaryColor = "#0088CC",
                PrimaryColorHover = "#006699",
                SecondaryColor = "#33AAFF",
                BackgroundColor = "#0a0a0c",
                TextColor = "#ffffff",
                LayoutTheme = "ambaari",
                HeroHeading = "India's Premier Sports & Casino Experience",
                HeroSubheading = "Live Betfair Cricket Exchange and Luxury Vegas Casino Tables."
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "sports", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
                new() { GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
                new() { GameKey = "matka", IsEnabled = false, DisplayOrder = 3 },
                new() { GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 },
                new() { GameKey = "carrom", IsEnabled = false, DisplayOrder = 5 },
                new() { GameKey = "ludo", IsEnabled = false, DisplayOrder = 6 },
                new() { GameKey = "pool", IsEnabled = false, DisplayOrder = 7 }
            }
        };

        // 3. Apex Sports (Sports ONLY)
        var apex = new Tenant
        {
            Id = "ten_sports_only",
            Slug = "apex-sports",
            Name = "Apex Sports Exchange Ltd",
            PackageCode = "CUSTOM",
            ContactEmail = "desk@apexsports.bet",
            Branding = new TenantBranding
            {
                BrandName = "APEX SPORTS",
                PrimaryColor = "#2563eb",
                SecondaryColor = "#60a5fa"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "sports", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Live Cricket" },
                new() { GameKey = "casino", IsEnabled = false, DisplayOrder = 2 },
                new() { GameKey = "matka", IsEnabled = false, DisplayOrder = 3 },
                new() { GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 }
            }
        };

        // 4. Royal Casino (Casino ONLY)
        var royal = new Tenant
        {
            Id = "ten_casino_only",
            Slug = "royal-casino",
            Name = "Royal Casino Lounge Ltd",
            PackageCode = "CASINO_SUITE",
            ContactEmail = "vip@royalcasino.live",
            Branding = new TenantBranding
            {
                BrandName = "ROYAL CASINO",
                PrimaryColor = "#dc2626",
                SecondaryColor = "#f87171"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "casino", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 2" },
                new() { GameKey = "sports", IsEnabled = false, DisplayOrder = 2 },
                new() { GameKey = "matka", IsEnabled = false, DisplayOrder = 3 },
                new() { GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 }
            }
        };

        // 5. Kalyan Club (Matka ONLY)
        var kalyan = new Tenant
        {
            Id = "ten_kalyan_001",
            Slug = "kalyan-club",
            Name = "Kalyan Club International Ltd",
            PackageCode = "MATKA_ONLY",
            ContactEmail = "contact@kalyanclub.com",
            Branding = new TenantBranding
            {
                BrandName = "KALYAN CLUB",
                PrimaryColor = "#f59e0b",
                SecondaryColor = "#fbbf24"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "matka", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
                new() { GameKey = "casino", IsEnabled = false, DisplayOrder = 2 },
                new() { GameKey = "sports", IsEnabled = false, DisplayOrder = 3 },
                new() { GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 },
                new() { GameKey = "carrom", IsEnabled = false, DisplayOrder = 5 },
                new() { GameKey = "ludo", IsEnabled = false, DisplayOrder = 6 },
                new() { GameKey = "pool", IsEnabled = false, DisplayOrder = 7 }
            }
        };

        // 6. Board Masters (Matka + Ludo Duo)
        var board = new Tenant
        {
            Id = "ten_board_001",
            Slug = "board-masters",
            Name = "Board Masters UK Ltd",
            PackageCode = "MATKA_LUDO",
            ContactEmail = "ops@boardmasters.uk",
            Branding = new TenantBranding
            {
                BrandName = "BOARD MASTERS",
                PrimaryColor = "#10b981",
                SecondaryColor = "#34d399"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "matka", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
                new() { GameKey = "other-games", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 4" },
                new() { GameKey = "ludo", IsEnabled = true, DisplayOrder = 3, CustomBadge = "Category 4" },
                new() { GameKey = "casino", IsEnabled = false, DisplayOrder = 4 },
                new() { GameKey = "sports", IsEnabled = false, DisplayOrder = 5 },
                new() { GameKey = "carrom", IsEnabled = false, DisplayOrder = 6 },
                new() { GameKey = "pool", IsEnabled = false, DisplayOrder = 7 }
            }
        };

        // 7. Pro Cue (Carrom + Pool Lounge)
        var procue = new Tenant
        {
            Id = "ten_procue_001",
            Slug = "pro-cue",
            Name = "Pro Cue Billiards Lounge",
            PackageCode = "CUSTOM",
            ContactEmail = "desk@procue.vip",
            Branding = new TenantBranding
            {
                BrandName = "PRO CUE LOUNGE",
                PrimaryColor = "#06b6d4",
                SecondaryColor = "#22d3ee"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "other-games", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 4" },
                new() { GameKey = "carrom", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 4" },
                new() { GameKey = "pool", IsEnabled = true, DisplayOrder = 3, CustomBadge = "Category 4" },
                new() { GameKey = "matka", IsEnabled = false, DisplayOrder = 4 },
                new() { GameKey = "casino", IsEnabled = false, DisplayOrder = 5 },
                new() { GameKey = "sports", IsEnabled = false, DisplayOrder = 6 },
                new() { GameKey = "ludo", IsEnabled = false, DisplayOrder = 7 }
            }
        };

        // 8. Titan Gaming (Sports + Casino Hybrid)
        var titan = new Tenant
        {
            Id = "ten_hybrid_001",
            Slug = "titan-gaming",
            Name = "Titan Gaming Hybrid Syndicate",
            PackageCode = "CUSTOM",
            ContactEmail = "desk@titangaming.vip",
            Branding = new TenantBranding
            {
                BrandName = "TITAN GAMING",
                PrimaryColor = "#8b5cf6",
                SecondaryColor = "#a78bfa"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "sports", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 3" },
                new() { GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
                new() { GameKey = "matka", IsEnabled = false, DisplayOrder = 3 },
                new() { GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 },
                new() { GameKey = "carrom", IsEnabled = false, DisplayOrder = 5 },
                new() { GameKey = "ludo", IsEnabled = false, DisplayOrder = 6 },
                new() { GameKey = "pool", IsEnabled = false, DisplayOrder = 7 }
            }
        };

        _tenants[atlas.Id] = atlas;
        _tenants[ambaari.Id] = ambaari;
        _tenants[apex.Id] = apex;
        _tenants[royal.Id] = royal;
        _tenants[kalyan.Id] = kalyan;
        _tenants[board.Id] = board;
        _tenants[procue.Id] = procue;
        _tenants[titan.Id] = titan;

        _domainIndex["localhost"] = atlas.Id;
        _domainIndex["127.0.0.1"] = atlas.Id;
        _domainIndex["platform.atlasgaming.uk"] = atlas.Id;
        _domainIndex["ambaari999.com"] = ambaari.Id;
        _domainIndex["apexsports.bet"] = apex.Id;
        _domainIndex["royalcasino.live"] = royal.Id;
        _domainIndex["kalyanclub.com"] = kalyan.Id;
        _domainIndex["boardmasters.uk"] = board.Id;
        _domainIndex["procue.vip"] = procue.Id;
        _domainIndex["titangaming.vip"] = titan.Id;
    }
}
