using System.Text.Encodings.Web;
using KanbanBoardApi.Common;
using KanbanBoardApi.Models.KanbanTasks;
using KanbanBoardApi.Models.Users;
using Microsoft.AspNetCore.Identity.UI.Services;
using Rebus.Handlers;

namespace KanbanBoardApi.Messages.KanbanTaskChanged;

public enum NotificationTypeEnum
{
    NewKanbanTaskAssigned,
    KanbanTaskAssigned,
    KanbanTaskReassigned,
    KanbanTaskChanged,
    KanbanTaskDeleted,
}

public class SendNotificationsOnKanbanTaskChangedHandler(IEmailSender emailSender) : IHandleMessages<KanbanTaskChangedMessage>
{
    private static string CreateSubject(int id, NotificationTypeEnum notificationType)
        => notificationType switch
        {
            NotificationTypeEnum.NewKanbanTaskAssigned => $"New Kanban Task (Id: {id}) has been assigned to you.",
            NotificationTypeEnum.KanbanTaskAssigned => $"Kanban Task (Id: {id}) has been assigned to you.",
            NotificationTypeEnum.KanbanTaskReassigned => $"Kanban Task (Id: {id}) has been reassigned.",
            NotificationTypeEnum.KanbanTaskChanged => $"Kanban Task (Id: {id}) has changed.",
            NotificationTypeEnum.KanbanTaskDeleted => $"Kanban Task (Id: {id}) has been deleted.",
            _ => string.Empty,
        };

    private static string CreateIntroduction(NotificationTypeEnum notificationType)
        => notificationType switch
        {
            NotificationTypeEnum.NewKanbanTaskAssigned => $"New Kanban Task has been assigned to you:",
            NotificationTypeEnum.KanbanTaskAssigned => $"Kanban Task has been assigned to you:",
            NotificationTypeEnum.KanbanTaskReassigned => $"Kanban Task is no longer assigned to you:",
            NotificationTypeEnum.KanbanTaskChanged => $"Your assigned Kanban Task has changed:",
            NotificationTypeEnum.KanbanTaskDeleted => $"Kanban Task which was assigned to you has been deleted:",
            _ => string.Empty,
        };

    private static string AddRow(string title, string? value, string? oldValue)
        => $"""

                <tr>
                    <td class="kb-td kb-nowrap kb-semibold">{HtmlEncoder.Default.Encode(title.Trim())}:</td>
                    <td class="kb-td">{(string.IsNullOrWhiteSpace(oldValue) ? "" : @"<span class=""kb-line-through"">" + HtmlEncoder.Default.Encode(oldValue.Trim()) + @"</span>")}{((string.IsNullOrWhiteSpace(oldValue) || string.IsNullOrWhiteSpace(value)) ? "" : "<br>")}{(string.IsNullOrWhiteSpace(value) ? "" : @"<span>" + HtmlEncoder.Default.Encode(value.Trim()) + @"</span>")}</td>
                </tr>
            """;

    private static string CreateTaskDetails(KanbanTaskModel? kanbanTask, KanbanTaskModel? oldKanbanTask)
    {
        var taskDetails = AddRow("Task Id", kanbanTask?.Id.ToString(), kanbanTask != null ? null : oldKanbanTask?.Id.ToString());

        taskDetails += AddRow("Title", kanbanTask?.Title, (oldKanbanTask == null || oldKanbanTask.Title == kanbanTask?.Title) ? null : oldKanbanTask.Title);

        taskDetails += AddRow("Description", kanbanTask?.Description, (oldKanbanTask == null || oldKanbanTask.Description == kanbanTask?.Description) ? null : oldKanbanTask.Description);

        taskDetails += AddRow("Status", kanbanTask?.Status.GetDisplayName(), (oldKanbanTask == null || oldKanbanTask.Status == kanbanTask?.Status) ? null : oldKanbanTask.Status.GetDisplayName());

        taskDetails += AddRow("Assigned To", kanbanTask?.AssignedUser?.GetNameWithEmail(), (oldKanbanTask == null || oldKanbanTask.AssignedUserId == kanbanTask?.AssignedUserId) ? null : oldKanbanTask.AssignedUser?.GetNameWithEmail());

        return taskDetails;
    }

