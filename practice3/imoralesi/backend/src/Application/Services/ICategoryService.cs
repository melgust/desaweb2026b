using Domain.Entities;

namespace Application.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct = default);
    Task<Category?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Category> CreateAsync(Category category, CancellationToken ct = default);
    Task UpdateAsync(int id, Category category, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}