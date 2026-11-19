namespace ProjectAtlas.Domain.Games.Pool;

public enum PoolBallType
{
    Cue,
    Solid,
    Stripe,
    EightBall
}

public class PoolBall
{
    public int Number { get; set; }
    public PoolBallType Type { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Vx { get; set; }
    public double Vy { get; set; }
    public double Radius { get; set; } = 13.0;
    public double Mass { get; set; } = 1.0;
    public bool IsPocketed { get; set; }
    public string ColorHex { get; set; } = "#ffffff";
}

public class PoolPocket
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public double Radius { get; set; } = 32.0;
    public double DropRadius { get; set; } = 22.0;
}

public class PoolSimulationResult
{
    public List<PoolBall> FinalBalls { get; set; } = new();
    public List<int> PocketedBallNumbers { get; set; } = new();
    public bool CueBallScratch { get; set; }
    public bool EightBallPocketed { get; set; }
    public int? FirstBallHitNumber { get; set; }
    public int StepCount { get; set; }
}

public static class PoolPhysicsEngine
{
    public const double TableWidth = 1000.0;
    public const double TableHeight = 500.0;
    public const double CushionWidth = 44.0;
    public const double Friction = 0.986;
    public const double RestitutionBall = 0.94;
    public const double RestitutionCushion = 0.82;
    public const double RestVelocityThreshold = 0.08;

    public static readonly List<PoolPocket> StandardPockets = new()
    {
        new PoolPocket { Id = 1, Name = "TL", X = 44, Y = 44, Radius = 32 },
        new PoolPocket { Id = 2, Name = "TM", X = 500, Y = 34, Radius = 28 },
        new PoolPocket { Id = 3, Name = "TR", X = 956, Y = 44, Radius = 32 },
        new PoolPocket { Id = 4, Name = "BL", X = 44, Y = 456, Radius = 32 },
        new PoolPocket { Id = 5, Name = "BM", X = 500, Y = 466, Radius = 28 },
        new PoolPocket { Id = 6, Name = "BR", X = 956, Y = 456, Radius = 32 }
    };

    public static List<PoolBall> SetupStandardRack()
    {
        var balls = new List<PoolBall>();

        // Cue ball
        balls.Add(new PoolBall
        {
            Number = 0,
            Type = PoolBallType.Cue,
            X = 250,
            Y = 250,
            ColorHex = "#ffffff"
        });

        // 15 object balls in triangle rack at foot spot (750, 250)
        double startX = 700;
        double startY = 250;
        double r = 13.0;
        double colSpacing = r * Math.Sqrt(3.0);
        double rowSpacing = r * 2.0;

        int[] rackOrder = new int[]
        {
            1,
            9, 2,
            3, 8, 10,
            11, 4, 12, 5,
            6, 13, 7, 14, 15
        };

        int ballIdx = 0;
        for (int col = 0; col < 5; col++)
        {
            double cx = startX + col * colSpacing;
            double topY = startY - (col * rowSpacing) / 2.0;

            for (int row = 0; row <= col; row++)
            {
                int num = rackOrder[ballIdx++];
                PoolBallType type;
                if (num == 8) type = PoolBallType.EightBall;
                else if (num <= 7) type = PoolBallType.Solid;
                else type = PoolBallType.Stripe;

                balls.Add(new PoolBall
                {
                    Number = num,
                    Type = type,
                    X = cx,
                    Y = topY + row * rowSpacing,
                    ColorHex = GetBallColor(num)
                });
            }
        }

        return balls;
    }

    private static string GetBallColor(int num) => num switch
    {
        1 or 9 => "#fbbf24",   // Yellow
        2 or 10 => "#2563eb",  // Blue
        3 or 11 => "#dc2626",  // Red
        4 or 12 => "#7c3aed",  // Purple
        5 or 13 => "#ea580c",  // Orange
        6 or 14 => "#16a34a",  // Green
        7 or 15 => "#991b1b",  // Maroon
        8 => "#09090b",        // Black
        _ => "#ffffff"
    };

