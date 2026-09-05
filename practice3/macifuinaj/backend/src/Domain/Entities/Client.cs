namespace Domain.Entities;

public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? Nit { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Un cliente tiene muchas facturas
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}