using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(int page, int pageSize, CancellationToken ct);
    Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct);
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;
    public InvoiceService(AppDbContext db) => _db = db;
    public async Task<InvoicePagedResult> GetInvoicesAsync(int page, int pageSize, CancellationToken ct) { page = Math.Max(page, 1); pageSize = Math.Clamp(pageSize, 1, 100); var query = _db.Invoices.AsNoTracking().OrderByDescending(i => i.Date); var total = await query.CountAsync(ct); var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(i => new InvoiceListDto(i.Id, i.ClientId, i.Client.Name, i.InvoiceNumber, i.Date, i.Total, i.IsActive)).ToListAsync(ct); return new InvoicePagedResult(items, total, page, pageSize, (int)Math.Ceiling(total / (double)pageSize)); }
    public async Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct) => await _db.Invoices.AsNoTracking().Where(i => i.Id == id).Select(i => new InvoiceDto(i.Id, i.ClientId, i.Client.Name, i.InvoiceNumber, i.Date, i.Total, i.IsActive, i.CreatedAt, i.Details.OrderBy(d => d.Product.Name).Select(d => new InvoiceDetailDto(d.Id, d.ProductId, d.Product.Name, d.Quantity, d.UnitPrice, d.Subtotal)))).FirstOrDefaultAsync(ct) ?? throw new KeyNotFoundException("Invoice not found.");
    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct)
    {
        var requestedDetails = request.Details?.ToList() ?? [];
        if (requestedDetails.Count == 0) throw new ArgumentException("Invoice must have at least one detail.");
        if (requestedDetails.Any(d => d.Quantity <= 0)) throw new ArgumentException("Quantity must be greater than zero.");
        if (!await _db.Clients.AnyAsync(c => c.Id == request.ClientId && c.IsActive, ct)) throw new KeyNotFoundException("Client not found.");
        var productIds = requestedDetails.Select(d => d.ProductId).Distinct().ToList();
        var products = await _db.Products.Where(p => productIds.Contains(p.Id) && p.IsActive).ToDictionaryAsync(p => p.Id, ct);
        if (products.Count != productIds.Count) throw new KeyNotFoundException("One or more products were not found.");
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        var invoice = new Invoice { ClientId = request.ClientId, InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}" };
        foreach (var item in requestedDetails) { var price = products[item.ProductId].Price; invoice.Details.Add(new InvoiceDetail { ProductId = item.ProductId, Quantity = item.Quantity, UnitPrice = price, Subtotal = price * item.Quantity }); }
        invoice.Total = invoice.Details.Sum(d => d.Subtotal);
        _db.Invoices.Add(invoice); await _db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return await GetByIdAsync(invoice.Id, ct);
    }
}
