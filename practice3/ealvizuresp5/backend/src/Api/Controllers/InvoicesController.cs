using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;
    public InvoicesController(IInvoiceService service) => _service = service;
    [HttpGet, Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoicePagedResult>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) => Ok(await _service.GetInvoicesAsync(page, pageSize, ct));
    [HttpGet("{id:guid}"), Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid id, CancellationToken ct) { try { return Ok(await _service.GetByIdAsync(id, ct)); } catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); } }
    [HttpPost, Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<InvoiceDto>> Create(CreateInvoiceRequest request, CancellationToken ct) { try { var result = await _service.CreateAsync(request, ct); return CreatedAtAction(nameof(GetById), new { id = result.Id }, result); } catch (ArgumentException e) { return BadRequest(new { message = e.Message }); } catch (KeyNotFoundException e) { return BadRequest(new { message = e.Message }); } }
}
