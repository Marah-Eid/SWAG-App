using System;
using Microsoft.EntityFrameworkCore.Migrations;
using SwagBackend.Models;

#nullable disable

namespace SwagBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDevicePushTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "device_push_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    expo_token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_push_tokens", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_device_push_tokens_user_id_expo_token",
                table: "device_push_tokens",
                columns: new[] { "user_id", "expo_token" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "device_push_tokens");
        }
    }
}
