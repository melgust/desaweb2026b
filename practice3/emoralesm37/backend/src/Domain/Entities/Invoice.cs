namespace Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    public decimal Total { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    // Many invoices belong to one client.
    public Guid ClientId { get; set; }

    public Client Client { get; set; } = null!;


    // One invoice has many details.
    public ICollection<Detail> Details { get; set; }
        = new List<Detail>();
}