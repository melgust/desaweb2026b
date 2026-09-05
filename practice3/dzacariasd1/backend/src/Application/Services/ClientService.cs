using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IClientService
{
    Task<IEnumerable<ClientDto>> GetAllAsync(bool onlyActive, CancellationToken ct);
    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct);
    Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db) => _db = db;

    private static IQueryable<ClientDto> Project(IQueryable<Client> query) =>
        query.Select(c => new ClientDto(
            c.Id, c.Name, c.Nit, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt,
            c.Invoices.Count()));

    public async Task<IEnumerable<ClientDto>> GetAllAsync(bool onlyActive, CancellationToken ct)
    {
        var query = _db.Clients.AsNoTracking().AsQueryable();
        if (onlyActive) query = query.Where(c => c.IsActive);

        return await Project(query.OrderBy(c => c.Name)).ToListAsync(ct);
    }

    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await Project(_db.Clients.AsNoTracking().Where(c => c.Id == id)).FirstOrDefaultAsync(ct);
        return dto ?? throw new KeyNotFoundException("Client not found.");
    }

    public async Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct)
    {
        Validar(request.Name, request.Nit);
        await EnsureNitIsFreeAsync(request.Nit, null, ct);

        var c = new Client
        {
            Name = request.Name.Trim(),
            Nit = request.Nit.Trim().ToUpper(),
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            IsActive = request.IsActive
        };
        _db.Clients.Add(c);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(c.Id, ct);
    }

    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct)
    {
        var c = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found.");

        Validar(request.Name, request.Nit);
        await EnsureNitIsFreeAsync(request.Nit, id, ct);

        c.Name = request.Name.Trim();
        c.Nit = request.Nit.Trim().ToUpper();
        c.Email = request.Email;
        c.Phone = request.Phone;
        c.Address = request.Address;
        c.IsActive = request.IsActive;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(c.Id, ct);
    }

    /// <summary>
    /// Un cliente con facturas emitidas no se elimina: borrarlo dejaria facturas sin
    /// titular. Lo correcto es marcarlo como inactivo.
    /// </summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found.");

        int facturas = await _db.Invoices.CountAsync(i => i.ClientId == id, ct);
        if (facturas > 0)
            throw new InvalidOperationException($"No se puede eliminar el cliente porque tiene {facturas} factura(s) emitida(s). Puede marcarlo como inactivo.");

        _db.Clients.Remove(c);
        await _db.SaveChangesAsync(ct);
    }

    private static void Validar(string name, string nit)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("El nombre del cliente es obligatorio.");
        if (string.IsNullOrWhiteSpace(nit))
            throw new InvalidOperationException("El NIT es obligatorio.");
    }

    private async Task EnsureNitIsFreeAsync(string nit, Guid? ignoreId, CancellationToken ct)
    {
        var normalizado = nit.Trim().ToUpper();
        bool repetido = await _db.Clients
            .AnyAsync(c => c.Nit == normalizado && (!ignoreId.HasValue || c.Id != ignoreId.Value), ct);

        if (repetido)
            throw new InvalidOperationException($"Ya existe un cliente con el NIT {normalizado}.");
    }
}
