using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaService _categoriaService;


    public CategoriasController(
        ICategoriaService categoriaService
    )
    {
        _categoriaService = categoriaService;
    }


    // ======================================================
    // GET PAGINATED
    // GET api/categorias
    // ======================================================

    [HttpGet]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<CategoriaPagedResult>>
        GetCategorias(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortDirection,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default
        )
    {
        return Ok(
            await _categoriaService.GetCategoriasAsync(
                search,
                sortBy,
                sortDirection,
                page,
                pageSize,
                ct
            )
        );
    }


    // ======================================================
    // GET ALL ACTIVE
    // GET api/categorias/all
    // Used by dropdown
    // ======================================================

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>>
        GetAll(CancellationToken ct)
    {
        return Ok(
            await _categoriaService.GetAllAsync(ct)
        );
    }


    // ======================================================
    // GET BY ID
    // ======================================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<CategoriaDto>>
        GetById(
            Guid id,
            CancellationToken ct
        )
    {
        return Ok(
            await _categoriaService.GetByIdAsync(
                id,
                ct
            )
        );
    }


    // ======================================================
    // CREATE
    // ======================================================

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<CategoriaDto>>
        Create(
            [FromBody] CreateCategoriaRequest request,
            CancellationToken ct
        )
    {
        var created =
            await _categoriaService.CreateAsync(
                request,
                ct
            );


        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created
        );
    }


    // ======================================================
    // UPDATE
    // ======================================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<CategoriaDto>>
        Update(
            Guid id,
            [FromBody] UpdateCategoriaRequest request,
            CancellationToken ct
        )
    {
        return Ok(
            await _categoriaService.UpdateAsync(
                id,
                request,
                ct
            )
        );
    }


    // ======================================================
    // DELETE
    // ======================================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Delete(
            Guid id,
            CancellationToken ct
        )
    {
        await _categoriaService.DeleteAsync(
            id,
            ct
        );


        return NoContent();
    }
}