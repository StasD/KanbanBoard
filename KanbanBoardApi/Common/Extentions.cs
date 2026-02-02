using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace KanbanBoardApi.Common;

public static class Extensions
{
    public static string GetDisplayName(this Enum value)
        => value.GetType().GetField(value.ToString())?
            .GetCustomAttribute<DisplayAttribute>()?.Name ?? value.ToString();
}
