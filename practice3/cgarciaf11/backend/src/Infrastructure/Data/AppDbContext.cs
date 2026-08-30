using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de la entidad Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Description).HasMaxLength(500);
        });

        // Configuración de la relación uno a muchos entre Category y Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasOne(p => p.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Opcional: Datos semilla (Seed Data) iniciales para Categorías
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Electrónica", Description = "Dispositivos y gadgets electrónicos" },
            new Category { Id = 2, Name = "Ropa", Description = "Prendas de vestir y accesorios" },
            new Category { Id = 3, Name = "Hogar", Description = "Artículos para el hogar y decoración" }
        );
    }
}