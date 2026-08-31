namespace Application.DTOs;

public record ProductDto(Guid Id, string Name, string? Description, decimal Price, int Stock, bool IsActive, DateTime CreatedAt, Guid? SupplierId, string? SupplierName, int? CategoryId, string? CategoryName);
public record CreateProductRequest(string Name, string? Description, decimal Price, int Stock, bool IsActive, Guid? SupplierId, int? CategoryId);
public record UpdateProductRequest(string Name, string? Description, decimal Price, int Stock, bool IsActive, Guid? SupplierId, int? CategoryId);

public record ProductPagedResult(IEnumerable<ProductDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);