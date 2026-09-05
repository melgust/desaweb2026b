namespace Domain.Entities;

/// <summary>
/// Renglon de una factura: que producto, cuantas unidades y a que precio.
/// Es la tabla intermedia entre Facturas y Productos.
/// </summary>
public class InvoiceDetail
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>Nombre del producto al momento de facturar, por si luego cambia.</summary>
    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
