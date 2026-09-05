using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public interface IInvoiceService
{
    Task<InvoicePagedResult> GetInvoicesAsync(string? search, Guid? clientId, int page, int pageSize, CancellationToken ct);
    Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class InvoiceService : IInvoiceService
{
    /// <summary>IVA vigente en Guatemala.</summary>
    private const decimal TasaIva = 0.12m;

    private const int MaxPageSize = 100;

    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db) => _db = db;

    // ---------------------------------------------------------------- consultas

    public async Task<InvoicePagedResult> GetInvoicesAsync(string? search, Guid? clientId, int page, int pageSize, CancellationToken ct)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > MaxPageSize) pageSize = MaxPageSize;

        var query = _db.Invoices.AsNoTracking();

        if (clientId.HasValue)
            query = query.Where(i => i.ClientId == clientId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(i =>
                i.Number.ToLower().Contains(lower) ||
                i.Client!.Name.ToLower().Contains(lower) ||
                i.Client!.Nit.ToLower().Contains(lower));
        }

        // Mas recientes primero; el numero desempata para que el orden sea estable.
        var ordenada = query.OrderByDescending(i => i.IssuedAt).ThenByDescending(i => i.Number);

        int totalItems = await ordenada.CountAsync(ct);
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await ordenada
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceSummaryDto(
                i.Id, i.Number, i.ClientId,
                i.Client!.Name, i.Client!.Nit,
                i.IssuedAt, i.Subtotal, i.Tax, i.Total,
                i.Details.Count()))
            .ToListAsync(ct);

        return new InvoicePagedResult(items, totalItems, page, pageSize, totalPages);
    }

    public async Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var dto = await _db.Invoices.AsNoTracking()
            .Where(i => i.Id == id)
            .Select(i => new InvoiceDto(
                i.Id, i.Number, i.ClientId,
                i.Client!.Name, i.Client!.Nit, i.Client!.Address,
                i.IssuedAt, i.Subtotal, i.Tax, i.Total, i.Notes,
                i.Details
                    .OrderBy(d => d.ProductName)
                    .Select(d => new InvoiceDetailDto(
                        d.Id, d.ProductId, d.ProductName, d.Quantity, d.UnitPrice, d.LineTotal))))
            .FirstOrDefaultAsync(ct);

        return dto ?? throw new KeyNotFoundException("Invoice not found.");
    }

    // ---------------------------------------------------------------- creacion

    /// <summary>
    /// Crea la factura a partir de los productos y cantidades que envia el cliente.
    /// Los precios y los totales NO se toman de la peticion: se leen de la base de
    /// datos, para que no se puedan manipular desde el navegador. Ademas descuenta
    /// el stock de cada producto vendido.
    /// </summary>
    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken ct)
    {
        var lineas = (request.Details ?? Enumerable.Empty<CreateInvoiceDetailRequest>()).ToList();

        if (lineas.Count == 0)
            throw new InvalidOperationException("La factura debe tener al menos un renglón.");

        if (lineas.Any(l => l.Quantity <= 0))
            throw new InvalidOperationException("Las cantidades deben ser mayores que cero.");

        // Un mismo producto no puede venir en dos renglones: se acumulan las cantidades.
        var agrupadas = lineas
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToList();

        var cliente = await _db.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, ct)
            ?? throw new KeyNotFoundException("Client not found.");

        if (!cliente.IsActive)
            throw new InvalidOperationException("No se puede facturar a un cliente inactivo.");

        var ids = agrupadas.Select(a => a.ProductId).ToList();
        var productos = await _db.Products.Where(p => ids.Contains(p.Id)).ToListAsync(ct);

        if (productos.Count != agrupadas.Count)
            throw new KeyNotFoundException("Uno o más productos no existen.");

        // Se valida TODO el stock antes de descontar nada, para no dejar la factura a medias.
        foreach (var linea in agrupadas)
        {
            var p = productos.First(x => x.Id == linea.ProductId);
            if (p.Stock < linea.Quantity)
                throw new InvalidOperationException($"Stock insuficiente de «{p.Name}»: hay {p.Stock} y se solicitan {linea.Quantity}.");
        }

        var factura = new Invoice
        {
            Number = await GenerarCorrelativoAsync(ct),
            ClientId = cliente.Id,
            IssuedAt = DateTime.UtcNow,
            Notes = request.Notes
        };

        decimal subtotal = 0m;

        foreach (var linea in agrupadas)
        {
            var p = productos.First(x => x.Id == linea.ProductId);
            decimal totalLinea = Math.Round(p.Price * linea.Quantity, 2);

            factura.Details.Add(new InvoiceDetail
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Quantity = linea.Quantity,
                UnitPrice = p.Price,
                LineTotal = totalLinea
            });

            subtotal += totalLinea;

            // Descuento de inventario.
            p.Stock -= linea.Quantity;
            p.UpdatedAt = DateTime.UtcNow;
        }

        factura.Subtotal = Math.Round(subtotal, 2);
        factura.Tax = Math.Round(subtotal * TasaIva, 2);
        factura.Total = factura.Subtotal + factura.Tax;

        _db.Invoices.Add(factura);
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(factura.Id, ct);
    }

    /// <summary>
    /// Anula la factura y devuelve al inventario las unidades que se habian
    /// descontado. Los renglones se eliminan en cascada con la factura.
    /// </summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var factura = await _db.Invoices
            .Include(i => i.Details)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Invoice not found.");

        var ids = factura.Details.Select(d => d.ProductId).ToList();
        var productos = await _db.Products.Where(p => ids.Contains(p.Id)).ToListAsync(ct);

        foreach (var d in factura.Details)
        {
            var p = productos.FirstOrDefault(x => x.Id == d.ProductId);
            if (p == null) continue;
            p.Stock += d.Quantity;
            p.UpdatedAt = DateTime.UtcNow;
        }

        _db.Invoices.Remove(factura);
        await _db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Genera el siguiente correlativo con formato FAC-000001. Se apoya en el
    /// ultimo numero emitido; el indice unico de la columna es la garantia final.
    /// </summary>
    private async Task<string> GenerarCorrelativoAsync(CancellationToken ct)
    {
        var ultimo = await _db.Invoices
            .OrderByDescending(i => i.Number)
            .Select(i => i.Number)
            .FirstOrDefaultAsync(ct);

        int siguiente = 1;
        if (!string.IsNullOrEmpty(ultimo) && int.TryParse(ultimo.Replace("FAC-", ""), out var n))
            siguiente = n + 1;

        return $"FAC-{siguiente:D6}";
    }
}
