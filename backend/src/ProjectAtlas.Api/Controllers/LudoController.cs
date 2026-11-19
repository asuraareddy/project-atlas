using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Ludo;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/ludo")]
public class LudoController : ControllerBase
{
    private static readonly Dictionary<string, LudoGameState> Sessions = new();

    public record CreateLudoSessionRequest(string? Mode, int? PlayerCount, int? StakeMinor, int? RakePercentage, bool? IsRealMoney, string? UserId);
    public record RollDiceRequest(string SessionId, string Color);
    public record MoveTokenRequest(string SessionId, string Color, int TokenId);
    public record BotTurnRequest(string SessionId);

    [HttpPost("session")]
    public IActionResult CreateSession([FromBody] CreateLudoSessionRequest req)
    {
        int count = req.PlayerCount == 2 ? 2 : 4;
        var configs = new List<(string Id, string Name, string Color, bool IsBot)>
        {
            ("p1", "You (Player 1)", "RED", false),
            ("p2", "Ludo AI 1", "YELLOW", true)
        };

        if (count == 4)
        {
            configs.Add(("p3", "Ludo AI 2", "GREEN", true));
            configs.Add(("p4", "Ludo AI 3", "BLUE", true));
        }

        var session = LudoEngine.CreateGame(configs);
        Sessions[session.MatchId] = session;

        return Ok(new
        {
            success = true,
            data = new
            {
                session,
                validMoves = Array.Empty<int>()
            },
            meta = new { correlationId = $"corr_ludo_sess_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
        });
    }

    [HttpGet("session")]
    public IActionResult GetSession([FromQuery] string sessionId)
    {
        if (string.IsNullOrEmpty(sessionId) || !Sessions.TryGetValue(sessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Ludo session not found" } });
        }

        var activePlayer = session.Players[session.ActivePlayerIndex];
        var validMoves = session.CurrentDiceRoll.HasValue
            ? LudoEngine.GetMovableTokenIds(activePlayer, session.CurrentDiceRoll.Value)
            : new List<int>();

        return Ok(new
        {
            success = true,
            data = new { session, validMoves }
        });
    }

    [HttpPost("roll")]
    public IActionResult RollDice([FromBody] RollDiceRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        int roll = LudoEngine.RollDiceCsprng();
        session.CurrentDiceRoll = roll;
        session.AwaitingMove = true;

        var activePlayer = session.Players[session.ActivePlayerIndex];
        var validMoves = LudoEngine.GetMovableTokenIds(activePlayer, roll);

        if (!validMoves.Any())
        {
            // Auto advance turn if no moves possible
            session.AwaitingMove = false;
            session.CurrentDiceRoll = null;
            session.ActivePlayerIndex = (session.ActivePlayerIndex + 1) % session.Players.Count;
            session.LastActionNotice = $"{activePlayer.Name} rolled a {roll} with no legal moves. Turn passed.";
        }
        else
        {
            session.LastActionNotice = $"{activePlayer.Name} rolled a {roll}. Select a token to move.";
        }

        return Ok(new
        {
            success = true,
            data = new { session, validMoves }
        });
    }

    [HttpPost("move")]
    public IActionResult MoveToken([FromBody] MoveTokenRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        var (success, notice, extraTurn) = LudoEngine.ExecuteMove(session, req.TokenId);
        if (!success)
        {
            return BadRequest(new { error = new { code = "TOKEN_MOVE_ERROR", message = notice } });
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                session,
                validMoves = Array.Empty<int>()
            }
        });
    }

    [HttpPost("bot-turn")]
    public IActionResult ExecuteBotTurn([FromBody] BotTurnRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { error = new { code = "SESSION_NOT_FOUND", message = "Session not found" } });
        }

        var activePlayer = session.Players[session.ActivePlayerIndex];
        if (!activePlayer.IsBot)
        {
            return BadRequest(new { error = new { code = "NOT_BOT_TURN", message = "Current turn is human player" } });
        }

        // 1. Roll
        int roll = LudoEngine.RollDiceCsprng();
        session.CurrentDiceRoll = roll;

        // 2. Select token
        int? chosenToken = LudoEngine.ComputeBotTurnTokenId(activePlayer, roll);
        if (chosenToken.HasValue)
        {
            session.AwaitingMove = true;
            LudoEngine.ExecuteMove(session, chosenToken.Value);
        }
        else
        {
            session.CurrentDiceRoll = null;
            session.AwaitingMove = false;
            session.ActivePlayerIndex = (session.ActivePlayerIndex + 1) % session.Players.Count;
            session.LastActionNotice = $"{activePlayer.Name} rolled {roll} with no moves available.";
        }

        return Ok(new
        {
            success = true,
            data = new { session, roll, movedTokenId = chosenToken }
        });
    }

    [HttpGet("rooms")]
    public IActionResult GetRooms()
    {
        var rooms = new[]
        {
            new { id = "room_ludo_2p", name = "Rapid 2-Player Circuit", stakeMinor = 200, activePlayers = 2, maxPlayers = 2 },
            new { id = "room_ludo_4p", name = "Grand 4-Player Championship", stakeMinor = 500, activePlayers = 3, maxPlayers = 4 }
        };

        return Ok(new
        {
            data = new { rooms },
            meta = new { correlationId = $"corr_ludo_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" }
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
                totalMatchesPlayed = 890,
                averageMatchDurationMinutes = 8.5,
                cutsPerMatch = 3.8,
                winRateByColor = new { RED = 0.26, YELLOW = 0.25, GREEN = 0.24, BLUE = 0.25 }
            },
            meta = new { timestamp = DateTime.UtcNow.ToString("o") }
        });
    }
}
