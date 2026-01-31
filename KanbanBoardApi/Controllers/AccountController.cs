using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using KanbanBoardApi.Common;
using KanbanBoardApi.Data;
using KanbanBoardApi.Entities.Account;
using KanbanBoardApi.Models.Account;
using KanbanBoardApi.Models.Common;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;

namespace KanbanBoardApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ApplicationDbContext db, UserAgentService userAgentService, IEmailSender emailSender, IOptions<JwtSettings> jwtSettings) : ControllerBase
{
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    private const string confirmEmailEndpointName = "ConfirmEmail";
    private const string resetPasswordEndpointName = "ResetPassword";

    private async Task SendConfirmationEmailAsync(ApplicationUser user, string email, bool isChange = false)
    {
        var code = isChange
            ? await userManager.GenerateChangeEmailTokenAsync(user, email)
            : await userManager.GenerateEmailConfirmationTokenAsync(user);

        code = WebEncoders.Base64UrlEncode(HelperFunctions.GetUtf8Bytes(code));

        var userId = await userManager.GetUserIdAsync(user);

        var routeValues = new RouteValueDictionary()
        {
            ["userId"] = userId,
            ["code"] = code,
        };

        if (isChange)
        {
            // This is validated by the /confirmEmail endpoint on change.
            routeValues.Add("changedEmail", email);
        }

        // !!! THE URL SHOULD POINT TO A NORMAL WEBSITE PAGE, NOT API ENDPOINT !!!
        var confirmEmailUrl = Url.Action(confirmEmailEndpointName, "Account", routeValues, Uri.UriSchemeHttps);

        await emailSender.SendEmailAsync(email, "Confirm your email",
            $"Please confirm your account by <a href=\"{HtmlEncoder.Default.Encode(confirmEmailUrl!)}\">clicking here</a>.");
    }

