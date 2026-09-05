using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(
        int page,
        int pageSize,
        CancellationToken ct
    );

    Task<InvoiceDto> GetByIdAsync(
        Guid id,
        CancellationToken ct
    );

    Task<InvoiceDto> CreateAsync(
        CreateInvoiceRequest request,
        CancellationToken ct
    );
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db) => _db = db;

    public async Task<InvoicePagedResult> GetInvoicesAsync(
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var query = _db.Invoices
            .AsNoTracking()
            .OrderByDescending(i => i.Date);

        int totalItems = await query.CountAsync(ct);

        int totalPages =
            (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceDto(
                i.Id,
                i.Date,
                i.ClientId,
                i.Client.Name,
                i.Total,
                i.CreatedAt,
                i.Details.Select(d => new InvoiceDetailDto(
                    d.Id,
                    d.ProductId,
                    d.Product.Name,
                    d.Quantity,
                    d.UnitPrice,
                    d.Subtotal
                ))
            ))
            .ToListAsync(ct);

        return new InvoicePagedResult(
            items,
            totalItems,
            page,
            pageSize,
            totalPages
        );
    }

    public async Task<InvoiceDto> GetByIdAsync(
        Guid id,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .AsNoTracking()
            .Where(i => i.Id == id)
            .Select(i => new InvoiceDto(
                i.Id,
                i.Date,
                i.ClientId,
                i.Client.Name,
                i.Total,
                i.CreatedAt,
                i.Details.Select(d => new InvoiceDetailDto(
                    d.Id,
                    d.ProductId,
                    d.Product.Name,
                    d.Quantity,
                    d.UnitPrice,
                    d.Subtotal
                ))
            ))
            .FirstOrDefaultAsync(ct);

        return invoice
            ?? throw new KeyNotFoundException("Invoice not found.");
    }

    public async Task<InvoiceDto> CreateAsync(
        CreateInvoiceRequest request,
        CancellationToken ct)
    {
        var client = await _db.Clients
            .FirstOrDefaultAsync(
                c => c.Id == request.ClientId,
                ct
            )
            ?? throw new KeyNotFoundException("Client not found.");

        if (!client.IsActive)
            throw new InvalidOperationException(
                "The client is not active."
            );

        var requestedDetails = request.Details.ToList();

        if (requestedDetails.Count == 0)
            throw new InvalidOperationException(
                "The invoice must contain at least one product."
            );

        if (requestedDetails.Any(d => d.Quantity <= 0))
            throw new InvalidOperationException(
                "Product quantity must be greater than zero."
            );

        var productIds = requestedDetails
            .Select(d => d.ProductId)
            .Distinct()
            .ToList();

        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, ct);

        if (products.Count != productIds.Count)
            throw new KeyNotFoundException(
                "One or more products were not found."
            );

        var invoice = new Invoice
        {
            ClientId = client.Id,
            Date = DateTime.UtcNow
        };

        foreach (var requestedDetail in requestedDetails)
        {
            var product = products[requestedDetail.ProductId];

            if (!product.IsActive)
                throw new InvalidOperationException(
                    $"Product '{product.Name}' is not active."
                );

            decimal subtotal =
                product.Price * requestedDetail.Quantity;

            invoice.Details.Add(new InvoiceDetail
            {
                ProductId = product.Id,
                Quantity = requestedDetail.Quantity,
                UnitPrice = product.Price,
                Subtotal = subtotal
            });
        }

        invoice.Total = invoice.Details.Sum(d => d.Subtotal);

        _db.Invoices.Add(invoice);

        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(invoice.Id, ct);
    }
}