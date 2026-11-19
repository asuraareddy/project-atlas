namespace ProjectAtlas.Domain.Entities.Tenancy;

public class TenantBranding
{
    public string BrandName { get; set; } = "PROJECT ATLAS";
    public string? Tagline { get; set; } = "Multi-Gaming B2B Enterprise Platform";
    public string LogoUrl { get; set; } = "/icons/icon-192.png";
    public string? FaviconUrl { get; set; } = "/favicon.ico";
    public string PrimaryColor { get; set; } = "#7e0ac2";
    public string PrimaryColorHover { get; set; } = "#9a13e6";
    public string SecondaryColor { get; set; } = "#b45df0";
    public string BackgroundColor { get; set; } = "#1f1f1f";
    public string TextColor { get; set; } = "#ffffff";
    public string AccentGlowColor { get; set; } = "rgba(126,10,194,0.35)";
    public string HeroHeading { get; set; } = "Next-Gen Multi-Gaming & Skill Lounge";
    public string HeroSubheading { get; set; } = "Certified transparent gameplay, instant crypto QR deposits, and double-entry settlements.";
    public string FooterText { get; set; } = "Project Atlas Platform — Certified Multi-Tenant Enterprise Gaming System.";
    public string SupportEmail { get; set; } = "support@atlasgaming.uk";
    public string? LayoutTheme { get; set; } // null, "standard", "ambaari"
}

public class TenantPointConfig
{
    public decimal PointToCurrencyRate { get; set; } = 1.0m; // Default: 1 point = 1
    public string CurrencyCode { get; set; } = "UNDEFINED"; // "UNDEFINED", or client-configured
    public string CurrencySymbol { get; set; } = ""; // No fiat symbols (£/€/$)
    public string PointUnitName { get; set; } = "PTS"; // Default: "PTS" / "Points"
    public bool DisplayAsPointsOnly { get; set; } = true;
}

public class Tenant
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, SUSPENDED, ONBOARDING
    public string PackageCode { get; set; } = "COMPLETE_PRO_SUITE";
    public string ContactEmail { get; set; } = string.Empty;
    public string DefaultCurrency { get; set; } = "POINTS";
    public TenantBranding Branding { get; set; } = new();
    public TenantPointConfig PointConfig { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<TenantDomain> Domains { get; set; } = new();
    public List<TenantGameEntitlement> GameEntitlements { get; set; } = new();
}

public class TenantDomain
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string Hostname { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string VerificationStatus { get; set; } = "VERIFIED";
    public string VerificationToken { get; set; } = string.Empty;
    public string SslStatus { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
}

public class TenantGameEntitlement
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string GameKey { get; set; } = string.Empty; // matka, casino, sports, other-games, carrom, ludo, pool
    public bool IsEnabled { get; set; } = true;
    public int DisplayOrder { get; set; } = 1;
    public string? CustomTitle { get; set; }
    public string? CustomBadge { get; set; }

    public Tenant? Tenant { get; set; }
}

public class CommercialPackage
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int MonthlyPriceMinor { get; set; }
    public string Currency { get; set; } = "GBP";
    public List<string> IncludedGames { get; set; } = new();
    public bool IsActive { get; set; } = true;
}
