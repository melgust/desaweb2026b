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

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db) => _db = db;

    public async Task<CategoryPagedResult> GetCategoriesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Categories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(lower)
                || (c.Description != null && c.Description.ToLower().Contains(lower)));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "createdat" => isDesc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => isDesc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
        };

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);

        return new CategoryPagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct)
    {
        return await _db.Categories.AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");
        return new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        var c = new Category
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync(ct);
        return new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");
        c.Name = request.Name;
        c.Description = request.Description;
        c.IsActive = request.IsActive;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new CategoryDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync(ct);
    }
}
