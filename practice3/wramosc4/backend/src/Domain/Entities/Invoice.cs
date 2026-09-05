namespace Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }

    public Client Client { get; set; } = null!;

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    public decimal Total { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // One invoice contains many detail rows.
    public ICollection<InvoiceDetail> Details { get; set; }
        = new List<InvoiceDetail>();
}