using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Security;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/admin/approvals")]
public class AdminApprovalsController : ControllerBase
{
    public class ApprovalItem
    {
        public string Id { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public string ResourceId { get; set; } = string.Empty;
        public string MakerId { get; set; } = string.Empty;
        public string? CheckerId { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, rejected
        public string Reason { get; set; } = string.Empty;
        public object? RequestedPayload { get; set; }
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
        public string? DecidedAt { get; set; }
    }

    private static readonly List<ApprovalItem> PendingApprovals = new()
    {
        new ApprovalItem
        {
            Id = "appr_req_01",
            ActionType = "WITHDRAWAL_APPROVAL",
            ResourceType = "WITHDRAWAL",
            ResourceId = "wd_req_01",
            MakerId = "usr_player_01",
            Status = "pending",
            Reason = "High-value customer withdrawal exceeding automated limit (£50.00).",
            RequestedPayload = new { amountMinor = 5000, currency = "GBP", destination = "Sort 20-04-12 Acc 8912" }
        },
        new ApprovalItem
        {
            Id = "appr_req_02",
            ActionType = "WALLET_ADJUSTMENT",
            ResourceType = "WALLET",
            ResourceId = "usr_player_02",
            MakerId = "usr_payments_op_01",
            Status = "pending",
            Reason = "Goodwill compensation for delayed result settlement in Kalyan Night.",
            RequestedPayload = new { amountMinor = 1500, direction = "CREDIT", currency = "GBP" }
        },
        new ApprovalItem
        {
            Id = "appr_req_03",
            ActionType = "GAME_RESULT_PUBLISH",
            ResourceType = "GAME_ROUND",
            ResourceId = "round_mkt_milan_day_1025",
            MakerId = "usr_game_ops_01",
            Status = "pending",
            Reason = "Milan Day closing draw result verification: 147-21-489.",
            RequestedPayload = new { openPana = "147", jodi = "21", closePana = "489" }
        }
    };

    [HttpGet]
    public IActionResult GetApprovals()
    {
        return Ok(new
        {
            data = new
            {
                approvals = PendingApprovals
            },
            meta = new
            {
                correlationId = $"corr_appr_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                count = PendingApprovals.Count
            }
        });
    }

    public record DecisionPayload(string ApprovalId, string Decision, string CheckerId);

    [HttpPost]
    public IActionResult DecideApproval([FromBody] DecisionPayload payload)
    {
        var approval = PendingApprovals.FirstOrDefault(a => a.Id == payload.ApprovalId);
        if (approval == null)
        {
            return NotFound(new
            {
                error = new { code = "NOT_FOUND", message = $"Approval request '{payload.ApprovalId}' not found." }
            });
        }

        try
        {
            if (payload.Decision.Equals("APPROVED", StringComparison.OrdinalIgnoreCase))
            {
                // Enforce Maker-Checker dual control: makerId !== checkerId
                RbacService.VerifyMakerChecker(approval.MakerId, payload.CheckerId);

                approval.Status = "approved";
                approval.CheckerId = payload.CheckerId;
                approval.DecidedAt = DateTime.UtcNow.ToString("o");
            }
            else
            {
                approval.Status = "rejected";
                approval.CheckerId = payload.CheckerId;
                approval.DecidedAt = DateTime.UtcNow.ToString("o");
            }

            return Ok(new
            {
                data = new
                {
                    approval,
                    message = $"Approval request {payload.Decision.ToLower()} successfully by checker {payload.CheckerId}."
                },
                meta = new
                {
                    correlationId = $"corr_appr_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}"
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(403, new
            {
                error = new { code = "MAKER_CHECKER_REJECTED", message = ex.Message }
            });
        }
    }
}
