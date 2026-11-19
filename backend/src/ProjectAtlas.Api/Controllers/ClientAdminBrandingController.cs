using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Entities.Tenancy;
using ProjectAtlas.Infrastructure.MultiTenancy;
using ProjectAtlas.Infrastructure.Persistence;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/client-admin/branding")]
public class ClientAdminBrandingController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ClientAdminBrandingController(ApplicationDbContext db)
    {
        _db = db;
    }

    public record UpdateBrandingRequest(TenantBranding Branding);

    [HttpGet]
    public IActionResult GetBranding()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        var tenant = _db.Tenants.FirstOrDefault(t => t.Id == tenantCtx.TenantId);

        if (tenant == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = "Tenant not found" });
        }

        return Ok(new
        {
            data = new
            {
                tenantId = tenant.Id,
                slug = tenant.Slug,
                name = tenant.Name,
                branding = tenant.Branding,
                domains = _db.TenantDomains.Where(d => d.TenantId == tenant.Id).Select(d => new
                {
                    d.Id,
                    d.Hostname,
                    d.IsPrimary,
                    d.SslStatus,
                    d.VerificationStatus
                }).ToList(),
                enabledGames = tenant.GameEntitlements.Where(e => e.IsEnabled).Select(e => e.GameKey).ToList()
            }
        });
    }

    [HttpPut]
    public IActionResult UpdateBranding([FromBody] UpdateBrandingRequest req)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        var tenant = _db.Tenants.FirstOrDefault(t => t.Id == tenantCtx.TenantId);

        if (tenant == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = "Tenant not found" });
        }

        if (req.Branding != null)
        {
            tenant.Branding.BrandName = req.Branding.BrandName ?? tenant.Branding.BrandName;
            tenant.Branding.Tagline = req.Branding.Tagline ?? tenant.Branding.Tagline;
            tenant.Branding.PrimaryColor = req.Branding.PrimaryColor ?? tenant.Branding.PrimaryColor;
            tenant.Branding.PrimaryColorHover = req.Branding.PrimaryColorHover ?? tenant.Branding.PrimaryColorHover;
            tenant.Branding.SecondaryColor = req.Branding.SecondaryColor ?? tenant.Branding.SecondaryColor;
            tenant.Branding.BackgroundColor = req.Branding.BackgroundColor ?? tenant.Branding.BackgroundColor;
            tenant.Branding.TextColor = req.Branding.TextColor ?? tenant.Branding.TextColor;
            tenant.Branding.AccentGlowColor = req.Branding.AccentGlowColor ?? tenant.Branding.AccentGlowColor;
            tenant.Branding.HeroHeading = req.Branding.HeroHeading ?? tenant.Branding.HeroHeading;
            tenant.Branding.HeroSubheading = req.Branding.HeroSubheading ?? tenant.Branding.HeroSubheading;
            tenant.Branding.SupportEmail = req.Branding.SupportEmail ?? tenant.Branding.SupportEmail;

            _db.SaveChanges();
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                tenantId = tenant.Id,
                slug = tenant.Slug,
                branding = tenant.Branding
            }
        });
    }
}
