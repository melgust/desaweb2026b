using Api.Application.DTOs;
using Api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductsController(ProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _productService.GetPagedProductsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _productService.GetByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Price < 0 || request.Stock < 0)
            return BadRequest("Invalid product data.");

        var product = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Price < 0 || request.Stock < 0)
            return BadRequest("Invalid product data.");

        var product = await _productService.UpdateAsync(id, request);
        return product == null ? NotFound() : Ok(product);
    }
}
