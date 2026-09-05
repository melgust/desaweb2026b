namespace Application.DTOs;

public class InvoiceDetailDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public decimal Total { get; set; }
    public bool IsActive { get; set; }
    public List<InvoiceDetailDto> Details { get; set; } = new();
}

public class CreateInvoiceDetailRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class CreateInvoiceRequest
{
    public Guid ClientId { get; set; }
    public List<CreateInvoiceDetailRequest> Details { get; set; } = new();
}

public class InvoicePagedResult
{
    public List<InvoiceDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}