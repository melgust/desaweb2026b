namespace Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public decimal Total { get; set; }

    public Guid ClientId { get; set; }

    public Client Client { get; set; } = null!;

    // Una factura puede tener muchos detalles
    public ICollection<InvoiceDetail> Details { get; set; }
        = new List<InvoiceDetail>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}