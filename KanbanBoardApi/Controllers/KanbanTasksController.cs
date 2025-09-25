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
}
