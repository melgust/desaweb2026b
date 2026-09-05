using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IProductService
{
    Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, Guid? categoryId, Guid? supplierId, int page, int pageSize, CancellationToken ct);
    Task<ProductScrollResult> GetProductsScrollAsync(string? search, string? sortBy, string? sortDirection, Guid? categoryId, Guid? supplierId, int offset, int limit, CancellationToken ct);
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
    private IQueryable<Product> BuildQuery(string? search, string? sortBy, string? sortDirection, Guid? categoryId, Guid? supplierId)
    {
        var query = _db.Products.AsNoTracking();

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (supplierId.HasValue)
        {
            query = query.Where(p => p.SupplierId == supplierId.Value);
        }

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
            "category" => isDesc
                ? query.OrderByDescending(p => p.Category!.Name)
                : query.OrderBy(p => p.Category!.Name),
            "supplier" => isDesc
                ? query.OrderByDescending(p => p.Supplier!.Name)
                : query.OrderBy(p => p.Supplier!.Name),
            _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
        };

        return ordered.ThenBy(p => p.Id);
    }

    /// <summary>
    /// Proyecta a DTO incluyendo el nombre de la categoria. Al hacerlo dentro de la
    /// consulta, EF genera un LEFT JOIN y trae el nombre en la misma ida a la base
    /// de datos, en lugar de una consulta adicional por cada producto.
    /// </summary>
    private static IQueryable<ProductDto> Project(IQueryable<Product> query) =>
        query.Select(p => new ProductDto(
            p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt,
            p.CategoryId,
            p.Category != null ? p.Category.Name : null,
            p.SupplierId,
            p.Supplier != null ? p.Supplier.Name : null));

    /// <summary>
    /// Paginacion clasica por offset: el cliente pide una pagina concreta y
    /// reemplaza por completo el contenido de la tabla.
    /// </summary>
    public async Task<ProductPagedResult> GetProductsAsync(string? search, string? sortBy, string? sortDirection, Guid? categoryId, Guid? supplierId, int page, int pageSize, CancellationToken ct)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > MaxPageSize) pageSize = MaxPageSize;

        var query = BuildQuery(search, sortBy, sortDirection, categoryId, supplierId);

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
    public async Task<ProductScrollResult> GetProductsScrollAsync(string? search, string? sortBy, string? sortDirection, Guid? categoryId, Guid? supplierId, int offset, int limit, CancellationToken ct)
    {
        if (offset < 0) offset = 0;
        if (limit < 1) limit = 10;
        if (limit > MaxScrollLimit) limit = MaxScrollLimit;

        var query = BuildQuery(search, sortBy, sortDirection, categoryId, supplierId);

        int totalItems = await query.CountAsync(ct);

        var items = await Project(query.Skip(offset).Take(limit)).ToListAsync(ct);

        int loaded = offset + items.Count;
        bool hasMore = loaded < totalItems;

        return new ProductScrollResult(items, offset, limit, totalItems, hasMore ? loaded : null, hasMore);
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await Project(_db.Products.AsNoTracking().Where(p => p.Id == id)).FirstOrDefaultAsync(ct);
        return dto ?? throw new KeyNotFoundException("Product not found.");
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);
        await EnsureSupplierExistsAsync(request.SupplierId, ct);

        var p = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            IsActive = request.IsActive,
            CategoryId = request.CategoryId,
            SupplierId = request.SupplierId
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);
        await EnsureSupplierExistsAsync(request.SupplierId, ct);

        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");
        p.Name = request.Name;
        p.Description = request.Description;
        p.Price = request.Price;
        p.Stock = request.Stock;
        p.IsActive = request.IsActive;
        p.CategoryId = request.CategoryId;
        p.SupplierId = request.SupplierId;
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Product not found.");

        // Un producto que ya aparece en una factura no se puede borrar: alteraria
        // documentos ya emitidos.
        int facturado = await _db.InvoiceDetails.CountAsync(d => d.ProductId == id, ct);
        if (facturado > 0)
            throw new InvalidOperationException($"No se puede eliminar el producto porque aparece en {facturado} renglón(es) de factura.");

        _db.Products.Remove(p);
        await _db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Valida la categoria antes de guardar. Sin esta comprobacion, un identificador
    /// inexistente provocaria un error de clave foranea de MySQL, mucho menos claro
    /// para quien consume la API.
    /// </summary>
    private async Task EnsureSupplierExistsAsync(Guid? supplierId, CancellationToken ct)
    {
        if (!supplierId.HasValue) return;

        bool exists = await _db.Suppliers.AnyAsync(s => s.Id == supplierId.Value, ct);
        if (!exists) throw new KeyNotFoundException("Supplier not found.");
    }

    private async Task EnsureCategoryExistsAsync(Guid? categoryId, CancellationToken ct)
    {
        if (!categoryId.HasValue) return;

        bool exists = await _db.Categories.AnyAsync(c => c.Id == categoryId.Value, ct);
        if (!exists) throw new KeyNotFoundException("Category not found.");
    }
}
