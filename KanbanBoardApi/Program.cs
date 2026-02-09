using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text.Encodings.Web;
using KanbanBoardApi.Common;
using KanbanBoardApi.Data;
using KanbanBoardApi.Messages.KanbanTaskChanged;
using KanbanBoardApi.Models.Common;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Rebus.Config;
using Rebus.Config.Outbox;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var postgresConnString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options
        .UseNpgsql(postgresConnString)
        .UseSnakeCaseNamingConvention()
#if DEBUG
        .EnableSensitiveDataLogging()
#endif
);

var serverCertPaths = builder.Configuration.GetSection("Kestrel:Endpoints:Https:Certificate").Get<CertificatePaths>()!;
var serverCert = X509Certificate2.CreateFromPemFile(serverCertPaths.Path, serverCertPaths.KeyPath);

var clientCertPaths = builder.Configuration.GetSection("ClientCertificate").Get<CertificatePaths>()!;
var clientCert = X509Certificate2.CreateFromPemFile(clientCertPaths.Path, clientCertPaths.KeyPath);

var caCertPaths = builder.Configuration.GetSection("CaCertificate").Get<CertificatePaths>()!;
var caCert = X509CertificateLoader.LoadCertificateFromFile(caCertPaths.Path);

var rabbitMqConnString = builder.Configuration.GetConnectionString("RabbitMQ") ?? throw new InvalidOperationException("Connection string 'RabbitMQ' not found.");

var rabbitMqUri = new Uri(rabbitMqConnString);

builder.Services.AddRebus((configure, provider) => configure
    .Transport(t =>
        t.UseRabbitMq(rabbitMqConnString, "kanbanboard-app-queue")
            .CustomizeConnectionFactory(conn => {
                var cnn = new RabbitMQConnectionFactory
                {
                    Uri = rabbitMqUri
                };
                cnn.Ssl.CertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
                    sslPolicyErrors switch
                    {
                        SslPolicyErrors.None => true,
                        SslPolicyErrors.RemoteCertificateChainErrors => certificate.IsSignedByCaCert(caCert),
                        _ => false,
                    };
                cnn.Ssl.Certs = [clientCert];
                return cnn;
            })
        )
    .Outbox(o => o.StoreInPostgreSql(postgresConnString, "outbox")),
    // .Routing(c => c.TypeBased().Map<KanbanTaskChangedMessage>("kanbanboard-app-queue"))
    onCreated: async bus =>
    {
        await bus.Subscribe<KanbanTaskChangedMessage>();
    }
);

builder.Services.AutoRegisterHandlersFromAssemblyOf<Program>();

builder.Services.AddDataProtection()
    .PersistKeysToDbContext<ApplicationDbContext>()
    .ProtectKeysWithCertificate(serverCert);

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.SignIn.RequireConfirmedEmail = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders()
    .AddSignInManager();

var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings")!;
var jwtSettings = jwtSettingsSection.Get<JwtSettings>()!;

builder.Services.Configure<JwtSettings>(jwtSettingsSection);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            // the key used to sign the token
            IssuerSigningKey = new SymmetricSecurityKey(HelperFunctions.GetUtf8Bytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.Zero // this removes the 5-minute grace period
        };

        options.EventsType = typeof(CustomJwtBearerEvents);
    });

var requireAuthPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .Build();

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(requireAuthPolicy)
    .SetFallbackPolicy(requireAuthPolicy);

builder.Services.Configure<EmailSenderOptions>(builder.Configuration.GetSection("EmailSender"));
builder.Services.AddTransient<IEmailSender, EmailSender>();

// Add custom services
builder.Services.AddScoped<KanbanTasksService>();
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<UserAgentService>();
builder.Services.AddScoped<CustomJwtBearerEvents>();

// Set the JSON serializer options
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
});

builder.Services.AddControllers(options =>
{
    options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure CORS policies
var corsSettingsSection = builder.Configuration.GetSection("CorsSettings")!;
var corsSettings = corsSettingsSection.Get<CorsSettings>()!;

builder.Services.Configure<CorsSettings>(corsSettingsSection);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder =>
    {
        policyBuilder
            .WithOrigins(corsSettings.AllowedOrigins.Split(","))
            .WithHeaders(corsSettings.ClientHeaders.Split(","))
            .WithExposedHeaders(corsSettings.ExposedHeaders.Split(","))
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference(options =>
    {
        options.Servers = [];
    }).AllowAnonymous();
// }

// app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// app.MapGroup("/api/account")
//     .AllowAnonymous()
//     .MapIdentityApi<ApplicationUser>(); // click 'Go to Definition' to view the code for the endpoints it creates

app.MapControllers();

app.Run();
