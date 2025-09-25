using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using KanbanBoardApi.Entities;
using KanbanBoardApi.Models.Users;

namespace KanbanBoardApi.Models.KanbanTasks;

// in input models, fields declared nullable but with [Required] attribute so that passing json with a missing string field resulted in meaningful 400 error returned to the client, and also did not result in using default values e.g. 0.

public record KanbanTaskInputModel
{
    [Required]
    public string? Title { get; init; }

    [Required]
    public string? Description { get; init; }

    [Required]
    [EnumDataType(typeof(KanbanTaskStatus))]
    public KanbanTaskStatus? Status { get; init; }

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
