using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KanbanBoardApi.Migrations
{
    /// <inheritdoc />
    public partial class Change_Identity_Tables_And_Add_UserAgents_And_UserSessions_Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "role_claims");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.CreateTable(
                name: "user_agents",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_agent_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    user_agent_string = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_agents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_sessions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    user_agent_id = table.Column<int>(type: "integer", nullable: true),
                    login_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    session_expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    refresh_token_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    access_token_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    refresh_token_issue_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    access_token_issue_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    requests = table.Column<int>(type: "integer", nullable: true),
                    last_request_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_sessions_user_agents_user_agent_id",
                        column: x => x.user_agent_id,
                        principalTable: "user_agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_user_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_agents_user_agent_hash",
                table: "user_agents",
                column: "user_agent_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_sessions_user_agent_id",
                table: "user_sessions",
                column: "user_agent_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_sessions_user_id",
                table: "user_sessions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_sessions");

            migrationBuilder.DropTable(
                name: "user_agents");

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "role_claims",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_claims_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    role_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_role_claims_role_id",
                table: "role_claims",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_normalized_name",
                table: "roles",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_roles_role_id",
                table: "user_roles",
                column: "role_id");
        }
    }
}
