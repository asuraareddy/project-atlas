namespace ProjectAtlas.Domain.Entities.Payments;

public enum CryptoIntentStatus
{
    PENDING,
    DETECTED,
    CONFIRMING,
    COMPLETED,
    EXPIRED,
    FAILED,
    RISK_HOLD
}

public class CryptoDepositIntent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Asset { get; set; } = "USDT"; // USDT, USDC, BTC, ETH
    public string Network { get; set; } = "polygon"; // polygon, ethereum, bitcoin, bsc
    public string ReceivingAddress { get; set; } = string.Empty;
    public decimal ExpectedAmountCrypto { get; set; }
    public decimal QuotedRateGbp { get; set; }
    public long CreditedGbpMinor { get; set; }
    public string QrPayload { get; set; } = string.Empty;
    public CryptoIntentStatus Status { get; set; } = CryptoIntentStatus.PENDING;
    public string? TxHash { get; set; }
    public int ObservedConfirmations { get; set; }
    public int RequiredConfirmations { get; set; } = 12;
    public string IdempotencyKey { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum WithdrawalStatus
{
    REQUESTED,
    RISK_HOLD,
    PENDING_APPROVAL,
    APPROVED,
    PROCESSING,
    COMPLETED,
    REJECTED
}

public class WithdrawalRequest
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public long AmountMinor { get; set; }
    public string Currency { get; set; } = "GBP";
    public string DestinationType { get; set; } = "DIRECT_CRYPTO";
    public string DestinationReference { get; set; } = string.Empty;
    public WithdrawalStatus Status { get; set; } = WithdrawalStatus.REQUESTED;
    public string? MakerId { get; set; }
    public string? CheckerId { get; set; }
    public int RiskScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DecidedAt { get; set; }
}

public class PaymentGatewayConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = "platform"; // "platform" for Super Admin, or specific tenantId (e.g. "ten_ambaari_001")
    public string? TenantSlug { get; set; }
    public string ProviderKey { get; set; } = string.Empty; // razorpay_upi, cashfree_payouts, phonepe_pg, crypto_direct_qr, stripe_checkout, custom_gateway
    public string ProviderName { get; set; } = string.Empty;
    public string Ownership { get; set; } = "PLATFORM"; // PLATFORM, CLIENT_OWNED
    public string Environment { get; set; } = "SANDBOX"; // SANDBOX, PRODUCTION
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE, MAINTENANCE
    public bool SupportsDeposit { get; set; } = true;
    public bool SupportsWithdrawal { get; set; } = true;
    public string Currency { get; set; } = "INR"; // INR, GBP, USD, USDT
    public long MinDepositMinor { get; set; } = 100;
    public long MaxDepositMinor { get; set; } = 50000000;
    public long MinWithdrawalMinor { get; set; } = 500;
    public long MaxWithdrawalMinor { get; set; } = 10000000;
    public string EncryptedCredentialsJson { get; set; } = "{}";
    public List<string> AssignedTenantIds { get; set; } = new();
    public string LastHealthCheckStatus { get; set; } = "HEALTHY";
    public int LastHealthCheckLatencyMs { get; set; } = 65;
    public int LastHealthCheckStatusCode { get; set; } = 200;
    public string LastHealthCheckMessage { get; set; } = "Connected";
    public DateTime? LastHealthCheckAt { get; set; } = DateTime.UtcNow;
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class PaymentGatewayCredentials
{
    public string? MerchantId { get; set; }
    public string? ApiKey { get; set; }
    public string? ApiSecret { get; set; }
    public string? KeyId { get; set; }
    public string? ClientId { get; set; }
    public string? WebhookSecret { get; set; }
    public string? CallbackUrl { get; set; }
    public string? EncryptionKey { get; set; }
    public string? ReceivingAddress { get; set; }
    public Dictionary<string, object>? AdditionalSettings { get; set; }
}

public class MaskedGatewayCredentials
{
    public bool HasMerchantId { get; set; }
    public string? MaskedMerchantId { get; set; }
    public bool HasApiKey { get; set; }
    public string? MaskedApiKey { get; set; }
    public bool HasApiSecret { get; set; }
    public string? MaskedApiSecret { get; set; }
    public bool HasClientId { get; set; }
    public string? MaskedClientId { get; set; }
    public bool HasWebhookSecret { get; set; }
    public string? MaskedWebhookSecret { get; set; }
    public string? ReceivingAddress { get; set; }
}

public class MaskedPaymentGatewayDto
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string? TenantSlug { get; set; }
    public string ProviderKey { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string Ownership { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool SupportsDeposit { get; set; }
    public bool SupportsWithdrawal { get; set; }
    public string Currency { get; set; } = string.Empty;
    public long MinDepositMinor { get; set; }
    public long MaxDepositMinor { get; set; }
    public long MinWithdrawalMinor { get; set; }
    public long MaxWithdrawalMinor { get; set; }
    public MaskedGatewayCredentials MaskedCredentials { get; set; } = new();
    public List<string> AssignedTenantIds { get; set; } = new();
    public object? LastHealthCheck { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Version { get; set; }
}

public class TenantPaymentPolicy
{
    public string TenantId { get; set; } = string.Empty;
    public bool AllowClientOwned { get; set; } = true;
    public bool AllowPlatformGateway { get; set; } = true;
    public List<string> PermittedProviders { get; set; } = new() { "razorpay_upi", "cashfree_payouts", "crypto_direct_qr" };
    public long DailyDepositLimitMinor { get; set; } = 100000000;
    public long DailyWithdrawalLimitMinor { get; set; } = 50000000;
    public long AutoApproveWithdrawalsUnderMinor { get; set; } = 1000000;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class GatewayAuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // CREATE_GATEWAY, UPDATE_CREDENTIALS, ROTATE_KEYS, TOGGLE_STATUS, TEST_CONNECTION
    public string GatewayId { get; set; } = string.Empty;
    public string ProviderKey { get; set; } = string.Empty;
    public string ChangesSummary { get; set; } = string.Empty;
}
