using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IClientService
{
    Task<ClientPagedResult> GetClientsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken ct);
    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct);
    Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db) => _db = db;

    public async Task<ClientPagedResult> GetClientsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Clients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(lower)
                || (c.Email != null && c.Email.ToLower().Contains(lower)));
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
            .Select(c => new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);

        return new ClientPagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken ct)
    {
        return await _db.Clients.AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var c = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found.");
        return new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt);
    }

    public async Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct)
    {
        var c = new Client
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            IsActive = request.IsActive
        };
        _db.Clients.Add(c);
        await _db.SaveChangesAsync(ct);
        return new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt);
    }

    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct)
    {
        var c = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found.");
        c.Name = request.Name;
        c.Email = request.Email;
        c.Phone = request.Phone;
        c.Address = request.Address;
        c.IsActive = request.IsActive;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        bool hasInvoices = await _db.Invoices.AnyAsync(i => i.ClientId == id, ct);
        if (hasInvoices)
        {
            throw new InvalidOperationException("Cannot delete a client that already has invoices.");
        }

        var c = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found.");
        _db.Clients.Remove(c);
        await _db.SaveChangesAsync(ct);
    }
}
