using System;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260904205000_AddClientsInvoices")]
    public partial class AddClientsInvoices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // CLIENTS
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    Name = table.Column<string>(
                        type: "longtext",
                        nullable: false),

                    Email = table.Column<string>(
                        type: "longtext",
                        nullable: true),

                    Phone = table.Column<string>(
                        type: "longtext",
                        nullable: true),

                    IsActive = table.Column<bool>(
                        type: "tinyint(1)",
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false),

                    UpdatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_Clients",
                        x => x.Id
                    );
                });


            // INVOICES
            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    ClientId = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    InvoiceDate = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false),

                    Total = table.Column<decimal>(
                        type: "decimal(65,30)",
                        nullable: false),

                    Status = table.Column<string>(
                        type: "longtext",
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false),

                    UpdatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_Invoices",
                        x => x.Id
                    );

                    table.ForeignKey(
                        name: "FK_Invoices_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                });


            // INVOICE DETAILS
            migrationBuilder.CreateTable(
                name: "InvoiceDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    InvoiceId = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    ProductId = table.Column<Guid>(
                        type: "char(36)",
                        nullable: false,
                        collation: "ascii_general_ci"),

                    Quantity = table.Column<int>(
                        type: "int",
                        nullable: false),

                    UnitPrice = table.Column<decimal>(
                        type: "decimal(65,30)",
                        nullable: false),

                    Subtotal = table.Column<decimal>(
                        type: "decimal(65,30)",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_InvoiceDetails",
                        x => x.Id
                    );

                    table.ForeignKey(
                        name: "FK_InvoiceDetails_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );

                    table.ForeignKey(
                        name: "FK_InvoiceDetails_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                });


            // INDEXES
            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ClientId",
                table: "Invoices",
                column: "ClientId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_InvoiceId",
                table: "InvoiceDetails",
                column: "InvoiceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_ProductId",
                table: "InvoiceDetails",
                column: "ProductId"
            );
        }


        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvoiceDetails"
            );

            migrationBuilder.DropTable(
                name: "Invoices"
            );

            migrationBuilder.DropTable(
                name: "Clients"
            );
        }
    }
}