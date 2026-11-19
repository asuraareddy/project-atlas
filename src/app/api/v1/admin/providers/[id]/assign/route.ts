import { NextRequest, NextResponse } from 'next/server';
import { ProviderService } from '@/domain/providers/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/admin/providers/[id]/assign
 * Assign provider to specified client tenants
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    if (!Array.isArray(body.tenantIds)) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Field "tenantIds" must be an array of tenant IDs.' },
        { status: 400 }
      );
    }

    const updated = ProviderService.assignTenants(id, body.tenantIds, userId);

    return NextResponse.json({
      data: updated,
      message: `Provider assigned to ${body.tenantIds.length} tenants.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

