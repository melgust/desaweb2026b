using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(
        string? search,
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

    Task<InvoiceDto> UpdateAsync(
        Guid id,
        UpdateInvoiceRequest request,
        CancellationToken ct
    );

    Task DeleteAsync(
        Guid id,
        CancellationToken ct
    );
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<InvoicePagedResult> GetInvoicesAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var query = _db.Invoices
            .AsNoTracking()
            .Include(i => i.Client)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var value = search.ToLower();

            query = query.Where(i =>
                i.Client.Name.ToLower().Contains(value) ||
                i.Status.ToLower().Contains(value)
            );
        }

        query = query.OrderByDescending(i => i.InvoiceDate);

        int totalItems = await query.CountAsync(ct);

        int totalPages =
            (int)Math.Ceiling(totalItems / (double)pageSize);

        var invoices = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceDto(
                i.Id,
                i.ClientId,
                i.Client.Name,
                i.InvoiceDate,
                i.Total,
                i.Status,
                i.Details.Select(d =>
                    new InvoiceDetailDto(
                        d.Id,
                        d.ProductId,
                        d.Product.Name,
                        d.Quantity,
                        d.UnitPrice,
                        d.Subtotal
                    )
                ),
                i.CreatedAt
            ))
            .ToListAsync(ct);

        return new InvoicePagedResult(
            invoices,
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
                i.ClientId,
                i.Client.Name,
                i.InvoiceDate,
                i.Total,
                i.Status,
                i.Details.Select(d =>
                    new InvoiceDetailDto(
                        d.Id,
                        d.ProductId,
                        d.Product.Name,
                        d.Quantity,
                        d.UnitPrice,
                        d.Subtotal
                    )
                ),
                i.CreatedAt
            ))
            .FirstOrDefaultAsync(ct);

        return invoice
            ?? throw new KeyNotFoundException("Invoice not found.");
    }

    public async Task<InvoiceDto> CreateAsync(
        CreateInvoiceRequest request,
        CancellationToken ct)
    {
        await ValidateClientAsync(request.ClientId, ct);

        var invoice = new Invoice
        {
            ClientId = request.ClientId,
            InvoiceDate = DateTime.UtcNow,
            Status = "Pending"
        };

        foreach (var item in request.Details)
        {
            if (item.Quantity <= 0)
            {
                throw new InvalidOperationException(
                    "Quantity must be greater than zero."
                );
            }

            var product = await _db.Products
                .FirstOrDefaultAsync(
                    p => p.Id == item.ProductId,
                    ct
                )
                ?? throw new KeyNotFoundException(
                    "Product not found."
                );

            decimal subtotal =
                product.Price * item.Quantity;

            invoice.Details.Add(
                new InvoiceDetail
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    Subtotal = subtotal
                }
            );
        }

        invoice.Total =
            invoice.Details.Sum(d => d.Subtotal);

        _db.Invoices.Add(invoice);

        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task<InvoiceDto> UpdateAsync(
        Guid id,
        UpdateInvoiceRequest request,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Details)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException(
                "Invoice not found."
            );

        await ValidateClientAsync(
            request.ClientId,
            ct
        );

        invoice.ClientId = request.ClientId;
        invoice.Status = request.Status;
        invoice.UpdatedAt = DateTime.UtcNow;

        _db.InvoiceDetails.RemoveRange(
            invoice.Details
        );

        invoice.Details.Clear();

        foreach (var item in request.Details)
        {
            if (item.Quantity <= 0)
            {
                throw new InvalidOperationException(
                    "Quantity must be greater than zero."
                );
            }

            var product = await _db.Products
                .FirstOrDefaultAsync(
                    p => p.Id == item.ProductId,
                    ct
                )
                ?? throw new KeyNotFoundException(
                    "Product not found."
                );

            decimal subtotal =
                product.Price * item.Quantity;

            invoice.Details.Add(
                new InvoiceDetail
                {
                    InvoiceId = invoice.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    Subtotal = subtotal
                }
            );
        }

        invoice.Total =
            invoice.Details.Sum(d => d.Subtotal);

        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(
            invoice.Id,
            ct
        );
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException(
                "Invoice not found."
            );

        _db.Invoices.Remove(invoice);

        await _db.SaveChangesAsync(ct);
    }

    private async Task ValidateClientAsync(
        Guid clientId,
        CancellationToken ct)
    {
        bool exists = await _db.Clients
            .AnyAsync(
                c => c.Id == clientId &&
                     c.IsActive,
                ct
            );

        if (!exists)
        {
            throw new KeyNotFoundException(
                "Client not found."
            );
        }
    }
}