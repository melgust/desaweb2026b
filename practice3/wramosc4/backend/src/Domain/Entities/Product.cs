namespace Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    // Supplier
    public Guid? SupplierId { get; set; }

    public Supplier? Supplier { get; set; }


    // Category
    public Guid? CategoryId { get; set; }

    public Category? Category { get; set; }


    // Invoice details
    public ICollection<InvoiceDetail> InvoiceDetails { get; set; }
        = new List<InvoiceDetail>();
}