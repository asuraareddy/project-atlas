using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Matka;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/matka")]
public class MatkaController : ControllerBase
{
    [HttpGet("patti")]
    public IActionResult GetPatti([FromQuery] int? digit, [FromQuery] string? type)
    {
        if (digit.HasValue && (digit < 0 || digit > 9))
        {
            return BadRequest(new { error = "Digit must be between 0 and 9" });
        }

        var results = digit.HasValue
            ? MatkaPattiCalculator.GetPattiForDigit(digit.Value, type)
            : MatkaPattiCalculator.GenerateAll220Patti();

        return Ok(new
        {
            data = new
            {
                patti = results,
                count = results.Count,
                digit = digit,
                type = type
            }
        });
    }

    [HttpGet("markets")]
    public IActionResult GetMarkets()
    {
        var markets = new[]
        {
            new
            {
                id = "mkt_kalyan_main",
                name = "KALYAN",
                openTime = "16:15",
                closeTime = "18:15",
                status = "OPEN",
                result = "379-98-378"
            },
            new
            {
                id = "mkt_milan_day",
                name = "MILAN DAY",
                openTime = "15:00",
                closeTime = "17:00",
                status = "OPEN",
                result = "120-3"
            },
            new
            {
                id = "mkt_rajdhani_night",
                name = "RAJDHANI NIGHT",
                openTime = "21:30",
                closeTime = "23:45",
                status = "UPCOMING",
                result = "Pending Result"
            }
        };

        return Ok(new
        {
            data = new
            {
                markets,
                count = markets.Length
            }
        });
    }

    [HttpGet("markets/{id}/chart")]
    public IActionResult GetMarketChart(string id)
    {
        var chart = new[]
        {
            new { date = "2026-11-10", openPana = "379", jodi = "98", closePana = "378" },
            new { date = "2026-11-11", openPana = "120", jodi = "35", closePana = "249" },
            new { date = "2026-11-12", openPana = "456", jodi = "50", closePana = "145" }
        };

        return Ok(new
        {
            data = new
            {
                marketId = id,
                chart
            },
            meta = new { correlationId = $"corr_chart_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }

    public record ParticipateRequest(string MarketId, string EntryType, string? SelectedValues, decimal? StakeMinor, int? TotalPoints);

    [HttpPost("participate")]
    public IActionResult Participate([FromBody] ParticipateRequest req)
    {
        if (string.IsNullOrEmpty(req.MarketId) || string.IsNullOrEmpty(req.EntryType))
        {
            return BadRequest(new { error = new { code = "INVALID_INPUT", message = "Missing required marketId or entryType" } });
        }

        string participationId = $"pt_{Guid.NewGuid():N}";
        return Ok(new
        {
            success = true,
            data = new
            {
                participationId,
                marketId = req.MarketId,
                status = "ACCEPTED",
                placedAt = DateTime.UtcNow.ToString("o")
            },
            meta = new { correlationId = $"corr_matka_pt_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }
}
