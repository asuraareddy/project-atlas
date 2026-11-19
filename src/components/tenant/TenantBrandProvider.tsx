'use client';

import React, { useEffect } from 'react';
import { useTenant } from './TenantContext';

export function TenantBrandProvider({ children }: { children: React.ReactNode }) {
  const { branding, tenantSlug } = useTenant();

  useEffect(() => {
    if (!branding) return;

    // Inject tenant custom CSS variables
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', branding.primaryColor);
    root.style.setProperty('--tenant-primary-hover', branding.primaryColorHover);
    root.style.setProperty('--tenant-secondary', branding.secondaryColor);
    root.style.setProperty('--tenant-bg', branding.backgroundColor);
    root.style.setProperty('--tenant-glow', branding.accentGlowColor);

    // Update document title dynamically
    if (branding.brandName) {
      document.title = `${branding.brandName} | Multi-Gaming Lounge`;
    }
  }, [branding, tenantSlug]);

  return <>{children}</>;
}
