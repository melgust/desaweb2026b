namespace Application.DTOs;

public record ProductDto(Guid Id, string Name, string? Description, decimal Price, int Stock, bool IsActive, DateTime CreatedAt);
public record CreateProductRequest(string Name, string? Description, decimal Price, int Stock, bool IsActive);
public record UpdateProductRequest(string Name, string? Description, decimal Price, int Stock, bool IsActive);

/// <summary>
/// Resultado de la paginacion clasica por offset (pagina / tamanio de pagina).
/// Es la que alimenta los botones "Prev / Next" de la tabla.
/// </summary>
public record ProductPagedResult(IEnumerable<ProductDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);

/// <summary>
/// Resultado de la paginacion incremental usada por el scroll infinito.
/// En lugar de numero de pagina se trabaja con un desplazamiento (offset) y un
/// limite; la respuesta indica cual es el siguiente offset a pedir y si todavia
/// quedan registros por cargar, de modo que el cliente solo debe hacer scroll.
/// </summary>
public record ProductScrollResult(
    IEnumerable<ProductDto> Items,
    int Offset,
    int Limit,
    int TotalItems,
    int? NextOffset,
    bool HasMore);
