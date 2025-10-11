using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using KanbanBoardApi.Entities;
using KanbanBoardApi.Models.Users;
using KanbanBoardApi.ModelValidations;

namespace KanbanBoardApi.Models.KanbanTasks;

public record KanbanTaskInputModel
{
    [Required]
    [MinLength(5, ErrorMessage = "Title cannot be less than 5 characters long.")]
    [MaxLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
    public string? Title { get; init; }

    [Required]
    [MinLength(5, ErrorMessage = "Description cannot be less than 5 characters long.")]
    [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; init; }

    [Required]
    [EnumDataType(typeof(KanbanTaskStatus))]
    public KanbanTaskStatus? Status { get; init; }

    [IsValidUserId]
    [Display(Name = "Assigned User Id")]
    public int? AssignedUserId { get; init; }
}

public record KanbanTaskModel
{
    public int Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public KanbanTaskStatus Status { get; init; }
    public double Priority { get; init; }

    public DateTime? AssignedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public int? AssignedUserId { get; init; }
    public int? CreatedByUserId { get; init; }
    public int? UpdatedByUserId { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserModel? AssignedUser { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserModel? CreatedByUser { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserModel? UpdatedByUser { get; init; }
}

public record IdPriority
{
    public int Id { get; init; }
    public double Priority { get; init; }
}
