using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IProductService
{
    Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    public async Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lower) || (p.Description != null && p.Description.ToLower().Contains(lower)) || (
            p.Categoria != null && p.Categoria.Name.ToLower().Contains(lower)));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "price" => isDesc ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "stock" => isDesc ? query.OrderByDescending(p => p.Stock) : query.OrderBy(p => p.Stock),
            "createdat" => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            "supplier" => isDesc ? query.OrderByDescending(p => p.Supplier!.Name) : query.OrderBy(p => p.Supplier!.Name),
            "categoria" => isDesc ? query.OrderByDescending(p => p.Categoria!.Name) : query.OrderBy(p => p.Categoria!.Name),
            _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            
        };

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int) Math.Ceiling(totalItems / (double)pageSize);

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt, p.SupplierId, p.Supplier != null ? p.Supplier.Name : null,p.CategoriaId, p.Categoria != null ? p.Categoria.Name : null))
            .ToListAsync(ct);

        return new ProductPagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await _db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt, p.SupplierId, p.Supplier != null ? p.Supplier.Name : null, p.CategoriaId, p.Categoria != null ? p.Categoria.Name : null))
            .FirstOrDefaultAsync(ct);

        return dto ?? throw new KeyNotFoundException("Product not found.");
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct)
    {
        await ValidateSupplierAsync(request.SupplierId, ct);
        await ValidateCategoriaAsync(request.CategoriaId, ct);

        var p = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            IsActive = request.IsActive,
            SupplierId = request.SupplierId,
            CategoriaId = request.CategoriaId
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        await ValidateSupplierAsync(request.SupplierId, ct);
        await ValidateCategoriaAsync(request.CategoriaId, ct);

        p.Name = request.Name;
        p.Description = request.Description;
        p.Price = request.Price;
        p.Stock = request.Stock;
        p.IsActive = request.IsActive;
        p.SupplierId = request.SupplierId;
        p.CategoriaId = request.CategoriaId;
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        _db.Products.Remove(p);
        await _db.SaveChangesAsync(ct);
    }

    private async Task ValidateSupplierAsync(Guid? supplierId, CancellationToken ct)
    {
        if (supplierId is null) return;
        bool exists = await _db.Suppliers.AnyAsync(s => s.Id == supplierId, ct);
        if (!exists) throw new KeyNotFoundException("Supplier not found.");
    }

    private async Task ValidateCategoriaAsync(Guid? categoriaId, CancellationToken ct)
    {
        if (categoriaId is null) return;
        bool exists = await _db.Categorias.AnyAsync(c => c.Id == categoriaId && c.IsActive, ct);
        if (!exists) throw new KeyNotFoundException("Categoria not found.");
    }
}

