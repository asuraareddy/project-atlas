using ProjectAtlas.Domain.Games.Carrom;
using ProjectAtlas.Domain.Games.Casino;
using ProjectAtlas.Domain.Games.Ludo;
using ProjectAtlas.Domain.Games.Matka;
using ProjectAtlas.Domain.Games.Pool;
using ProjectAtlas.Domain.Games.Rummy;
using ProjectAtlas.Domain.Games.Sports;
using Xunit;

namespace ProjectAtlas.Tests;

public class GameEnginesPhase6Tests
{
    // ==========================================
    // 1. MATKA ENGINE & 220 PATTI
    // ==========================================
    [Fact]
    public void Matka_220Patti_GeneratesExactCombinations()
    {
        var all = MatkaPattiCalculator.GenerateAll220Patti();
        Assert.Equal(220, all.Count);

        // Every digit 0-9 must have exactly 22 patti (12 single, 9 double, 1 triple)
        for (int d = 0; d <= 9; d++)
        {
            var pattiForDigit = all.Where(p => p.Digit == d).ToList();
            Assert.Equal(22, pattiForDigit.Count);

            int singles = pattiForDigit.Count(p => p.Type == "SINGLE");
            int doubles = pattiForDigit.Count(p => p.Type == "DOUBLE");
            int triples = pattiForDigit.Count(p => p.Type == "TRIPLE");

            Assert.Equal(12, singles);
            Assert.Equal(9, doubles);
            Assert.Equal(1, triples);
        }
    }

    [Fact]
    public void Matka_ParseLiveResult_DecomposesCorrectly()
    {
        var result = MatkaEngine.ParseLiveResult("379-98-378");
        Assert.True(result.IsComplete);
        Assert.False(result.IsPending);
        Assert.Equal("379", result.OpenPana);
        Assert.Equal("378", result.ClosePana);
        Assert.Equal("98", result.Jodi);
        Assert.Equal(9, result.OpenSingle);
        Assert.Equal(8, result.CloseSingle);

        var partial = MatkaEngine.ParseLiveResult("120-3*");
        Assert.False(partial.IsComplete);
        Assert.Equal("120", partial.OpenPana);
        Assert.Equal(3, partial.OpenSingle);

        var pending = MatkaEngine.ParseLiveResult("Pending Result");
        Assert.True(pending.IsPending);
    }

    // ==========================================
    // 2. CARROM 2D RIGID-BODY PHYSICS ENGINE
    // ==========================================
    [Fact]
    public void Carrom_Physics_SimulatesShotAndDecelerates()
    {
        var coins = new List<CarromCoin>
        {
            new CarromCoin { Id = 1, Type = CoinType.Striker, X = 400, Y = 660, Vx = 0, Vy = -15, Radius = 22, Mass = 3.0 },
            new CarromCoin { Id = 2, Type = CoinType.White, X = 400, Y = 400, Vx = 0, Vy = 0, Radius = 15, Mass = 1.0 }
        };

        var sim = CarromPhysicsEngine.SimulateShot(coins, CarromPhysicsEngine.StandardPockets, 300);

        Assert.True(sim.StepCount > 0);
        // Striker and white coin must be completely settled
        Assert.All(sim.FinalCoins, c =>
        {
            Assert.Equal(0, c.Vx);
            Assert.Equal(0, c.Vy);
        });
    }

    [Fact]
    public void Carrom_BotShot_ComputesValidTrajectory()
    {
        var coins = new List<CarromCoin>
        {
            new CarromCoin { Id = 1, Type = CoinType.White, X = 350, Y = 350, Radius = 15, Mass = 1.0 }
        };

        var (angle, power, strikerX) = CarromPhysicsEngine.ComputeBotShot(coins, CoinType.White);

        Assert.InRange(strikerX, 200, 600);
        Assert.InRange(power, 40, 95);
        Assert.True(angle != 0);
    }

    // ==========================================
    // 3. 8-BALL POOL PRO PHYSICS & GEOMETRY
    // ==========================================
    [Fact]
    public void Pool_SetupStandardRack_Positions16Balls()
    {
        var balls = PoolPhysicsEngine.SetupStandardRack();
        Assert.Equal(16, balls.Count);

        var cue = balls.FirstOrDefault(b => b.Number == 0);
        Assert.NotNull(cue);
        Assert.Equal(PoolBallType.Cue, cue.Type);

        var eight = balls.FirstOrDefault(b => b.Number == 8);
        Assert.NotNull(eight);
        Assert.Equal(PoolBallType.EightBall, eight.Type);

        Assert.Equal(7, balls.Count(b => b.Type == PoolBallType.Solid));
        Assert.Equal(7, balls.Count(b => b.Type == PoolBallType.Stripe));
    }

    [Fact]
    public void Pool_SimulateShot_ResolvesBallCollisions()
    {
        var balls = PoolPhysicsEngine.SetupStandardRack();
        var result = PoolPhysicsEngine.SimulateShot(balls, angle: 0.0, power: 75.0, maxSteps: 400);

        Assert.True(result.StepCount > 0);
        Assert.NotNull(result.FirstBallHitNumber);
        Assert.False(result.CueBallScratch); // Break shot from center line shouldn't scratch
    }

    // ==========================================
    // 4. LUDO CSPRNG & BOARD ADVANCEMENT
    // ==========================================
    [Fact]
    public void Ludo_CsprngRoll_GeneratesWithinOneToSix()
    {
        for (int i = 0; i < 100; i++)
        {
            int roll = LudoEngine.RollDiceCsprng();
            Assert.InRange(roll, 1, 6);
        }
    }

