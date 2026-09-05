namespace Application.DTOs;

public record ClientDto(
    Guid Id,
    string Name,
    string Nit,
    string? Email,
    string? Phone,
    string? Address,
    bool IsActive,
    DateTime CreatedAt,
    int InvoiceCount);

public record CreateClientRequest(string Name, string Nit, string? Email, string? Phone, string? Address, bool IsActive);
public record UpdateClientRequest(string Name, string Nit, string? Email, string? Phone, string? Address, bool IsActive);
