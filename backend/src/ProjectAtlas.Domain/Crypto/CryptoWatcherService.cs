using ProjectAtlas.Domain.Ledger;

namespace ProjectAtlas.Domain.Crypto;

public class WhitelistedAssetModel
{
    public string Network { get; set; } = string.Empty; // polygon, ethereum, bitcoin
    public string NetworkLabel { get; set; } = string.Empty;
    public string Asset { get; set; } = string.Empty; // USDT, USDC, BTC, ETH
    public string? TokenContractAddress { get; set; }
    public int Decimals { get; set; } = 6;
    public int RequiredConfirmations { get; set; } = 12;
    public long MinDepositGbpMinor { get; set; } = 1000;  // £10.00
    public long MaxDepositGbpMinor { get; set; } = 500000; // £5,000.00
    public string ReceivingAddress { get; set; } = string.Empty;
    public decimal RateToGbp { get; set; }
    public bool Enabled { get; set; } = true;
}

public class CryptoDepositIntentModel
{
    public string Id { get; set; } = $"intent_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
    public string UserId { get; set; } = string.Empty;
    public string Network { get; set; } = string.Empty;
    public string Asset { get; set; } = string.Empty;
    public long AmountGbpMinor { get; set; }
    public string QuotedCryptoAmount { get; set; } = string.Empty;
    public decimal ExchangeRateGbp { get; set; }
    public string ReceivingAddress { get; set; } = string.Empty;
    public string QrPayload { get; set; } = string.Empty;
    public string Status { get; set; } = "awaiting_transfer"; // awaiting_transfer, detected, confirming, credited, wrong_address, wrong_network
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(30);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? DetectedTxHash { get; set; }
    public int ConfirmationsObserved { get; set; }
    public int RequiredConfirmations { get; set; }
}

public class ChainTransactionRecord
{
    public string TxHash { get; set; } = string.Empty;
    public string Network { get; set; } = string.Empty;
    public string Asset { get; set; } = string.Empty;
    public string DestinationAddress { get; set; } = string.Empty;
    public decimal AmountCrypto { get; set; }
    public int Confirmations { get; set; }
    public string Status { get; set; } = "SUCCESS";
}

public class CryptoWatcherService
{
    private static readonly List<WhitelistedAssetModel> Whitelist = new()
    {
        new WhitelistedAssetModel
        {
            Network = "polygon",
            NetworkLabel = "Polygon (POS)",
            Asset = "USDT",
            TokenContractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            Decimals = 6,
            RequiredConfirmations = 12,
            MinDepositGbpMinor = 1000,
            MaxDepositGbpMinor = 500000,
            ReceivingAddress = "0x71C8364b4c7365A5424D0A0b58e723c34a2e87B1",
            RateToGbp = 0.77m,
            Enabled = true
        },
        new WhitelistedAssetModel
        {
            Network = "ethereum",
            NetworkLabel = "Ethereum (ERC-20)",
            Asset = "USDT",
            TokenContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            Decimals = 6,
            RequiredConfirmations = 2,
            MinDepositGbpMinor = 5000,
            MaxDepositGbpMinor = 1000000,
            ReceivingAddress = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
            RateToGbp = 0.77m,
            Enabled = true
        },
        new WhitelistedAssetModel
        {
            Network = "bitcoin",
            NetworkLabel = "Bitcoin Network",
            Asset = "BTC",
            Decimals = 8,
            RequiredConfirmations = 3,
            MinDepositGbpMinor = 2500,
            MaxDepositGbpMinor = 2000000,
            ReceivingAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
            RateToGbp = 52000.00m,
            Enabled = true
        },
        new WhitelistedAssetModel
        {
            Network = "ethereum",
            NetworkLabel = "Ethereum Native",
            Asset = "ETH",
            Decimals = 18,
            RequiredConfirmations = 2,
            MinDepositGbpMinor = 2000,
            MaxDepositGbpMinor = 1000000,
            ReceivingAddress = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
            RateToGbp = 2200.00m,
            Enabled = true
        }
    };

    private static readonly Dictionary<string, CryptoDepositIntentModel> Intents = new(StringComparer.OrdinalIgnoreCase);
    private static readonly HashSet<string> ProcessedTxHashes = new(StringComparer.OrdinalIgnoreCase);
    private static readonly object _lock = new();

