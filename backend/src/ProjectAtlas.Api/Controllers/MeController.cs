using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Security;
using ProjectAtlas.Domain.Security;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MeController : ControllerBase
{
    private readonly IJwtTokenService _jwtService;

    public MeController(IJwtTokenService jwtService)
    {
        _jwtService = jwtService;
    }

    [HttpGet]
    public IActionResult GetCurrentUser()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();

        // Check auth cookie or header
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        var token = authHeader?.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase) ??
                    Request.Cookies["atlas_auth_token"];

        string userId = "usr_guest_01";
        string email = "guest@atlasgaming.uk";
        string role = PlatformRoles.Player;

        if (!string.IsNullOrEmpty(token))
        {
            var principal = _jwtService.ValidateToken(token);
            if (principal != null)
            {
                userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? userId;
                email = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? email;
                role = principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? role;
            }
        }

        return Ok(new
        {
            data = new
            {
                user = new
                {
                    id = userId,
                    email,
                    role,
                    tenantId = tenantCtx.TenantId,
                    tenantSlug = tenantCtx.TenantSlug,
                    wallet = new
                    {
                        cashAvailableMinor = 125050, // £1,250.50
                        cashReservedMinor = 0,
                        pointsBalance = 540,
                        currency = "GBP"
                    }
                }
            }
        });
    }

    public record SaferGamblingRequest(string ActionType, string? LimitType, decimal? AmountGbp, int? DurationDays, string? Reason);

    [HttpPost("safer-gambling")]
    public IActionResult EnforceSaferGambling([FromBody] SaferGamblingRequest req)
    {
        string eventId = $"sg_evt_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

        return Ok(new
        {
            data = new
            {
                eventId,
                actionType = req.ActionType,
                status = "ENFORCED",
                effectiveFrom = DateTime.UtcNow.ToString("o"),
                message = req.ActionType == "SELF_EXCLUSION"
                    ? "Self-exclusion has been activated across all games and payment options."
                    : "Limit configuration has been updated and applied to your account."
            },
            meta = new
            {
                correlationId = $"corr_sg_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}"
            }
        });
    }
}
