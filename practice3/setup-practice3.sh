#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Creating Enterprise Solution directory structure..."

# Set root project path
ROOT_DIR="emoralesm371"

# -----------------------------------------------------------------------------
# 1. Create Directory Hierarchy
# -----------------------------------------------------------------------------
mkdir -p "${ROOT_DIR}/backend/src/Domain/Entities"
mkdir -p "${ROOT_DIR}/backend/src/Domain/Common"
mkdir -p "${ROOT_DIR}/backend/src/Application/DTOs"
mkdir -p "${ROOT_DIR}/backend/src/Application/Interfaces"
mkdir -p "${ROOT_DIR}/backend/src/Application/Services"
mkdir -p "${ROOT_DIR}/backend/src/Infrastructure/Data/Migrations"
mkdir -p "${ROOT_DIR}/backend/src/Api/Controllers"

mkdir -p "${ROOT_DIR}/frontend/src/app/core/guards"
mkdir -p "${ROOT_DIR}/frontend/src/app/core/interceptors"
mkdir -p "${ROOT_DIR}/frontend/src/app/core/models"
mkdir -p "${ROOT_DIR}/frontend/src/app/core/services"
mkdir -p "${ROOT_DIR}/frontend/src/app/features/auth/pages/login"
mkdir -p "${ROOT_DIR}/frontend/src/app/features/products/pages/product-list"
mkdir -p "${ROOT_DIR}/frontend/src/app/features/products/pages/product-form"
mkdir -p "${ROOT_DIR}/frontend/src/assets"

echo "📁 Directories created successfully."

# -----------------------------------------------------------------------------
# 2. Create Backend Placeholder Files
# -----------------------------------------------------------------------------
echo "📄 Generating backend files..."

# Domain Entities
cat << 'EOF' > "${ROOT_DIR}/backend/src/Domain/Entities/Role.cs"
namespace Domain.Entities;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
}
EOF

cat << 'EOF' > "${ROOT_DIR}/backend/src/Domain/Entities/User.cs"
namespace Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
EOF

cat << 'EOF' > "${ROOT_DIR}/backend/src/Domain/Entities/Product.cs"
namespace Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
EOF

# Infrastructure DB Context
cat << 'EOF' > "${ROOT_DIR}/backend/src/Infrastructure/Data/AppDbContext.cs"
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();

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
    }
}
EOF

# Placeholder controller & config files
touch "${ROOT_DIR}/backend/src/Application/DTOs/AuthDtos.cs"
touch "${ROOT_DIR}/backend/src/Application/DTOs/ProductDtos.cs"
touch "${ROOT_DIR}/backend/src/Application/Interfaces/IAuthService.cs"
touch "${ROOT_DIR}/backend/src/Application/Interfaces/IProductService.cs"
touch "${ROOT_DIR}/backend/src/Application/Services/AuthService.cs"
touch "${ROOT_DIR}/backend/src/Application/Services/ProductService.cs"
touch "${ROOT_DIR}/backend/src/Api/Controllers/AuthController.cs"
touch "${ROOT_DIR}/backend/src/Api/Controllers/ProductsController.cs"
touch "${ROOT_DIR}/backend/src/Api/Program.cs"
touch "${ROOT_DIR}/backend/src/Api/appsettings.json"
touch "${ROOT_DIR}/backend/EnterpriseApp.sln"

# -----------------------------------------------------------------------------
# 3. Create Frontend Placeholder Files
# -----------------------------------------------------------------------------
echo "📄 Generating frontend files..."

# Core Layer Files
touch "${ROOT_DIR}/frontend/src/app/core/guards/auth.guard.ts"
touch "${ROOT_DIR}/frontend/src/app/core/guards/role.guard.ts"
touch "${ROOT_DIR}/frontend/src/app/core/interceptors/jwt.interceptor.ts"
touch "${ROOT_DIR}/frontend/src/app/core/models/auth.model.ts"
touch "${ROOT_DIR}/frontend/src/app/core/models/product.model.ts"
touch "${ROOT_DIR}/frontend/src/app/core/services/auth.service.ts"
touch "${ROOT_DIR}/frontend/src/app/core/services/product.service.ts"

# Login Feature Component
touch "${ROOT_DIR}/frontend/src/app/features/auth/pages/login/login.component.ts"
touch "${ROOT_DIR}/frontend/src/app/features/auth/pages/login/login.component.html"
touch "${ROOT_DIR}/frontend/src/app/features/auth/pages/login/login.component.css"

# Product List Feature Component
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-list/product-list.component.ts"
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-list/product-list.component.html"
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-list/product-list.component.css"

# Product Form Feature Component
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-form/product-form.component.ts"
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-form/product-form.component.html"
touch "${ROOT_DIR}/frontend/src/app/features/products/pages/product-form/product-form.component.css"

# Main App Entry Files
touch "${ROOT_DIR}/frontend/src/app/app.component.ts"
touch "${ROOT_DIR}/frontend/src/app/app.routes.ts"
touch "${ROOT_DIR}/frontend/src/index.html"
touch "${ROOT_DIR}/frontend/src/styles.css"
touch "${ROOT_DIR}/frontend/angular.json"
touch "${ROOT_DIR}/frontend/package.json"
touch "${ROOT_DIR}/frontend/tsconfig.json"

echo "✅ All files and directory structure generated successfully inside './${ROOT_DIR}'!"
