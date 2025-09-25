using System.Linq.Expressions;
using KanbanBoardApi.Data;
using KanbanBoardApi.Models.Users;
using LinqKit;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Services;

public class UsersService(ApplicationDbContext db)
{
    public static readonly Expression<Func<ApplicationUser, UserModel>> UserMapping =
        u => new UserModel
        {
            Id = u.Id,
            Email = u.Email!,
            FirstName = u.FirstName,
            LastName = u.LastName,
            PhotoUrl = u.PhotoUrl,
        };

    public IQueryable<ApplicationUser> GetAllUsersQuery() =>
        db.Users.AsExpandable();

    public IQueryable<ApplicationUser> GetUserByIdQuery(int id) =>
        GetAllUsersQuery().Where(u => u.Id == id);

    public Task<UserModel?> GetUserById(int id) =>
        GetUserByIdQuery(id).Select(UserMapping).FirstOrDefaultAsync();
}
