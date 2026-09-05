using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _service;
    public ClientsController(IClientService service) => _service = service;
    [HttpGet, Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<ClientPagedResult>> Get([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) => Ok(await _service.GetClientsAsync(search, sortBy, sortDirection, page, pageSize, ct));
    [HttpGet("all"), Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<IEnumerable<ClientDto>>> GetAll(CancellationToken ct) => Ok(await _service.GetAllAsync(ct));
    [HttpGet("{id:guid}"), Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<ClientDto>> GetById(Guid id, CancellationToken ct) { try { return Ok(await _service.GetByIdAsync(id, ct)); } catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); } }
    [HttpPost, Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ClientDto>> Create(CreateClientRequest request, CancellationToken ct) { try { var result = await _service.CreateAsync(request, ct); return CreatedAtAction(nameof(GetById), new { id = result.Id }, result); } catch (ArgumentException e) { return BadRequest(new { message = e.Message }); } catch (InvalidOperationException e) { return Conflict(new { message = e.Message }); } }
    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ClientDto>> Update(Guid id, UpdateClientRequest request, CancellationToken ct) { try { return Ok(await _service.UpdateAsync(id, request, ct)); } catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); } catch (ArgumentException e) { return BadRequest(new { message = e.Message }); } catch (InvalidOperationException e) { return Conflict(new { message = e.Message }); } }
    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) { try { await _service.DeleteAsync(id, ct); return NoContent(); } catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); } }
}
