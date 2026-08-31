using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(bool onlyActive, CancellationToken ct);
    Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db) => _db = db;

    /// <summary>
    /// Proyecta a DTO incluyendo cuantos productos tiene asignados cada categoria.
    /// EF lo traduce a una subconsulta COUNT, de modo que no hace falta traer los
    /// productos a memoria para contarlos.
    /// </summary>
    private static IQueryable<CategoryDto> Project(IQueryable<Category> query) =>
        query.Select(c => new CategoryDto(
            c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt,
            c.Products.Count()));

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(bool onlyActive, CancellationToken ct)
    {
        var query = _db.Categories.AsNoTracking().AsQueryable();
        if (onlyActive) query = query.Where(c => c.IsActive);

        return await Project(query.OrderBy(c => c.Name)).ToListAsync(ct);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await Project(_db.Categories.AsNoTracking().Where(c => c.Id == id)).FirstOrDefaultAsync(ct);
        return dto ?? throw new KeyNotFoundException("Category not found.");
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        await EnsureNameIsFreeAsync(request.Name, null, ct);

        var c = new Category
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            IsActive = request.IsActive
        };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(c.Id, ct);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");

        await EnsureNameIsFreeAsync(request.Name, id, ct);

        c.Name = request.Name.Trim();
        c.Description = request.Description;
        c.IsActive = request.IsActive;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(c.Id, ct);
    }

    /// <summary>
    /// No se permite eliminar una categoria que todavia agrupa productos: primero
    /// hay que reasignarlos. Se comprueba aqui para devolver un mensaje entendible
    /// en vez de dejar que falle la restriccion de clave foranea.
    /// </summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Category not found.");

        int enUso = await _db.Products.CountAsync(p => p.CategoryId == id, ct);
        if (enUso > 0)
            throw new InvalidOperationException($"No se puede eliminar la categoría porque tiene {enUso} producto(s) asignado(s).");

        _db.Categories.Remove(c);
        await _db.SaveChangesAsync(ct);
    }

    private async Task EnsureNameIsFreeAsync(string name, Guid? ignoreId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("El nombre de la categoría es obligatorio.");

        var normalizado = name.Trim().ToLower();
        bool repetido = await _db.Categories
            .AnyAsync(c => c.Name.ToLower() == normalizado && (!ignoreId.HasValue || c.Id != ignoreId.Value), ct);

        if (repetido)
            throw new InvalidOperationException($"Ya existe una categoría llamada «{name.Trim()}».");
    }
}
