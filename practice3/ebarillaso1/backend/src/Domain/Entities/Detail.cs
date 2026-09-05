namespace Domain.Entities;

public class Detail
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }

    /// <summary>Snapshot of the product's price at the moment of billing.</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>Quantity * UnitPrice, stored so historical invoices don't change if the product price changes later.</summary>
    public decimal Subtotal { get; set; }
}
