namespace Domain.Entities;

public class Detail
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    // Many details belong to one product.
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;


    // Many details belong to one invoice.
    public Guid InvoiceId { get; set; }

    public Invoice Invoice { get; set; } = null!;
}