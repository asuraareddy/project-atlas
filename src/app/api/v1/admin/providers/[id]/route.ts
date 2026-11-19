import { NextRequest, NextResponse } from 'next/server';
import { ProviderService } from '@/domain/providers/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/providers/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const provider = ProviderService.getProviderById(id);

    if (!provider) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Provider "${id}" not found.` },
        { status: 404 }
      );
    }

    const snapshots = ProviderService.getSnapshots(id);

    return NextResponse.json({
      data: {
        provider,
        snapshots,
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
 * PUT /api/v1/admin/providers/[id]
 * Update provider configuration, endpoints, or rotate credentials
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    const updated = ProviderService.updateProvider(id, body, userId);

    return NextResponse.json({
      data: updated,
      message: `Provider "${updated.name}" updated successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

