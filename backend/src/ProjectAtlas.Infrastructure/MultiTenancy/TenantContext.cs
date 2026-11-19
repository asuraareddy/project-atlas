using ProjectAtlas.Domain.Entities.Tenancy;

namespace ProjectAtlas.Infrastructure.MultiTenancy;

public interface ITenantContext
{
    string TenantId { get; }
    string TenantSlug { get; }
    string TenantName { get; }
    TenantBranding Branding { get; }
    TenantPointConfig PointConfig { get; }
    List<string> EnabledGames { get; }
    bool IsGameEnabled(string gameKey);
}

public class TenantContext : ITenantContext
{
    public string TenantId { get; set; } = "org_atlas_uk_001";
    public string TenantSlug { get; set; } = "atlas";
    public string TenantName { get; set; } = "Project Atlas Global Ltd";
    public TenantBranding Branding { get; set; } = new();
    public TenantPointConfig PointConfig { get; set; } = new();
    public List<string> EnabledGames { get; set; } = new() { "matka", "casino", "sports", "other-games", "carrom", "ludo", "pool" };

    public bool IsGameEnabled(string gameKey)
    {
        if (string.IsNullOrEmpty(gameKey)) return false;
        return EnabledGames.Contains(gameKey.ToLowerInvariant());
    }
}
