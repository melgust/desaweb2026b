using Application.DTOs;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface ICategorieservice
{
    Task<CategoryPagedResult> GetCategoriesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class Categorieservice : ICategorieservice
{
    private readonly AppDbContext _db;

    public Categorieservice(AppDbContext db) => _db = db;

    public async Task<CategoryPagedResult> GetCategoriesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Categories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lower) || (p.Description != null && p.Description.ToLower().Contains(lower)));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "createdat" => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
        };

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new CategoryDto(p.Id, p.Name, p.Description, p.CreatedAt))
            .ToListAsync(ct);

        return new CategoryPagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await _db.Categories.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new CategoryDto(p.Id, p.Name, p.Description, p.CreatedAt))
            .FirstOrDefaultAsync(ct);

        return dto ?? throw new KeyNotFoundException("Category not found.");
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        await ValidateProductAsync(request.productId, ct);

        var p = new Category
        {
            Name = request.Name,
            Description = request.Description ?? "",
        };
        _db.Categories.Add(p);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var p = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");
        await ValidateProductAsync(request.productId, ct);

        p.Name = request.Name;
        p.Description = request.Description ?? "";
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(p.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");
        _db.Categories.Remove(p);
        await _db.SaveChangesAsync(ct);
    }

    private async Task ValidateProductAsync(Guid? id, CancellationToken ct)
    {
        if (id is null) return;
        bool exists = await _db.Products.AnyAsync(s => s.Id == id, ct);
        if (!exists) throw new KeyNotFoundException("Product not found.");
    }
}
