namespace Application.DTOs;

public record ClientDto(Guid Id, string Name, string Email, string? Phone, string? Address, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt);
public record CreateClientRequest(string Name, string Email, string? Phone, string? Address, bool IsActive);
public record UpdateClientRequest(string Name, string Email, string? Phone, string? Address, bool IsActive);
public record ClientPagedResult(IEnumerable<ClientDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);
