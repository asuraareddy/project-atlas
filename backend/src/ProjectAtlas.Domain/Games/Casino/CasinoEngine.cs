using System.Security.Cryptography;
using System.Text;

namespace ProjectAtlas.Domain.Games.Casino;

public class ProvablyFairResult
{
    public string ServerSeed { get; set; } = string.Empty;
    public string ServerSeedHash { get; set; } = string.Empty;
    public string ClientSeed { get; set; } = string.Empty;
    public long Nonce { get; set; }
    public string CalculatedHash { get; set; } = string.Empty;
    public double DerivedOutcome { get; set; }
    public bool IsValid { get; set; }
}

public static class CasinoEngine
{
    public const int ReplayWindowSeconds = 300; // 5-minute replay attack prevention window

    public static string GenerateFlexrixSignature(string secretKey, string payload)
    {
        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(secretKey));
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static bool VerifyFlexrixSignature(string secretKey, string payload, string expectedSignature, long timestampSeconds)
    {
        long currentTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (Math.Abs(currentTimestamp - timestampSeconds) > ReplayWindowSeconds)
        {
            return false; // Replay attack protection expired
        }

        string calculated = GenerateFlexrixSignature(secretKey, payload);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(calculated),
            Encoding.UTF8.GetBytes(expectedSignature.ToLowerInvariant()));
    }

    public static ProvablyFairResult VerifyProvablyFairOutcome(string serverSeed, string clientSeed, long nonce)
    {
        // 1. Calculate server seed hash (SHA-256)
        using var sha256 = SHA256.Create();
        byte[] serverSeedBytes = Encoding.UTF8.GetBytes(serverSeed);
        string serverSeedHash = Convert.ToHexString(sha256.ComputeHash(serverSeedBytes)).ToLowerInvariant();

        // 2. Compute HMAC-SHA256(serverSeed, $"{clientSeed}:{nonce}")
        string message = $"{clientSeed}:{nonce}";
        using var hmac = new HMACSHA256(serverSeedBytes);
        byte[] outcomeHashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        string outcomeHash = Convert.ToHexString(outcomeHashBytes).ToLowerInvariant();

        // 3. Derive float outcome between 0.00 and 99.99 (standard dice / roulette formula)
        uint subInt = BitConverter.ToUInt32(outcomeHashBytes, 0);
        double outcome = (subInt % 10000) / 100.0;

        return new ProvablyFairResult
        {
            ServerSeed = serverSeed,
            ServerSeedHash = serverSeedHash,
            ClientSeed = clientSeed,
            Nonce = nonce,
            CalculatedHash = outcomeHash,
            DerivedOutcome = outcome,
            IsValid = true
        };
    }
}
