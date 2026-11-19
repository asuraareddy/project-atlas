using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Services.Providers;
using ProjectAtlas.Domain.Entities.Providers;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/admin/providers")]
public class AdminProvidersController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string? category = null)
    {
        var providers = ProviderManagementService.GetAllProviders(category);
        return Ok(new
        {
            data = new
            {
                providers,
                count = providers.Count()
            }
        });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var prov = ProviderManagementService.GetProviderById(id);
        if (prov == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Provider '{id}' not found." });
        }

        return Ok(new { data = new { provider = prov } });
    }

    public record CreateProviderRequest(
        string Name,
        string Category,
        string ApiBaseUrl,
        string? CategoryLabel,
        string? LogoUrl,
        string? ApiVersion,
        string? AuthMethod,
        string? Environment,
        string? Notes,
        ProviderCredentials? Credentials,
        List<string>? AssignedTenantIds
    );

    [HttpPost]
    public IActionResult Create([FromBody] CreateProviderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.ApiBaseUrl) || string.IsNullOrWhiteSpace(request.Category))
        {
            return BadRequest(new { error = "BAD_REQUEST", message = "Name, Category, and ApiBaseUrl are required." });
        }

        var prov = ProviderManagementService.CreateProvider(
            request.Name,
            request.Category,
            request.ApiBaseUrl,
            request.CategoryLabel,
            request.LogoUrl,
            request.ApiVersion ?? "v1.0",
            request.AuthMethod ?? "API_KEY_HEADER",
            request.Environment ?? "SANDBOX",
            request.Notes,
            request.Credentials,
            request.AssignedTenantIds
        );

        return Ok(new
        {
            data = new { provider = prov },
            message = "Provider created successfully."
        });
    }

    public record UpdateProviderRequest(
        string? Name,
        string? ApiBaseUrl,
        string? ApiVersion,
        string? AuthMethod,
        string? Environment,
        string? Status,
        string? Notes,
        ProviderCredentials? Credentials
    );

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateProviderRequest request)
    {
        var prov = ProviderManagementService.UpdateProvider(
            id,
            request.Name,
            request.ApiBaseUrl,
            request.ApiVersion,
            request.AuthMethod,
            request.Environment,
            request.Status,
            request.Notes,
            request.Credentials
        );

        if (prov == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Provider '{id}' not found." });
        }

        return Ok(new
        {
            data = new { provider = prov },
            message = "Provider updated successfully."
        });
    }

    [HttpPost("{id}/test")]
    public IActionResult TestConnection(string id)
    {
        var testRes = ProviderManagementService.TestConnection(id);
        if (testRes == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Provider '{id}' not found." });
        }

        return Ok(new
        {
            data = new { testResult = testRes.Value.Result },
            message = "Connection diagnostic completed."
        });
    }

    public record AssignTenantsRequest(List<string> TenantIds);

    [HttpPost("{id}/assign")]
    public IActionResult AssignTenants(string id, [FromBody] AssignTenantsRequest request)
    {
        var prov = ProviderManagementService.AssignTenants(id, request.TenantIds ?? new List<string>());
        if (prov == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Provider '{id}' not found." });
        }

        return Ok(new
        {
            data = new { provider = prov },
            message = "Tenant assignments updated."
        });
    }

    [HttpPost("{id}/rollback")]
    public IActionResult Rollback(string id)
    {
        var prov = ProviderManagementService.RollbackProvider(id);
        if (prov == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"No previous snapshot found for provider '{id}'." });
        }

        return Ok(new
        {
            data = new { provider = prov },
            message = "Rolled back to previous configuration snapshot."
        });
    }

    [HttpGet("audit")]
    public IActionResult GetAuditLogs()
    {
        var logs = ProviderManagementService.GetAuditLogs();
        return Ok(new
        {
            data = new
            {
                auditLogs = logs,
                count = logs.Count()
            }
        });
    }
}
