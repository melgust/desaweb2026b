namespace Application.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    int ProductCount);

public record CreateCategoryRequest(string Name, string? Description, bool IsActive);
public record UpdateCategoryRequest(string Name, string? Description, bool IsActive);