    [Fact]
    public void Ludo_RollOfSix_ReleasesTokenFromBase()
    {
        var state = LudoEngine.CreateGame(new List<(string Id, string Name, string Color, bool IsBot)>
        {
            ("p1", "Player 1", "RED", false),
            ("p2", "Player 2", "YELLOW", true)
        });

        state.CurrentDiceRoll = 6;
        state.AwaitingMove = true;

        var (success, _, extraTurn) = LudoEngine.ExecuteMove(state, 0);

        Assert.True(success);
        Assert.True(extraTurn); // Roll of 6 awards an extra turn!
        Assert.Equal(0, state.Players[0].Tokens[0].StepIndex); // Released to track 0
    }

    // ==========================================
    // 5. ACE2THREE RUMMY 13-CARD MELD ENGINE
    // ==========================================
    [Fact]
    public void Rummy_PureSequence_ValidatesConsecutiveSameSuit()
    {
        var pure = new List<RummyCard>
        {
            new RummyCard { Id = "s3", Suit = "S", Rank = 3 },
            new RummyCard { Id = "s4", Suit = "S", Rank = 4 },
            new RummyCard { Id = "s5", Suit = "S", Rank = 5 }
        };
        Assert.True(RummyValidator.IsPureSequence(pure));

        // Ace high Q-K-A
        var aceHigh = new List<RummyCard>
        {
            new RummyCard { Id = "hq", Suit = "H", Rank = 12 },
            new RummyCard { Id = "hk", Suit = "H", Rank = 13 },
            new RummyCard { Id = "ha", Suit = "H", Rank = 1 }
        };
        Assert.True(RummyValidator.IsPureSequence(aceHigh));

        // Mixed suit fails
        var mixed = new List<RummyCard>
        {
            new RummyCard { Id = "s3", Suit = "S", Rank = 3 },
            new RummyCard { Id = "h4", Suit = "H", Rank = 4 },
            new RummyCard { Id = "s5", Suit = "S", Rank = 5 }
        };
        Assert.False(RummyValidator.IsPureSequence(mixed));
    }

    [Fact]
    public void Rummy_ImpureSequence_ValidatesWithWildJoker()
    {
        int wildJokerRank = 8;
        var impure = new List<RummyCard>
        {
            new RummyCard { Id = "d2", Suit = "D", Rank = 2 },
            new RummyCard { Id = "s8", Suit = "S", Rank = 8, IsWildJoker = true }, // Wild Joker substituting 3 of Diamonds
            new RummyCard { Id = "d4", Suit = "D", Rank = 4 }
        };

        Assert.True(RummyValidator.IsImpureSequence(impure, wildJokerRank));
    }

    // ==========================================
    // 6. CASINO REPLAY PROTECTION & PROVABLY FAIR
    // ==========================================
    [Fact]
    public void Casino_FlexrixSignature_VerifiesAndProtectsAgainstReplay()
    {
        string secret = "test_flexrix_secret_key_12345";
        string payload = "{\"playerId\":\"usr_123\",\"gameId\":\"1stake_dice\"}";
        long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        string sig = CasinoEngine.GenerateFlexrixSignature(secret, payload);

        // Valid signature within timestamp window
        Assert.True(CasinoEngine.VerifyFlexrixSignature(secret, payload, sig, now));

        // Expired signature older than 5 minutes (301 seconds ago) must fail
        Assert.False(CasinoEngine.VerifyFlexrixSignature(secret, payload, sig, now - 301));
    }

    [Fact]
    public void Casino_ProvablyFair_DerivesDeterministicOutcome()
    {
        var result = CasinoEngine.VerifyProvablyFairOutcome("secret_server_seed_987", "client_seed_456", 1);
        Assert.True(result.IsValid);
        Assert.InRange(result.DerivedOutcome, 0.0, 99.99);
        Assert.NotEmpty(result.ServerSeedHash);
        Assert.NotEmpty(result.CalculatedHash);
    }

    // ==========================================
    // 7. SPORTS BETFAIR LADDER & CRICKET MATH
    // ==========================================
    [Fact]
    public void Sports_CricketOversAndRunRate_CalculatesAccurately()
    {
        // 18.2 overs = 18 completed overs + 2 balls = 110 balls
        int balls = SportsEngine.CalculateTotalCricketBalls(18.2);
        Assert.Equal(110, balls);

        // 165 runs in 18.2 overs -> (165 * 6) / 110 = 9.0 run rate
        double crr = SportsEngine.CalculateCurrentRunRate(165, 18.2);
        Assert.Equal(9.0, crr);
    }

    [Fact]
    public void Sports_BetfairExchangeOrders_ComputesBackAndLayLiability()
    {
        // Back bet: 100 PTS at 2.50 odds -> Profit = 150 PTS, Risk = 100 PTS
        var back = SportsEngine.CalculateBetfairExchangeOrder("mkt_1", "sel_1", "BACK", 2.50, 10000m);
        Assert.Equal(10000m, back.LiabilityMinor);
        Assert.Equal(15000m, back.PotentialProfitMinor);

        // Lay bet: 100 PTS at 2.50 odds -> Liability = 150 PTS, Profit = 100 PTS
        var lay = SportsEngine.CalculateBetfairExchangeOrder("mkt_1", "sel_1", "LAY", 2.50, 10000m);
        Assert.Equal(15000m, lay.LiabilityMinor);
        Assert.Equal(10000m, lay.PotentialProfitMinor);
    }
}
