using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly ICategorieservice _CategoryService;

        public CategoryController(ICategorieservice CategoryService) => _CategoryService = CategoryService;

        [HttpGet]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<ActionResult<CategoryPagedResult>> GetCategorys([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        {
            return Ok(await _CategoryService.GetCategoriesAsync(search, sortBy, sortDirection, page, pageSize, ct));
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken ct)
        {
            return Ok(await _CategoryService.GetByIdAsync(id, ct));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
        {
            var created = await _CategoryService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
        {
            return Ok(await _CategoryService.UpdateAsync(id, request, ct));
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            await _CategoryService.DeleteAsync(id, ct);
            return NoContent();
        }
    }
}