    public static PoolSimulationResult SimulateShot(List<PoolBall> initialBalls, double angle, double power, int maxSteps = 800)
    {
        var balls = initialBalls.Select(b => new PoolBall
        {
            Number = b.Number,
            Type = b.Type,
            X = b.X,
            Y = b.Y,
            Vx = b.Vx,
            Vy = b.Vy,
            Radius = b.Radius,
            Mass = b.Mass,
            IsPocketed = b.IsPocketed,
            ColorHex = b.ColorHex
        }).ToList();

        var cueBall = balls.FirstOrDefault(b => b.Number == 0);
        if (cueBall != null && !cueBall.IsPocketed)
        {
            double speed = Math.Clamp(power, 5.0, 100.0) * 0.36;
            cueBall.Vx = speed * Math.Cos(angle);
            cueBall.Vy = speed * Math.Sin(angle);
        }

        var pocketed = new List<int>();
        bool cueScratch = false;
        bool eightPocketed = false;
        int? firstHit = null;
        int stepCount = 0;

        while (AreBallsInMotion(balls) && stepCount < maxSteps)
        {
            // 1. Motion & friction
            foreach (var b in balls)
            {
                if (b.IsPocketed) continue;
                b.X += b.Vx;
                b.Y += b.Vy;

                b.Vx *= Friction;
                b.Vy *= Friction;

                if (Math.Sqrt(b.Vx * b.Vx + b.Vy * b.Vy) < RestVelocityThreshold)
                {
                    b.Vx = 0;
                    b.Vy = 0;
                }
            }

            // 2. Cushion reflections (table bounds 44 to 956 on X, 44 to 456 on Y)
            foreach (var b in balls)
            {
                if (b.IsPocketed) continue;

                if (b.X - b.Radius < CushionWidth)
                {
                    b.X = CushionWidth + b.Radius;
                    b.Vx = -b.Vx * RestitutionCushion;
                }
                else if (b.X + b.Radius > TableWidth - CushionWidth)
                {
                    b.X = TableWidth - CushionWidth - b.Radius;
                    b.Vx = -b.Vx * RestitutionCushion;
                }

                if (b.Y - b.Radius < CushionWidth)
                {
                    b.Y = CushionWidth + b.Radius;
                    b.Vy = -b.Vy * RestitutionCushion;
                }
                else if (b.Y + b.Radius > TableHeight - CushionWidth)
                {
                    b.Y = TableHeight - CushionWidth - b.Radius;
                    b.Vy = -b.Vy * RestitutionCushion;
                }
            }

            // 3. Sphere-to-sphere collisions
            for (int i = 0; i < balls.Count; i++)
            {
                var b1 = balls[i];
                if (b1.IsPocketed) continue;

                for (int j = i + 1; j < balls.Count; j++)
                {
                    var b2 = balls[j];
                    if (b2.IsPocketed) continue;

                    double dx = b2.X - b1.X;
                    double dy = b2.Y - b1.Y;
                    double dist = Math.Sqrt(dx * dx + dy * dy);
                    double minDist = b1.Radius + b2.Radius;

                    if (dist > 0 && dist < minDist)
                    {
                        if (firstHit == null && (b1.Number == 0 || b2.Number == 0))
                        {
                            firstHit = b1.Number == 0 ? b2.Number : b1.Number;
                        }

                        double nx = dx / dist;
                        double ny = dy / dist;

                        double overlap = minDist - dist;
                        b1.X -= nx * overlap * 0.5;
                        b1.Y -= ny * overlap * 0.5;
                        b2.X += nx * overlap * 0.5;
                        b2.Y += ny * overlap * 0.5;

                        double kx = b1.Vx - b2.Vx;
                        double ky = b1.Vy - b2.Vy;
                        double normalVel = kx * nx + ky * ny;

                        if (normalVel > 0)
                        {
                            double impulse = (-(1 + RestitutionBall) * normalVel) / 2.0;
                            b1.Vx += impulse * nx;
                            b1.Vy += impulse * ny;
                            b2.Vx -= impulse * nx;
                            b2.Vy -= impulse * ny;
                        }
                    }
                }
            }

            // 4. Pocket detection
            foreach (var b in balls)
            {
                if (b.IsPocketed) continue;

                foreach (var p in StandardPockets)
                {
                    double d = Math.Sqrt((b.X - p.X) * (b.X - p.X) + (b.Y - p.Y) * (b.Y - p.Y));
                    if (d < p.Radius)
                    {
                        b.IsPocketed = true;
                        b.Vx = 0;
                        b.Vy = 0;
                        b.X = p.X;
                        b.Y = p.Y;

                        if (b.Number == 0)
                            cueScratch = true;
                        else if (b.Number == 8)
                            eightPocketed = true;

                        pocketed.Add(b.Number);
                        break;
                    }
                }
            }

            stepCount++;
        }

        foreach (var b in balls)
        {
            b.Vx = 0;
            b.Vy = 0;
        }

        return new PoolSimulationResult
        {
            FinalBalls = balls,
            PocketedBallNumbers = pocketed,
            CueBallScratch = cueScratch,
            EightBallPocketed = eightPocketed,
            FirstBallHitNumber = firstHit,
            StepCount = stepCount
        };
    }

    public static bool AreBallsInMotion(IEnumerable<PoolBall> balls)
    {
        return balls.Any(b => !b.IsPocketed && (Math.Abs(b.Vx) > 0.05 || Math.Abs(b.Vy) > 0.05));
    }

    public static (double Angle, double Power) ComputeAceCueBotShot(List<PoolBall> balls, PoolBallType? assignedGroup)
    {
        var cue = balls.FirstOrDefault(b => b.Number == 0);
        if (cue == null || cue.IsPocketed) return (0.0, 50.0);

        var legalTargets = balls.Where(b => !b.IsPocketed && b.Number != 0 &&
            (assignedGroup == null || b.Type == assignedGroup || b.Type == PoolBallType.EightBall)).ToList();

        if (!legalTargets.Any())
        {
            var eight = balls.FirstOrDefault(b => b.Number == 8 && !b.IsPocketed);
            if (eight != null) legalTargets.Add(eight);
        }

        if (!legalTargets.Any()) return (0.0, 50.0);

        var target = legalTargets.OrderBy(b => Math.Sqrt((b.X - cue.X) * (b.X - cue.X) + (b.Y - cue.Y) * (b.Y - cue.Y))).First();
        double dx = target.X - cue.X;
        double dy = target.Y - cue.Y;
        double angle = Math.Atan2(dy, dx);
        double dist = Math.Sqrt(dx * dx + dy * dy);
        double power = Math.Clamp(dist * 0.12 + 40.0, 35.0, 90.0);

        return (angle, power);
    }
}
