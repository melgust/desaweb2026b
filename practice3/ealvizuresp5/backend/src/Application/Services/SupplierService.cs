using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface ISupplierService
{
    Task<SupplierPagedResult> GetSuppliersAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<IEnumerable<SupplierDto>> GetAllAsync(CancellationToken ct);
    Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct);
    Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class SupplierService(AppDbContext db) : ISupplierService
{
    public async Task<SupplierPagedResult> GetSuppliersAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        page = Math.Max(page, 1); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.Suppliers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(s => s.Name.Contains(search) || (s.ContactEmail != null && s.ContactEmail.Contains(search)));
        bool desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
        query = sortBy?.ToLowerInvariant() switch
        {
            "contactemail" => desc ? query.OrderByDescending(s => s.ContactEmail) : query.OrderBy(s => s.ContactEmail),
            "createdat" => desc ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt),
            _ => desc ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name)
        };
        int total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(s => new SupplierDto(s.Id, s.Name, s.ContactEmail, s.Phone, s.IsActive, s.CreatedAt)).ToListAsync(ct);
        return new(items, total, page, pageSize, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<IEnumerable<SupplierDto>> GetAllAsync(CancellationToken ct) => await db.Suppliers.AsNoTracking().Where(s => s.IsActive).OrderBy(s => s.Name).Select(s => new SupplierDto(s.Id, s.Name, s.ContactEmail, s.Phone, s.IsActive, s.CreatedAt)).ToListAsync(ct);
    public async Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken ct) => ToDto(await db.Suppliers.FindAsync([id], ct) ?? throw new KeyNotFoundException("Supplier not found."));
    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct) { var s = new Supplier { Name = request.Name, ContactEmail = request.ContactEmail, Phone = request.Phone, IsActive = request.IsActive }; db.Add(s); await db.SaveChangesAsync(ct); return ToDto(s); }
    public async Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct) { var s = await db.Suppliers.FindAsync([id], ct) ?? throw new KeyNotFoundException("Supplier not found."); s.Name = request.Name; s.ContactEmail = request.ContactEmail; s.Phone = request.Phone; s.IsActive = request.IsActive; s.UpdatedAt = DateTime.UtcNow; await db.SaveChangesAsync(ct); return ToDto(s); }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var s = await db.Suppliers.FindAsync([id], ct) ?? throw new KeyNotFoundException("Supplier not found."); db.Remove(s); await db.SaveChangesAsync(ct); }
    private static SupplierDto ToDto(Supplier s) => new(s.Id, s.Name, s.ContactEmail, s.Phone, s.IsActive, s.CreatedAt);
}
