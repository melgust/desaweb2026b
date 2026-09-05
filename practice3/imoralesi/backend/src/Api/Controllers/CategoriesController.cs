using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetAll(CancellationToken ct)
    {
        var categories = await _categoryService.GetAllAsync(ct);
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id, CancellationToken ct)
    {
        var category = await _categoryService.GetByIdAsync(id, ct);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<Category>> Create(Category category, CancellationToken ct)
    {
        var created = await _categoryService.CreateAsync(category, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(int id, Category category, CancellationToken ct)
    {
        var existing = await _categoryService.GetByIdAsync(id, ct);
        if (existing == null) return NotFound();

        await _categoryService.UpdateAsync(id, category, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var existing = await _categoryService.GetByIdAsync(id, ct);
        if (existing == null) return NotFound();

        await _categoryService.DeleteAsync(id, ct);
        return NoContent();
    }
}