using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IClientService
{
    Task<ClientPagedResult> GetClientsAsync(
        string? search,
        string? sortBy,
        string? sortDirection,
        int page,
        int pageSize,
        CancellationToken ct
    );

    Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken ct);

    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct);

    Task<ClientDto> CreateAsync(
        CreateClientRequest request,
        CancellationToken ct
    );

    Task<ClientDto> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken ct
    );

    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ClientPagedResult> GetClientsAsync(
        string? search,
        string? sortBy,
        string? sortDirection,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var query = _db.Clients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var value = search.ToLower();

            query = query.Where(c =>
                c.Name.ToLower().Contains(value) ||
                (c.Email != null &&
                 c.Email.ToLower().Contains(value)) ||
                (c.Phone != null &&
                 c.Phone.ToLower().Contains(value))
            );
        }

        bool desc = sortDirection?.ToLower() == "desc";

        query = sortBy?.ToLower() switch
        {
            "email" => desc
                ? query.OrderByDescending(c => c.Email)
                : query.OrderBy(c => c.Email),

            "createdat" => desc
                ? query.OrderByDescending(c => c.CreatedAt)
                : query.OrderBy(c => c.CreatedAt),

            _ => desc
                ? query.OrderByDescending(c => c.Name)
                : query.OrderBy(c => c.Name)
        };

        int totalItems = await query.CountAsync(ct);

        int totalPages =
            (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClientDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.IsActive,
                c.CreatedAt
            ))
            .ToListAsync(ct);

        return new ClientPagedResult(
            items,
            totalItems,
            page,
            pageSize,
            totalPages
        );
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync(
        CancellationToken ct)
    {
        return await _db.Clients
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new ClientDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.IsActive,
                c.CreatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task<ClientDto> GetByIdAsync(
        Guid id,
        CancellationToken ct)
    {
        var client = await _db.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Client not found.");

        return new ClientDto(
            client.Id,
            client.Name,
            client.Email,
            client.Phone,
            client.IsActive,
            client.CreatedAt
        );
    }

    public async Task<ClientDto> CreateAsync(
        CreateClientRequest request,
        CancellationToken ct)
    {
        var client = new Client
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            IsActive = request.IsActive
        };

        _db.Clients.Add(client);

        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(client.Id, ct);
    }

    public async Task<ClientDto> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken ct)
    {
        var client = await _db.Clients
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Client not found.");

        client.Name = request.Name;
        client.Email = request.Email;
        client.Phone = request.Phone;
        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(client.Id, ct);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken ct)
    {
        var client = await _db.Clients
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Client not found.");

        bool hasInvoices = await _db.Invoices
            .AnyAsync(i => i.ClientId == id, ct);

        if (hasInvoices)
        {
            throw new InvalidOperationException(
                "Client cannot be deleted because it has invoices."
            );
        }

        _db.Clients.Remove(client);

        await _db.SaveChangesAsync(ct);
    }
}