namespace Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNumber { get; set; } = string.Empty;

    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    /// <summary>Pending, Paid or Cancelled.</summary>
    public string Status { get; set; } = "Pending";

    /// <summary>Sum of all Detail.Subtotal. Recalculated whenever details change.</summary>
    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // One invoice has many detail lines.
    public ICollection<Detail> Details { get; set; } = new List<Detail>();
}
