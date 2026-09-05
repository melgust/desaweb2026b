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
        page = Math.Max(page, 1); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _db.Clients.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.ToLower(); query = query.Where(c => c.Name.ToLower().Contains(term) || c.Email.ToLower().Contains(term)); }
        var desc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch { "email" => desc ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email), "createdat" => desc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt), _ => desc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name) };
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(c => new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt, c.UpdatedAt)).ToListAsync(ct);
        return new ClientPagedResult(items, total, page, pageSize, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken ct) => await _db.Clients.AsNoTracking().Where(c => c.IsActive).OrderBy(c => c.Name).Select(c => new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt, c.UpdatedAt)).ToListAsync(ct);
    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct) => await _db.Clients.AsNoTracking().Where(c => c.Id == id).Select(c => new ClientDto(c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsActive, c.CreatedAt, c.UpdatedAt)).FirstOrDefaultAsync(ct) ?? throw new KeyNotFoundException("Client not found.");
    public async Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct) { Validate(request.Name, request.Email); if (await _db.Clients.AnyAsync(c => c.Email == request.Email.Trim(), ct)) throw new InvalidOperationException("A client with this email already exists."); var client = new Client { Name = request.Name.Trim(), Email = request.Email.Trim(), Phone = request.Phone?.Trim(), Address = request.Address?.Trim(), IsActive = request.IsActive }; _db.Clients.Add(client); await _db.SaveChangesAsync(ct); return await GetByIdAsync(client.Id, ct); }
    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct) { Validate(request.Name, request.Email); var client = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found."); var email = request.Email.Trim(); if (await _db.Clients.AnyAsync(c => c.Email == email && c.Id != id, ct)) throw new InvalidOperationException("A client with this email already exists."); client.Name = request.Name.Trim(); client.Email = email; client.Phone = request.Phone?.Trim(); client.Address = request.Address?.Trim(); client.IsActive = request.IsActive; client.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(ct); return await GetByIdAsync(id, ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var client = await _db.Clients.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Client not found."); client.IsActive = false; client.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(ct); }
    private static void Validate(string name, string email) { if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Client name is required."); if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Client email is required."); }
}
