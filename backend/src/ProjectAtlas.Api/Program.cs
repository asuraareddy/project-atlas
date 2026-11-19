using Microsoft.EntityFrameworkCore;
using ProjectAtlas.Infrastructure.Persistence;
using ProjectAtlas.Infrastructure.MultiTenancy;
using ProjectAtlas.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services & DbContext
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSingleton<ProjectAtlas.Application.Security.IJwtTokenService, ProjectAtlas.Application.Security.JwtTokenService>();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Project Atlas — Multi-Gaming White-Label C# Web API",
        Version = "v1",
        Description = "Enterprise C# ASP.NET Core 8.0 backend powering multi-tenant sports exchange, casino aggregation, tabletop skill games (Carrom, Ludo, Pool, Rummy), and double-entry ledger."
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseInMemoryDatabase("ProjectAtlasDb");
});

// 2. Configure CORS for Multi-Tenant Frontends
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAtlasFrontends", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    ApplicationDbContext.SeedDatabase(db);
}

// 3. Configure HTTP Request Pipeline
app.UseCors("AllowAtlasFrontends");

// Enable Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project Atlas API v1");
    c.RoutePrefix = "swagger";
});

// Multi-Tenancy Middleware
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseRouting();

// 4. Map Root Route Dashboard
app.MapGet("/", () => Results.Content(@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <title>Project Atlas — C# ASP.NET Core Web API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e2e8f0; margin: 0; padding: 40px; display: flex; justify-content: center; }
    .card { background: #1a1d26; border: 1px solid #2d3748; border-radius: 16px; padding: 36px; max-width: 780px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #ffffff; margin-top: 0; font-size: 26px; display: flex; align-items: center; gap: 10px; }
    .badge { display: inline-block; background: #10b98125; color: #10b981; border: 1px solid #10b98150; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    .tag { display: inline-block; background: #7e0ac225; color: #c084fc; border: 1px solid #7e0ac250; padding: 4px 12px; border-radius: 9999px; font-size: 12px; margin-right: 6px; }
    p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
    .endpoints { margin-top: 24px; border-top: 1px solid #2d3748; padding-top: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .btn { display: flex; align-items: center; justify-content: space-between; background: #232733; border: 1px solid #333a4d; border-radius: 10px; padding: 12px 16px; color: #cbd5e1; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .btn:hover { background: #2d3345; border-color: #8b5cf6; color: #ffffff; }
    .footer { margin-top: 28px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class=""card"">
    <div style=""display: flex; justify-content: space-between; align-items: center;"">
      <h1>⚡ Project Atlas Web API</h1>
      <span class=""badge"">OPERATIONAL (PORT 5000)</span>
    </div>
    <p>Standardized enterprise C# ASP.NET Core 8.0 backend powering multi-tenant gaming, real-time SignalR hubs, double-entry ledger, and payment gateways.</p>
    <div>
      <span class=""tag"">.NET 8.0</span>
      <span class=""tag"">ASP.NET Core Web API</span>
      <span class=""tag"">SignalR Realtime</span>
      <span class=""tag"">EF Core Multi-Tenant</span>
      <span class=""tag"">Swagger / OpenAPI</span>
    </div>

    <div class=""endpoints"">
      <h3 style=""color: #ffffff; margin-bottom: 6px;"">Quick Links & Endpoints</h3>
      <div class=""grid"">
        <a class=""btn"" href=""/swagger"" target=""_blank""><span>📖 Swagger API Explorer</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/health"" target=""_blank""><span>🩺 Health Check Status</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/categories"" target=""_blank""><span>🎮 Categories Catalog (4 Ordered)</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/categories?tenant=ambaari999"" target=""_blank""><span>👑 Ambaari999 Tenant Context</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/games/other"" target=""_blank""><span>🎯 Other Games Hub (Carrom/Pool)</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/games/matka/patti?digit=3"" target=""_blank""><span>🔢 Matka 220 Patti Math</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/admin/tenants"" target=""_blank""><span>🏢 Super Admin Tenants</span><span>→</span></a>
        <a class=""btn"" href=""/api/v1/admin/gateways"" target=""_blank""><span>💳 Payment Gateways</span><span>→</span></a>
      </div>
    </div>

    <div class=""footer"">
      Project Atlas &bull; React + TypeScript Frontend on Port 3000 &bull; C# ASP.NET Core Backend on Port 5000
    </div>
  </div>
</body>
</html>
", "text/html"));

// 5. Map API Endpoints & SignalR Hubs
app.MapControllers();
app.MapHub<CarromHub>("/hubs/carrom");
app.MapHub<LudoHub>("/hubs/ludo");
app.MapHub<PoolHub>("/hubs/pool");
app.MapHub<RummyHub>("/hubs/rummy");

// Health check endpoint
app.MapGet("/api/v1/health", () => Results.Ok(new
{
    status = "HEALTHY",
    service = "Project Atlas ASP.NET Core C# Backend",
    timestamp = DateTime.UtcNow.ToString("o"),
    framework = ".NET 8.0",
    port = 5000,
    features = new[] { "Swagger UI", "EF Core Multi-Tenancy", "SignalR Hubs", "Double-Entry Ledger", "220 Patti Generator" }
}));

app.Run();
