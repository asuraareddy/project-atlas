using ProjectAtlas.Domain.Games.Physics;

namespace ProjectAtlas.Domain.Games.Carrom;

public enum CoinType
{
    White,
    Black,
    Queen,
    Striker
}

public class CarromCoin
{
    public int Id { get; set; }
    public CoinType Type { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Vx { get; set; }
    public double Vy { get; set; }
    public double Radius { get; set; }
    public double Mass { get; set; }
    public bool IsPocketed { get; set; }
}

public class CarromPocket
{
    public int Id { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Radius { get; set; }
}

public class SimulationResult
{
    public List<CarromCoin> FinalCoins { get; set; } = new();
    public List<CoinType> PocketedInShot { get; set; } = new();
    public bool StrikerPocketed { get; set; }
    public int StepCount { get; set; }
}

public static class CarromPhysicsEngine
{
    public const double BoardSize = 800;
    public const double BoardPadding = 48;
    public const double MinBound = BoardPadding;
    public const double MaxBound = BoardSize - BoardPadding;

    public const double CoinRadius = 15;
    public const double StrikerRadius = 22;
    public const double PocketRadius = 36;

    public const double CoinMass = 1.0;
    public const double StrikerMass = 3.0;

    public const double FrictionCoefficient = 0.984;
    public const double Restitution = 0.92;
    public const double CushionRestitution = 0.80;
    public const double StopVelocityEpsilon = 0.12;

    public static readonly List<CarromPocket> StandardPockets = new()
    {
        new CarromPocket { Id = 1, X = 48, Y = 48, Radius = PocketRadius },
        new CarromPocket { Id = 2, X = 752, Y = 48, Radius = PocketRadius },
        new CarromPocket { Id = 3, X = 48, Y = 752, Radius = PocketRadius },
        new CarromPocket { Id = 4, X = 752, Y = 752, Radius = PocketRadius }
    };

    public static (List<CoinType> Pocketed, bool StrikerPocketed) Step(List<CarromCoin> coins, List<CarromPocket> pockets)
    {
        var pocketed = new List<CoinType>();
        bool strikerPocketed = false;

        // 1. Position update & friction deceleration
        foreach (var c in coins)
        {
            if (c.IsPocketed) continue;

            c.X += c.Vx;
            c.Y += c.Vy;

            c.Vx *= FrictionCoefficient;
            c.Vy *= FrictionCoefficient;

            if (Math.Sqrt(c.Vx * c.Vx + c.Vy * c.Vy) < StopVelocityEpsilon)
            {
                c.Vx = 0;
                c.Vy = 0;
            }
        }

        // 2. Cushion boundaries
        foreach (var c in coins)
        {
            if (c.IsPocketed) continue;

            if (c.X - c.Radius < MinBound)
            {
                c.X = MinBound + c.Radius;
                c.Vx = -c.Vx * CushionRestitution;
            }
            if (c.X + c.Radius > MaxBound)
            {
                c.X = MaxBound - c.Radius;
                c.Vx = -c.Vx * CushionRestitution;
            }
            if (c.Y - c.Radius < MinBound)
            {
                c.Y = MinBound + c.Radius;
                c.Vy = -c.Vy * CushionRestitution;
            }
            if (c.Y + c.Radius > MaxBound)
            {
                c.Y = MaxBound - c.Radius;
                c.Vy = -c.Vy * CushionRestitution;
            }
        }

        // 3. Disc-to-disc collisions
        for (int i = 0; i < coins.Count; i++)
        {
            var c1 = coins[i];
            if (c1.IsPocketed) continue;

            for (int j = i + 1; j < coins.Count; j++)
            {
                var c2 = coins[j];
                if (c2.IsPocketed) continue;

                double dx = c2.X - c1.X;
                double dy = c2.Y - c1.Y;
                double dist = Math.Sqrt(dx * dx + dy * dy);
                double minDist = c1.Radius + c2.Radius;

                if (dist > 0 && dist < minDist)
                {
                    double nx = dx / dist;
                    double ny = dy / dist;

                    double overlap = minDist - dist;
                    double totalMass = c1.Mass + c2.Mass;
                    double m1Ratio = c2.Mass / totalMass;
                    double m2Ratio = c1.Mass / totalMass;

                    c1.X -= nx * overlap * m1Ratio;
                    c1.Y -= ny * overlap * m1Ratio;
                    c2.X += nx * overlap * m2Ratio;
                    c2.Y += ny * overlap * m2Ratio;

                    double kx = c1.Vx - c2.Vx;
                    double ky = c1.Vy - c2.Vy;
                    double normalVel = kx * nx + ky * ny;

                    if (normalVel > 0)
                    {
                        double impulse = (-(1 + Restitution) * normalVel) / (1 / c1.Mass + 1 / c2.Mass);
                        c1.Vx += (impulse / c1.Mass) * nx;
                        c1.Vy += (impulse / c1.Mass) * ny;
                        c2.Vx -= (impulse / c2.Mass) * nx;
                        c2.Vy -= (impulse / c2.Mass) * ny;
                    }
                }
            }
        }

        // 4. Pocket detection
        foreach (var c in coins)
        {
            if (c.IsPocketed) continue;

            foreach (var p in pockets)
            {
                double d = Math.Sqrt((c.X - p.X) * (c.X - p.X) + (c.Y - p.Y) * (c.Y - p.Y));
                if (d < p.Radius)
                {
                    c.IsPocketed = true;
                    c.Vx = 0;
                    c.Vy = 0;
                    c.X = p.X;
                    c.Y = p.Y;

                    if (c.Type == CoinType.Striker)
                        strikerPocketed = true;
                    else
                        pocketed.Add(c.Type);
                    break;
                }
            }
        }

        return (pocketed, strikerPocketed);
    }

