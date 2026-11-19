using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private record CategoryDto(
        string Key,
        string Label,
        string Route,
        int Order,
        bool Enabled,
        string Status,
        string Description,
        string Badge,
        string ArtworkIcon
    );

    private static readonly Dictionary<string, (int Order, string Label, string Route, string Badge, string Icon, string Desc)> DefaultCatalog = new()
    {
        ["matka"] = (1, "Matka", "/matka", "Category 1", "Dice5", "Classic number draw markets with server-verified draw schedules, cut-offs, and live result charts."),
        ["casino"] = (2, "Casino Games", "/casino", "Category 2", "Sparkles", "Unified iGaming aggregation featuring slots, live dealer tables, and crash games in test mode."),
        ["sports"] = (3, "Sports Exchange", "/sports", "Category 3", "Trophy", "Betfair API-NG live exchange markets, in-play cricket scoreboards, and bookmaker odds."),
        ["other-games"] = (4, "Other Games", "/other-games", "Category 4", "Layers", "Explore certified 8-Ball Pool Pro, Carrom Tabletop, Ludo Grand Circuit, and Ace2Three Indian Rummy.")
    };

    [HttpGet]
    public IActionResult GetCategories()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();

        var categories = new List<CategoryDto>();

        foreach (var (key, (order, label, route, badge, icon, desc)) in DefaultCatalog.OrderBy(d => d.Value.Order))
        {
            // If game is enabled for tenant or subgame is enabled
            bool isEnabled = tenantCtx.IsGameEnabled(key);
            if (key == "other-games" && (tenantCtx.IsGameEnabled("carrom") || tenantCtx.IsGameEnabled("ludo") || tenantCtx.IsGameEnabled("pool")))
            {
                isEnabled = true;
            }

            if (isEnabled)
            {
                categories.Add(new CategoryDto(
                    key,
                    label,
                    route,
                    order,
                    true,
                    "available",
                    desc,
                    badge,
                    icon
                ));
            }
        }

        return Ok(new
        {
            data = new
            {
                categories,
                tenant = new
                {
                    id = tenantCtx.TenantId,
                    slug = tenantCtx.TenantSlug,
                    name = tenantCtx.TenantName,
                    branding = tenantCtx.Branding,
                    pointConfig = tenantCtx.PointConfig,
                    enabledGames = tenantCtx.EnabledGames
                }
            },
            meta = new
            {
                correlationId = $"corr_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                count = categories.Count,
                tenantId = tenantCtx.TenantId
            }
        });
    }
}
