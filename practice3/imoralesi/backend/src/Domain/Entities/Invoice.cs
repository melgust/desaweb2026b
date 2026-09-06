namespace Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    
    public int ClientId { get; set; }
    public Client? Client { get; set; }

    public ICollection<InvoiceDetail> Details { get; set; } = new List<InvoiceDetail>();
}