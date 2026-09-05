namespace Application.DTOs;

public record InvoiceDetailDto(Guid Id, Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal Subtotal);
public record CreateInvoiceDetailRequest(Guid ProductId, int Quantity);

public record InvoiceDto(Guid Id, Guid ClientId, string ClientName, DateTime IssueDate, string Status, decimal Total, DateTime CreatedAt, IEnumerable<InvoiceDetailDto> Details);
public record CreateInvoiceRequest(Guid ClientId, DateTime IssueDate, string Status, IEnumerable<CreateInvoiceDetailRequest> Details);
public record UpdateInvoiceRequest(Guid ClientId, DateTime IssueDate, string Status, IEnumerable<CreateInvoiceDetailRequest> Details);

public record InvoicePagedResult(IEnumerable<InvoiceDto> Items, int TotalItems, int Page, int PageSize, int TotalPages);