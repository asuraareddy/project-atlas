'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';

/**
 * Localhost-only Operator Preview Bar.
 * When previewing a client tenant on localhost, provides 1-click return to Project Atlas
 * or Super Admin without needing to clear cookies or open incognito.
 * Never renders on real custom client domains (e.g. ambaari999.com).
 */
export function OperatorPreviewBar() {
  const pathname = usePathname();
  const { tenantSlug, branding, switchTenant } = useTenant();
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      setIsLocalhost(host === 'localhost' || host === '127.0.0.1' || host.endsWith('.platform.internal'));
    }
  }, []);

  if (!isLocalhost || tenantSlug === 'atlas' || pathname.startsWith('/admin')) {
    return null;
  }

  const goToSuperAdmin = () => {
    document.cookie = 'atlas_tenant=atlas; path=/; max-age=86400; SameSite=Lax';
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="w-full bg-[#191919] text-white border-b border-white/10 px-4 py-1.5 text-xs z-[60]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#317CFF]/20 text-[#8DB8FF] font-mono text-[10px] font-medium">
            PREVIEW MODE
          </span>
          <span className="text-white/80">
            Viewing <strong className="text-white">{branding.brandName || tenantSlug}</strong> ({tenantSlug})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TenantSwitcher />
          <button
            type="button"
            onClick={() => switchTenant('atlas')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Project Atlas</span>
          </button>
          <button
            type="button"
            onClick={goToSuperAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#317CFF] hover:bg-[#2563EB] text-white text-[11px] font-medium transition-colors"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
