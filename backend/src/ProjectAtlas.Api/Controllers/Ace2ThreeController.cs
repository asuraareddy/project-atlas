using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Rummy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/ace2three")]
public class Ace2ThreeController : ControllerBase
{
    private static readonly Dictionary<string, Ace2ThreeSessionState> Sessions = new();

    public class Ace2ThreeSessionState
    {
        public string MatchId { get; set; } = Guid.NewGuid().ToString();
        public string Player1Name { get; set; } = "Player 1 (You)";
        public string Player2Name { get; set; } = "Ace2Three Bot (AI)";
        public decimal Stake { get; set; } = 250m;
        public int WildJokerRank { get; set; } = 7;
        public RummyCard CutJokerCard { get; set; } = new() { Id = "s7", Suit = "S", Rank = 7, IsWildJoker = true };
        public List<RummyCard> PlayerHand { get; set; } = new();
        public List<RummyCard> BotHand { get; set; } = new();
        public List<RummyCard> DiscardPile { get; set; } = new();
        public int ClosedDeckRemaining { get; set; } = 80;
        public int TurnNumber { get; set; } = 1;
        public string CurrentTurn { get; set; } = "player"; // "player" or "bot"
        public string TurnPhase { get; set; } = "draw"; // "draw" or "discard"
        public bool IsBotThinking { get; set; }
        public string Notice { get; set; } = "Game started. Draw from closed deck or discard pile.";
    }

    public record CreateAce2ThreeRequest(string? Player1Name, string? Player2Name, decimal? Stake);
    public record ValidateDeclarationRequest(List<CardGroup> Groups, int WildJokerRank);

    private static List<RummyCard> Deal13Cards(int seedOffset)
    {
        var suits = new[] { "S", "H", "D", "C" };
        var cards = new List<RummyCard>();
        var rand = new Random(seedOffset);

        for (int i = 0; i < 13; i++)
        {
            int rank = rand.Next(1, 14);
            string suit = suits[rand.Next(0, 4)];
            cards.Add(new RummyCard
            {
                Id = $"{suit.ToLower()}{rank}_{i}",
                Suit = suit,
                Rank = rank,
                IsWildJoker = rank == 7
            });
        }
        return cards;
    }

    [HttpPost("session")]
    public IActionResult CreateSession([FromBody] CreateAce2ThreeRequest req)
    {
        int seed = (int)(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() % 10000);
        var session = new Ace2ThreeSessionState
        {
            Player1Name = req.Player1Name ?? "Player 1 (You)",
            Player2Name = req.Player2Name ?? "Ace2Three Bot (AI)",
            Stake = req.Stake ?? 250m,
            PlayerHand = Deal13Cards(seed),
            BotHand = Deal13Cards(seed + 1),
            DiscardPile = new List<RummyCard>
            {
                new() { Id = "h4_0", Suit = "H", Rank = 4 }
            }
        };
        Sessions[session.MatchId] = session;

        return Ok(new
        {
            success = true,
            data = session
        });
    }

    [HttpPut("session")]
    public IActionResult ValidateDeclaration([FromBody] ValidateDeclarationRequest req)
    {
        if (req.Groups == null || req.Groups.Count == 0)
        {
            return BadRequest(new { success = false, error = "groups and wildJokerRank are required" });
        }

        var result = RummyValidator.ValidateHand(req.Groups, req.WildJokerRank);

        return Ok(new
        {
            success = true,
            data = result
        });
    }
}
