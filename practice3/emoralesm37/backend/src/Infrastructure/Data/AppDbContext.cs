using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Detail> Details => Set<Detail>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Role>().HasIndex(r => r.Name).IsUnique();

        // One supplier -> many products. Deleting a supplier sets products' SupplierId to null.
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Supplier>().HasIndex(s => s.Name);

        // CATEGORIA - PRODUCT
        // One category -> many products

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Categoria)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Optional: unique category name
        modelBuilder.Entity<Categoria>()
            .HasIndex(c => c.Name)
            .IsUnique();

        // CLIENT - INVOICE
        // One client -> many invoices
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Client)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // INVOICE - DETAIL
        // One invoice -> many details
        modelBuilder.Entity<Detail>()
            .HasOne(d => d.Invoice)
            .WithMany(i => i.Details)
            .HasForeignKey(d => d.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // PRODUCT - DETAIL
        // One product -> many invoice details
        modelBuilder.Entity<Detail>()
            .HasOne(d => d.Product)
            .WithMany(p => p.Details)
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // INDEXES
        modelBuilder.Entity<Client>()
            .HasIndex(c => c.Email);

        modelBuilder.Entity<Invoice>()
            .HasIndex(i => i.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Detail>()
            .HasIndex(d => d.ProductId);

        modelBuilder.Entity<Detail>()
            .HasIndex(d => d.InvoiceId);
    }
}
