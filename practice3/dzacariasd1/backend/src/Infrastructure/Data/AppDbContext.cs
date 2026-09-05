using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceDetail> InvoiceDetails => Set<InvoiceDetail>();

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

        // --- Categoria 1 --- N Productos ---
        // Restrict impide borrar una categoria que todavia tenga productos
        // asignados: obliga a reasignarlos primero en lugar de dejar datos huerfanos.
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Category>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Category>().Property(c => c.Name).HasMaxLength(80);

        // --- Proveedor 1 --- N Productos ---
        // SetNull: al borrar un proveedor los productos se quedan, simplemente
        // dejan de tener proveedor asignado. Se pierde un dato de contacto, no el
        // producto ni su historial de ventas.
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Supplier>().HasIndex(s => s.Name);
        modelBuilder.Entity<Supplier>().Property(s => s.Name).HasMaxLength(120);

        // --- Cliente 1 --- N Facturas ---
        // Restrict: un cliente con facturas emitidas no se puede borrar, porque
        // dejaria facturas sin titular.
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Client)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Client>().HasIndex(c => c.Nit).IsUnique();
        modelBuilder.Entity<Client>().Property(c => c.Nit).HasMaxLength(20);
        modelBuilder.Entity<Client>().Property(c => c.Name).HasMaxLength(120);

        // --- Factura 1 --- N Detalles ---
        // Cascade: los renglones no existen fuera de su factura, asi que se van con ella.
        modelBuilder.Entity<InvoiceDetail>()
            .HasOne(d => d.Invoice)
            .WithMany(i => i.Details)
            .HasForeignKey(d => d.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Producto 1 --- N Detalles ---
        // Restrict: no se puede borrar un producto que ya fue facturado, porque
        // alteraria facturas ya emitidas.
        modelBuilder.Entity<InvoiceDetail>()
            .HasOne(d => d.Product)
            .WithMany(p => p.InvoiceDetails)
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Invoice>().HasIndex(i => i.Number).IsUnique();
        modelBuilder.Entity<Invoice>().Property(i => i.Number).HasMaxLength(20);
        modelBuilder.Entity<InvoiceDetail>().Property(d => d.ProductName).HasMaxLength(200);
    }
}
