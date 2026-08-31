using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class CategoriesController(ICategoryService service) : ControllerBase
{
    [HttpGet, Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<CategoryPagedResult>> GetCategories([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) => Ok(await service.GetCategoriesAsync(search, sortBy, sortDirection, page, pageSize, ct));
    [HttpGet("all"), Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll(CancellationToken ct) => Ok(await service.GetAllAsync(ct));
    [HttpGet("{id:guid}"), Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken ct) => Ok(await service.GetByIdAsync(id, ct));
    [HttpPost, Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryRequest request, CancellationToken ct) { var result = await service.CreateAsync(request, ct); return CreatedAtAction(nameof(GetById), new { id = result.Id }, result); }
    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, UpdateCategoryRequest request, CancellationToken ct) => Ok(await service.UpdateAsync(id, request, ct));
    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) { await service.DeleteAsync(id, ct); return NoContent(); }
}
