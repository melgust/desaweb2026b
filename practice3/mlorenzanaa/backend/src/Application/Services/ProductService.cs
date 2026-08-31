using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        return await _context.Products
            .Include(p => p.Supplier)
            .Include(p => p.Category)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.Stock,
                p.SupplierId,
                p.Supplier != null ? p.Supplier.Name : null,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null
            ))
            .ToListAsync();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var p = await _context.Products
            .Include(p => p.Supplier)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return null;

        return new ProductDto(
            p.Id,
            p.Name,
            p.Description,
            p.Price,
            p.Stock,
            p.SupplierId,
            p.Supplier?.Name,
            p.CategoryId,
            p.Category?.Name
        );
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            SupplierId = dto.SupplierId,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id) ?? throw new Exception("Error al crear producto");
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductRequest dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return null;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.SupplierId = dto.SupplierId;
        product.CategoryId = dto.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}