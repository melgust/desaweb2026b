namespace Application.DTOs;

public record ClientDto(
    Guid Id,
    string Name,
    string? Nit,
    string? Address,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateClientRequest(
    string Name,
    string? Nit,
    string? Address,
    bool IsActive
);

public record UpdateClientRequest(
    string Name,
    string? Nit,
    string? Address,
    bool IsActive
);

public record ClientPagedResult(
    IEnumerable<ClientDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages
);