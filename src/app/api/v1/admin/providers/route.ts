import { NextRequest, NextResponse } from 'next/server';
import { ProviderService } from '@/domain/providers/service';
import type { ProviderCategory } from '@/domain/providers/types';

/**
 * GET /api/v1/admin/providers
 * List all registered providers with masked credentials and health metrics
 */
export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') as ProviderCategory | null;
    const providers = ProviderService.getAllProviders(category || undefined);

    return NextResponse.json({
      data: {
        providers,
        total: providers.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/providers
 * Create a new API provider integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    const created = ProviderService.createProvider(body, userId);

    return NextResponse.json(
      {
        data: created,
        message: `Provider "${created.name}" created successfully.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

