namespace Application.DTOs;

public record SupplierDto(
    Guid Id,
    string Name,
    string? ContactEmail,
    string? Phone,
    bool IsActive,
    DateTime CreatedAt,
    int ProductCount);

public record CreateSupplierRequest(string Name, string? ContactEmail, string? Phone, bool IsActive);
public record UpdateSupplierRequest(string Name, string? ContactEmail, string? Phone, bool IsActive);