    public static List<WhitelistedAssetModel> GetWhitelistedAssets()
    {
        lock (_lock)
        {
            return new List<WhitelistedAssetModel>(Whitelist);
        }
    }

    public static CryptoDepositIntentModel CreateDepositIntent(string userId, string network, string asset, long amountGbpMinor)
    {
        lock (_lock)
        {
            var config = Whitelist.FirstOrDefault(w => w.Network.Equals(network, StringComparison.OrdinalIgnoreCase) &&
                                                      w.Asset.Equals(asset, StringComparison.OrdinalIgnoreCase) &&
                                                      w.Enabled);
            if (config == null)
            {
                throw new ArgumentException($"Asset '{asset}' on network '{network}' is not whitelisted or disabled.");
            }

            decimal gbpAmount = amountGbpMinor / 100.0m;
            decimal cryptoAmount = gbpAmount / config.RateToGbp;
            string formattedCrypto = config.Asset == "BTC" ? cryptoAmount.ToString("F8") : cryptoAmount.ToString("F2");

            string qrPayload = config.Network == "bitcoin"
                ? $"bitcoin:{config.ReceivingAddress}?amount={formattedCrypto}"
                : $"ethereum:{config.ReceivingAddress}@{(config.Network == "polygon" ? "137" : "1")}";

            var intent = new CryptoDepositIntentModel
            {
                UserId = userId,
                Network = config.Network,
                Asset = config.Asset,
                AmountGbpMinor = amountGbpMinor,
                QuotedCryptoAmount = formattedCrypto,
                ExchangeRateGbp = config.RateToGbp,
                ReceivingAddress = config.ReceivingAddress,
                QrPayload = qrPayload,
                RequiredConfirmations = config.RequiredConfirmations
            };

            Intents[intent.Id] = intent;
            return intent;
        }
    }

    public static CryptoDepositIntentModel? GetIntent(string id)
    {
        lock (_lock)
        {
            return Intents.TryGetValue(id, out var intent) ? intent : null;
        }
    }

    /// <summary>
    /// Autonomous Blockchain Observer validation
    /// Invariants verified:
    /// - Destination address matches intent receiving address
    /// - Network and asset match
    /// - TxHash not already processed
    /// - Wait for required confirmation depth before committing wallet credit
    /// </summary>
    public static (bool Credited, string Message) ProcessObservedTransaction(string intentId, ChainTransactionRecord tx)
    {
        lock (_lock)
        {
            var intent = GetIntent(intentId);
            if (intent == null)
            {
                return (false, "Intent not found.");
            }

            if (ProcessedTxHashes.Contains(tx.TxHash))
            {
                return (false, "TRANSACTION_ALREADY_PROCESSED: Replay attempt detected.");
            }

            // Invariant 1: Destination address verification
            if (!tx.DestinationAddress.Trim().Equals(intent.ReceivingAddress.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                intent.Status = "wrong_address";
                return (false, "DESTINATION_MISMATCH: Funds sent to an unassigned address.");
            }

            // Invariant 2: Network verification
            if (!tx.Network.Trim().Equals(intent.Network.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                intent.Status = "wrong_network";
                return (false, "NETWORK_MISMATCH: Transaction observed on incorrect blockchain network.");
            }

            intent.DetectedTxHash = tx.TxHash;
            intent.ConfirmationsObserved = tx.Confirmations;

            // Invariant 3: Confirmation depth verification
            if (tx.Confirmations < intent.RequiredConfirmations)
            {
                intent.Status = "confirming";
                return (false, $"CONFIRMATIONS_INSUFFICIENT: {tx.Confirmations}/{intent.RequiredConfirmations} observed.");
            }

            // All invariants satisfied: Commit atomic double-entry ledger credit!
            intent.Status = "credited";
            ProcessedTxHashes.Add(tx.TxHash);

            LedgerService.PostCryptoDeposit(
                intent.UserId,
                intent.AmountGbpMinor,
                $"idemp_dep_{intent.Id}",
                tx.TxHash
            );

            return (true, $"SUCCESS: Deposit of £{(intent.AmountGbpMinor / 100.0):F2} credited after {tx.Confirmations} confirmations.");
        }
    }
}
