import { NextRequest, NextResponse } from 'next/server';
import { ProviderService } from '@/domain/providers/service';

/**
 * GET /api/v1/admin/providers/audit
 * Retrieve immutable audit logs for API & Provider modifications
 */
export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId') || undefined;
    const logs = ProviderService.getAuditLogs(providerId);

    return NextResponse.json({
      data: {
        logs,
        total: logs.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

