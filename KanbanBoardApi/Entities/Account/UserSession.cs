using System.ComponentModel.DataAnnotations;
using KanbanBoardApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Entities.Account;

public class UserSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? UserAgentId { get; set; }

    public DateTime LoginDate { get; set; }
    public DateTime? SessionExpiryDate { get; set; }

    [Required]
    [MaxLength(64)]
    public string? RefreshTokenId { get; set; }

    [Required]
    [MaxLength(64)]
    public string? AccessTokenId { get; set; }

    public DateTime RefreshTokenIssueDate { get; set; }
    public DateTime AccessTokenIssueDate { get; set; }

    public int? Requests { get; set; }
    public DateTime? LastRequestDate { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? User { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public UserAgent? UserAgent { get; set; }
}