    private static string CreateText(UserModel recipient, NotificationTypeEnum notificationType, KanbanTaskModel? kanbanTask, KanbanTaskModel? oldKanbanTask)
    {
        var text = $$"""
        <style>
            .kb-table {
                border-collapse: collapse; border: 0;
            }
            .kb-semibold {
                font-weight: 600;
            }
            .kb-my-16px {
                margin: 16px 0;
            }
            .kb-nowrap {
                text-wrap: nowrap;
            }
            .kb-line-through {
               text-decoration-line: line-through;
            }
            .kb-email {
                max-width: 600px; font-family: Arial, Verdana, sans-serif; font-size: 14px; line-height: 1.5;
            }
            .kb-td {
                padding: 4px 8px 4px 0; vertical-align: top;
            }
        </style>
        <div class="kb-email">
            <p>Hi {{HtmlEncoder.Default.Encode(recipient.GetName().Trim())}},</p>
            <p class="kb-my-16px">{{CreateIntroduction(notificationType)}}</p>
            <table class="kb-table kb-my-16px">
            <tbody>{{CreateTaskDetails(kanbanTask, oldKanbanTask)}}
            </tbody>
            </table>
            <p class="kb-my-16px">Regards,<br>Kanban Board Team</p>
        </div>
        """;

        return text;
    }

    public async Task Handle(KanbanTaskChangedMessage msg)
    {
        var newKanbanTask = msg.NewKanbanTask;
        var oldKanbanTask = msg.OldKanbanTask;

        UserModel? assignedUser = null;
        NotificationTypeEnum? assignedUserNotificationType;
        string? assignedUserSubject = null;
        string? assignedUserText = null;

        UserModel? reassignedUser = null;
        NotificationTypeEnum? reassignedUserNotificationType;
        string? reassignedUserSubject = null;
        string? reassignedUserText = null;

        switch (msg.ChangeType)
        {
            case KanbanTaskChangeTypeEnum.KanbanTaskCreated:
                assignedUser = newKanbanTask?.AssignedUser;

                if (assignedUser != null)
                {
                    assignedUserNotificationType = NotificationTypeEnum.NewKanbanTaskAssigned;
                    assignedUserSubject = CreateSubject(msg.Id, (NotificationTypeEnum)assignedUserNotificationType);
                    assignedUserText = CreateText(assignedUser, (NotificationTypeEnum)assignedUserNotificationType, newKanbanTask!, null);
                }

                break;
            case KanbanTaskChangeTypeEnum.KanbanTaskModified:
                assignedUser = newKanbanTask?.AssignedUser;
                reassignedUser = oldKanbanTask?.AssignedUser;

                if (assignedUser != null && !(assignedUser.Id == reassignedUser?.Id && newKanbanTask?.Title == oldKanbanTask?.Title && newKanbanTask?.Description == oldKanbanTask?.Description && newKanbanTask?.Status == oldKanbanTask?.Status))
                {
                    if (assignedUser.Id != reassignedUser?.Id)
                        assignedUserNotificationType = NotificationTypeEnum.KanbanTaskAssigned;
                    else
                        assignedUserNotificationType = NotificationTypeEnum.KanbanTaskChanged;

                    assignedUserSubject = CreateSubject(msg.Id, (NotificationTypeEnum)assignedUserNotificationType);
                    assignedUserText = CreateText(assignedUser, (NotificationTypeEnum)assignedUserNotificationType, newKanbanTask, oldKanbanTask);
                }

                if (reassignedUser != null && (reassignedUser.Id != assignedUser?.Id))
                {
                    reassignedUserNotificationType = NotificationTypeEnum.KanbanTaskReassigned;
                    reassignedUserSubject = CreateSubject(msg.Id, (NotificationTypeEnum)reassignedUserNotificationType);
                    reassignedUserText = CreateText(reassignedUser, (NotificationTypeEnum)reassignedUserNotificationType, newKanbanTask, oldKanbanTask);
                }

                break;
            case KanbanTaskChangeTypeEnum.KanbanTaskDeleted:
                reassignedUser = oldKanbanTask?.AssignedUser;

                if (reassignedUser != null)
                {
                    reassignedUserNotificationType = NotificationTypeEnum.KanbanTaskDeleted;
                    reassignedUserSubject = CreateSubject(msg.Id, (NotificationTypeEnum)reassignedUserNotificationType);
                    reassignedUserText = CreateText(reassignedUser, (NotificationTypeEnum)reassignedUserNotificationType, null, oldKanbanTask);
                }

                break;
        }

        if (assignedUser != null && !string.IsNullOrWhiteSpace(assignedUserSubject) && !string.IsNullOrWhiteSpace(assignedUserText))
        {
            await emailSender.SendEmailAsync(assignedUser.Email, assignedUserSubject, assignedUserText);
        }

        if (reassignedUser != null && !string.IsNullOrWhiteSpace(reassignedUserSubject) && !string.IsNullOrWhiteSpace(reassignedUserText))
        {
            await emailSender.SendEmailAsync(reassignedUser.Email, reassignedUserSubject, reassignedUserText);
        }
    }
}
