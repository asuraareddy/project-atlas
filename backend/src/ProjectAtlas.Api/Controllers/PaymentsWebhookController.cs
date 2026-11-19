using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Application.Services.Payments;
using ProjectAtlas.Infrastructure.MultiTenancy;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/payments/webhooks")]
public class PaymentsWebhookController : ControllerBase
{
    [HttpPost("{provider}")]
    public async Task<IActionResult> HandleWebhook(string provider)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();
        var signature = Request.Headers["X-Webhook-Signature"].ToString();
        var tenantCtx = HttpContext.Items["TenantContext"] as TenantContext;

        var (isDuplicate, txId, status) = PaymentGatewayManagementService.ProcessWebhook(
            provider,
            payload,
            signature,
            tenantCtx?.TenantId
        );

        return Ok(new
        {
            success = true,
            isDuplicate,
            transactionId = txId,
            status,
            provider,
            receivedAt = DateTime.UtcNow
        });
    }
}
