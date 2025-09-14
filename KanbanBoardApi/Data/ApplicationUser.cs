using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace KanbanBoardApi.Data;

public class ApplicationUser : IdentityUser<int>
{
    [MaxLength(50)]
    public required string FirstName { get; set; }

    [MaxLength(50)]
    public required string LastName { get; set; }
}
