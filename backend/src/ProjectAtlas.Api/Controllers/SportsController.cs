using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Sports;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/sports")]
public class SportsController : ControllerBase
{
    private static readonly List<object> Categories = new()
    {
        new { id = "4", name = "Cricket", slug = "cricket", icon = "Trophy", activeEventCount = 12, inPlayCount = 4 },
        new { id = "1", name = "Soccer", slug = "soccer", icon = "CircleDot", activeEventCount = 28, inPlayCount = 8 },
        new { id = "2", name = "Tennis", slug = "tennis", icon = "Activity", activeEventCount = 15, inPlayCount = 5 }
    };

    private static readonly List<object> Events = new()
    {
        new
        {
            id = "33445501",
            eventTypeId = "4",
            sportName = "Cricket",
            competition = "ICC Champions Trophy",
            name = "India vs Australia",
            homeTeam = "India",
            awayTeam = "Australia",
            openDate = DateTime.UtcNow.AddMinutes(-45).ToString("o"),
            countryCode = "IN",
            venue = "Wankhede Stadium, Mumbai",
            status = "IN_PLAY",
            isInPlay = true,
            marketCount = 6,
            scoreboard = new
            {
                homeScore = new { runs = 178, wickets = 3, overs = 18.2, inning = 1 },
                awayScore = new { runs = 0, wickets = 0, overs = 0.0, inning = 2 },
                currentBattingTeam = "HOME",
                matchType = "T20",
                oversLimit = 20,
                currentRunRate = 9.71,
                requiredRunRate = 0.0,
                recentBalls = new[] { "1", "4", "W", "0", "6", "1" },
                commentary = "18.2 Cummins to Sharma, 1 run, driven firmly down to long-on."
            },
            exchangeMarket = new
            {
                marketId = "1.22334455",
                marketName = "Match Odds",
                status = "OPEN",
                runners = new[]
                {
                    new
                    {
                        selectionId = "sel_ind",
                        runnerName = "India",
                        backOdds = 1.48,
                        backSize = 12500,
                        layOdds = 1.50,
                        laySize = 18400
                    },
                    new
                    {
                        selectionId = "sel_aus",
                        runnerName = "Australia",
                        backOdds = 2.92,
                        backSize = 8200,
                        layOdds = 2.96,
                        laySize = 6500
                    }
                }
            }
        },
        new
        {
            id = "33445502",
            eventTypeId = "4",
            sportName = "Cricket",
            competition = "Indian Premier League",
            name = "Mumbai Indians vs Chennai Super Kings",
            homeTeam = "Mumbai Indians",
            awayTeam = "Chennai Super Kings",
            openDate = DateTime.UtcNow.AddHours(2).ToString("o"),
            countryCode = "IN",
            venue = "Eden Gardens",
            status = "PRE_MATCH",
            isInPlay = false,
            marketCount = 14
        }
    };

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        bool isEnabled = tenantCtx.IsGameEnabled("sports");

        return Ok(new
        {
            data = new
            {
                isConfigured = true,
                mode = "SANDBOX",
                appKey = "bf_live_••••••••0199",
                defaultSportId = "4",
                maxLiabilityMinor = 100000,
                tenantEnabled = isEnabled
            },
            meta = new
            {
                tenantId = tenantCtx.TenantId,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        });
    }

    [HttpGet("events")]
    public IActionResult GetEvents([FromQuery] string? category)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        if (!tenantCtx.IsGameEnabled("sports"))
        {
            return StatusCode(403, new
            {
                error = "FORBIDDEN_403",
                message = "Sports & Exchange module is not enabled for this tenant domain."
            });
        }

        string activeCat = category ?? "4";

        return Ok(new
        {
            data = new
            {
                activeCategoryId = activeCat,
                events = Events,
                categories = Categories,
                credentials = new
                {
                    mode = "SANDBOX",
                    isConfigured = true,
                    appKeyMasked = "bf_live_••••••••0199"
                }
            },
            meta = new
            {
                provider = "Betfair API-NG & In-Play Service",
                tenantId = tenantCtx.TenantId,
                timestamp = DateTime.UtcNow.ToString("o"),
                isTestMode = true
            }
        });
    }

    [HttpGet("events/{id}")]
    public IActionResult GetEventById(string id)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        if (!tenantCtx.IsGameEnabled("sports"))
        {
            return StatusCode(403, new
            {
                error = "FORBIDDEN_403",
                message = "Sports & Exchange module is not enabled for this tenant domain."
            });
        }

        var ev = Events.FirstOrDefault(e => ((dynamic)e).id == id);
        if (ev == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Sports event {id} not found" });
        }

        return Ok(new
        {
            data = new { @event = ev },
            meta = new
            {
                tenantId = tenantCtx.TenantId,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        });
    }
}
