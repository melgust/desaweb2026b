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
    DateTime Date,
    Guid ClientId,
    string ClientName,
    decimal Total,
    DateTime CreatedAt,
    IEnumerable<InvoiceDetailDto> Details
);

public record CreateInvoiceDetailRequest(
    Guid ProductId,
    int Quantity
);

public record CreateInvoiceRequest(
    Guid ClientId,
    IEnumerable<CreateInvoiceDetailRequest> Details
);

public record InvoicePagedResult(
    IEnumerable<InvoiceDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages
);