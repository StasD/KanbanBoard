namespace KanbanBoardApi.Models.Users;

public record UserModel
{
    public int Id { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string PhotoUrl { get; init; }
}
