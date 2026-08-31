namespace Application.DTOs;

public record ProductDto(
    int Id, 
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    int SupplierId, 
    string? SupplierName,
    int CategoryId,
    string? CategoryName
);

public record CreateProductRequest(
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    int SupplierId,
    int CategoryId
);

public record UpdateProductRequest(
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    int SupplierId,
    int CategoryId
);

public record CreateProductDto(
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    int SupplierId,
    int CategoryId
);

public record UpdateProductDto(
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    int SupplierId,
    int CategoryId
);

public class ProductPagedResult
{
    public List<ProductDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
}