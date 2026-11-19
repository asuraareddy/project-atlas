import { NextRequest, NextResponse } from 'next/server';
import { ProviderService } from '@/domain/providers/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/admin/providers/[id]/rollback
 * Rollback provider configuration to a previous snapshot
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    if (typeof body.version !== 'number') {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Field "version" (number) is required for rollback.' },
        { status: 400 }
      );
    }

    const restored = ProviderService.rollbackProvider(id, body.version, userId);

    return NextResponse.json({
      data: restored,
      message: `Provider successfully rolled back to version ${body.version}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'ROLLBACK_FAILED', message: err.message },
      { status: 400 }
    );
  }
}

