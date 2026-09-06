using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Application.DTOs;
using Infrastructure.Data;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InvoicesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Client)
            .Include(i => i.Details)
                .ThenInclude(d => d.Product)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                Date = i.Date,
                Total = i.Total,
                ClientId = i.ClientId,
                ClientName = i.Client != null ? i.Client.Name : string.Empty,
                Details = i.Details.Select(d => new InvoiceDetailDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : string.Empty,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    Subtotal = d.Subtotal
                }).ToList()
            })
            .ToListAsync();

        return Ok(invoices);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice(CreateInvoiceDto dto)
    {
        var client = await _context.Clients.FindAsync(dto.ClientId);
        if (client == null)
        {
            return BadRequest(new { message = "El cliente especificado no existe." });
        }

        var invoice = new Invoice
        {
            ClientId = dto.ClientId,
            Date = DateTime.UtcNow,
            Details = new List<InvoiceDetail>()
        };

        decimal calculatedTotal = 0;

        foreach (var itemDto in dto.Details)
        {
            var product = await _context.Products.FindAsync(itemDto.ProductId);
            if (product == null)
            {
                return BadRequest(new { message = $"El producto con ID {itemDto.ProductId} no existe." });
            }

            if (product.Stock < itemDto.Quantity)
            {
                return BadRequest(new { message = $"Stock insuficiente para el producto: {product.Name}. Stock actual: {product.Stock}" });
            }

            // Descontar stock
            product.Stock -= itemDto.Quantity;

            var subtotal = product.Price * itemDto.Quantity;
            calculatedTotal += subtotal;

            invoice.Details.Add(new InvoiceDetail
            {
                ProductId = product.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = product.Price,
                Subtotal = subtotal
            });
        }

        invoice.Total = calculatedTotal;

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Factura creada con éxito", invoiceId = invoice.Id });
    }
}