using Api.Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Application.Services;

public class ProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<ProductDto>> GetPagedProductsAsync(int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Products.AsNoTracking();
        var totalItems = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDtoExpression())
            .ToListAsync();

        return new PagedResultDto<ProductDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(ToDtoExpression())
            .FirstOrDefaultAsync();
    }

    public async Task<ProductDto> CreateAsync(ProductRequestDto request)
    {
        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Price = request.Price,
            Stock = request.Stock,
            IsActive = request.IsActive
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, ProductRequestDto request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return null;

        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim() ?? string.Empty;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return ToDto(product);
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description ?? string.Empty,
        Price = p.Price,
        Stock = p.Stock,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };

    private static System.Linq.Expressions.Expression<Func<Product, ProductDto>> ToDtoExpression() =>
        p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description ?? string.Empty,
            Price = p.Price,
            Stock = p.Stock,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt
        };
}
