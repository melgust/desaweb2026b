namespace Domain.Entities;

/// <summary>
/// Categoria a la que pertenecen los productos (Computo, Redes, Perifericos...).
/// Relacion uno a muchos: una categoria agrupa muchos productos.
/// </summary>
public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
