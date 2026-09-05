namespace Application.DTOs;

/// <summary>Renglon de factura tal como se devuelve al cliente.</summary>
public record InvoiceDetailDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

/// <summary>Resumen de factura para el listado (sin los renglones).</summary>
public record InvoiceSummaryDto(
    Guid Id,
    string Number,
    Guid ClientId,
    string ClientName,
    string ClientNit,
    DateTime IssuedAt,
    decimal Subtotal,
    decimal Tax,
    decimal Total,
    int LineCount);

/// <summary>Factura completa, con sus renglones.</summary>
public record InvoiceDto(
    Guid Id,
    string Number,
    Guid ClientId,
    string ClientName,
    string ClientNit,
    string? ClientAddress,
    DateTime IssuedAt,
    decimal Subtotal,
    decimal Tax,
    decimal Total,
    string? Notes,
    IEnumerable<InvoiceDetailDto> Details);

/// <summary>
/// Renglon que envia el cliente al crear una factura. Solo manda el producto y la
/// cantidad: el precio y los totales los calcula el servidor con el precio vigente,
/// para que no se puedan manipular desde el navegador.
/// </summary>
public record CreateInvoiceDetailRequest(Guid ProductId, int Quantity);

public record CreateInvoiceRequest(
    Guid ClientId,
    string? Notes,
    IEnumerable<CreateInvoiceDetailRequest> Details);

public record InvoicePagedResult(
    IEnumerable<InvoiceSummaryDto> Items,
    int TotalItems,
    int Page,
    int PageSize,
    int TotalPages);
