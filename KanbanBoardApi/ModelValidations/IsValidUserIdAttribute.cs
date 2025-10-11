using System.ComponentModel.DataAnnotations;
using KanbanBoardApi.Services;

namespace KanbanBoardApi.ModelValidations;

public class IsValidUserIdAttribute() : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var usersService = validationContext.GetService<UsersService>();

        if (value is int userId && (
            userId <= 0 ||
            usersService?.GetUserByIdQuery(userId).Select(u => new { u.Id }).FirstOrDefault() == null // can't use Async() here...
        ))
            return new ValidationResult(ErrorMessage ?? $"The field {validationContext.DisplayName} is invalid.");

        return ValidationResult.Success;
    }
}
