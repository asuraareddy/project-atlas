using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Carrom;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/carrom")]
public class CarromController : ControllerBase
{
    private static readonly Dictionary<string, CarromSessionState> Sessions = new();

    public class CarromSessionState
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString();
        public string Mode { get; set; } = "vs_ai";
        public string CurrentTurnPlayerId { get; set; } = "p1";
        public string TurnPhase { get; set; } = "aiming";
        public int TurnNumber { get; set; } = 1;
        public List<CarromCoin> Coins { get; set; } = new();
        public double StrikerX { get; set; } = 400.0;
        public double StrikerY { get; set; } = 660.0;
        public int ScoreP1 { get; set; }
        public int ScoreP2 { get; set; }
        public bool IsGameOver { get; set; }
        public string LastNotice { get; set; } = "Match initialized.";
    }

    private static List<CarromCoin> SetupBoard()
    {
        var list = new List<CarromCoin>
        {
            new() { Id = 0, Type = CoinType.Striker, X = 400, Y = 660, Radius = 22, Mass = 3.0, IsPocketed = false },
            new() { Id = 1, Type = CoinType.Queen, X = 400, Y = 400, Radius = 15, Mass = 1.0, IsPocketed = false }
        };

        // Ring of 6 coins around Queen
        double r = 32.0;
        for (int i = 0; i < 6; i++)
        {
            double angle = i * (Math.PI / 3.0);
            var type = (i % 2 == 0) ? CoinType.White : CoinType.Black;
            list.Add(new CarromCoin
            {
                Id = i + 2,
                Type = type,
                X = 400 + r * Math.Cos(angle),
                Y = 400 + r * Math.Sin(angle),
                Radius = 15,
                Mass = 1.0,
                IsPocketed = false
            });
        }
        return list;
    }

    public record CreateSessionRequest(string? Mode, int? StakeMinor, int? RakePercentage, bool? IsRealMoney, string? UserId);
    public record ExecuteShotRequest(string SessionId, double Angle, double Power);
    public record PositionStrikerRequest(string SessionId, double X);
    public record BotShotRequest(string SessionId);

    [HttpPost("session")]
    public IActionResult CreateSession([FromBody] CreateSessionRequest req)
    {
        var session = new CarromSessionState
        {
            Mode = req.Mode ?? "vs_ai",
            Coins = SetupBoard()
        };
        Sessions[session.SessionId] = session;

        return Ok(new
        {
            success = true,
            data = new { session },
            meta = new { correlationId = $"corr_carrom_sess_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }

    [HttpGet("session")]
    public IActionResult GetSession([FromQuery] string sessionId)
    {
        if (string.IsNullOrEmpty(sessionId) || !Sessions.TryGetValue(sessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Carrom session not found" } });
        }

        return Ok(new { success = true, data = new { session } });
    }

    [HttpDelete("session")]
    public IActionResult CancelSession([FromQuery] string sessionId, [FromQuery] string? reason)
    {
        if (string.IsNullOrEmpty(sessionId) || !Sessions.TryGetValue(sessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Carrom session not found" } });
        }

        session.IsGameOver = true;
        session.LastNotice = reason ?? "Session cancelled";
        return Ok(new { success = true, data = new { session } });
    }

    [HttpPost("position")]
    public IActionResult PositionStriker([FromBody] PositionStrikerRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        session.StrikerX = Math.Clamp(req.X, 200, 600);
        var striker = session.Coins.FirstOrDefault(c => c.Type == CoinType.Striker);
        if (striker != null) striker.X = session.StrikerX;

        return Ok(new { success = true, data = new { session } });
    }

    [HttpPost("shot")]
    public IActionResult ExecuteShot([FromBody] ExecuteShotRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        var striker = session.Coins.FirstOrDefault(c => c.Type == CoinType.Striker);
        if (striker != null)
        {
            double speed = Math.Clamp(req.Power, 10, 100) * 0.25;
            striker.Vx = speed * Math.Cos(req.Angle);
            striker.Vy = speed * Math.Sin(req.Angle);
        }

        var sim = CarromPhysicsEngine.SimulateShot(session.Coins, CarromPhysicsEngine.StandardPockets, 400);
        session.Coins = sim.FinalCoins;

        // Reset striker to baseline for next turn
        var finalStriker = session.Coins.FirstOrDefault(c => c.Type == CoinType.Striker);
        if (finalStriker != null)
        {
            finalStriker.IsPocketed = false;
            finalStriker.X = 400;
            finalStriker.Y = 660;
            finalStriker.Vx = 0;
            finalStriker.Vy = 0;
        }

        session.TurnNumber++;
        session.LastNotice = sim.PocketedInShot.Any()
            ? $"Pocketed: {string.Join(", ", sim.PocketedInShot)}"
            : "No coins pocketed.";

        return Ok(new { success = true, data = new { session } });
    }

    [HttpPost("bot-shot")]
    public IActionResult ProcessBotShot([FromBody] BotShotRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        var (angle, power, strikerX) = CarromPhysicsEngine.ComputeBotShot(session.Coins, CoinType.Black);
        session.StrikerX = strikerX;

        return Ok(new
        {
            success = true,
            acted = true,
            shotDetails = new { angle, power, strikerX },
            data = new { session }
        });
    }

    [HttpGet("rooms")]
    public IActionResult GetRooms()
    {
        var rooms = new[]
        {
            new { id = "room_crm_beginner", name = "Club Tabletop 1", stakeMinor = 100, activePlayers = 2, maxPlayers = 2 },
            new { id = "room_crm_pro", name = "Master Arena", stakeMinor = 500, activePlayers = 1, maxPlayers = 2 }
        };

        return Ok(new
        {
            data = new
            {
                rooms,
                capabilities = new { realTimePhysics = true, multiTouchAim = true, botAi = true }
            },
            meta = new { correlationId = $"corr_crm_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }

    [HttpGet("analytics")]
    public IActionResult GetAnalytics()
    {
        return Ok(new
        {
            success = true,
            data = new
            {
                totalGamesPlayed = 342,
                averageTurnDurationSeconds = 12.4,
                foulRatePercent = 4.2,
                queenPocketRatio = 0.88
            },
            meta = new { timestamp = DateTime.UtcNow.ToString("o") }
        });
    }
}
