namespace ProjectAtlas.Domain.Ledger;

public class WalletBalance
{
    public string UserId { get; set; } = string.Empty;
    public string Currency { get; set; } = "GBP";
    public long CashAvailableMinor { get; set; }
    public long CashReservedMinor { get; set; }
    public long BonusMinor { get; set; }
    public long PointsBalance { get; set; }
    public string LastUpdated { get; set; } = DateTime.UtcNow.ToString("o");
}

public class LedgerEntryModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TransactionGroupId { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public string Direction { get; set; } = "DEBIT"; // DEBIT, CREDIT
    public long AmountMinor { get; set; }
    public string Currency { get; set; } = "GBP";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class LedgerTransactionGroupModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SourceType { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string ReasonCode { get; set; } = string.Empty;
    public string ActorId { get; set; } = string.Empty;
    public List<LedgerEntryModel> Entries { get; set; } = new();
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");

    public bool IsBalanced()
    {
        long debits = Entries.Where(e => e.Direction == "DEBIT").Sum(e => e.AmountMinor);
        long credits = Entries.Where(e => e.Direction == "CREDIT").Sum(e => e.AmountMinor);
        return debits == credits;
    }
}

public class LedgerService
{
    private static readonly Dictionary<string, WalletBalance> _balances = new()
    {
        ["usr_player_01"] = new WalletBalance
        {
            UserId = "usr_player_01",
            Currency = "GBP",
            CashAvailableMinor = 25000, // £250.00
            CashReservedMinor = 0,
            BonusMinor = 1000,
            PointsBalance = 450
        },
        ["usr_player_02"] = new WalletBalance
        {
            UserId = "usr_player_02",
            Currency = "GBP",
            CashAvailableMinor = 5000,  // £50.00
            CashReservedMinor = 0,
            BonusMinor = 0,
            PointsBalance = 120
        }
    };

    private static readonly HashSet<string> _processedIdempotencyKeys = new(StringComparer.OrdinalIgnoreCase);
    private static readonly List<LedgerTransactionGroupModel> _journalTransactions = new();
    private static readonly object _lock = new();

    public static WalletBalance GetBalance(string userId)
    {
        lock (_lock)
        {
            if (!_balances.TryGetValue(userId, out var balance))
            {
                balance = new WalletBalance
                {
                    UserId = userId,
                    Currency = "GBP",
                    CashAvailableMinor = 10000, // £100.00 initial
                    CashReservedMinor = 0,
                    BonusMinor = 0,
                    PointsBalance = 100
                };
                _balances[userId] = balance;
            }
            return new WalletBalance
            {
                UserId = balance.UserId,
                Currency = balance.Currency,
                CashAvailableMinor = balance.CashAvailableMinor,
                CashReservedMinor = balance.CashReservedMinor,
                BonusMinor = balance.BonusMinor,
                PointsBalance = balance.PointsBalance,
                LastUpdated = balance.LastUpdated
            };
        }
    }

    public static bool ReserveCash(string userId, long amountMinor, string sourceId)
    {
        lock (_lock)
        {
            if (amountMinor <= 0)
            {
                throw new ArgumentException("INVALID_AMOUNT: Reservation amount must be greater than zero.");
            }

            var wallet = GetBalance(userId);
            if (wallet.CashAvailableMinor < amountMinor)
            {
                throw new InvalidOperationException($"INSUFFICIENT_FUNDS: Available cash {(wallet.CashAvailableMinor / 100.0):F2} is less than required {(amountMinor / 100.0):F2}");
            }

            var rawWallet = _balances[userId];
            rawWallet.CashAvailableMinor -= amountMinor;
            rawWallet.CashReservedMinor += amountMinor;
            rawWallet.LastUpdated = DateTime.UtcNow.ToString("o");

            return true;
        }
    }

    public static void ReleaseReservedCash(string userId, long amountMinor)
    {
        lock (_lock)
        {
            if (_balances.TryGetValue(userId, out var rawWallet))
            {
                long release = Math.Min(amountMinor, rawWallet.CashReservedMinor);
                rawWallet.CashReservedMinor -= release;
                rawWallet.CashAvailableMinor += release;
                rawWallet.LastUpdated = DateTime.UtcNow.ToString("o");
            }
        }
    }

    public static LedgerTransactionGroupModel PostCryptoDeposit(
        string userId,
        long amountMinor,
        string idempotencyKey,
        string cryptoTxHash)
    {
        lock (_lock)
        {
            if (_processedIdempotencyKeys.Contains(idempotencyKey))
            {
                var existing = _journalTransactions.FirstOrDefault(t => t.IdempotencyKey.Equals(idempotencyKey, StringComparison.OrdinalIgnoreCase));
                if (existing != null) return existing;
            }

            if (amountMinor <= 0)
            {
                throw new ArgumentException("INVALID_DEPOSIT: Deposit amount must be positive.");
            }

            string txGroupId = $"tx_grp_dep_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            string now = DateTime.UtcNow.ToString("o");

            // Balanced journal entries: Debits == Credits
            var entries = new List<LedgerEntryModel>
            {
                new()
                {
                    TransactionGroupId = txGroupId,
                    AccountCode = "PSP_CRYPTO_CLEARING",
                    Direction = "DEBIT",
                    AmountMinor = amountMinor,
                    Currency = "GBP",
                    CreatedAt = now
                },
                new()
                {
                    TransactionGroupId = txGroupId,
                    AccountCode = "CUSTOMER_CASH_LIABILITY",
                    Direction = "CREDIT",
                    AmountMinor = amountMinor,
                    Currency = "GBP",
                    CreatedAt = now
                }
            };

            var group = new LedgerTransactionGroupModel
            {
                Id = txGroupId,
                SourceType = "CRYPTO_DEPOSIT",
                SourceId = cryptoTxHash,
                IdempotencyKey = idempotencyKey,
                ReasonCode = "DIRECT_CRYPTO_QR_DEPOSIT_CONFIRMED",
                ActorId = "SYSTEM_BLOCKCHAIN_OBSERVER",
                Entries = entries,
                CreatedAt = now
            };

            // Assert Debit == Credit equilibrium
            if (!group.IsBalanced())
            {
                throw new InvalidOperationException("LEDGER_UNBALANCED: Debits and Credits must balance to zero.");
            }

            _journalTransactions.Insert(0, group);
            _processedIdempotencyKeys.Add(idempotencyKey);

            // Update user balance projection
            var balance = _balances.TryGetValue(userId, out var b) ? b : GetBalance(userId);
            balance.CashAvailableMinor += amountMinor;
            balance.LastUpdated = now;
            _balances[userId] = balance;

            return group;
        }
    }

    public static List<LedgerTransactionGroupModel> GetTransactionHistory()
    {
        lock (_lock)
        {
            return new List<LedgerTransactionGroupModel>(_journalTransactions);
        }
    }
}
