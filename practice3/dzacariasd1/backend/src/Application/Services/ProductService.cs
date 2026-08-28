using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IProductService
{
    Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<ProductScrollResult> GetProductsScrollAsync(string? search, string? sortBy, string? sortDirection, int offset, int limit, CancellationToken ct);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ProductService : IProductService
{
    // Limites defensivos: evitan que un cliente pida 1.000.000 de filas de golpe.
    private const int MaxPageSize = 100;
    private const int MaxScrollLimit = 100;

    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    /// <summary>
    /// Filtro + ordenamiento compartidos por las dos estrategias de paginacion.
    /// El desempate por Id garantiza un orden estable: sin el, dos productos con
    /// el mismo nombre podrian repetirse o perderse al saltar de pagina.
    /// </summary>
    private IQueryable<Product> BuildQuery(string? search, string? sortBy, string? sortDirection)
    {
        var query = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lower) || (p.Description != null && p.Description.ToLower().Contains(lower)));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        var ordered = sortBy?.ToLower() switch
        {
            "price" => isDesc ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "stock" => isDesc ? query.OrderByDescending(p => p.Stock) : query.OrderBy(p => p.Stock),
            "createdat" => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
        };

        return ordered.ThenBy(p => p.Id);
    }

    private static IQueryable<ProductDto> Project(IQueryable<Product> query) =>
        query.Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt));

    /// <summary>
    /// Paginacion clasica por offset: el cliente pide una pagina concreta y
    /// reemplaza por completo el contenido de la tabla.
    /// </summary>
    public async Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > MaxPageSize) pageSize = MaxPageSize;

        var query = BuildQuery(search, sortBy, sortDirection);

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await Project(query.Skip((page - 1) * pageSize).Take(pageSize)).ToListAsync(ct);

        return new ProductPagedResult(items, totalItems, page, pageSize, totalPages);
    }

    /// <summary>
    /// Paginacion incremental para el scroll infinito: devuelve el siguiente bloque
    /// de <paramref name="limit"/> productos a partir de <paramref name="offset"/> y
    /// le dice al cliente si quedan mas (HasMore) y desde donde continuar (NextOffset).
    /// El cliente va concatenando los bloques en vez de reemplazarlos.
    /// </summary>
    public async Task<ProductScrollResult> GetProductsScrollAsync(string? search, string? sortBy, string? sortDirection, int offset, int limit, CancellationToken ct)
    {
        if (offset < 0) offset = 0;
        if (limit < 1) limit = 10;
        if (limit > MaxScrollLimit) limit = MaxScrollLimit;

        var query = BuildQuery(search, sortBy, sortDirection);

        int totalItems = await query.CountAsync(ct);

        var items = await Project(query.Skip(offset).Take(limit)).ToListAsync(ct);

        int loaded = offset + items.Count;
        bool hasMore = loaded < totalItems;

        return new ProductScrollResult(items, offset, limit, totalItems, hasMore ? loaded : null, hasMore);
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        return new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct)
    {
        var p = new Product { Name = request.Name, Description = request.Description, Price = request.Price, Stock = request.Stock, IsActive = request.IsActive };
        _db.Products.Add(p);
        await _db.SaveChangesAsync(ct);
        return new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        p.Name = request.Name;
        p.Description = request.Description;
        p.Price = request.Price;
        p.Stock = request.Stock;
        p.IsActive = request.IsActive;
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        _db.Products.Remove(p);
        await _db.SaveChangesAsync(ct);
    }
}
