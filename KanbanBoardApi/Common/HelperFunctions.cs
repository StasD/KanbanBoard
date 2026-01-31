using System.Diagnostics;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace KanbanBoardApi.Common;

public enum StringEncoding
{
    Hex,
    Base64,
    Base64Url,
}

public static class HelperFunctions
{
    private static string[]? hexLookup = null;

    public static string ByteArrayToHexString(byte[] ba)
    {
        if (hexLookup == null)
        {
            hexLookup = new string[256];

            for (int i = 0; i < 256; i++)
            {
                hexLookup[i] = i.ToString("X2");
            }
        }

        var sb = new StringBuilder(ba.Length * 2);

        foreach (byte b in ba)
        {
            sb.Append(hexLookup[b]);
        }

        return sb.ToString();
    }

    public static byte[] GetUtf8Bytes(string s) => new UTF8Encoding(false).GetBytes(s);

    public static byte[] GetSHA256HashBytes(string s) => SHA256.HashData(GetUtf8Bytes(s));

    public static string GetSHA256Hash(string message, StringEncoding encodeWith = StringEncoding.Base64Url)
    {
        byte[] data = GetSHA256HashBytes(message);

        return encodeWith switch
        {
            StringEncoding.Hex => ByteArrayToHexString(data),
            StringEncoding.Base64 => Convert.ToBase64String(data),
            StringEncoding.Base64Url => WebEncoders.Base64UrlEncode(data),
            _ => string.Empty,
        };
    }

    public static ProblemHttpResult NotFound(string title, string detail) =>
        Problem(StatusCodes.Status404NotFound, title, detail);

    public static ProblemHttpResult BadRequest(string title, string detail) =>
        Problem(StatusCodes.Status400BadRequest, title, detail);

    public static ProblemHttpResult InternalServerError(string title, string detail) =>
        Problem(StatusCodes.Status500InternalServerError, title, detail);

    public static ProblemHttpResult Problem(int statusCode, string title, string detail) =>
        TypedResults.Problem(detail, null, statusCode, title);

    public static ValidationProblem ValidationProblem(IDictionary<string, string[]> errors, string title, string detail) =>
        TypedResults.ValidationProblem(errors, detail, null, title);

    public static ValidationProblem CreateValidationProblem(string errorCode, string errorDescription) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]> {
            { errorCode, [errorDescription] }
        });

    public static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        Debug.Assert(!result.Succeeded);

        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }

    public static string GenerateJwtTokenAsync(int userId, string userEmail, string tokenId, int sessionId, DateTime now, string key, string issuer, string audience, int expireMinutes)
    {
        var securityKey = new SymmetricSecurityKey(GetUtf8Bytes(key));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        List<Claim> claims =
        [
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, userEmail),
            new(JwtRegisteredClaimNames.Jti, tokenId),
            new(JwtRegisteredClaimNames.Sid, sessionId.ToString()),
        ];

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer,
            Audience = audience,
            IssuedAt = now,
            NotBefore = now,
            Expires = now.AddMinutes(expireMinutes),
            Subject = new ClaimsIdentity(claims),
            SigningCredentials = signingCredentials
        };

        return new JsonWebTokenHandler().CreateToken(tokenDescriptor);
    }
}
