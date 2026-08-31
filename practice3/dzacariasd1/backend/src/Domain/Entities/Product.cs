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

    // --- Relacion con Categoria ---
    // Es opcional (Guid?) para que los productos que ya existian antes de crear
    // la tabla Categorias sigan siendo validos; en la interfaz el campo si es
    // obligatorio al dar de alta o editar un producto.
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
}
