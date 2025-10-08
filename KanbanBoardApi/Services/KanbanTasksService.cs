using System.Linq.Expressions;
using KanbanBoardApi.Data;
using KanbanBoardApi.Entities;
using KanbanBoardApi.Models.KanbanTasks;
using LinqKit;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Services;

public class KanbanTasksService(ApplicationDbContext db)
{
    public static readonly Expression<Func<KanbanTask, KanbanTaskModel>> KanbanTaskMapping =
        kt => new KanbanTaskModel
        {
            Id = kt.Id,
            Title = kt.Title,
            Description = kt.Description,
            Priority = kt.Priority,
            Status = kt.Status,
            AssignedAt = kt.AssignedAt,
            CreatedAt = kt.CreatedAt,
            UpdatedAt = kt.UpdatedAt,
            AssignedUserId = kt.AssignedUserId,
            CreatedByUserId = kt.CreatedByUserId,
            UpdatedByUserId = kt.UpdatedByUserId,
            AssignedUser = kt.AssignedUser == null ? null : UsersService.UserMapping.Invoke(kt.AssignedUser),
            CreatedByUser = kt.CreatedByUser == null ? null : UsersService.UserMapping.Invoke(kt.CreatedByUser),
            UpdatedByUser = kt.UpdatedByUser == null ? null : UsersService.UserMapping.Invoke(kt.UpdatedByUser)
        };

    public IQueryable<KanbanTask> GetAllKanbanTasksQuery() =>
        db.KanbanTasks.AsExpandable();

    public IQueryable<KanbanTask> GetKanbanTaskByIdQuery(int id) =>
        GetAllKanbanTasksQuery().Where(kt => kt.Id == id);

    public Task<KanbanTaskModel?> GetKanbanTaskById(int id) =>
        GetKanbanTaskByIdQuery(id).Select(KanbanTaskMapping).FirstOrDefaultAsync();

    public IQueryable<KanbanTask> GetKanbanTasksByStatusQuery(KanbanTaskStatus status) =>
        GetAllKanbanTasksQuery().Where(kt => kt.Status == status);

    public IQueryable<KanbanTask> GetKanbanTasksByAssignedUserIdQuery(int assignedUserId) =>
        GetAllKanbanTasksQuery().Where(kt => kt.AssignedUserId == assignedUserId);

    public Task<double?> GetMaxPriority() =>
        GetAllKanbanTasksQuery().MaxAsync(kt => (double?)kt.Priority);
}
