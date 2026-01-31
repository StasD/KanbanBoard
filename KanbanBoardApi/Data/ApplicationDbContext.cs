using KanbanBoardApi.Entities;
using KanbanBoardApi.Entities.Account;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Data;

public partial class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityUserContext<ApplicationUser, int, ApplicationUserClaim, ApplicationUserLogin, ApplicationUserToken>(options), IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
    public DbSet<KanbanTask> KanbanTasks { get; set; }
    public DbSet<UserAgent> UserAgents { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // NEW ENTRIES SHOULD BE ADDED AT THE BOTTOM

        // customize identity tables
        modelBuilder.Entity<ApplicationUser>(b =>
        {
            b.ToTable("users");

            b.Property(u => u.FirstName).IsRequired().HasDefaultValue("");
            b.Property(u => u.LastName).IsRequired().HasDefaultValue("");
            b.Property(u => u.PhotoUrl).IsRequired().HasDefaultValue("");
            b.Property(u => u.IsDisabled).IsRequired().HasDefaultValue(false);

            b.Property(u => u.UserName).IsRequired().HasDefaultValue("");
            b.Property(u => u.NormalizedUserName).IsRequired().HasDefaultValue("");
            b.Property(u => u.Email).IsRequired().HasDefaultValue("");
            b.Property(u => u.NormalizedEmail).IsRequired().HasDefaultValue("");

            b.HasIndex(u => u.NormalizedUserName).HasDatabaseName("ix_users_normalized_user_name").IsUnique();
            b.HasIndex(u => u.NormalizedEmail).HasDatabaseName("ix_users_normalized_email").IsUnique();

            b.HasMany(u => u.Tokens)
                .WithOne(ut => ut.User)
                .HasForeignKey(ut => ut.UserId)
                .IsRequired();

            b.HasMany(u => u.Logins)
                .WithOne(ul => ul.User)
                .HasForeignKey(ul => ul.UserId)
                .IsRequired();

            b.HasMany(u => u.Claims)
                .WithOne(uc => uc.User)
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();
        });

        modelBuilder.Entity<ApplicationUserToken>().ToTable("user_tokens");
        modelBuilder.Entity<ApplicationUserLogin>().ToTable("user_logins");
        modelBuilder.Entity<ApplicationUserClaim>().ToTable("user_claims");

        modelBuilder.Entity<KanbanTask>(b =>
        {
            b.HasOne(kt => kt.AssignedUser)
                .WithMany(u => u.AssignedToTasks)
                .HasForeignKey(kt => kt.AssignedUserId);

            b.HasOne(kt => kt.CreatedByUser)
                .WithMany(u => u.CreatedByTasks)
                .HasForeignKey(kt => kt.CreatedByUserId);

            b.HasOne(kt => kt.UpdatedByUser)
                .WithMany(u => u.UpdatedByTasks)
                .HasForeignKey(kt => kt.UpdatedByUserId);

            b.Property(kt => kt.AssignedAt).HasConversion(
                v => v,
                v => new DateTime(((DateTime)v!).Ticks, DateTimeKind.Utc)); // null values bypass convertions

            b.Property(kt => kt.CreatedAt).HasConversion(v => v, v => new DateTime(v.Ticks, DateTimeKind.Utc));
            b.Property(kt => kt.UpdatedAt).HasConversion(v => v, v => new DateTime(v.Ticks, DateTimeKind.Utc));
        });

        modelBuilder.Entity<UserAgent>(b =>
        {
            b.Property(ua => ua.CreatedAt).HasConversion(v => v, v => new DateTime(v.Ticks, DateTimeKind.Utc));
        });

        modelBuilder.Entity<UserSession>(b =>
        {
            b.HasOne(us => us.User)
                .WithMany(u => u.UserSessions)
                .HasForeignKey(us => us.UserId);

            b.HasOne(us => us.UserAgent)
                .WithMany(ua => ua.UserSessions)
                .HasForeignKey(us => us.UserAgentId);

            b.Property(us => us.LoginDate).HasConversion(v => v, v => new DateTime(v.Ticks, DateTimeKind.Utc));

            b.Property(us => us.SessionExpiryDate).HasConversion(
                v => v,
                v => new DateTime(((DateTime)v!).Ticks, DateTimeKind.Utc)); // null values bypass convertions

            b.Property(us => us.RefreshTokenIssueDate).HasConversion(
                v => v,
                v => new DateTime(((DateTime)v!).Ticks, DateTimeKind.Utc)); // null values bypass convertions
        });
    }
}
