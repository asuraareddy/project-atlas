using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Games.Pool;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/pool")]
public class PoolController : ControllerBase
{
    private static readonly Dictionary<string, PoolSessionState> Sessions = new();

    public class PoolSessionState
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString();
        public string Mode { get; set; } = "vs_bot";
        public string Player1Name { get; set; } = "Player 1";
        public string Player2Name { get; set; } = "AceCue (Pro)";
        public int CurrentTurnPlayer { get; set; } = 1;
        public string? Player1Group { get; set; } // "SOLIDS", "STRIPES", null (open table)
        public string? Player2Group { get; set; }
        public bool IsBallInHand { get; set; }
        public List<PoolBall> Balls { get; set; } = new();
        public bool IsGameOver { get; set; }
        public string? Winner { get; set; }
        public string LastNotice { get; set; } = "Table racked. Break shot ready.";
    }

    public record CreatePoolSessionRequest(string? Mode, string? Player1Name, string? Player2Name);
    public record PoolShotRequest(string SessionId, double Angle, double Power);
    public record BallInHandRequest(string SessionId, double X, double Y);
    public record BotShotRequest(string SessionId);

    [HttpPost("session")]
    public IActionResult CreateSession([FromBody] CreatePoolSessionRequest req)
    {
        var session = new PoolSessionState
        {
            Mode = req.Mode ?? "vs_bot",
            Player1Name = req.Player1Name ?? "Player 1",
            Player2Name = req.Player2Name ?? (req.Mode == "pass_play" ? "Player 2" : "AceCue (Pro)"),
            Balls = PoolPhysicsEngine.SetupStandardRack()
        };
        Sessions[session.SessionId] = session;

        return Ok(new
        {
            success = true,
            data = session
        });
    }

    [HttpGet("session")]
    public IActionResult GetSession([FromQuery] string sessionId)
    {
        if (string.IsNullOrEmpty(sessionId) || !Sessions.TryGetValue(sessionId, out var session))
        {
            return NotFound(new { success = false, error = "Session not found" });
        }

        return Ok(new { success = true, data = session });
    }

    [HttpPost("shot")]
    public IActionResult ExecuteShot([FromBody] PoolShotRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { success = false, error = "Session not found" });
        }

        var sim = PoolPhysicsEngine.SimulateShot(session.Balls, req.Angle, req.Power, 500);
        session.Balls = sim.FinalBalls;

        if (sim.CueBallScratch)
        {
            session.IsBallInHand = true;
            // Place cue ball back on head string
            var cue = session.Balls.FirstOrDefault(b => b.Number == 0);
            if (cue != null)
            {
                cue.IsPocketed = false;
                cue.X = 250;
                cue.Y = 250;
                cue.Vx = 0;
                cue.Vy = 0;
            }
            session.LastNotice = "Scratch foul! Opponent receives Ball-in-Hand.";
            session.CurrentTurnPlayer = session.CurrentTurnPlayer == 1 ? 2 : 1;
        }
        else if (sim.EightBallPocketed)
        {
            session.IsGameOver = true;
            session.Winner = session.CurrentTurnPlayer == 1 ? session.Player1Name : session.Player2Name;
            session.LastNotice = $"8-Ball pocketed! Winner: {session.Winner}";
        }
        else
        {
            session.IsBallInHand = false;
            session.LastNotice = sim.PocketedBallNumbers.Any()
                ? $"Pocketed ball(s): {string.Join(", ", sim.PocketedBallNumbers)}"
                : "No ball pocketed. Turn switched.";

            if (!sim.PocketedBallNumbers.Any())
            {
                session.CurrentTurnPlayer = session.CurrentTurnPlayer == 1 ? 2 : 1;
            }
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                session,
                simulation = sim
            }
        });
    }

    [HttpPost("ball-in-hand")]
    public IActionResult PlaceBallInHand([FromBody] BallInHandRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { success = false, error = "Session not found" });
        }

        var cue = session.Balls.FirstOrDefault(b => b.Number == 0);
        if (cue != null)
        {
            cue.X = Math.Clamp(req.X, 70, 930);
            cue.Y = Math.Clamp(req.Y, 70, 430);
            cue.Vx = 0;
            cue.Vy = 0;
            cue.IsPocketed = false;
        }
        session.IsBallInHand = false;
        session.LastNotice = "Ball-in-Hand placed.";

        return Ok(new { success = true, data = session });
    }

    [HttpPost("bot-shot")]
    public IActionResult ComputeBotShot([FromBody] BotShotRequest req)
    {
        if (!Sessions.TryGetValue(req.SessionId, out var session))
        {
            return NotFound(new { success = false, error = "Session not found" });
        }

        var group = session.CurrentTurnPlayer == 2 && session.Player2Group != null
            ? (session.Player2Group == "SOLIDS" ? PoolBallType.Solid : PoolBallType.Stripe)
            : (PoolBallType?)null;

        var (angle, power) = PoolPhysicsEngine.ComputeAceCueBotShot(session.Balls, group);

        return Ok(new
        {
            success = true,
            data = new
            {
                angle,
                power,
                session
            }
        });
    }
}
