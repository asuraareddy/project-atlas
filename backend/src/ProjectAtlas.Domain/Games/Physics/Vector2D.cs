namespace ProjectAtlas.Domain.Games.Physics;

public struct Vector2D
{
    public double X { get; set; }
    public double Y { get; set; }

    public Vector2D(double x, double y)
    {
        X = x;
        Y = y;
    }

    public static Vector2D Zero => new(0, 0);

    public static Vector2D operator +(Vector2D a, Vector2D b) => new(a.X + b.X, a.Y + b.Y);
    public static Vector2D operator -(Vector2D a, Vector2D b) => new(a.X - b.X, a.Y - b.Y);
    public static Vector2D operator *(Vector2D a, double scalar) => new(a.X * scalar, a.Y * scalar);
    public static Vector2D operator /(Vector2D a, double scalar) => new(a.X / scalar, a.Y / scalar);

    public double LengthSquared => X * X + Y * Y;
    public double Length => Math.Sqrt(LengthSquared);

    public Vector2D Normalize()
    {
        double len = Length;
        return len > 0.000001 ? new Vector2D(X / len, Y / len) : Zero;
    }

    public double Dot(Vector2D other) => X * other.X + Y * other.Y;
}
