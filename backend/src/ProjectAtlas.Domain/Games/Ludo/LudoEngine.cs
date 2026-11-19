using System.Security.Cryptography;

namespace ProjectAtlas.Domain.Games.Ludo;

public class LudoToken
{
    public int TokenId { get; set; }
    public string Color { get; set; } = string.Empty; // RED, GREEN, YELLOW, BLUE
    public int StepIndex { get; set; } = -1; // -1 = Base, 0-50 = Track, 51-56 = Home Path, 57 = Home
    public bool IsInBase => StepIndex == -1;
    public bool IsHome => StepIndex >= 57;
}

public class LudoPlayer
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public bool IsBot { get; set; }
    public List<LudoToken> Tokens { get; set; } = new();
}

public class LudoGameState
{
    public string MatchId { get; set; } = Guid.NewGuid().ToString();
    public List<LudoPlayer> Players { get; set; } = new();
    public int ActivePlayerIndex { get; set; }
    public int? CurrentDiceRoll { get; set; }
    public bool AwaitingMove { get; set; }
    public string? WinnerColor { get; set; }
    public string LastActionNotice { get; set; } = "Game started. Roll dice to begin.";
}

public static class LudoEngine
{
    // Standard 52-tile track with safe squares (stars)
    public static readonly HashSet<int> SafeTrackIndices = new() { 0, 8, 13, 21, 26, 34, 39, 47 };

    public static readonly Dictionary<string, int> ColorStartOffsets = new()
    {
        ["RED"] = 0,
        ["GREEN"] = 13,
        ["YELLOW"] = 26,
        ["BLUE"] = 39
    };

    public static int RollDiceCsprng()
    {
        return RandomNumberGenerator.GetInt32(1, 7); // 1 to 6 inclusive
    }

    public static LudoGameState CreateGame(List<(string Id, string Name, string Color, bool IsBot)> playerConfigs)
    {
        var state = new LudoGameState();
        foreach (var cfg in playerConfigs)
        {
            var tokens = new List<LudoToken>();
            for (int t = 0; t < 4; t++)
            {
                tokens.Add(new LudoToken { TokenId = t, Color = cfg.Color.ToUpperInvariant(), StepIndex = -1 });
            }

            state.Players.Add(new LudoPlayer
            {
                Id = cfg.Id,
                Name = cfg.Name,
                Color = cfg.Color.ToUpperInvariant(),
                IsBot = cfg.IsBot,
                Tokens = tokens
            });
        }
        return state;
    }

    public static bool CanTokenMove(LudoToken token, int roll)
    {
        if (token.IsHome) return false;

        // In base, only a roll of 6 can release the token
        if (token.IsInBase)
        {
            return roll == 6;
        }

        // On track or home path
        return token.StepIndex + roll <= 57;
    }

    public static List<int> GetMovableTokenIds(LudoPlayer player, int roll)
    {
        return player.Tokens
            .Where(t => CanTokenMove(t, roll))
            .Select(t => t.TokenId)
            .ToList();
    }

    public static (bool Success, string Notice, bool ExtraTurn) ExecuteMove(LudoGameState state, int tokenId)
    {
        if (!state.CurrentDiceRoll.HasValue || !state.AwaitingMove)
        {
            return (false, "No active dice roll awaiting move.", false);
        }

        int roll = state.CurrentDiceRoll.Value;
        var activePlayer = state.Players[state.ActivePlayerIndex];
        var token = activePlayer.Tokens.FirstOrDefault(t => t.TokenId == tokenId);

        if (token == null || !CanTokenMove(token, roll))
        {
            return (false, "Illegal token move selected.", false);
        }

        bool cutOpponent = false;
        bool extraTurn = roll == 6;

        if (token.IsInBase)
        {
            token.StepIndex = 0; // Released to starting square
        }
        else
        {
            token.StepIndex += roll;

            // Check cutting opponent tokens if landed on shared track (step 0-50)
            if (token.StepIndex <= 50)
            {
                int trackPos = (token.StepIndex + ColorStartOffsets[activePlayer.Color]) % 52;
                if (!SafeTrackIndices.Contains(trackPos))
                {
                    foreach (var opponent in state.Players.Where(p => p.Color != activePlayer.Color))
                    {
                        foreach (var oppToken in opponent.Tokens.Where(t => !t.IsInBase && t.StepIndex <= 50))
                        {
                            int oppTrackPos = (oppToken.StepIndex + ColorStartOffsets[opponent.Color]) % 52;
                            if (oppTrackPos == trackPos)
                            {
                                oppToken.StepIndex = -1; // Sent back to base!
                                cutOpponent = true;
                                extraTurn = true; // Cutting earns an extra turn!
                            }
                        }
                    }
                }
            }
        }

        // Check if player won
        if (activePlayer.Tokens.All(t => t.IsHome))
        {
            state.WinnerColor = activePlayer.Color;
            state.AwaitingMove = false;
            state.CurrentDiceRoll = null;
            return (true, $"{activePlayer.Name} ({activePlayer.Color}) has won the match!", false);
        }

        string notice = cutOpponent
            ? $"{activePlayer.Name} cut an opponent token and earned an extra turn!"
            : (extraTurn ? $"{activePlayer.Name} rolled a 6 and earned an extra turn!" : $"{activePlayer.Name} moved token {tokenId}.");

        state.AwaitingMove = false;
        state.CurrentDiceRoll = null;
        state.LastActionNotice = notice;

        if (!extraTurn)
        {
            state.ActivePlayerIndex = (state.ActivePlayerIndex + 1) % state.Players.Count;
        }

        return (true, notice, extraTurn);
    }

    public static int? ComputeBotTurnTokenId(LudoPlayer player, int roll)
    {
        var movable = GetMovableTokenIds(player, roll);
        if (!movable.Any()) return null;

        // Preference 1: Release token from base if roll is 6
        if (roll == 6)
        {
            var baseToken = player.Tokens.FirstOrDefault(t => t.IsInBase);
            if (baseToken != null) return baseToken.TokenId;
        }

        // Preference 2: Token that can reach home
        var homeToken = player.Tokens.FirstOrDefault(t => t.StepIndex + roll == 57);
        if (homeToken != null) return homeToken.TokenId;

        // Preference 3: Token furthest ahead on track
        return player.Tokens
            .Where(t => movable.Contains(t.TokenId))
            .OrderByDescending(t => t.StepIndex)
            .First().TokenId;
    }
}
