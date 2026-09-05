using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService) => _productService = productService;

    /// <summary>
    /// Paginacion clasica por offset. El parametro opcional categoryId filtra
    /// los productos de una categoria concreta.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<ProductPagedResult>> GetProducts([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] Guid? categoryId, [FromQuery] Guid? supplierId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        return Ok(await _productService.GetProductsAsync(search, sortBy, sortDirection, categoryId, supplierId, page, pageSize, ct));
    }

    /// <summary>
    /// Paginacion incremental para el scroll infinito.
    /// GET /api/products/scroll?offset=0&amp;limit=12
    /// Devuelve el siguiente bloque de productos junto con NextOffset y HasMore,
    /// que es lo que el frontend necesita para saber si debe seguir cargando.
    /// Acepta el mismo filtro por categoria que la paginacion por offset.
    /// </summary>
    [HttpGet("scroll")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<ProductScrollResult>> GetProductsScroll([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] Guid? categoryId, [FromQuery] Guid? supplierId, [FromQuery] int offset = 0, [FromQuery] int limit = 12, CancellationToken ct = default)
    {
        return Ok(await _productService.GetProductsScrollAsync(search, sortBy, sortDirection, categoryId, supplierId, offset, limit, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Manager,User")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken ct)
    {
        try { return Ok(await _productService.GetByIdAsync(id, ct)); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _productService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException e) { return BadRequest(new { message = e.Message }); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        try { return Ok(await _productService.UpdateAsync(id, request, ct)); }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _productService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException e) { return NotFound(new { message = e.Message }); }
        catch (InvalidOperationException e) { return Conflict(new { message = e.Message }); }
    }
}
