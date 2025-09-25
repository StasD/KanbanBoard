namespace KanbanBoardApi.Models.Common;

public class EmailSenderOptions
{
    public required string Host { get; set; }
    public int Port { get; set; }
    public required string FromEmail { get; set; }
    public required string FromName { get; set; }
}
