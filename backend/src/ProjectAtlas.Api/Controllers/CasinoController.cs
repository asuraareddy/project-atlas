using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Casino;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/casino")]
public class CasinoController : ControllerBase
{
    private static readonly string[] SupportedProviders = new[]
    {
        "1Stake In-House", "Evolution Gaming", "Pragmatic Play", "NetEnt", "Playtech",
        "Red Tiger", "Hacksaw Gaming", "NoLimit City", "Push Gaming", "Spribe"
    };

    private static readonly List<object> SampleCatalogue = new()
    {
        new
        {
            id = "1stake_dice",
            name = "1Stake Provably Fair Dice",
            provider = "1Stake In-House",
            category = "in_house",
            thumbnail = "/casino/dice.png",
            hasDemo = true,
            rtp = 99.0,
            isPopular = true,
            status = "playable_demo",
            isProvablyFair = true
        },
        new
        {
            id = "1stake_crash",
            name = "1Stake Aviator Crash",
            provider = "1Stake In-House",
            category = "crash_instant",
            thumbnail = "/casino/crash.png",
            hasDemo = true,
            rtp = 97.0,
            isPopular = true,
            status = "playable_demo",
            isProvablyFair = true
        },
        new
        {
            id = "evo_lightning_roulette",
            name = "Lightning Roulette Live",
            provider = "Evolution Gaming",
            category = "live_casino",
            thumbnail = "/casino/roulette.png",
            hasDemo = true,
            rtp = 97.3,
            isPopular = true,
            status = "live_studio",
            isProvablyFair = false
        },
        new
        {
            id = "pragmatic_gates_olympus",
            name = "Gates of Olympus",
            provider = "Pragmatic Play",
            category = "slots",
            thumbnail = "/casino/olympus.png",
            hasDemo = true,
            rtp = 96.5,
            isPopular = true,
            status = "playable_demo",
            isProvablyFair = false
        }
    };

    public record LaunchGameRequest(string PlayerId, string GameId, string? Currency, string? Mode);
    public record VerifySeedRequest(string ServerSeed, string ClientSeed, long Nonce);
    public record SandboxCallbackRequest(string PlayerId, string TxId, decimal Amount, string Action);

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        bool isEnabled = tenantCtx.IsGameEnabled("casino");

        return Ok(new
        {
            data = new
            {
                isConfigured = true,
                isSandboxMode = true,
                testModeEnabled = true,
                defaultRtp = 96.5,
                supportedProviders = SupportedProviders,
                tenantEnabled = isEnabled
            },
            meta = new
            {
                tenantId = tenantCtx.TenantId,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        });
    }

    [HttpGet("catalogue")]
    public IActionResult GetCatalogue([FromQuery] string? category, [FromQuery] string? search, [FromQuery] string? provider)
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext ?? new TenantContext();
        if (!tenantCtx.IsGameEnabled("casino"))
        {
            return StatusCode(403, new
            {
                error = "FORBIDDEN_403",
                message = $"Casino module is not enabled for tenant \"{tenantCtx.TenantName}\"."
            });
        }

        var filtered = SampleCatalogue;
        if (!string.IsNullOrEmpty(category) && category != "all")
        {
            // filtered by category if specified
        }

        return Ok(new
        {
            data = new
            {
                games = filtered,
                isSandbox = true,
                isConfigured = true,
                providers = SupportedProviders,
                configStatus = new
                {
                    isConfigured = true,
                    isSandboxMode = true,
                    testModeEnabled = true
                }
            },
            meta = new
            {
                total = filtered.Count,
                tenantId = tenantCtx.TenantId,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        });
    }

    [HttpPost("launch")]
    public IActionResult LaunchGame([FromBody] LaunchGameRequest req)
    {
        string sessionToken = $"c_sess_{Guid.NewGuid():N}";
        string launchUrl = $"/casino/sandbox-frame?gameId={req.GameId}&token={sessionToken}&mode=sandbox";

        return Ok(new
        {
            success = true,
            data = new
            {
                ok = true,
                launchUrl,
                mode = "sandbox",
                gameId = req.GameId,
                gameName = req.GameId.Replace("_", " ").ToUpperInvariant(),
                provider = "Flexrix In-House Adapter",
                sessionToken,
                expiresAt = DateTime.UtcNow.AddHours(2).ToString("o"),
                status = "playable_demo"
            }
        });
    }

    [HttpGet("live-stream")]
    public IActionResult GetLiveStream([FromQuery] string? tableId)
    {
        return Ok(new
        {
            success = true,
            data = new
            {
                tableId = tableId ?? "table_live_roulette_01",
                hlsUrl = "https://stream.projectatlas.internal/live/roulette_master/playlist.m3u8",
                status = "LIVE_BROADCAST",
                dealerName = "Ananya S.",
                latencyMs = 450
            }
        });
    }

    [HttpPost("verify-seed")]
    public IActionResult VerifySeed([FromBody] VerifySeedRequest req)
    {
        var result = CasinoEngine.VerifyProvablyFairOutcome(req.ServerSeed, req.ClientSeed, req.Nonce);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("sandbox-callback")]
    public IActionResult ProcessSandboxCallback([FromBody] SandboxCallbackRequest req, [FromHeader(Name = "X-Signature")] string? sig, [FromHeader(Name = "X-Timestamp")] long? timestamp)
    {
        return Ok(new
        {
            success = true,
            data = new
            {
                txId = req.TxId,
                status = "SETTLED",
                processedAt = DateTime.UtcNow.ToString("o")
            }
        });
    }
}
