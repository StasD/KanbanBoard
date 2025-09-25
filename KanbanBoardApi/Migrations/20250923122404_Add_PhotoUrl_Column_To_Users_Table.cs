using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KanbanBoardApi.Migrations
{
    /// <inheritdoc />
    public partial class Add_PhotoUrl_Column_To_Users_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "photo_url",
                table: "users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "photo_url",
                table: "users");
        }
    }
}
