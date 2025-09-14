using System.ComponentModel.DataAnnotations;

namespace KanbanBoardApi.Models.Auth;

public class LoginModel
{
    [Required]
    [MaxLength(256)]
    public required string UserName { get; set; }

    [Required]
    [MaxLength(256)]
    public required string Password { get; set; }
}
