using KanbanBoardApi.Entities;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Data;

public partial class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser, ApplicationRole, int, ApplicationUserClaim, ApplicationUserRole, ApplicationUserLogin, ApplicationRoleClaim, ApplicationUserToken>(options), IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
    public DbSet<KanbanTask> KanbanTasks { get; set; }

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

            b.HasMany(u => u.Roles)
                .WithOne(ur => ur.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();

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

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            b.ToTable("roles");

            b.Property(r => r.Name).IsRequired().HasDefaultValue("");
            b.Property(r => r.NormalizedName).IsRequired().HasDefaultValue("");

            b.HasIndex(r => r.NormalizedName).HasDatabaseName("ix_roles_normalized_name").IsUnique();

            b.HasMany(r => r.Users)
                .WithOne(ur => ur.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();

            b.HasMany(r => r.Claims)
                .WithOne(rc => rc.Role)
                .HasForeignKey(rc => rc.RoleId)
                .IsRequired();
        });

        modelBuilder.Entity<ApplicationUserRole>().ToTable("user_roles");
        modelBuilder.Entity<ApplicationUserToken>().ToTable("user_tokens");
        modelBuilder.Entity<ApplicationUserLogin>().ToTable("user_logins");
        modelBuilder.Entity<ApplicationUserClaim>().ToTable("user_claims");
        modelBuilder.Entity<ApplicationRoleClaim>().ToTable("role_claims");

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
    }
}
