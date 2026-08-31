using Application.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;


public interface ICategoriaService
{
    Task<CategoriaPagedResult> GetCategoriasAsync(
        string? search,
        string? sortBy,
        string? sortDirection,
        int page,
        int pageSize,
        CancellationToken ct
    );

    Task<IEnumerable<CategoriaDto>> GetAllAsync(
        CancellationToken ct
    );

    Task<CategoriaDto> GetByIdAsync(
        Guid id,
        CancellationToken ct
    );

    Task<CategoriaDto> CreateAsync(
        CreateCategoriaRequest request,
        CancellationToken ct
    );

    Task<CategoriaDto> UpdateAsync(
        Guid id,
        UpdateCategoriaRequest request,
        CancellationToken ct
    );

    Task DeleteAsync(
        Guid id,
        CancellationToken ct
    );
}


public class CategoriaService : ICategoriaService
{
    private readonly AppDbContext _db;


    public CategoriaService(AppDbContext db)
    {
        _db = db;
    }


    // ======================================================
    // GET PAGINATED
    // ======================================================

    public async Task<CategoriaPagedResult> GetCategoriasAsync(
        string? search,
        string? sortBy,
        string? sortDirection,
        int page,
        int pageSize,
        CancellationToken ct
    )
    {
        var query =
            _db.Categorias
               .AsNoTracking();


        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower =
                search.ToLower();

            query = query.Where(c =>
                c.Name.ToLower().Contains(lower)
                ||
                (
                    c.Description != null &&
                    c.Description.ToLower().Contains(lower)
                )
            );
        }


        // Sort
        bool isDesc =
            sortDirection?.ToLower() == "desc";


        query = sortBy?.ToLower() switch
        {
            "createdat" =>
                isDesc
                    ? query.OrderByDescending(c => c.CreatedAt)
                    : query.OrderBy(c => c.CreatedAt),

            _ =>
                isDesc
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name)
        };


        // Pagination
        int totalItems =
            await query.CountAsync(ct);


        int totalPages =
            (int)Math.Ceiling(
                totalItems / (double)pageSize
            );


        var items =
            await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c =>
                    new CategoriaDto(
                        c.Id,
                        c.Name,
                        c.Description,
                        c.IsActive,
                        c.CreatedAt
                    )
                )
                .ToListAsync(ct);


        return new CategoriaPagedResult(
            items,
            totalItems,
            page,
            pageSize,
            totalPages
        );
    }


    // ======================================================
    // GET ALL ACTIVE CATEGORIES
    // Used by Product dropdown
    // ======================================================

    public async Task<IEnumerable<CategoriaDto>> GetAllAsync(
        CancellationToken ct
    )
    {
        return await _db.Categorias
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c =>
                new CategoriaDto(
                    c.Id,
                    c.Name,
                    c.Description,
                    c.IsActive,
                    c.CreatedAt
                )
            )
            .ToListAsync(ct);
    }


    // ======================================================
    // GET BY ID
    // ======================================================

    public async Task<CategoriaDto> GetByIdAsync(
        Guid id,
        CancellationToken ct
    )
    {
        var categoria =
            await _db.Categorias.FindAsync(
                new object[] { id },
                ct
            )
            ?? throw new KeyNotFoundException(
                "Categoria not found."
            );


        return new CategoriaDto(
            categoria.Id,
            categoria.Name,
            categoria.Description,
            categoria.IsActive,
            categoria.CreatedAt
        );
    }


    // ======================================================
    // CREATE
    // ======================================================

    public async Task<CategoriaDto> CreateAsync(
        CreateCategoriaRequest request,
        CancellationToken ct
    )
    {
        bool exists =
            await _db.Categorias.AnyAsync(
                c => c.Name == request.Name,
                ct
            );


        if (exists)
        {
            throw new InvalidOperationException(
                "A categoria with this name already exists."
            );
        }


        var categoria = new Categoria
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };


        _db.Categorias.Add(categoria);

        await _db.SaveChangesAsync(ct);


        return new CategoriaDto(
            categoria.Id,
            categoria.Name,
            categoria.Description,
            categoria.IsActive,
            categoria.CreatedAt
        );
    }


    // ======================================================
    // UPDATE
    // ======================================================

    public async Task<CategoriaDto> UpdateAsync(
        Guid id,
        UpdateCategoriaRequest request,
        CancellationToken ct
    )
    {
        var categoria =
            await _db.Categorias.FindAsync(
                new object[] { id },
                ct
            )
            ?? throw new KeyNotFoundException(
                "Categoria not found."
            );


        bool duplicated =
            await _db.Categorias.AnyAsync(
                c =>
                    c.Name == request.Name &&
                    c.Id != id,
                ct
            );


        if (duplicated)
        {
            throw new InvalidOperationException(
                "A categoria with this name already exists."
            );
        }


        categoria.Name =
            request.Name;

        categoria.Description =
            request.Description;

        categoria.IsActive =
            request.IsActive;

        categoria.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync(ct);


        return new CategoriaDto(
            categoria.Id,
            categoria.Name,
            categoria.Description,
            categoria.IsActive,
            categoria.CreatedAt
        );
    }


    // ======================================================
    // DELETE
    // ======================================================

    public async Task DeleteAsync(
        Guid id,
        CancellationToken ct
    )
    {
        var categoria =
            await _db.Categorias.FindAsync(
                new object[] { id },
                ct
            )
            ?? throw new KeyNotFoundException(
                "Categoria not found."
            );


        _db.Categorias.Remove(categoria);

        await _db.SaveChangesAsync(ct);
    }
}