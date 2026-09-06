namespace Application.DTOs;

public class InvoiceDetailDto
{
    public int Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class InvoiceDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public List<InvoiceDetailDto> Details { get; set; } = new();
}

public class CreateInvoiceDetailDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateInvoiceDto
{
    public int ClientId { get; set; }
    public List<CreateInvoiceDetailDto> Details { get; set; } = new();
}