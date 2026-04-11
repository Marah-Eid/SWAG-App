using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwagBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLastSeenAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "last_seen_at",
                table: "vendors",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_seen_at",
                table: "customers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "last_seen_at",
                table: "vendors");

            migrationBuilder.DropColumn(
                name: "last_seen_at",
                table: "customers");
        }
    }
}
