namespace Application.DTOs;

public record CategoryDto(Guid Id, string Name, string? Description, DateTime CreatedAt);
public record CreateCategoryRequest(string Name, string? Description, Guid? productId);
public record UpdateCategoryRequest(string Name, string? Description, Guid? productId);

public record CategoryPagedResult(IEnumerable<CategoryDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);