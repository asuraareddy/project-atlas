namespace ProjectAtlas.Domain.Games.Rummy;

public class RummyCard
{
    public string Id { get; set; } = string.Empty;
    public string Suit { get; set; } = string.Empty; // S, H, D, C
    public int Rank { get; set; } // 1 (A), 2-10, 11 (J), 12 (Q), 13 (K)
    public bool IsWildJoker { get; set; }
}

public class CardGroup
{
    public string GroupType { get; set; } = "DEADWOOD"; // PURE_SEQUENCE, IMPURE_SEQUENCE, SET, DEADWOOD
    public List<RummyCard> Cards { get; set; } = new();
    public bool IsValid { get; set; }
    public int Points { get; set; }
}

public class RummyDeclarationResult
{
    public bool IsValidDeclaration { get; set; }
    public int TotalScorePoints { get; set; }
    public List<CardGroup> Groups { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public static class RummyValidator
{
    public static int GetCardValue(int rank)
    {
        if (rank == 1) return 10; // Ace is 10 points
        if (rank >= 10) return 10; // 10, J, Q, K are 10 points
        return rank; // 2-9 are face value
    }

    public static bool IsPureSequence(List<RummyCard> cards, int wildJokerRank = -1)
    {
        if (cards == null || cards.Count < 3) return false;

        string suit = cards[0].Suit;
        if (cards.Any(c => c.Suit != suit)) return false;

        var ranks = cards.Select(c => c.Rank).Distinct().OrderBy(r => r).ToList();
        if (ranks.Count != cards.Count) return false;

        // Check normal run (e.g. 4, 5, 6)
        bool isRun = true;
        for (int i = 0; i < ranks.Count - 1; i++)
        {
            if (ranks[i + 1] - ranks[i] != 1)
            {
                isRun = false;
                break;
            }
        }
        if (isRun) return true;

        // Check Ace-high sequence (e.g. Q, K, A -> 12, 13, 1)
        if (ranks.Contains(1))
        {
            var aceHigh = ranks.Select(r => r == 1 ? 14 : r).OrderBy(r => r).ToList();
            bool aceHighRun = true;
            for (int i = 0; i < aceHigh.Count - 1; i++)
            {
                if (aceHigh[i + 1] - aceHigh[i] != 1)
                {
                    aceHighRun = false;
                    break;
                }
            }
            if (aceHighRun) return true;
        }

        return false;
    }

    public static bool IsImpureSequence(List<RummyCard> cards, int wildJokerRank)
    {
        if (cards == null || cards.Count < 3) return false;

        var nonJokers = cards.Where(c => c.Rank != wildJokerRank && !c.IsWildJoker).ToList();
        int jokersCount = cards.Count - nonJokers.Count;

        if (jokersCount == 0) return IsPureSequence(cards, wildJokerRank);
        if (!nonJokers.Any()) return false;

        string suit = nonJokers[0].Suit;
        if (nonJokers.Any(c => c.Suit != suit)) return false;

        var ranks = nonJokers.Select(c => c.Rank).Distinct().OrderBy(r => r).ToList();
        if (ranks.Count != nonJokers.Count) return false;

        bool CheckRun(List<int> rList)
        {
            int neededJokers = 0;
            for (int i = 0; i < rList.Count - 1; i++)
            {
                int gap = rList[i + 1] - rList[i] - 1;
                if (gap < 0) return false;
                neededJokers += gap;
            }
            int spare = jokersCount - neededJokers;
            if (spare < 0) return false;
            int runSpan = rList[^1] - rList[0] + 1 + spare;
            return runSpan <= 14;
        }

        if (CheckRun(ranks)) return true;

        if (ranks.Contains(1))
        {
            var highRanks = ranks.Select(r => r == 1 ? 14 : r).OrderBy(r => r).ToList();
            if (CheckRun(highRanks)) return true;
        }

        return false;
    }

    public static bool IsValidSet(List<RummyCard> cards, int wildJokerRank)
    {
        if (cards == null || cards.Count < 3 || cards.Count > 4) return false;

        var nonJokers = cards.Where(c => c.Rank != wildJokerRank && !c.IsWildJoker).ToList();
        if (!nonJokers.Any()) return false;

        int targetRank = nonJokers[0].Rank;
        if (nonJokers.Any(c => c.Rank != targetRank)) return false;

        // Distinct suits
        var suits = nonJokers.Select(c => c.Suit).Distinct().ToList();
        return suits.Count == nonJokers.Count;
    }

    public static RummyDeclarationResult ValidateHand(List<CardGroup> groups, int wildJokerRank)
    {
        int totalCards = groups.Sum(g => g.Cards.Count);
        if (totalCards != 13)
        {
            return new RummyDeclarationResult
            {
                IsValidDeclaration = false,
                TotalScorePoints = 80,
                Message = $"Hand must contain exactly 13 cards (found {totalCards})."
            };
        }

        bool hasPureSequence = false;
        int validSequencesCount = 0;
        int deadwoodPoints = 0;

        foreach (var group in groups)
        {
            if (IsPureSequence(group.Cards, wildJokerRank))
            {
                group.GroupType = "PURE_SEQUENCE";
                group.IsValid = true;
                group.Points = 0;
                hasPureSequence = true;
                validSequencesCount++;
            }
            else if (hasPureSequence && IsImpureSequence(group.Cards, wildJokerRank))
            {
                group.GroupType = "IMPURE_SEQUENCE";
                group.IsValid = true;
                group.Points = 0;
                validSequencesCount++;
            }
            else if (hasPureSequence && validSequencesCount >= 2 && IsValidSet(group.Cards, wildJokerRank))
            {
                group.GroupType = "SET";
                group.IsValid = true;
                group.Points = 0;
            }
            else
            {
                group.GroupType = "DEADWOOD";
                group.IsValid = false;
                group.Points = group.Cards.Sum(c => (c.Rank == wildJokerRank || c.IsWildJoker) ? 0 : GetCardValue(c.Rank));
                deadwoodPoints += group.Points;
            }
        }

        bool isValid = hasPureSequence && validSequencesCount >= 2 && deadwoodPoints == 0;

        return new RummyDeclarationResult
        {
            IsValidDeclaration = isValid,
            TotalScorePoints = Math.Min(80, deadwoodPoints),
            Groups = groups,
            Message = isValid ? "Valid Rummy Show! 0 Penalty Points." : "Invalid declaration. Requires at least 1 Pure Sequence and 2 Sequences total."
        };
    }

    public static List<CardGroup> AutoGroupHand(List<RummyCard> cards, int wildJokerRank)
    {
        var groups = new List<CardGroup>();
        var pool = new List<RummyCard>(cards);

        // 1. Extract pure sequences
        var suits = new[] { "S", "H", "D", "C" };
        foreach (var s in suits)
        {
            var suitCards = pool.Where(c => c.Suit == s && c.Rank != wildJokerRank && !c.IsWildJoker)
                                .OrderBy(c => c.Rank).ToList();
            if (suitCards.Count >= 3)
            {
                for (int len = Math.Min(5, suitCards.Count); len >= 3; len--)
                {
                    for (int start = 0; start <= suitCards.Count - len; start++)
                    {
                        var candidate = suitCards.Skip(start).Take(len).ToList();
                        if (IsPureSequence(candidate, wildJokerRank))
                        {
                            groups.Add(new CardGroup
                            {
                                GroupType = "PURE_SEQUENCE",
                                Cards = candidate,
                                IsValid = true,
                                Points = 0
                            });
                            foreach (var c in candidate) pool.Remove(c);
                            break;
                        }
                    }
                }
            }
        }

        // 2. Extract Sets
        var remainingByRank = pool.GroupBy(c => c.Rank).Where(g => g.Count() >= 3 && g.Key != wildJokerRank).ToList();
        foreach (var rg in remainingByRank)
        {
            var distinctSuits = rg.GroupBy(c => c.Suit).Select(g => g.First()).Take(4).ToList();
            if (distinctSuits.Count >= 3)
            {
                groups.Add(new CardGroup
                {
                    GroupType = "SET",
                    Cards = distinctSuits,
                    IsValid = true,
                    Points = 0
                });
                foreach (var c in distinctSuits) pool.Remove(c);
            }
        }

        // 3. Remainder into Deadwood
        if (pool.Any())
        {
            groups.Add(new CardGroup
            {
                GroupType = "DEADWOOD",
                Cards = pool.OrderBy(c => c.Suit).ThenBy(c => c.Rank).ToList(),
                IsValid = false,
                Points = pool.Sum(c => (c.Rank == wildJokerRank || c.IsWildJoker) ? 0 : GetCardValue(c.Rank))
            });
        }

        return groups;
    }
}
