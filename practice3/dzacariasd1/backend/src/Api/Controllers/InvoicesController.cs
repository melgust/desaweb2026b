using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService) => _invoiceService = invoiceService;

    /// <summary>
    /// Listado paginado de facturas. Se puede buscar por numero, nombre o NIT del
    /// cliente, y filtrar por cliente concreto.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoicePagedResult>> GetInvoices([FromQuery] string? search, [FromQuery] Guid? clientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        return Ok(await _invoiceService.GetInvoicesAsync(search, clientId, page, pageSize, ct));
    }

    /// <summary>Factura completa con todos sus renglones.</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid id, CancellationToken ct)
    {
        try { return Ok(await _invoiceService.GetByIdAsync(id, ct)); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    /// <summary>
    /// Emite una factura. El cuerpo solo trae el cliente y los productos con sus
    /// cantidades; los precios y totales los calcula el servidor.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _invoiceService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException e) { return BadRequest(new { message = e.Message }); }
        catch (InvalidOperationException e) { return Conflict(new { message = e.Message }); }
    }

    /// <summary>Anula la factura y devuelve las unidades al inventario.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _invoiceService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }
}
