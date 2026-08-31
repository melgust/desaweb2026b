using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface ICategoryService
{
    Task<CategoryPagedResult> GetCategoriesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct);
    Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class CategoryService(AppDbContext db) : ICategoryService
{
    public async Task<CategoryPagedResult> GetCategoriesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        page = Math.Max(page, 1); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.Categories.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(c => c.Name.Contains(search) || (c.Description != null && c.Description.Contains(search)));
        bool desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
        query = sortBy?.ToLowerInvariant() switch
        {
            "createdat" => desc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => desc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name)
        };
        int total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt)).ToListAsync(ct);
        return new(items, total, page, pageSize, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct) => await db.Categories.AsNoTracking().Where(c => c.IsActive).OrderBy(c => c.Name).Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt)).ToListAsync(ct);
    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct) => ToDto(await db.Categories.FindAsync([id], ct) ?? throw new KeyNotFoundException("Category not found."));
    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct) { var c = new Category { Name = request.Name, Description = request.Description, IsActive = request.IsActive }; db.Add(c); await db.SaveChangesAsync(ct); return ToDto(c); }
    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct) { var c = await db.Categories.FindAsync([id], ct) ?? throw new KeyNotFoundException("Category not found."); c.Name = request.Name; c.Description = request.Description; c.IsActive = request.IsActive; c.UpdatedAt = DateTime.UtcNow; await db.SaveChangesAsync(ct); return ToDto(c); }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var c = await db.Categories.FindAsync([id], ct) ?? throw new KeyNotFoundException("Category not found."); db.Remove(c); await db.SaveChangesAsync(ct); }
    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt);
}
