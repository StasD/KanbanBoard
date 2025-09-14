namespace KanbanBoardApi.Models.Common;

public class CorsSettings
{
    public required string AllowedOrigins { get; set; }
    public required string ExposedHeaders { get; set; }
}