    public static bool AreCoinsInMotion(IEnumerable<CarromCoin> coins)
    {
        return coins.Any(c => !c.IsPocketed && (Math.Abs(c.Vx) > 0.05 || Math.Abs(c.Vy) > 0.05));
    }

    public static SimulationResult SimulateShot(List<CarromCoin> initialCoins, List<CarromPocket> pockets, int maxSteps = 700)
    {
        var coins = initialCoins.Select(c => new CarromCoin
        {
            Id = c.Id,
            Type = c.Type,
            X = c.X,
            Y = c.Y,
            Vx = c.Vx,
            Vy = c.Vy,
            Radius = c.Radius,
            Mass = c.Mass,
            IsPocketed = c.IsPocketed
        }).ToList();

        var pocketedInShot = new List<CoinType>();
        bool strikerPocketed = false;
        int stepCount = 0;

        while (AreCoinsInMotion(coins) && stepCount < maxSteps)
        {
            var res = Step(coins, pockets);
            pocketedInShot.AddRange(res.Pocketed);
            if (res.StrikerPocketed) strikerPocketed = true;
            stepCount++;
        }

        foreach (var c in coins)
        {
            c.Vx = 0;
            c.Vy = 0;
        }

        return new SimulationResult
        {
            FinalCoins = coins,
            PocketedInShot = pocketedInShot,
            StrikerPocketed = strikerPocketed,
            StepCount = stepCount
        };
    }

    public static (double Angle, double Power, double StrikerX) ComputeBotShot(List<CarromCoin> coins, CoinType targetColor)
    {
        var target = coins.FirstOrDefault(c => !c.IsPocketed && (c.Type == targetColor || c.Type == CoinType.Queen));
        if (target == null)
        {
            return (-Math.PI / 2, 60.0, 400.0);
        }

        // Aim towards closest pocket to target
        var targetPocket = StandardPockets.OrderBy(p => Math.Sqrt((p.X - target.X) * (p.X - target.X) + (p.Y - target.Y) * (p.Y - target.Y))).First();

        double strikerX = Math.Clamp(target.X, 200, 600);
        double strikerY = 660; // Standard bottom baseline

        double dx = target.X - strikerX;
        double dy = target.Y - strikerY;
        double angle = Math.Atan2(dy, dx);
        double dist = Math.Sqrt(dx * dx + dy * dy);
        double power = Math.Clamp(dist * 0.18 + 35, 40, 95);

        return (angle, power, strikerX);
    }
}
