using KanbanBoardApi.Models.KanbanTasks;

namespace KanbanBoardApi.Messages.KanbanTaskChanged;

public enum KanbanTaskChangeTypeEnum
{
    KanbanTaskCreated,
    KanbanTaskModified,
    KanbanTaskDeleted
}

public record KanbanTaskChangedMessage
{
    public int Id { get; init; }
    public required KanbanTaskChangeTypeEnum ChangeType { get; init; }
    public KanbanTaskModel? NewKanbanTask { get; init; }
    public KanbanTaskModel? OldKanbanTask { get; init; }
}
