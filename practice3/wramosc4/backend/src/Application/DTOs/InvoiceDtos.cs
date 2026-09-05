namespace Application.DTOs;

public record InvoiceDetailDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

public record InvoiceDto(
    Guid Id,
    Guid ClientId,
    string ClientName,
    DateTime InvoiceDate,
    decimal Total,
    string Status,
    IEnumerable<InvoiceDetailDto> Details,
    DateTime CreatedAt
);

public record CreateInvoiceDetailRequest(
    Guid ProductId,
    int Quantity
);

public record CreateInvoiceRequest(
    Guid ClientId,
    IEnumerable<CreateInvoiceDetailRequest> Details
);

public record UpdateInvoiceRequest(
    Guid ClientId,
    string Status,
    IEnumerable<CreateInvoiceDetailRequest> Details
);

public record InvoicePagedResult(
    IEnumerable<InvoiceDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages
);