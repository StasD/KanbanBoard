using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoardApi.Data;

public partial class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser, ApplicationRole,int>(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // customize identity tables
        modelBuilder.Entity<ApplicationUser>(b =>
        {
            b.HasIndex(r => r.NormalizedUserName).HasDatabaseName("ix_users_normalized_user_name").IsUnique();
            b.HasIndex(r => r.NormalizedEmail).HasDatabaseName("ix_users_normalized_email").IsUnique();
            b.ToTable("users");
        });

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            b.HasIndex(r => r.NormalizedName).HasDatabaseName("ix_roles_normalized_name").IsUnique();
            b.ToTable("roles");
        });

        modelBuilder.Entity<IdentityUserRole<int>>().ToTable("user_roles");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("user_tokens");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("user_logins");
        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("user_claims");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("role_claims");
    }
}
