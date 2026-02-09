using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;

namespace KanbanBoardApi.Common;

public static class Extensions
{
    public static string GetDisplayName(this Enum value)
        => value.GetType().GetField(value.ToString())?
            .GetCustomAttribute<DisplayAttribute>()?.Name ?? value.ToString();

    public static bool IsSignedByCaCert(this X509Certificate? certificate, X509Certificate2 caCert)
    {
        if (certificate is not X509Certificate2 cert || cert.Issuer != caCert.Subject)
            return false;

        using var chain = new X509Chain();

        chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
        chain.ChainPolicy.VerificationFlags = X509VerificationFlags.AllowUnknownCertificateAuthority;
        chain.ChainPolicy.ExtraStore.Add(caCert);

        var chainBuilt = chain.Build(cert);

        return chainBuilt &&
            chain.ChainElements.Count == 2 &&
            chain.ChainElements[^1].Certificate.Thumbprint == caCert.Thumbprint;
    }
}
