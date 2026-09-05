using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context) => _context = context;

    public async Task<InvoicePagedResult> GetInvoicesAsync(string? search, string? sortBy, string? sortDirection, int page, int pageSize, CancellationToken ct)
    {
        var query = _context.Invoices
            .Include(i => i.Client)
            .Include(i => i.Details).ThenInclude(d => d.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(i => i.Client != null && i.Client.Name.Contains(search));

        query = (sortBy?.ToLower(), sortDirection?.ToLower()) switch
        {
            ("total", "desc") => query.OrderByDescending(i => i.Total),
            ("total", _) => query.OrderBy(i => i.Total),
            ("issuedate", "desc") => query.OrderByDescending(i => i.IssueDate),
            _ => query.OrderByDescending(i => i.IssueDate)
        };

        var totalItems = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new InvoicePagedResult
        {
            Items = items.Select(ToDto).ToList(),
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    public async Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Client)
            .Include(i => i.Details).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Factura no encontrada");

        return ToDto(invoice);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, ct)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        var invoice = new Invoice { ClientId = client.Id };

        foreach (var d in request.Details)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == d.ProductId, ct)
                ?? throw new KeyNotFoundException($"Producto {d.ProductId} no encontrado");

            invoice.Details.Add(new InvoiceDetail
            {
                ProductId = product.Id,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            });
        }

        invoice.Total = invoice.Details.Sum(d => d.Quantity * d.UnitPrice);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync(ct);

        return await GetByIdAsync(invoice.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Factura no encontrada");

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync(ct);
    }

    private static InvoiceDto ToDto(Invoice i) => new()
    {
        Id = i.Id,
        ClientId = i.ClientId,
        ClientName = i.Client?.Name ?? string.Empty,
        IssueDate = i.IssueDate,
        Total = i.Total,
        IsActive = i.IsActive,
        Details = i.Details.Select(d => new InvoiceDetailDto
        {
            Id = d.Id,
            ProductId = d.ProductId,
            ProductName = d.Product?.Name ?? string.Empty,
            Quantity = d.Quantity,
            UnitPrice = d.UnitPrice,
            Subtotal = d.Quantity * d.UnitPrice
        }).ToList()
    };
}