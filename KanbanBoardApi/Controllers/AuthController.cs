using KanbanBoardApi.Models;
using KanbanBoardApi.Models.Auth;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanbanBoardApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(JwtTokenGenerator jwtTokenGenerator) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        // ... authenticate user ...
        // if (userAuthenticated)
        // {
        //     var token = jwtTokenGenerator.GenerateToken(user.Id, user.Username, user.Role);
        //     return Ok(new { AccessToken = token });
        // }

        return Unauthorized();
    }
}
