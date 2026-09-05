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
    Task<InvoiceDto> UpdateAsync(Guid id, UpdateInvoiceRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db) => _db = db;

    public async Task<InvoicePagedResult> GetInvoicesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Invoices.AsNoTracking().Include(i => i.Client).Include(i => i.Details).ThenInclude(d => d.Product).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(i => i.Client != null && i.Client.Name.ToLower().Contains(lower));
        }

        bool isDesc = sortDirection?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "total" => isDesc ? query.OrderByDescending(i => i.Total) : query.OrderBy(i => i.Total),
            "status" => isDesc ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            "client" => isDesc ? query.OrderByDescending(i => i.Client!.Name) : query.OrderBy(i => i.Client!.Name),
            _ => isDesc ? query.OrderByDescending(i => i.IssueDate) : query.OrderBy(i => i.IssueDate),
        };

        int totalItems = await query.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var pageItems = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var items = pageItems.Select(MapToDto);

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
        bool clientExists = await _db.Clients.AnyAsync(c => c.Id == request.ClientId, ct);
        if (!clientExists) throw new KeyNotFoundException("Client not found.");

        var invoice = new Invoice
        {
            ClientId = request.ClientId,
            IssueDate = request.IssueDate,
            Status = request.Status
        };

        decimal total = 0;
        foreach (var line in request.Details)
        {
            var product = await _db.Products.FindAsync(new object[] { line.ProductId }, ct)
                ?? throw new KeyNotFoundException($"Product {line.ProductId} not found.");

            var subtotal = product.Price * line.Quantity;
            invoice.Details.Add(new InvoiceDetail
            {
                ProductId = product.Id,
                Quantity = line.Quantity,
                UnitPrice = product.Price,
                Subtotal = subtotal
            });
            total += subtotal;
        }
        invoice.Total = total;

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task<InvoiceDto> UpdateAsync(Guid id, UpdateInvoiceRequest request, CancellationToken ct)
    {
        var invoice = await _db.Invoices.Include(i => i.Details)
            .FirstOrDefaultAsync(i => i.Id == id, ct) ?? throw new KeyNotFoundException("Invoice not found.");

        bool clientExists = await _db.Clients.AnyAsync(c => c.Id == request.ClientId, ct);
        if (!clientExists) throw new KeyNotFoundException("Client not found.");

        invoice.ClientId = request.ClientId;
        invoice.IssueDate = request.IssueDate;
        invoice.Status = request.Status;

        // Replace all detail lines.
        _db.InvoiceDetails.RemoveRange(invoice.Details);
        invoice.Details.Clear();

        decimal total = 0;
        foreach (var line in request.Details)
        {
            var product = await _db.Products.FindAsync(new object[] { line.ProductId }, ct)
                ?? throw new KeyNotFoundException($"Product {line.ProductId} not found.");

            var subtotal = product.Price * line.Quantity;
            invoice.Details.Add(new InvoiceDetail
            {
                ProductId = product.Id,
                Quantity = line.Quantity,
                UnitPrice = product.Price,
                Subtotal = subtotal
            });
            total += subtotal;
        }
        invoice.Total = total;

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var invoice = await _db.Invoices.FindAsync(new object[] { id }, ct) ?? throw new KeyNotFoundException("Invoice not found.");
        _db.Invoices.Remove(invoice);
        await _db.SaveChangesAsync(ct);
    }

    private static InvoiceDto MapToDto(Invoice i)
    {
        var details = i.Details.Select(d => new InvoiceDetailDto(
            d.Id, d.ProductId, d.Product != null ? d.Product.Name : "", d.Quantity, d.UnitPrice, d.Subtotal));

        return new InvoiceDto(i.Id, i.ClientId, i.Client != null ? i.Client.Name : "", i.IssueDate, i.Status, i.Total, i.CreatedAt, details);
    }
}