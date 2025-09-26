using System.Security.Cryptography.X509Certificates;
using System.Text.Encodings.Web;
using KanbanBoardApi.Data;
using KanbanBoardApi.Models.Common;
using KanbanBoardApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;

// using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention()
#if DEBUG
        .EnableSensitiveDataLogging()
#endif
);

var certPaths = builder.Configuration.GetSection("Kestrel:Endpoints:Https:Certificate").Get<CertificatePaths>()!;
var certificate = X509Certificate2.CreateFromPemFile(certPaths.Path, certPaths.KeyPath);

builder.Services.AddDataProtection()
    .PersistKeysToDbContext<ApplicationDbContext>()
    .ProtectKeysWithCertificate(certificate);

// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
//     options.DefaultChallengeScheme = IdentityConstants.BearerScheme;
// })
// .AddBearerToken();

builder.Services.AddIdentityApiEndpoints<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.SignIn.RequireConfirmedEmail = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<ApplicationRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

var requireAuthPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .Build();

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(requireAuthPolicy)
    .SetFallbackPolicy(requireAuthPolicy)
    .AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));

builder.Services.Configure<EmailSenderOptions>(builder.Configuration.GetSection("EmailSender"));
builder.Services.AddTransient<IEmailSender, EmailSender>();

// Add custom services
builder.Services.AddScoped<KanbanTasksService>();
builder.Services.AddScoped<UsersService>();

builder.Services.AddControllers();

// Set the JSON serializer options
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure CORS policies
#if DEBUG
builder.Services.Configure<CorsSettings>(builder.Configuration.GetSection("CorsSettings"));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder =>
    {
        var corsSettings = builder.Configuration.GetSection("CorsSettings").Get<CorsSettings>()!;

        policyBuilder
            .WithOrigins(corsSettings.AllowedOrigins.Split(","))
            .WithExposedHeaders(corsSettings.ExposedHeaders.Split(","))
            .AllowCredentials()
            .AllowAnyMethod();
    });
});
#endif

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

if (app.Environment.IsDevelopment())
{
    app.UseCors();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGroup("/api/account")
    .AllowAnonymous()
    .MapIdentityApi<ApplicationUser>(); // click 'Go to Definition' to view the code for the endpoints it creates

app.MapControllers();

app.Run();
