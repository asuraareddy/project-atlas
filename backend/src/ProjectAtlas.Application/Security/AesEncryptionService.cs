using System.Security.Cryptography;
using System.Text;

namespace ProjectAtlas.Application.Security;

public static class AesEncryptionService
{
    private const string MasterKey = "atlas-b2b-super-admin-master-secrets-key-2026";
    private static readonly byte[] Salt = Encoding.UTF8.GetBytes("project-atlas-salt-salt");

    private static byte[] GetDerivedKey()
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(MasterKey, Salt, 10000, HashAlgorithmName.SHA256);
        return pbkdf2.GetBytes(32); // 256 bits
    }

    public static string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return string.Empty;

        using var aes = Aes.Create();
        aes.Key = GetDerivedKey();
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        // Format: ivHex:cipherHex
        return $"{Convert.ToHexString(aes.IV)}:{Convert.ToHexString(cipherBytes)}";
    }

    public static string Decrypt(string cipherPayload)
    {
        if (string.IsNullOrEmpty(cipherPayload)) return string.Empty;
        if (!cipherPayload.Contains(':')) return cipherPayload; // unencrypted plain fallback

        try
        {
            var parts = cipherPayload.Split(':');
            if (parts.Length != 2) return cipherPayload;

            var iv = Convert.FromHexString(parts[0]);
            var cipherBytes = Convert.FromHexString(parts[1]);

            using var aes = Aes.Create();
            aes.Key = GetDerivedKey();
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            return cipherPayload;
        }
    }

    public static string MaskSecret(string? secret)
    {
        if (string.IsNullOrEmpty(secret)) return string.Empty;
        var clean = secret.Trim();
        if (clean.Length <= 8) return "••••••••";

        var prefixLen = Math.Min(4, clean.Length / 4);
        var suffixLen = Math.Min(4, clean.Length / 4);
        var prefix = clean[..prefixLen];
        var suffix = clean[^suffixLen..];
        return $"{prefix}••••••••{suffix}";
    }
}
