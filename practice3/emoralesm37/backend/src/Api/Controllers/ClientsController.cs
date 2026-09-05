using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(
        IClientService clientService
    )
    {
        _clientService =
            clientService;
    }

    [HttpGet]
    [Authorize(
        Roles = "Admin,Manager,User"
    )]
    public async Task<ActionResult<ClientPagedResult>>
        GetClients(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortDirection,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default
        )
    {
        var result =
            await _clientService
                .GetClientsAsync(
                    search,
                    sortBy,
                    sortDirection,
                    page,
                    pageSize,
                    ct
                );

        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize(
        Roles = "Admin,Manager,User"
    )]
    public async Task<
        ActionResult<IEnumerable<ClientDto>>
    > GetAll(
        CancellationToken ct
    )
    {
        return Ok(
            await _clientService
                .GetAllAsync(ct)
        );
    }

    [HttpGet("{id:guid}")]
    [Authorize(
        Roles = "Admin,Manager,User"
    )]
    public async Task<
        ActionResult<ClientDto>
    > GetById(
        Guid id,
        CancellationToken ct
    )
    {
        return Ok(
            await _clientService
                .GetByIdAsync(
                    id,
                    ct
                )
        );
    }

    [HttpPost]
    [Authorize(
        Roles = "Admin,Manager"
    )]
    public async Task<
        ActionResult<ClientDto>
    > Create(
        [FromBody]
        CreateClientRequest request,

        CancellationToken ct
    )
    {
        var created =
            await _clientService
                .CreateAsync(
                    request,
                    ct
                );

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = created.Id
            },
            created
        );
    }

    [HttpPut("{id:guid}")]
    [Authorize(
        Roles = "Admin,Manager"
    )]
    public async Task<
        ActionResult<ClientDto>
    > Update(
        Guid id,

        [FromBody]
        UpdateClientRequest request,

        CancellationToken ct
    )
    {
        return Ok(
            await _clientService
                .UpdateAsync(
                    id,
                    request,
                    ct
                )
        );
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Delete(
            Guid id,
            CancellationToken ct
        )
    {
        await _clientService
            .DeleteAsync(
                id,
                ct
            );

        return NoContent();
    }
}