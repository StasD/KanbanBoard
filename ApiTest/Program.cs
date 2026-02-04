using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using RabbitMQ.Client;

Console.WriteLine("Hello, World!");

#if DEBUG
    Console.WriteLine("In DEBUG.");
#else
    Console.WriteLine("NOT In DEBUG.");
#endif

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine($"In {builder.Environment.EnvironmentName} environment.");

if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("In Development environment.");
}
else if (builder.Environment.IsProduction())
{
    Console.WriteLine("In Production environment.");
}

var serverCertConfig = builder.Configuration.GetSection("Certificates:Server").Get<CertificateConfig>()!;
var serverCert = X509Certificate2.CreateFromPemFile(serverCertConfig.CrtPath, serverCertConfig.KeyPath);

var clientCertConfig = builder.Configuration.GetSection("Certificates:Client").Get<CertificateConfig>()!;
var clientCert = X509Certificate2.CreateFromPemFile(clientCertConfig.CrtPath, clientCertConfig.KeyPath);

var rabbitMqConnString = builder.Configuration.GetConnectionString("RabbitMQ") ?? throw new InvalidOperationException("Connection string 'RabbitMQ' not found.");

var rabbitMqUri = new Uri(rabbitMqConnString);

var factory = new ConnectionFactory
{
    Uri = rabbitMqUri
};

// factory.Ssl.CertPath = certConfig.PfxPath;
// factory.Ssl.CertPassphrase = certConfig.PfxPass;

// factory.Ssl.Certs = [clientCert]; // [X509CertificateLoader.LoadCertificate(clientCert.RawData)]; // [clientCert];

factory.Ssl.CertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
{
    return sslPolicyErrors == SslPolicyErrors.None || certificate?.GetCertHashString() == serverCert.Thumbprint;
};

string factoryString = JsonSerializer.Serialize(new { factory.Uri, factory.UserName, factory.Password, factory.HostName, factory.Port, factory.ClientProperties });
Console.WriteLine($"ConnectionFactory: {factoryString}");

try
{
    await using var connection = await factory.CreateConnectionAsync();

    Console.WriteLine("AMQP Connection successful!");

    // You can optionally create a channel and perform more operations
    // using (var channel = connection.CreateModel())
    // {
    //     Console.WriteLine("Channel created successfully.");
    // }
}
catch (Exception ex)
{
    Console.WriteLine($"AMQP Connection failed: {ex.Message}");
}

Console.WriteLine("Bye, World!");

// Add services to the container.

var app = builder.Build();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

class CertificateConfig
{
    public required string CrtPath { get; set; }
    public required string KeyPath { get; set; }
    public required string PfxPath { get; set; }
    public required string PfxPass { get; set; }
}
