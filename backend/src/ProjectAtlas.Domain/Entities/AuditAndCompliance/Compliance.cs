namespace ProjectAtlas.Domain.Entities.AuditAndCompliance;

public enum ApprovalStatus
{
    PENDING,
    APPROVED,
    REJECTED
}

public class ApprovalRequest
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ActionType { get; set; } = string.Empty; // WITHDRAWAL_PAYOUT, GAME_RESULT_OVERRIDE, SYSTEM_KILLSWITCH, BALANCE_ADJUSTMENT
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceId { get; set; } = string.Empty;
    public string RequestedBy { get; set; } = string.Empty; // Maker ID
    public string RequestedPayloadHash { get; set; } = string.Empty;
    public ApprovalStatus Status { get; set; } = ApprovalStatus.PENDING;
    public string? ApprovedBy { get; set; } // Checker ID (Must != Maker ID)
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DecidedAt { get; set; }
}

public class AuditEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrganizationId { get; set; } = string.Empty;
    public string ActorType { get; set; } = "SYSTEM"; // USER, STAFF, SYSTEM
    public string ActorId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceId { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? IpHint { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AccountRestriction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string RestrictionType { get; set; } = "DEPOSIT_LIMIT"; // DEPOSIT_LIMIT, SELF_EXCLUSION, TIME_OUT, GAMING_BLOCK
    public string Scope { get; set; } = "ALL";
    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndsAt { get; set; }
    public string ReasonCode { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
}
