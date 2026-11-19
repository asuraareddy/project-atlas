namespace ProjectAtlas.Domain.Entities.Games;

public class GameProvider
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrganizationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE";
    public string IntegrationType { get; set; } = "CLIENT_MATKA_API";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Game
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrganizationId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // MATKA, CARROM, LUDO, POOL, CASINO, SPORTS, OTHER_GAMES
    public string Status { get; set; } = "ACTIVE";
    public bool RealMoneyEnabled { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class GameSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string GameId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ProviderSessionRef { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
}

public class GameParticipation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string GameSessionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RoundId { get; set; } = string.Empty;
    public long StakeMinor { get; set; }
    public long PayoutMinor { get; set; }
    public string Currency { get; set; } = "GBP";
    public string IdempotencyKey { get; set; } = string.Empty;
    public string Status { get; set; } = "CONFIRMED";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
