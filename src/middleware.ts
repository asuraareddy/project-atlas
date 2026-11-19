import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TenantStore } from './domain/tenant/store';
import { GameRegistry } from './domain/games/registry';
import { AddonRegistry } from './domain/addons/registry';
import { GameKey } from './domain/tenant/types';

// Paths that bypass tenant game gating
const PUBLIC_STATIC_PATHS = [
  '/_next',
  '/favicon.ico',
  '/icons',
  '/manifest.json',
  '/api/health',
  '/access-denied',
];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Skip static assets and error display paths
  for (const prefix of PUBLIC_STATIC_PATHS) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // 2. Resolve Host & Tenant
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const cleanHost = host.split(':')[0].toLowerCase();
  const isLocalOrPlatform = ['localhost', '127.0.0.1'].includes(cleanHost) || cleanHost.endsWith('.platform.internal');

  // Check override from query param (?tenant=kalyan-club), header, or preview cookie (ONLY permitted on localhost/platform)
  const queryTenant = isLocalOrPlatform ? searchParams.get('tenant') : null;
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = isLocalOrPlatform ? request.cookies.get('atlas_tenant')?.value : null;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantContext = TenantStore.getTenantContext(host, requestedTenant);
  const tenant = TenantStore.getTenantById(tenantContext.tenantId)!;

  // 3. Platform Super Admin Isolation (/admin & /api/v1/admin/*)
  // Super Admin must NEVER be accessible from client customer domains (e.g. ambaari999.com)
  // On localhost/platform operator host, a client preview cookie (atlas_tenant) must not lock the operator out of /admin.
  const isSuperAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin');
  if (isSuperAdminRoute) {
    const explicitNonAtlasRequest = (queryTenant && queryTenant !== 'atlas') || (headerTenant && headerTenant !== 'atlas');
    const isClientDomain = tenantContext.isCustomDomain || !isLocalOrPlatform || explicitNonAtlasRequest;
    if (isClientDomain) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'FORBIDDEN_403',
            message: `Platform Super Admin is strictly restricted to platform operators and cannot be accessed from client customer domains ("${tenant.branding.brandName}").`,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
          },
          { status: 403 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      url.searchParams.set('game', 'super_admin');
      url.searchParams.set('tenant', tenant.slug);
      return NextResponse.redirect(url);
    }
  }

  // 4. Client Admin Route Isolation (/client-admin & /api/v1/client-admin/*)
  const isClientAdminRoute = pathname.startsWith('/client-admin') || pathname.startsWith('/api/v1/client-admin');
  if (isClientAdminRoute) {
    const userRole = request.headers.get('x-user-role') || 'SUPER_ADMIN'; // Default internal demo context
    if (userRole === 'PLAYER') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'FORBIDDEN_403',
            message: 'Player accounts cannot access client management.',
          },
          { status: 403 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      url.searchParams.set('game', 'client_admin');
      url.searchParams.set('tenant', tenant.slug);
      return NextResponse.redirect(url);
    }
  }

  // 5. Addon & Game Route Gating (Hard Backend Protection)
  const matchedAddon = AddonRegistry.matchAddonByPath(pathname);
  const matchedGame = GameRegistry.matchGameByPath(pathname);
  const targetKey = matchedAddon ? matchedAddon.id : (matchedGame ? matchedGame.key : null);
  const targetName = matchedAddon ? matchedAddon.name : (matchedGame ? matchedGame.name : '');

  if (targetKey) {
    const isAllowed = tenantContext.enabledGames.includes(targetKey as GameKey);
    if (!isAllowed) {
      // API call receives clean JSON 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'FORBIDDEN_403',
            message: `Addon/Game "${targetName}" (${targetKey}) is not enabled for tenant "${tenant.branding.brandName}". Upgrade subscription to access this module.`,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            addonKey: targetKey,
          },
          { status: 403 }
        );
      }

      // Page request redirects to access-denied page with explanation
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      url.searchParams.set('game', targetKey);
      url.searchParams.set('tenant', tenant.slug);
      return NextResponse.redirect(url);
    }
  }

  // 4. Inject Tenant Headers for downstream handlers and components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-slug', tenant.slug);
  requestHeaders.set('x-tenant-name', tenant.name);
  requestHeaders.set('x-tenant-brand-name', tenant.branding.brandName);
  requestHeaders.set('x-tenant-primary-color', tenant.branding.primaryColor);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // If user explicitly switched tenant via query param, persist in session cookie
  if (queryTenant) {
    response.cookies.set('atlas_tenant', tenant.slug, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // accessible to client for instant switcher sync
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
