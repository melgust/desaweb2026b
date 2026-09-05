using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Categories.ToListAsync(ct);
    }

    public async Task<Category?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _context.Categories.FindAsync(new object[] { id }, ct);
    }

    public async Task<Category> CreateAsync(Category category, CancellationToken ct = default)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(ct);
        return category;
    }

    public async Task UpdateAsync(int id, Category category, CancellationToken ct = default)
    {
        var existing = await _context.Categories.FindAsync(new object[] { id }, ct);
        if (existing != null)
        {
            existing.Name = category.Name;
            existing.Description = category.Description;
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await _context.Categories.FindAsync(new object[] { id }, ct);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync(ct);
        }
    }
}