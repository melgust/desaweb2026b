using Application.DTOs;

namespace Application.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductRequest dto);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductRequest dto);
    Task<bool> DeleteAsync(int id);
}