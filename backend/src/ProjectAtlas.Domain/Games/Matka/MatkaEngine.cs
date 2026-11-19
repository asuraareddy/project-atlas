using System.Text.RegularExpressions;

namespace ProjectAtlas.Domain.Games.Matka;

public class MatkaResultDecomposition
{
    public string RawResult { get; set; } = string.Empty;
    public string? OpenPana { get; set; }
    public int? OpenSingle { get; set; }
    public int? CloseSingle { get; set; }
    public string? ClosePana { get; set; }
    public string? Jodi { get; set; }
    public bool IsComplete { get; set; }
    public bool IsPending { get; set; }
}

public static class MatkaEngine
{
    public static MatkaResultDecomposition ParseLiveResult(string raw)
    {
        var result = new MatkaResultDecomposition { RawResult = raw };

        if (string.IsNullOrWhiteSpace(raw) || raw.Equals("Pending Result", StringComparison.OrdinalIgnoreCase) || raw.Contains("***"))
        {
            result.IsPending = true;
            return result;
        }

        // Standard Matka formats:
        // Format A: "379-98-378" (Complete: Open Pana - Jodi - Close Pana)
        // Format B: "379-9*" or "379-9" (Open declared, Close pending)
        // Format C: "***-**-***" (Completely pending)

        var parts = raw.Split(new[] { '-', ' ' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 3)
        {
            result.OpenPana = parts[0];
            result.ClosePana = parts[2];
            result.Jodi = parts[1];

            if (parts[1].Length >= 2 && int.TryParse(parts[1][0].ToString(), out int os) && int.TryParse(parts[1][1].ToString(), out int cs))
            {
                result.OpenSingle = os;
                result.CloseSingle = cs;
                result.IsComplete = true;
            }
        }
        else if (parts.Length == 2)
        {
            result.OpenPana = parts[0];
            string jodiPart = parts[1].Replace("*", "");
            if (jodiPart.Length >= 1 && int.TryParse(jodiPart[0].ToString(), out int os))
            {
                result.OpenSingle = os;
            }
            result.IsComplete = false;
        }
        else
        {
            result.IsPending = true;
        }

        return result;
    }

    public static bool IsCutoffPassed(string cutoffTimeString, DateTimeOffset currentUtc)
    {
        // e.g. "16:15"
        if (TimeSpan.TryParse(cutoffTimeString, out var cutoff))
        {
            var nowTime = currentUtc.TimeOfDay;
            return nowTime >= cutoff;
        }
        return false;
    }
}
