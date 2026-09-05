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

    Task<IEnumerable<ClientDto>> GetAllAsync(
        CancellationToken ct
    );

    Task<ClientDto> GetByIdAsync(
        Guid id,
        CancellationToken ct
    );

    Task<ClientDto> CreateAsync(
        CreateClientRequest request,
        CancellationToken ct
    );

    Task<ClientDto> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken ct
    );

    Task DeleteAsync(
        Guid id,
        CancellationToken ct
    );
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
        CancellationToken ct
    )
    {
        page = page < 1 ? 1 : page;

        pageSize = pageSize switch
        {
            < 1 => 10,
            > 1000 => 1000,
            _ => pageSize
        };

        var query =
            _db.Clients
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower =
                search.Trim().ToLower();

            query = query.Where(c =>
                c.Name.ToLower().Contains(lower) ||
                (
                    c.Email != null &&
                    c.Email.ToLower().Contains(lower)
                ) ||
                (
                    c.Phone != null &&
                    c.Phone.ToLower().Contains(lower)
                ) ||
                (
                    c.Address != null &&
                    c.Address.ToLower().Contains(lower)
                )
            );
        }

        bool isDesc =
            sortDirection?.ToLower()
            == "desc";

        query = sortBy?.ToLower() switch
        {
            "email" =>
                isDesc
                    ? query.OrderByDescending(c => c.Email)
                    : query.OrderBy(c => c.Email),

            "phone" =>
                isDesc
                    ? query.OrderByDescending(c => c.Phone)
                    : query.OrderBy(c => c.Phone),

            "createdat" =>
                isDesc
                    ? query.OrderByDescending(c => c.CreatedAt)
                    : query.OrderBy(c => c.CreatedAt),

            "isactive" =>
                isDesc
                    ? query.OrderByDescending(c => c.IsActive)
                    : query.OrderBy(c => c.IsActive),

            _ =>
                isDesc
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name)
        };

        int totalItems =
            await query.CountAsync(ct);

        int totalPages =
            totalItems == 0
                ? 0
                : (int)Math.Ceiling(
                    totalItems /
                    (double)pageSize
                );

        var items =
            await query
                .Skip(
                    (page - 1) *
                    pageSize
                )
                .Take(pageSize)
                .Select(c =>
                    new ClientDto(
                        c.Id,
                        c.Name,
                        c.Email,
                        c.Phone,
                        c.Address,
                        c.IsActive,
                        c.CreatedAt
                    )
                )
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
        CancellationToken ct
    )
    {
        return await _db.Clients
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c =>
                new ClientDto(
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Phone,
                    c.Address,
                    c.IsActive,
                    c.CreatedAt
                )
            )
            .ToListAsync(ct);
    }

    public async Task<ClientDto> GetByIdAsync(
        Guid id,
        CancellationToken ct
    )
    {
        var client =
            await _db.Clients
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    c => c.Id == id,
                    ct
                )
            ?? throw new KeyNotFoundException(
                "Client not found."
            );

        return new ClientDto(
            client.Id,
            client.Name,
            client.Email,
            client.Phone,
            client.Address,
            client.IsActive,
            client.CreatedAt
        );
    }

    public async Task<ClientDto> CreateAsync(
        CreateClientRequest request,
        CancellationToken ct
    )
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException(
                "Client name is required."
            );
        }

        var client = new Client
        {
            Name = request.Name.Trim(),
            Email =
                string.IsNullOrWhiteSpace(request.Email)
                    ? null
                    : request.Email.Trim(),

            Phone =
                string.IsNullOrWhiteSpace(request.Phone)
                    ? null
                    : request.Phone.Trim(),

            Address =
                string.IsNullOrWhiteSpace(request.Address)
                    ? null
                    : request.Address.Trim(),

            IsActive = request.IsActive
        };

        _db.Clients.Add(client);

        await _db.SaveChangesAsync(ct);

        return new ClientDto(
            client.Id,
            client.Name,
            client.Email,
            client.Phone,
            client.Address,
            client.IsActive,
            client.CreatedAt
        );
    }

    public async Task<ClientDto> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken ct
    )
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException(
                "Client name is required."
            );
        }

        var client =
            await _db.Clients
                .FirstOrDefaultAsync(
                    c => c.Id == id,
                    ct
                )
            ?? throw new KeyNotFoundException(
                "Client not found."
            );

        client.Name =
            request.Name.Trim();

        client.Email =
            string.IsNullOrWhiteSpace(request.Email)
                ? null
                : request.Email.Trim();

        client.Phone =
            string.IsNullOrWhiteSpace(request.Phone)
                ? null
                : request.Phone.Trim();

        client.Address =
            string.IsNullOrWhiteSpace(request.Address)
                ? null
                : request.Address.Trim();

        client.IsActive =
            request.IsActive;

        client.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new ClientDto(
            client.Id,
            client.Name,
            client.Email,
            client.Phone,
            client.Address,
            client.IsActive,
            client.CreatedAt
        );
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken ct
    )
    {
        var client =
            await _db.Clients
                .Include(c => c.Invoices)
                .FirstOrDefaultAsync(
                    c => c.Id == id,
                    ct
                )
            ?? throw new KeyNotFoundException(
                "Client not found."
            );

        if (client.Invoices.Any())
        {
            throw new InvalidOperationException(
                "The client cannot be deleted because it has associated invoices."
            );
        }

        _db.Clients.Remove(client);

        await _db.SaveChangesAsync(ct);
    }
}