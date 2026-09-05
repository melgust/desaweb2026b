namespace Application.DTOs;

public record CreateInvoiceDetailRequest(Guid ProductId, int Quantity);
public record CreateInvoiceRequest(Guid ClientId, IEnumerable<CreateInvoiceDetailRequest> Details);
public record InvoiceDetailDto(Guid Id, Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal Subtotal);
public record InvoiceDto(Guid Id, Guid ClientId, string ClientName, string InvoiceNumber, DateTime Date, decimal Total, bool IsActive, DateTime CreatedAt, IEnumerable<InvoiceDetailDto> Details);
public record InvoiceListDto(Guid Id, Guid ClientId, string ClientName, string InvoiceNumber, DateTime Date, decimal Total, bool IsActive);
public record InvoicePagedResult(IEnumerable<InvoiceListDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);
