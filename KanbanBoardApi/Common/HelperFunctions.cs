using Microsoft.AspNetCore.Http.HttpResults;

namespace KanbanBoardApi.Common;

public static class HelperFunctions
{
    public static ProblemHttpResult NotFound(string title, string detail) =>
        Problem(StatusCodes.Status404NotFound, title, detail);

    public static ProblemHttpResult BadRequest(string title, string detail) =>
        Problem(StatusCodes.Status400BadRequest, title, detail);

    public static ProblemHttpResult InternalServerError(string title, string detail) =>
        Problem(StatusCodes.Status500InternalServerError, title, detail);

    public static ProblemHttpResult Problem(int statusCode, string title, string detail) =>
        TypedResults.Problem(detail, null, statusCode, title);

    public static ValidationProblem ValidationProblem(IEnumerable<KeyValuePair<string, string[]>> errors, string title, string detail) =>
        TypedResults.ValidationProblem(errors, detail, null, title);
}
