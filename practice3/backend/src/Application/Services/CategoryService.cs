using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class CategoryService(AppDbContext context)
{
    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var categories = await context.Categories.ToListAsync();
        return categories.Select(c => new CategoryDto(
            c.Id, c.Name, c.Description, c.CreatedAt, c.UpdatedAt));
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id)
    {
        var c = await context.Categories.FindAsync(id);
        if (c == null) return null;
        return new CategoryDto(c.Id, c.Name, c.Description, c.CreatedAt, c.UpdatedAt);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return new CategoryDto(category.Id, category.Name, category.Description, category.CreatedAt, category.UpdatedAt);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await context.Categories.FindAsync(id);
        if (category == null) return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return new CategoryDto(category.Id, category.Name, category.Description, category.CreatedAt, category.UpdatedAt);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await context.Categories.FindAsync(id);
        if (category == null) return false;

        context.Categories.Remove(category);
        await context.SaveChangesAsync();
        return true;
    }
}
