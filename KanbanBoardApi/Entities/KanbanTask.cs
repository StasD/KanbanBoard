using System.ComponentModel.DataAnnotations;
using KanbanBoardApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Entities;

public enum KanbanTaskStatus
{
    None = 0,
    ToDo,
    InProgress,
    Done
}

public class KanbanTask
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Title { get; set; } = "";

    [MaxLength(2000)]
    public string Description { get; set; } = "";

    public KanbanTaskStatus Status { get; set; }
    public double Priority { get; set; }

    public DateTime? AssignedAt { get; set; }
    public int? AssignedUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedByUserId { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int? UpdatedByUserId { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? AssignedUser { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? CreatedByUser { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public ApplicationUser? UpdatedByUser { get; set; }
}
