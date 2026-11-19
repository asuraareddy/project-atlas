using Microsoft.AspNetCore.Mvc;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/admin/reports")]
public class AdminReportsController : ControllerBase
{
    [HttpGet("pnl")]
    public IActionResult GetPnLReport()
    {
        var reportData = new
        {
            period = "2026-10-25",
            currency = "GBP",
            timezone = "Europe/London",
            formulaVersion = "UK_GAAP_NGR_v1.2",
            asOf = DateTime.UtcNow.ToString("o"),
            reconciliationStatus = "RECONCILED",
            metrics = new
            {
                totalStakesMinor = 845000,
                totalWinningsMinor = 612000,
                grossGamingRevenueMinor = 233000,
                bonusCostMinor = 25000,
                paymentFeesMinor = 14000,
                gamingDutyEstimateMinor = 35000,
                netGamingRevenueMinor = 159000,
                customerCashLiabilityMinor = 3000000,
                pendingWithdrawalsMinor = 50000
            },
            gamePerformance = new[]
            {
                new { category = "Matka", stakesMinor = 480000, winningsMinor = 340000, ggrMinor = 140000, rounds = 420 },
                new { category = "Carrom", stakesMinor = 165000, winningsMinor = 125000, ggrMinor = 40000, rounds = 110 },
                new { category = "Ludo", stakesMinor = 140000, winningsMinor = 105000, ggrMinor = 35000, rounds = 165 },
                new { category = "Other Games", stakesMinor = 60000, winningsMinor = 42000, ggrMinor = 18000, rounds = 45 }
            },
            branchPerformance = new[]
            {
                new { branchId = "br_london_central", name = "London Central Ops", activePlayers = 185, netContributionMinor = 88000 },
                new { branchId = "br_manchester_north", name = "Manchester North", activePlayers = 120, netContributionMinor = 51000 },
                new { branchId = "br_birmingham_west", name = "Birmingham West", activePlayers = 74, netContributionMinor = 20000 }
            }
        };

        return Ok(new
        {
            data = new { report = reportData },
            meta = new { correlationId = $"corr_pnl_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }
}
