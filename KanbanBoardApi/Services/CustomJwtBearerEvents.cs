using System.Security.Claims;
using KanbanBoardApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Services;

public class CustomJwtBearerEvents(ApplicationDbContext db, UsersService usersService) : JwtBearerEvents
{
    private const string TokenRefreshPath = "/api/Account/refresh";

    public override async Task TokenValidated(TokenValidatedContext context)
    {
        // by now the token expiry date, signature and some other parameters have already been validated, so here we only do additional checks

        if (context.Principal?.Identity is not ClaimsIdentity primaryIdentity)
        {
            context.Fail("Identity is null");
            return;
        }

        if (int.TryParse(primaryIdentity.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) &&
            int.TryParse(primaryIdentity.FindFirst(JwtRegisteredClaimNames.Sid)?.Value, out var sessionId) &&
            primaryIdentity.FindFirst(ClaimTypes.Email)?.Value is string userEmail &&
            primaryIdentity.FindFirst(JwtRegisteredClaimNames.Jti)?.Value is string tokenId)
        {
            var utcNow = DateTime.UtcNow;
            var requestPath = context.Request.Path;

            var sessionInfo = await usersService.GetUserSessionByIdQuery(sessionId)
                .Where(us => us.UserId == userId)
                .Select(us => new { us.AccessTokenId, us.RefreshTokenId, us.SessionExpiryDate, us.User!.Email, us.User!.EmailConfirmed, us.User!.IsDisabled })
                .FirstOrDefaultAsync();

            // check session
            if (sessionInfo is null)
            {
                context.Fail("Session does not exist");
                return;
            }

            if (sessionInfo.SessionExpiryDate is not null && sessionInfo.SessionExpiryDate <= utcNow)
            {
                context.Fail("Session expired");
                return;
            }

            if (!((requestPath != TokenRefreshPath && sessionInfo.AccessTokenId == tokenId) ||
                (requestPath == TokenRefreshPath && sessionInfo.RefreshTokenId == tokenId)))
            {
                context.Fail("Token expired or not valid in this context");
                return;
            }

            // check user
            if (sessionInfo.IsDisabled || sessionInfo.Email != userEmail || !sessionInfo.EmailConfirmed)
            {
                context.Fail("User cannot log in");
                return;
            }

            // update user sessions table
            await db.UserSessions
                .Where(us => us.Id == sessionId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(us => us.Requests, us => (us.Requests ?? 0) + 1)
                    .SetProperty(us => us.LastRequestDate, us => (us.LastRequestDate == null || us.LastRequestDate < utcNow) ? utcNow : us.LastRequestDate));
        }
        else
        {
            context.Fail("Invalid token data");
            return;
        }

        return;
    }
}
