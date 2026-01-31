using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Entities.Account;

[Index(nameof(UserAgentHash), IsUnique = true)]
public class UserAgent
{
    public int Id { get; set; }

    [Required]
    [MaxLength(64)]
    public string? UserAgentHash { get; set; }

    [Required]
    public string? UserAgentString { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<UserSession> UserSessions { get; } = [];
}
