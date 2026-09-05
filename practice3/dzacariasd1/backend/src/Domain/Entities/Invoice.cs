namespace Domain.Entities;

/// <summary>
/// Factura emitida a un cliente. Una factura tiene muchos detalles (renglones).
/// Los importes se guardan calculados para que la factura conserve el precio que
/// tenia el producto el dia que se emitio, aunque despues ese precio cambie.
/// </summary>
public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Correlativo con formato FAC-000001. Unico.</summary>
    public string Number { get; set; } = string.Empty;

    public Guid ClientId { get; set; }
    public Client? Client { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceDetail> Details { get; set; } = new List<InvoiceDetail>();
}
