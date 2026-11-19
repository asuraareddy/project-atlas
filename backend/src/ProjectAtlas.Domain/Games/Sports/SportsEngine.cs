namespace ProjectAtlas.Domain.Games.Sports;

public class BetfairOrder
{
    public string MarketId { get; set; } = string.Empty;
    public string SelectionId { get; set; } = string.Empty;
    public string Side { get; set; } = "BACK"; // BACK (Blue) or LAY (Pink)
    public double Odds { get; set; }
    public decimal StakeMinor { get; set; }
    public decimal LiabilityMinor { get; set; }
    public decimal PotentialProfitMinor { get; set; }
}

public static class SportsEngine
{
    public static int CalculateTotalCricketBalls(double overs)
    {
        int completedOvers = (int)Math.Floor(overs);
        int additionalBalls = (int)Math.Round((overs - completedOvers) * 10.0);
        return completedOvers * 6 + additionalBalls;
    }

    public static double CalculateCurrentRunRate(int runs, double overs)
    {
        int balls = CalculateTotalCricketBalls(overs);
        if (balls <= 0) return 0.0;
        return Math.Round((runs * 6.0) / balls, 2);
    }

    public static double CalculateRequiredRunRate(int targetRuns, int currentRuns, double currentOvers, int totalOversLimit = 20)
    {
        int runsNeeded = targetRuns - currentRuns;
        int ballsBowled = CalculateTotalCricketBalls(currentOvers);
        int ballsRemaining = (totalOversLimit * 6) - ballsBowled;

        if (ballsRemaining <= 0) return runsNeeded <= 0 ? 0.0 : 99.99;
        return Math.Round((runsNeeded * 6.0) / ballsRemaining, 2);
    }

    public static BetfairOrder CalculateBetfairExchangeOrder(string marketId, string selectionId, string side, double odds, decimal stakeMinor)
    {
        if (odds <= 1.0)
        {
            throw new ArgumentException("Betfair exchange odds must be strictly greater than 1.0");
        }

        decimal decimalMultiplier = (decimal)(odds - 1.0);

        if (side.Equals("BACK", StringComparison.OrdinalIgnoreCase))
        {
            // Back bet (Blue): User stakes X to win X * (odds - 1)
            return new BetfairOrder
            {
                MarketId = marketId,
                SelectionId = selectionId,
                Side = "BACK",
                Odds = odds,
                StakeMinor = stakeMinor,
                LiabilityMinor = stakeMinor, // Back liability is the stake itself
                PotentialProfitMinor = Math.Round(stakeMinor * decimalMultiplier, 2)
            };
        }
        else if (side.Equals("LAY", StringComparison.OrdinalIgnoreCase))
        {
            // Lay bet (Pink): User acts as bookmaker; liability is stake * (odds - 1)
            decimal liability = Math.Round(stakeMinor * decimalMultiplier, 2);
            return new BetfairOrder
            {
                MarketId = marketId,
                SelectionId = selectionId,
                Side = "LAY",
                Odds = odds,
                StakeMinor = stakeMinor,
                LiabilityMinor = liability, // Lay liability is stake * (odds - 1)
                PotentialProfitMinor = stakeMinor // Potential profit is the backer's stake
            };
        }
        else
        {
            throw new ArgumentException("Betfair exchange side must be BACK or LAY");
        }
    }
}
