namespace Application.DTOs;

// --- Detail ---
public record DetailDto(Guid Id, Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal Subtotal);

/// <summary>What the client sends when creating an invoice line: only the product and the quantity.
/// UnitPrice/Subtotal are always computed server-side from the product's current price.</summary>
public record CreateDetailRequest(Guid ProductId, int Quantity);

// --- Invoice ---
public record InvoiceListItemDto(Guid Id, string InvoiceNumber, Guid ClientId, string ClientName, DateTime InvoiceDate, string Status, decimal Total, DateTime CreatedAt);
public record InvoiceDto(Guid Id, string InvoiceNumber, Guid ClientId, string ClientName, DateTime InvoiceDate, string Status, decimal Total, DateTime CreatedAt, IEnumerable<DetailDto> Details);

public record CreateInvoiceRequest(Guid ClientId, DateTime InvoiceDate, List<CreateDetailRequest> Details);
public record UpdateInvoiceStatusRequest(string Status);

public record InvoicePagedResult(IEnumerable<InvoiceListItemDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);
