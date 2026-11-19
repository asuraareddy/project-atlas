using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Services.Payments;
using ProjectAtlas.Domain.Entities.Payments;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/admin/gateways")]
public class AdminGatewaysController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        var gateways = PaymentGatewayManagementService.GetGatewaysForSuperAdmin();
        return Ok(new
        {
            data = new
            {
                gateways,
                count = gateways.Count()
            }
        });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var gw = PaymentGatewayManagementService.GetGatewayById(id);
        if (gw == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Gateway '{id}' not found." });
        }

        return Ok(new { data = new { gateway = gw } });
    }

    public record CreatePlatformGatewayRequest(
        string ProviderKey,
        string ProviderName,
        PaymentGatewayCredentials Credentials,
        List<string>? AssignedTenantIds,
        string? Currency,
        string? Environment
    );

    [HttpPost]
    public IActionResult CreatePlatform([FromBody] CreatePlatformGatewayRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProviderKey) || string.IsNullOrWhiteSpace(request.ProviderName))
        {
            return BadRequest(new { error = "BAD_REQUEST", message = "ProviderKey and ProviderName are required." });
        }

        var gw = PaymentGatewayManagementService.CreatePlatformGateway(
            request.ProviderKey,
            request.ProviderName,
            request.Credentials ?? new PaymentGatewayCredentials(),
            request.AssignedTenantIds,
            request.Currency ?? "INR",
            request.Environment ?? "SANDBOX"
        );

        return Ok(new
        {
            data = new { gateway = gw },
            message = "Platform payment gateway created successfully."
        });
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] PaymentGatewayCredentials credentials)
    {
        var gw = PaymentGatewayManagementService.UpdateGatewayCredentials(id, credentials, "platform");
        if (gw == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Gateway '{id}' not found." });
        }

        return Ok(new
        {
            data = new { gateway = gw },
            message = "Gateway credentials updated."
        });
    }

    [HttpPost("{id}/test")]
    public IActionResult TestConnection(string id)
    {
        var testRes = PaymentGatewayManagementService.TestGatewayConnection(id, "platform");
        if (testRes == null)
        {
            return NotFound(new { error = "NOT_FOUND", message = $"Gateway '{id}' not found." });
        }

        return Ok(new
        {
            data = new { testResult = testRes.Value.Result },
            message = "Gateway diagnostic completed."
        });
    }

    [HttpGet("policies")]
    public IActionResult GetPolicies()
    {
        var policies = PaymentGatewayManagementService.GetPolicies();
        return Ok(new
        {
            data = new
            {
                policies,
                count = policies.Count()
            }
        });
    }

    [HttpGet("policies/{tenantId}")]
    public IActionResult GetPolicy(string tenantId)
    {
        var policy = PaymentGatewayManagementService.GetPolicyForTenant(tenantId);
        return Ok(new { data = new { policy } });
    }

    public record UpdatePolicyRequest(bool AllowClientOwned, bool AllowPlatformGateway, List<string>? PermittedProviders);

    [HttpPut("policies/{tenantId}")]
    public IActionResult UpdatePolicy(string tenantId, [FromBody] UpdatePolicyRequest request)
    {
        var policy = PaymentGatewayManagementService.UpdatePolicy(
            tenantId,
            request.AllowClientOwned,
            request.AllowPlatformGateway,
            request.PermittedProviders
        );

        return Ok(new
        {
            data = new { policy },
            message = $"Policy updated for tenant '{tenantId}'."
        });
    }
}
