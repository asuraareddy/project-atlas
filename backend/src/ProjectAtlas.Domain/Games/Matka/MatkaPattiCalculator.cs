namespace ProjectAtlas.Domain.Games.Matka;

public class PattiCombination
{
    public string Patti { get; set; } = string.Empty;
    public int Digit { get; set; }
    public string Type { get; set; } = string.Empty; // SINGLE, DOUBLE, TRIPLE
}

public static class MatkaPattiCalculator
{
    public static List<PattiCombination> GenerateAll220Patti()
    {
        var list = new List<PattiCombination>();

        for (int i = 0; i <= 9; i++)
        {
            for (int j = i; j <= 9; j++)
            {
                for (int k = j; k <= 9; k++)
                {
                    int sum = (i + j + k) % 10;
                    string patti = $"{i}{j}{k}";

                    string type;
                    if (i == j && j == k)
                    {
                        type = "TRIPLE";
                    }
                    else if (i == j || j == k || i == k)
                    {
                        type = "DOUBLE";
                    }
                    else
                    {
                        type = "SINGLE";
                    }

                    list.Add(new PattiCombination
                    {
                        Patti = patti,
                        Digit = sum,
                        Type = type
                    });
                }
            }
        }

        return list;
    }

    public static List<PattiCombination> GetPattiForDigit(int digit, string? pattiType = null)
    {
        var all = GenerateAll220Patti();
        return all
            .Where(p => p.Digit == digit && (string.IsNullOrEmpty(pattiType) || p.Type.Equals(pattiType, StringComparison.OrdinalIgnoreCase)))
            .OrderBy(p => p.Patti)
            .ToList();
    }
}
