using Microsoft.AspNetCore.Http;

namespace ProjectAtlas.Infrastructure.MultiTenancy;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate _next)
    {
        this._next = _next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var host = context.Request.Headers["x-forwarded-host"].FirstOrDefault() ??
                   context.Request.Headers["Host"].FirstOrDefault() ??
                   "localhost";

        var queryTenant = context.Request.Query["tenant"].FirstOrDefault();
        var headerTenant = context.Request.Headers["x-tenant-id"].FirstOrDefault() ??
                           context.Request.Headers["x-tenant-slug"].FirstOrDefault();
        var cookieTenant = context.Request.Cookies["atlas_tenant"];

        var requestedTenant = queryTenant ?? headerTenant ?? cookieTenant;

        var tenantCtx = TenantStore.ResolveTenant(host, requestedTenant);

        context.Items["TenantContext"] = tenantCtx;

        await _next(context);
    }
}
