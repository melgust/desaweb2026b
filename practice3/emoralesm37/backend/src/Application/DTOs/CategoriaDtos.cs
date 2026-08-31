namespace Application.DTOs;

public record CategoriaDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);


public record CreateCategoriaRequest(
    string Name,
    string? Description,
    bool IsActive
);


public record UpdateCategoriaRequest(
    string Name,
    string? Description,
    bool IsActive
);


public record CategoriaPagedResult(
    IEnumerable<CategoriaDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages
);