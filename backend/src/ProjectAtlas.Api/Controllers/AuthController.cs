using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Security;
using ProjectAtlas.Domain.Security;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtService;

    public AuthController(IJwtTokenService jwtService)
    {
        _jwtService = jwtService;
    }

    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string Email, string Password, string DisplayName);

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();

        string role = PlatformRoles.Player;
        string userId = "usr_player_" + Guid.NewGuid().ToString("N")[..8];
        string name = "Atlas Player";

        if (request.Email.Contains("superadmin", StringComparison.OrdinalIgnoreCase) ||
            request.Email.Equals("admin@atlasgaming.uk", StringComparison.OrdinalIgnoreCase))
        {
            role = PlatformRoles.SuperAdmin;
            userId = "usr_superadmin_01";
            name = "Chief Super Administrator";
        }
        else if (request.Email.Contains("clientadmin", StringComparison.OrdinalIgnoreCase) ||
                 request.Email.Contains("admin@", StringComparison.OrdinalIgnoreCase))
        {
            role = PlatformRoles.OperatorAdmin;
            userId = "usr_clientadmin_01";
            name = "Domain Operator Admin";
        }
        else if (request.Email.Contains("finance", StringComparison.OrdinalIgnoreCase))
        {
            role = PlatformRoles.FinanceManager;
            userId = "usr_finance_mgr_01";
            name = "Finance Operations Manager";
        }

        var token = _jwtService.GenerateToken(userId, request.Email, role, tenantCtx.TenantId);

        // Set secure HTTP-only cookie
        Response.Cookies.Append("atlas_auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            data = new
            {
                token,
                user = new
                {
                    id = userId,
                    email = request.Email,
                    displayName = name,
                    role,
                    tenantId = tenantCtx.TenantId,
                    tenantSlug = tenantCtx.TenantSlug
                }
            },
            meta = new
            {
                correlationId = $"corr_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}"
            }
        });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        var userId = "usr_player_" + Guid.NewGuid().ToString("N")[..8];

        var token = _jwtService.GenerateToken(userId, request.Email, PlatformRoles.Player, tenantCtx.TenantId);

        Response.Cookies.Append("atlas_auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            data = new
            {
                token,
                user = new
                {
                    id = userId,
                    email = request.Email,
                    displayName = request.DisplayName,
                    role = PlatformRoles.Player,
                    tenantId = tenantCtx.TenantId
                }
            }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("atlas_auth_token");
        return Ok(new { data = new { loggedOut = true } });
    }
}
