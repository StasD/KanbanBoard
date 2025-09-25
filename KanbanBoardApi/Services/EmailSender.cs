using KanbanBoardApi.Models.Common;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;

namespace KanbanBoardApi.Services;

public class EmailSender(IOptions<EmailSenderOptions> options) : IEmailSender
{
    private readonly EmailSenderOptions _options = options.Value;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        message.To.Add(new MailboxAddress(email, email));
        message.Subject = subject;

        message.Body = new TextPart("html")
        {
            Text = htmlMessage
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.None); // No SSL needed for local smtp4dev
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
