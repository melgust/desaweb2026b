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

    [HttpGet]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoicePagedResult>> GetInvoices([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        return Ok(await _invoiceService.GetInvoicesAsync(search, sortBy, sortDirection, page, pageSize, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid id, CancellationToken ct)
    {
        try
        {
            return Ok(await _invoiceService.GetByIdAsync(id, ct));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _invoiceService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<InvoiceDto>> UpdateStatus(Guid id, [FromBody] UpdateInvoiceStatusRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _invoiceService.UpdateStatusAsync(id, request, ct));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _invoiceService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
