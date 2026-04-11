using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwagBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCollectionUpdatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "vendor_collections",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "vendor_collections");
        }
    }
}
