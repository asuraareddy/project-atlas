using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Entities.Tenancy;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/admin/tenants")]
public class AdminTenantsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAllTenants()
    {
        var tenants = TenantStore.GetAllTenants().Select(t => new
        {
            id = t.Id,
            slug = t.Slug,
            name = t.Name,
            status = t.Status,
            packageCode = t.PackageCode,
            contactEmail = t.ContactEmail,
            branding = t.Branding,
            pointConfig = t.PointConfig,
            gameEntitlements = t.GameEntitlements,
            // Shape expected by the Tenants admin UI (kept backward-compatible)
            gameConfigs = t.GameEntitlements.Select(g => new
            {
                gameKey = g.GameKey,
                isEnabled = g.IsEnabled,
                displayOrder = g.DisplayOrder,
                customTitle = g.CustomTitle,
                customBadge = g.CustomBadge
            }).ToList(),
            domains = t.Domains.Select(d => new
            {
                id = d.Id,
                tenantId = d.TenantId,
                hostname = d.Hostname,
                isPrimary = d.IsPrimary,
                verificationStatus = d.VerificationStatus,
                verificationToken = d.VerificationToken,
                sslStatus = d.SslStatus,
                createdAt = d.CreatedAt
            }).ToList(),
            createdAt = t.CreatedAt,
            updatedAt = t.UpdatedAt
        }).ToList();

        return Ok(new
        {
            data = new
            {
                tenants,
                packages = B2BPackages,
                count = tenants.Count
            }
        });
    }

    private static readonly object[] B2BPackages = new object[]
    {
        new { id = "pkg_matka_only", code = "MATKA_ONLY", name = "Matka Starter Suite", description = "Standalone live Matka draw markets, cut-offs, and historical result charts.", includedGames = new[] { "matka" }, monthlyPriceMinor = 49900, currency = "GBP", isActive = true },
        new { id = "pkg_matka_ludo", code = "MATKA_LUDO", name = "Matka & Ludo Duo", description = "Live Matka number draws plus multiplayer cryptographic Ludo circuit racing.", includedGames = new[] { "matka", "ludo" }, monthlyPriceMinor = 89900, currency = "GBP", isActive = true },
        new { id = "pkg_matka_carrom", code = "MATKA_CARROM", name = "Matka & Carrom Duo", description = "Live Matka markets plus 2D physics tabletop Carrom tournament tables.", includedGames = new[] { "matka", "carrom" }, monthlyPriceMinor = 89900, currency = "GBP", isActive = true },
        new { id = "pkg_matka_ludo_carrom", code = "MATKA_LUDO_CARROM", name = "Classic Trio Suite", description = "Matka number draws, Ludo racing, and Carrom tabletop challenge.", includedGames = new[] { "matka", "ludo", "carrom" }, monthlyPriceMinor = 129900, currency = "GBP", isActive = true },
        new { id = "pkg_casino_suite", code = "CASINO_SUITE", name = "Casino & Draw Starter Suite", description = "Aggregated casino slots & tables (Sandbox Test Mode) plus live Matka draws.", includedGames = new[] { "matka", "casino" }, monthlyPriceMinor = 119900, currency = "GBP", isActive = true },
        new { id = "pkg_complete_pro", code = "COMPLETE_PRO_SUITE", name = "Grand Master Full Suite", description = "Every gaming title: Matka, Ludo, Carrom, 8-Ball Pool Pro, Other Games, Casino Games, and Betfair Sports Exchange.", includedGames = new[] { "matka", "carrom", "ludo", "pool", "other-games", "casino", "sports" }, monthlyPriceMinor = 199900, currency = "GBP", isActive = true },
        new { id = "pkg_sports_suite", code = "SPORTS_SUITE", name = "Sports & Exchange Specialist Suite", description = "Betfair API-NG live exchange markets, in-play cricket scoreboards, and bookmaker odds.", includedGames = new[] { "sports" }, monthlyPriceMinor = 129900, currency = "GBP", isActive = true },
        new { id = "pkg_custom", code = "CUSTOM", name = "Custom Operator Package", description = "Fully bespoke game entitlements configured per operator.", includedGames = new[] { "matka" }, monthlyPriceMinor = 0, currency = "GBP", isActive = true }
    };

    [HttpGet("{id}")]
    public IActionResult GetTenantById(string id)
    {
        var tenant = TenantStore.GetTenantById(id) ?? TenantStore.GetTenantBySlug(id);
        if (tenant == null)
        {
            return NotFound(new { error = $"Tenant with ID or slug '{id}' not found." });
        }

        return Ok(new
        {
            data = new
            {
                tenant = new
                {
                    id = tenant.Id,
                    slug = tenant.Slug,
                    name = tenant.Name,
                    status = tenant.Status,
                    packageCode = tenant.PackageCode,
                    branding = tenant.Branding,
                    pointConfig = tenant.PointConfig,
                    gameEntitlements = tenant.GameEntitlements
                }
            }
        });
    }

    [HttpGet("{id}/point-config")]
    public IActionResult GetTenantPointConfig(string id)
    {
        var tenant = TenantStore.GetTenantById(id) ?? TenantStore.GetTenantBySlug(id);
        if (tenant == null)
        {
            return NotFound(new { error = $"Tenant '{id}' not found." });
        }

        return Ok(new
        {
            data = new
            {
                tenantId = tenant.Id,
                tenantSlug = tenant.Slug,
                pointConfig = tenant.PointConfig,
                description = "Point valuation is configured per client. By default, 1 Point = 1 (currency undefined / points only)."
            }
        });
    }

    [HttpPost]
    public IActionResult CreateTenant([FromBody] CreateTenantRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Slug) || string.IsNullOrWhiteSpace(request.ContactEmail))
        {
            return BadRequest(new { error = "BAD_REQUEST", message = "Name, slug, and contact email are required." });
        }

        var existingSlug = TenantStore.GetTenantBySlug(request.Slug);
        if (existingSlug != null)
        {
            return Conflict(new { error = "CONFLICT", message = $"Tenant slug '{request.Slug}' already exists." });
        }

        var tenantId = $"ten_{request.Slug.ToLowerInvariant().Replace(' ', '_')}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^6..]}";
        var pkg = request.PackageCode ?? "COMPLETE_PRO_SUITE";

        var newTenant = new Tenant
        {
            Id = tenantId,
            Slug = request.Slug.ToLowerInvariant(),
            Name = request.Name,
            Status = "ACTIVE",
            PackageCode = pkg,
            ContactEmail = request.ContactEmail,
            Branding = request.Branding ?? new TenantBranding
            {
                BrandName = request.Name.ToUpperInvariant(),
                Tagline = "Multi-Gaming Lounge",
                PrimaryColor = "#7e0ac2",
                SecondaryColor = "#b45df0",
                BackgroundColor = "#18181b",
                TextColor = "#ffffff"
            },
            GameEntitlements = new List<TenantGameEntitlement>
            {
                new() { GameKey = "matka", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
                new() { GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
                new() { GameKey = "sports", IsEnabled = true, DisplayOrder = 3, CustomBadge = "Category 3" },
                new() { GameKey = "other-games", IsEnabled = true, DisplayOrder = 4, CustomBadge = "Category 4" }
            }
        };

        TenantStore.SaveTenant(newTenant);

        return Ok(new
        {
            data = new { tenant = newTenant },
            message = "Tenant provisioned successfully."
        });
    }

    public record CreateTenantRequest(
        string? Name,
        string? Slug,
        string? ContactEmail,
        string? PackageCode,
        string? PrimaryHostname,
        TenantBranding? Branding
    );

    public record UpdateGamesRequest(string? PackageCode, List<TenantGameEntitlement>? GameConfigs);

    [HttpPut("{id}/games")]
    public IActionResult UpdateTenantGames(string id, [FromBody] UpdateGamesRequest request)
    {
        var tenant = TenantStore.GetTenantById(id) ?? TenantStore.GetTenantBySlug(id);
        if (tenant == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Tenant '{id}' not found." });
        }

        if (!string.IsNullOrEmpty(request.PackageCode)) tenant.PackageCode = request.PackageCode;
        if (request.GameConfigs != null) tenant.GameEntitlements = request.GameConfigs;
        tenant.UpdatedAt = DateTime.UtcNow;

        return Ok(new
        {
            data = new { tenant },
            message = "Game entitlements updated successfully."
        });
    }

    public record UpdatePointConfigRequest(decimal PointToCurrencyRate, string? CurrencyCode, string? PointUnitName);

    [HttpPut("{id}/point-config")]
    public IActionResult UpdateTenantPointConfig(string id, [FromBody] UpdatePointConfigRequest request)
    {
        var updated = TenantStore.UpdateTenantPointConfig(id, request.PointToCurrencyRate, request.CurrencyCode, request.PointUnitName);
        if (!updated)
        {
            return NotFound(new { error = $"Tenant '{id}' not found." });
        }

        var tenant = TenantStore.GetTenantById(id) ?? TenantStore.GetTenantBySlug(id);
        return Ok(new
        {
            data = new
            {
                tenantId = tenant!.Id,
                tenantSlug = tenant.Slug,
                pointConfig = tenant.PointConfig,
                message = $"Point configuration updated successfully. 1 Point = {tenant.PointConfig.PointToCurrencyRate} {tenant.PointConfig.CurrencyCode}."
            }
        });
    }
}
