using System.ComponentModel.DataAnnotations;

namespace KanbanBoardApi.Models.Account;

public record EmailInputModel
{
    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    public string? Email { get; init; }
}

public record ResendConfirmationEmailInputModel : EmailInputModel
{
}

public record ForgotPasswordInputModel : EmailInputModel
{
}

public record EmailAndPasswordInputModel : EmailInputModel
{
    [Required]
    [StringLength(50, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [Display(Name = "Password")]
    public string? Password { get; init; }
}

public record LoginInputModel : EmailAndPasswordInputModel
{
}

public record RegisterInputModel : EmailAndPasswordInputModel
{
    [Required]
    [StringLength(50, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [Display(Name = "First Name")]
    public string? FirstName { get; init; }

    [Required]
    [StringLength(50, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [Display(Name = "Last Name")]
    public string? LastName { get; init; }
}

public record ResetPasswordInputModel : EmailAndPasswordInputModel
{
    [Required]
    [Display(Name = "Reset Code")]
    public string? ResetCode { get; init; }
}
