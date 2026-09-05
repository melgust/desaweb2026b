using Application.DTOs;

namespace Application.Services;

public interface IClientService
{
    Task<ClientPagedResult> GetClientsAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken ct);
    Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}