using KanbanBoardApi.Models.Users;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Controllers;

[AllowAnonymous]
// [Authorize(Policy="AdminPolicy")]
[ApiController]
[Route("api/[controller]")]
public class UsersController(UsersService usersService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IEnumerable<UserModel>>(StatusCodes.Status200OK, "application/json")]
    public async Task<Ok<IEnumerable<UserModel>>> GetUsers() =>
        TypedResults.Ok<IEnumerable<UserModel>>(await usersService.GetAllUsersQuery().OrderBy(u => u.Id).Select(UsersService.UserMapping).ToListAsync());
}
