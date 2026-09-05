using Application.DTOs;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}