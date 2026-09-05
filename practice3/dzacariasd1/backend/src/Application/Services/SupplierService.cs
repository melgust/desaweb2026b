using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface ISupplierService
{
    Task<IEnumerable<SupplierDto>> GetAllAsync(bool onlyActive, CancellationToken ct);
    Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct);
    Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _db;

    public SupplierService(AppDbContext db) => _db = db;

    private static IQueryable<SupplierDto> Project(IQueryable<Supplier> query) =>
        query.Select(s => new SupplierDto(
            s.Id, s.Name, s.ContactEmail, s.Phone, s.IsActive, s.CreatedAt,
            s.Products.Count()));

    public async Task<IEnumerable<SupplierDto>> GetAllAsync(bool onlyActive, CancellationToken ct)
    {
        var query = _db.Suppliers.AsNoTracking().AsQueryable();
        if (onlyActive) query = query.Where(s => s.IsActive);

        return await Project(query.OrderBy(s => s.Name)).ToListAsync(ct);
    }

    public async Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await Project(_db.Suppliers.AsNoTracking().Where(s => s.Id == id)).FirstOrDefaultAsync(ct);
        return dto ?? throw new KeyNotFoundException("Supplier not found.");
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken ct)
    {
        await EnsureNameIsFreeAsync(request.Name, null, ct);

        var s = new Supplier
        {
            Name = request.Name.Trim(),
            ContactEmail = request.ContactEmail,
            Phone = request.Phone,
            IsActive = request.IsActive
        };
        _db.Suppliers.Add(s);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(s.Id, ct);
    }

    public async Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken ct)
    {
        var s = await _db.Suppliers.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Supplier not found.");

        await EnsureNameIsFreeAsync(request.Name, id, ct);

        s.Name = request.Name.Trim();
        s.ContactEmail = request.ContactEmail;
        s.Phone = request.Phone;
        s.IsActive = request.IsActive;
        s.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(s.Id, ct);
    }

    /// <summary>
    /// Al eliminar un proveedor, los productos que surtia se conservan y quedan sin
    /// proveedor asignado (DeleteBehavior.SetNull). Se avisa cuantos quedaron asi.
    /// </summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Suppliers.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Supplier not found.");
        _db.Suppliers.Remove(s);
        await _db.SaveChangesAsync(ct);
    }

    private async Task EnsureNameIsFreeAsync(string name, Guid? ignoreId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("El nombre del proveedor es obligatorio.");

        var normalizado = name.Trim().ToLower();
        bool repetido = await _db.Suppliers
            .AnyAsync(s => s.Name.ToLower() == normalizado && (!ignoreId.HasValue || s.Id != ignoreId.Value), ct);

        if (repetido)
            throw new InvalidOperationException($"Ya existe un proveedor llamado {name.Trim()}.");
    }
}
