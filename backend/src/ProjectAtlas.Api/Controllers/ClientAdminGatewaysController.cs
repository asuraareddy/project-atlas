using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Services.Payments;
using ProjectAtlas.Domain.Entities.Payments;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/client-admin/gateways")]
public class ClientAdminGatewaysController : ControllerBase
{
    private string GetActiveTenantId()
    {
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext;
        return tenantCtx?.TenantId ?? "ten_ambaari_001";
    }

    [HttpGet]
    public IActionResult GetClientGateways()
    {
        var tenantId = GetActiveTenantId();
        var gateways = PaymentGatewayManagementService.GetGatewaysForClientAdmin(tenantId);

        return Ok(new
        {
            data = new
            {
                tenantId,
                gateways,
                count = gateways.Count()
            }
        });
    }

    public record ConnectClientGatewayRequest(
        string ProviderKey,
        string ProviderName,
        PaymentGatewayCredentials Credentials,
        string? Currency,
        string? Environment
    );

    [HttpPost]
    public IActionResult ConnectClientGateway([FromBody] ConnectClientGatewayRequest request)
    {
        var tenantId = GetActiveTenantId();

        try
        {
            var gw = PaymentGatewayManagementService.CreateClientGateway(
                tenantId,
                request.ProviderKey,
                request.ProviderName,
                request.Credentials ?? new PaymentGatewayCredentials(),
                request.Currency ?? "INR",
                request.Environment ?? "SANDBOX",
                $"usr_admin_{tenantId}"
            );

            return Ok(new
            {
                data = new { gateway = gw },
                message = "Client gateway connected successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = "POLICY_VIOLATION", message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public IActionResult UpdateClientGateway(string id, [FromBody] PaymentGatewayCredentials credentials)
    {
        var tenantId = GetActiveTenantId();

        try
        {
            var gw = PaymentGatewayManagementService.UpdateGatewayCredentials(id, credentials, tenantId, $"usr_admin_{tenantId}");
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
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = "CROSS_TENANT_FORBIDDEN", message = ex.Message });
        }
    }

    [HttpPost("{id}/test")]
    public IActionResult TestClientGateway(string id)
    {
        var tenantId = GetActiveTenantId();

        try
        {
            var testRes = PaymentGatewayManagementService.TestGatewayConnection(id, tenantId);
            if (testRes == null)
            {
                return NotFound(new { error = "NOT_FOUND", message = $"Gateway '{id}' not found." });
            }

            return Ok(new
            {
                data = new { testResult = testRes.Value.Result },
                message = "Gateway connection verified."
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = "CROSS_TENANT_FORBIDDEN", message = ex.Message });
        }
    }
}
