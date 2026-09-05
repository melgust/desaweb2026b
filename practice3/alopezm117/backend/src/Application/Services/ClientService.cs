using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _context;

    public ClientService(AppDbContext context) => _context = context;

    public async Task<ClientPagedResult> GetClientsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _context.Clients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Name.Contains(search) || (c.Email != null && c.Email.Contains(search)));

        query = (sortBy?.ToLower(), sortDirection?.ToLower()) switch
        {
            ("name", "desc") => query.OrderByDescending(c => c.Name),
            ("createdat", "desc") => query.OrderByDescending(c => c.CreatedAt),
            ("createdat", _) => query.OrderBy(c => c.CreatedAt),
            _ => query.OrderBy(c => c.Name)
        };

        var totalItems = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new ClientPagedResult
        {
            Items = items.Select(ToDto).ToList(),
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Cliente no encontrado");
        return ToDto(client);
    }

    public async Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct)
    {
        var client = new Client
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync(ct);
        return ToDto(client);
    }

    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        client.Name = request.Name;
        client.Email = request.Email;
        client.Phone = request.Phone;
        client.Address = request.Address;
        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return ToDto(client);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync(ct);
    }

    private static ClientDto ToDto(Client c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Email = c.Email,
        Phone = c.Phone,
        Address = c.Address,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt
    };
}