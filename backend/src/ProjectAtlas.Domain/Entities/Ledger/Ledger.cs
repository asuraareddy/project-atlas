namespace ProjectAtlas.Domain.Entities.Ledger;

public enum WalletType
{
    PLAYER_PRIMARY,
    OPERATOR_SYSTEM
}

public class Wallet
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public WalletType WalletType { get; set; } = WalletType.PLAYER_PRIMARY;
    public string Currency { get; set; } = "GBP";
    public long CashAvailableMinor { get; set; }
    public long CashReservedMinor { get; set; }
    public long BonusMinor { get; set; }
    public long PointsBalance { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum EntryDirection
{
    DEBIT,
    CREDIT
}

public class LedgerAccount
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public string AccountType { get; set; } = "ASSET"; // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    public string Currency { get; set; } = "GBP";
    public string Status { get; set; } = "ACTIVE";
}

public class LedgerTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty; // CRYPTO_DEPOSIT, WITHDRAWAL, GAME_STAKE, GAME_WIN, BONUS_GRANT
    public string SourceId { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string Status { get; set; } = "POSTED"; // POSTED, REVERSED
    public string ReasonCode { get; set; } = string.Empty;
    public string? ActorId { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<LedgerEntry> Entries { get; set; } = new();
}

public class LedgerEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TransactionId { get; set; } = string.Empty;
    public string LedgerAccountId { get; set; } = string.Empty;
    public EntryDirection Direction { get; set; }
    public long AmountMinor { get; set; }
    public string Currency { get; set; } = "GBP";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public LedgerTransaction? Transaction { get; set; }
    public LedgerAccount? LedgerAccount { get; set; }
}
