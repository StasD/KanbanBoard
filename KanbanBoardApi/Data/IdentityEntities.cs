using System.ComponentModel.DataAnnotations;
using KanbanBoardApi.Entities;
using KanbanBoardApi.Entities.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Data;

public class ApplicationUser : IdentityUser<int>
{
    [PersonalData]
    [MaxLength(50)]
    public string FirstName { get; set; } = "";

    [PersonalData]
    [MaxLength(50)]
    public string LastName { get; set; } = "";

    [PersonalData]
    [MaxLength(256)]
    public string PhotoUrl { get; set; } = "";

    public bool IsDisabled { get; set; }

    public ICollection<ApplicationUserToken> Tokens { get; } = [];
    public ICollection<ApplicationUserLogin> Logins { get; } = [];
    public ICollection<ApplicationUserClaim> Claims { get; } = [];

    public ICollection<KanbanTask> AssignedToTasks { get; } = [];
    public ICollection<KanbanTask> CreatedByTasks { get; } = [];
    public ICollection<KanbanTask> UpdatedByTasks { get; } = [];

    public ICollection<UserSession> UserSessions { get; } = [];
}

public class ApplicationUserToken : IdentityUserToken<int>
{
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? User { get; set; }
}

public class ApplicationUserLogin : IdentityUserLogin<int>
{
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? User { get; set; }
}

public class ApplicationUserClaim : IdentityUserClaim<int>
{
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? User { get; set; }
}
