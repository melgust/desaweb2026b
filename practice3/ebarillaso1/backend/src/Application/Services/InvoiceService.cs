using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct);
    Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct);
    Task<InvoiceDto> UpdateStatusAsync(Guid id, UpdateInvoiceStatusRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class InvoiceService : IInvoiceService
{
    private static readonly string[] ValidStatuses = { "Pending", "Paid", "Cancelled" };

    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db) => _db = db;

    public async Task<InvoicePagedResult> GetInvoicesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Invoices.AsNoTracking().Include(i => i.Client).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(i => i.InvoiceNumber.ToLower().Contains(lower)
                || i.Client.Name.ToLower().Contains(lower));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "total" => isDesc ? query.OrderByDescending(i => i.Total) : query.OrderBy(i => i.Total),
            "status" => isDesc ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            "client" => isDesc ? query.OrderByDescending(i => i.Client.Name) : query.OrderBy(i => i.Client.Name),
            _ => isDesc ? query.OrderByDescending(i => i.InvoiceDate) : query.OrderBy(i => i.InvoiceDate),
        };

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => new InvoiceListItemDto(i.Id, i.InvoiceNumber, i.ClientId, i.Client.Name, i.InvoiceDate, i.Status, i.Total, i.CreatedAt))
            .ToListAsync(ct);

        return new InvoicePagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var invoice = await _db.Invoices.AsNoTracking()
            .Include(i => i.Client)
            .Include(i => i.Details).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Invoice not found.");

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct)
    {
        if (request.Details is null || request.Details.Count == 0)
        {
            throw new InvalidOperationException("An invoice needs at least one detail line.");
        }

        var client = await _db.Clients.FindAsync(new object[] { request.ClientId }, ct)
            ?? throw new KeyNotFoundException("Client not found.");

        var invoice = new Invoice
        {
            ClientId = client.Id,
            InvoiceDate = request.InvoiceDate == default ? DateTime.UtcNow : request.InvoiceDate,
            Status = "Pending",
            InvoiceNumber = await GenerateInvoiceNumberAsync(ct)
        };

        decimal total = 0;

        foreach (var line in request.Details)
        {
            if (line.Quantity <= 0)
            {
                throw new InvalidOperationException("Detail quantity must be greater than zero.");
            }

            var product = await _db.Products.FindAsync(new object[] { line.ProductId }, ct)
                ?? throw new KeyNotFoundException($"Product {line.ProductId} not found.");

            if (product.Stock < line.Quantity)
            {
                throw new InvalidOperationException($"Not enough stock for '{product.Name}'. Available: {product.Stock}, requested: {line.Quantity}.");
            }

            var subtotal = product.Price * line.Quantity;

            invoice.Details.Add(new Detail
            {
                ProductId = product.Id,
                Quantity = line.Quantity,
                UnitPrice = product.Price,
                Subtotal = subtotal
            });

            // Decrease stock immediately since the sale is being registered now.
            product.Stock -= line.Quantity;
            total += subtotal;
        }

        invoice.Total = total;

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task<InvoiceDto> UpdateStatusAsync(Guid id, UpdateInvoiceStatusRequest request, CancellationToken ct)
    {
        if (!ValidStatuses.Contains(request.Status))
        {
            throw new InvalidOperationException($"Status must be one of: {string.Join(", ", ValidStatuses)}.");
        }

        var invoice = await _db.Invoices.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Invoice not found.");
        invoice.Status = request.Status;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var invoice = await _db.Invoices.Include(i => i.Details).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Invoice not found.");

        // Restock products since this invoice is being removed entirely.
        foreach (var detail in invoice.Details)
        {
            detail.Product.Stock += detail.Quantity;
        }

        _db.Invoices.Remove(invoice); // Details cascade-delete with the invoice.
        await _db.SaveChangesAsync(ct);
    }

    private async Task<string> GenerateInvoiceNumberAsync(CancellationToken ct)
    {
        int count = await _db.Invoices.CountAsync(ct);
        return $"INV-{(count + 1):D6}";
    }

    private static InvoiceDto MapToDto(Invoice invoice)
    {
        var details = invoice.Details.Select(d => new DetailDto(d.Id, d.ProductId, d.Product.Name, d.Quantity, d.UnitPrice, d.Subtotal));
        return new InvoiceDto(invoice.Id, invoice.InvoiceNumber, invoice.ClientId, invoice.Client.Name, invoice.InvoiceDate, invoice.Status, invoice.Total, invoice.CreatedAt, details);
    }
}
