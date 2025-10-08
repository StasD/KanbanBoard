using KanbanBoardApi.Common;
using KanbanBoardApi.Data;
using KanbanBoardApi.Entities;
using KanbanBoardApi.Models.KanbanTasks;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Controllers;

[AllowAnonymous]
// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class KanbanTasksController(UserManager<ApplicationUser> userManager, ApplicationDbContext db, KanbanTasksService kanbanTasksService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IEnumerable<KanbanTaskModel>>(StatusCodes.Status200OK, "application/json")]
    public async Task<Ok<IEnumerable<KanbanTaskModel>>> GetKanbanTasks() =>
        TypedResults.Ok<IEnumerable<KanbanTaskModel>>(await kanbanTasksService.GetAllKanbanTasksQuery().Select(KanbanTasksService.KanbanTaskMapping).ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType<KanbanTaskModel>(StatusCodes.Status200OK, "application/json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<Results<Ok<KanbanTaskModel>, ValidationProblem, ProblemHttpResult>> GetKanbanTask(int id)
    {
        var kanbanTaskModel = await kanbanTasksService.GetKanbanTaskById(id);

        return kanbanTaskModel == null
            ? HelperFunctions.NotFound("Error Returning Task", $"Task with Id {id} does not exist.")
            : TypedResults.Ok(kanbanTaskModel);
    }

    [HttpPost]
    [ProducesResponseType<KanbanTaskModel>(StatusCodes.Status201Created, "application/json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
    public async Task<Results<Created<KanbanTaskModel>, ValidationProblem, ProblemHttpResult>> CreateKanbanTask(KanbanTaskInputModel kanbanTaskModel)
    {
        var loggedInUserId = (await userManager.GetUserAsync(User))?.Id;
        var now = DateTime.UtcNow;

        var newKanbanTask = new KanbanTask
        {
            Title = kanbanTaskModel.Title!,
            Description = kanbanTaskModel.Description!,
            Status = (KanbanTaskStatus)kanbanTaskModel.Status!,
            AssignedUserId = kanbanTaskModel.AssignedUserId,
            AssignedAt = kanbanTaskModel.AssignedUserId == null ? null : now,
            CreatedByUserId = loggedInUserId,
            CreatedAt = now,
            UpdatedByUserId = loggedInUserId,
            UpdatedAt = now,
        };

        using var tran = await db.Database.BeginTransactionAsync();

        try
        {
            var maxPriority = await kanbanTasksService.GetMaxPriority() ?? 0.0d;
            newKanbanTask.Priority = maxPriority + 1.0d;
            await db.AddAsync(newKanbanTask);
            await db.SaveChangesAsync();
            await tran.CommitAsync();
        }
        catch (Exception)
        {
            await tran.RollbackAsync();
            return HelperFunctions.InternalServerError("Error Creating Task", "Task could not be created.");
        }

        // newKanbanTask should now have Id field set to the Id of the newly created record
        return TypedResults.Created($"/api/KanbanTasks/{newKanbanTask.Id}", await kanbanTasksService.GetKanbanTaskById(newKanbanTask.Id));
    }

    [HttpPut("{id}")]
    [ProducesResponseType<KanbanTaskModel>(StatusCodes.Status200OK, "application/json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<Results<Ok<KanbanTaskModel>, ValidationProblem, ProblemHttpResult>> UpdateKanbanTask(int id, KanbanTaskInputModel kanbanTaskModel)
    {
        var loggedInUserId = (await userManager.GetUserAsync(User))?.Id;

        var kanbanTask = await kanbanTasksService.GetKanbanTaskByIdQuery(id).FirstOrDefaultAsync();

        if (kanbanTask == null)
            return HelperFunctions.NotFound("Error Updating Task", $"Task with Id {id} does not exist.");

        var now = DateTime.UtcNow;

        kanbanTask.Title = kanbanTaskModel.Title!;
        kanbanTask.Description = kanbanTaskModel.Description!;
        kanbanTask.Status = (KanbanTaskStatus)kanbanTaskModel.Status!;

        if (kanbanTask.AssignedUserId != kanbanTaskModel.AssignedUserId)
        {
            kanbanTask.AssignedUserId = kanbanTaskModel.AssignedUserId;
            kanbanTask.AssignedAt = kanbanTaskModel.AssignedUserId == null ? null : now;
        }

        kanbanTask.UpdatedByUserId = loggedInUserId;
        kanbanTask.UpdatedAt = now;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception)
        {
            return HelperFunctions.InternalServerError("Error Updating Task", "Task could not be updated.");
        }

        return TypedResults.Ok(await kanbanTasksService.GetKanbanTaskById(kanbanTask.Id));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<Results<NoContent, ValidationProblem, ProblemHttpResult>> DeleteKanbanTask(int id)
    {
        var kanbanTask = await kanbanTasksService.GetKanbanTaskByIdQuery(id)
            .Select(kt => new { kt.Id })
            .FirstOrDefaultAsync();

        if (kanbanTask == null)
            return HelperFunctions.NotFound("Error Deleting Task", $"Task with Id {id} does not exist.");

        try
        {
            await db.KanbanTasks.Where(kt => kt.Id == id).ExecuteDeleteAsync();
        }
        catch (Exception)
        {
            return HelperFunctions.InternalServerError("Error Deleting Task", "Task could not be deleted.");
        }

        return TypedResults.NoContent();
    }

    [HttpPost("{id}/UpdateLocation")]
    [ProducesResponseType<KanbanTaskModel>(StatusCodes.Status200OK, "application/json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<Results<Ok<KanbanTaskModel>, ValidationProblem, ProblemHttpResult>> UpdateKanbanTaskLocation(int id, KanbanTaskStatus newStatus, int idAfter, int idBefore)
    {
        const string errorTitle = "Error Updating Task";

        if (idAfter == id || idBefore == id)
            return HelperFunctions.BadRequest(errorTitle, "New location is the same as the previous one.");

        var loggedInUserId = (await userManager.GetUserAsync(User))?.Id;

        var kanbanTask = await kanbanTasksService.GetKanbanTaskByIdQuery(id).FirstOrDefaultAsync();

        if (kanbanTask == null)
            return HelperFunctions.NotFound(errorTitle, $"Task with Id {id} does not exist.");

        // get all tasks with NewStatus
        var newStatusTasks = await kanbanTasksService.GetKanbanTasksByStatusQuery(newStatus)
            .Select(kt => new { kt.Id, kt.Priority })
            .OrderBy(kt => kt.Priority)
            .ToListAsync();

        int findPos(int _id) => _id == 0 ? -1 : newStatusTasks.FindIndex((kt) => kt.Id == _id);

        var posTaskAfter = findPos(idAfter);
        var posTaskBefore = findPos(idBefore);

        if (
            (idAfter > 0 && posTaskAfter == -1) || // TaskAfter is not in the list
            (idBefore > 0 && posTaskBefore == -1) || // TaskBefore is not in the list
            (idAfter == 0 && idBefore > 0 && posTaskBefore != 0) || // TaskBefore is not the first one in the list
            (idBefore == 0 && idAfter > 0 && posTaskAfter != newStatusTasks.Count - 1) || // TaskAfter is not the last one in the list
            (idAfter > 0 && idBefore > 0 && posTaskBefore != posTaskAfter + 1) // TaskBefore does not immediately follow TaskAfter
        )
            return HelperFunctions.Problem(StatusCodes.Status409Conflict, errorTitle, "The state of the database changed. Please refresh the page.") ; // returning 409 error instead of 400, assuming the data has changed since the client saw it, not that they deliberately sent wrong data.

        var taskAfter = posTaskAfter == -1 ? null : newStatusTasks[posTaskAfter];
        var taskBefore = posTaskBefore == -1 ? null : newStatusTasks[posTaskBefore];

        // calculate new priority
        double newPriority =
            taskBefore == null
                ? (taskAfter?.Priority ?? 0) + 10
                : taskBefore.Priority - (taskBefore.Priority - (taskAfter?.Priority ?? 0)) * 0.1;

        var now = DateTime.UtcNow;

        kanbanTask.Status = newStatus;
        kanbanTask.Priority = newPriority;
        kanbanTask.UpdatedByUserId = loggedInUserId;
        kanbanTask.UpdatedAt = now;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception)
        {
            return HelperFunctions.InternalServerError(errorTitle, "Task could not be updated.");
        }

        return TypedResults.Ok(await kanbanTasksService.GetKanbanTaskById(kanbanTask.Id));
    }
}
