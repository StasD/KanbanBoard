using KanbanBoardApi.Data;
using LinqKit;
using Microsoft.EntityFrameworkCore;
using KanbanBoardApi.Entities.Account;
using KanbanBoardApi.Common;

namespace KanbanBoardApi.Services;

public class UserAgentService(ApplicationDbContext db)
{
    public IQueryable<UserAgent> GetAllUserAgentsQuery() =>
        db.UserAgents.AsExpandable();

    public IQueryable<UserAgent> GetUserAgentByIdQuery(int id) =>
        GetAllUserAgentsQuery().Where(ua => ua.Id == id);

    public IQueryable<UserAgent> GetUserAgentByHashQuery(string userAgentHash) =>
        GetAllUserAgentsQuery().Where(ua => ua.UserAgentHash == userAgentHash);

    public async Task<int?> GetUserAgentId(string? userAgentString)
    {
        if (string.IsNullOrEmpty(userAgentString)) return null;

        var userAgentHash = HelperFunctions.GetSHA256Hash(userAgentString);

        var userAgent = await GetUserAgentByHashQuery(userAgentHash).Select(ua => new { ua.Id }).FirstOrDefaultAsync();

        if (userAgent is not null)
        {
            return userAgent.Id;
        }

        using var tran = await db.Database.BeginTransactionAsync();
 
        try
        {
            await db.Database.ExecuteSqlRawAsync("LOCK TABLE user_agents IN ACCESS EXCLUSIVE MODE");

            userAgent = await GetUserAgentByHashQuery(userAgentHash).Select(ua => new { ua.Id }).FirstOrDefaultAsync();

            if (userAgent is not null)
            {
                return userAgent.Id;
            }

            var newUserAgent = new UserAgent { UserAgentHash = userAgentHash, UserAgentString = userAgentString, CreatedAt = DateTime.UtcNow };

            await db.AddAsync(newUserAgent);
            await db.SaveChangesAsync();
            await tran.CommitAsync();

            return newUserAgent.Id;
        }
        catch (Exception)
        {
            await tran.RollbackAsync();
        }

        return null;
    }
}
