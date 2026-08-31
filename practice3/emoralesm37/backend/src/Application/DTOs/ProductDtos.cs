namespace Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    bool IsActive,
    DateTime CreatedAt,
    Guid? SupplierId,
    string? SupplierName,
    Guid? CategoriaId,
    string? CategoriaName
);

public record CreateProductRequest(
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    bool IsActive,
    Guid? SupplierId,
    Guid? CategoriaId
);

public record UpdateProductRequest(
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    bool IsActive,
    Guid? SupplierId,
    Guid? CategoriaId
);

public record ProductPagedResult(
    IEnumerable<ProductDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages
);