    private async Task SendPasswordResetCodeAsync(ApplicationUser user, string email)
    {
        var code = await userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(HelperFunctions.GetUtf8Bytes(code));

        var userId = await userManager.GetUserIdAsync(user);

        var routeValues = new RouteValueDictionary()
        {
            ["userId"] = userId,
            ["code"] = code,
        };

        // !!! THE URL SHOULD POINT TO A NORMAL WEBSITE PAGE, NOT API ENDPOINT !!!
        var passwordResetUrl = Url.Action(resetPasswordEndpointName, routeValues);

        await emailSender.SendEmailAsync(email, "Reset password",
            $"To reset your password, <a href=\"{HtmlEncoder.Default.Encode(passwordResetUrl!)}\">click here</a>.");
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<Results<Ok<object>, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> Login(LoginInputModel model)
    {
        var email = model.Email!;
        var user = await userManager.FindByEmailAsync(email);

        if (user == null || !await userManager.IsEmailConfirmedAsync(user))
        {
            return TypedResults.Unauthorized();
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, model.Password!, true);

        if (result.Succeeded)
        {
            var userAgentString = Request.Headers.UserAgent.ToString();
            var userAgentid = await userAgentService.GetUserAgentId(userAgentString);

            // create session record
            var utcNow = DateTime.UtcNow;
            var accessTokenId = Guid.NewGuid().ToString();
            var refreshTokenId = Guid.NewGuid().ToString();

            var userSession = new UserSession { UserId = user.Id, UserAgentId = userAgentid, LoginDate = utcNow, RefreshTokenId = refreshTokenId, RefreshTokenIssueDate = utcNow, AccessTokenId = accessTokenId, AccessTokenIssueDate = utcNow };

            try
            {
                await db.AddAsync(userSession);
                await db.SaveChangesAsync();
            }
            catch (Exception)
            {
                return TypedResults.Unauthorized();
            }

            var userSessionId = userSession.Id;

            var key = _jwtSettings.Key;
            var issuer = _jwtSettings.Issuer;
            var audience = _jwtSettings.Audience;

            var refreshToken = HelperFunctions.GenerateJwtTokenAsync(user.Id, user.Email!, refreshTokenId, userSessionId, utcNow, key, issuer, audience, _jwtSettings.RefreshTokenExpireMinutes);
            var accessToken = HelperFunctions.GenerateJwtTokenAsync(user.Id, user.Email!, accessTokenId, userSessionId, utcNow, key, issuer, audience, _jwtSettings.AccessTokenExpireMinutes);

            return TypedResults.Ok((object) new { userId = user.Id, email = user.Email!, refreshToken, accessToken });
        }

        return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
    }

    [Authorize]
    [HttpPost("refresh")]
    public async Task<Results<Ok<object>, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> Refresh()
    {
        // this endpoint is supposed to be authenticated with refresh token
        // all verification of the token and its claims including necessary db checks have already been done at this point

        if (User?.Identity is not ClaimsIdentity primaryIdentity)
        {
            return TypedResults.Unauthorized();
        }

        if (int.TryParse(primaryIdentity.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) &&
            int.TryParse(primaryIdentity.FindFirst(JwtRegisteredClaimNames.Sid)?.Value, out var sessionId) &&
            primaryIdentity.FindFirst(ClaimTypes.Email)?.Value is string userEmail)
        {
            var utcNow = DateTime.UtcNow;
            var accessTokenId = Guid.NewGuid().ToString();
            var refreshTokenId = Guid.NewGuid().ToString();

            var key = _jwtSettings.Key;
            var issuer = _jwtSettings.Issuer;
            var audience = _jwtSettings.Audience;

            // update session
            try
            {
                var rowsUpdated = await db.UserSessions
                    .Where(us => us.Id == sessionId)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(us => us.RefreshTokenId, refreshTokenId)
                        .SetProperty(us => us.RefreshTokenIssueDate, utcNow)
                        .SetProperty(us => us.AccessTokenId, accessTokenId)
                        .SetProperty(us => us.AccessTokenIssueDate, utcNow));

                if (rowsUpdated != 1)
                {
                    return TypedResults.Unauthorized();
                }
            }
            catch
            {
                return TypedResults.Unauthorized();
            }

            var refreshToken = HelperFunctions.GenerateJwtTokenAsync(userId, userEmail, refreshTokenId, sessionId, utcNow, key, issuer, audience, _jwtSettings.RefreshTokenExpireMinutes);
            var accessToken = HelperFunctions.GenerateJwtTokenAsync(userId, userEmail, accessTokenId, sessionId, utcNow, key, issuer, audience, _jwtSettings.AccessTokenExpireMinutes);

            return TypedResults.Ok((object)new { userId, email = userEmail, refreshToken, accessToken });
        }

        return TypedResults.Unauthorized();
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<Results<Ok, ValidationProblem, ProblemHttpResult>> Register(RegisterInputModel model)
    {
        var email = model.Email!;

        var user = new ApplicationUser { UserName = email, Email = email, FirstName = model.FirstName!, LastName = model.LastName! };
        var result = await userManager.CreateAsync(user, model.Password!);

        if (!result.Succeeded)
        {
            return HelperFunctions.CreateValidationProblem(result);
        }

        await SendConfirmationEmailAsync(user, email);
        return TypedResults.Ok();
    }

    [AllowAnonymous]
    [HttpGet("confirmEmail")]
    public async Task<Results<Ok, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> ConfirmEmail([FromQuery] string userId, [FromQuery] string code, [FromQuery] string? changedEmail)
    {
        if (await userManager.FindByIdAsync(userId) is not { } user)
        {
            return TypedResults.Unauthorized();
        }

        try
        {
            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        }
        catch (FormatException)
        {
            return TypedResults.Unauthorized();
        }

        IdentityResult result;

        if (string.IsNullOrEmpty(changedEmail))
        {
            result = await userManager.ConfirmEmailAsync(user, code);
        }
        else
        {
            // As with Identity UI, email and user name are one and the same.
            // So when we update the email, we need to update the user name.
            // !!! THESE SHOULD BE IN A TRANSACTION !!!
            result = await userManager.ChangeEmailAsync(user, changedEmail, code);

            if (result.Succeeded)
            {
                result = await userManager.SetUserNameAsync(user, changedEmail);
            }
        }

        if (!result.Succeeded)
        {
            return TypedResults.Unauthorized();
        }

        // !!! MIGHT NEED TO REDIRECT TO THE ROOT OF THE WEBSITE OR RETURN SOME TEXT !!!
        // return TypedResults.Text("Thank you for confirming your email."); // add ContentHttpResult to Results
        return TypedResults.Ok();
    }

    [AllowAnonymous]
    [HttpPost("resendConfirmationEmail")]
    public async Task<Results<Ok, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> ResendConfirmationEmail(ResendConfirmationEmailInputModel model)
    {
        var email = model.Email!;
        var user = await userManager.FindByEmailAsync(email);

        if (user != null)
        {
            await SendConfirmationEmailAsync(user, email);
        }

        return TypedResults.Ok();
    }

    [AllowAnonymous]
    [HttpPost("forgotPassword")]
    public async Task<Results<Ok, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> ForgotPassword(ForgotPasswordInputModel model)
    {
        var email = model.Email!;
        var user = await userManager.FindByEmailAsync(email);

        if (user != null && await userManager.IsEmailConfirmedAsync(user))
        {
            await SendPasswordResetCodeAsync(user, email);
        }

        // Don't reveal that the user does not exist or is not confirmed
        return TypedResults.Ok();
    }

    [AllowAnonymous]
    [HttpPost("resetPassword")]
    public async Task<Results<Ok, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> ResetPassword(ResetPasswordInputModel model)
    {
        var email = model.Email!;
        var user = await userManager.FindByEmailAsync(email);

        IdentityResult result;

        if (user == null || !await userManager.IsEmailConfirmedAsync(user))
        {
            // Don't reveal that the user does not exist or is not confirmed, so don't return a 200 if we would have
            // returned a 400 for an invalid code given a valid user email.
            result = IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken());
            return HelperFunctions.CreateValidationProblem(result);
        }

        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.ResetCode!));
            result = await userManager.ResetPasswordAsync(user, code, model.Password!);
        }
        catch (FormatException)
        {
            result = IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken());
        }

        if (!result.Succeeded)
        {
            return HelperFunctions.CreateValidationProblem(result);
        }

        return TypedResults.Ok();
    }
}
