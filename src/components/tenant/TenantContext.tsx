'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameKey, TenantBrandingConfig, TenantPointConfig, TenantRecord } from '@/domain/tenant/types';

interface TenantContextValue {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  branding: TenantBrandingConfig;
  pointConfig: TenantPointConfig;
  enabledGames: GameKey[];
  isLoading: boolean;
  switchTenant: (slug: string) => void;
  isGameEnabled: (key: GameKey) => boolean;
  refreshTenant: () => Promise<void>;
}

const DEFAULT_BRANDING: TenantBrandingConfig = {
  brandName: 'PROJECT ATLAS',
  tagline: 'Multi-Gaming B2B Enterprise Platform',
  logoUrl: '/icons/icon-192.png',
  faviconUrl: '/favicon.ico',
  primaryColor: '#7e0ac2',
  primaryColorHover: '#9a13e6',
  secondaryColor: '#b45df0',
  backgroundColor: '#1f1f1f',
  textColor: '#ffffff',
  accentGlowColor: 'rgba(126,10,194,0.35)',
  heroHeading: 'Next-Gen Multi-Gaming & Skill Lounge',
  heroSubheading: 'Certified transparent gameplay, instant crypto QR deposits, and double-entry settlements.',
  footerText: 'Project Atlas Platform — Certified Multi-Tenant Enterprise Gaming System.',
  supportEmail: 'support@atlasgaming.uk',
};

const DEFAULT_POINT_CONFIG: TenantPointConfig = {
  pointToCurrencyRate: 1.0,
  currencyCode: 'UNDEFINED',
  currencySymbol: '',
  pointUnitName: 'PTS',
  displayAsPointsOnly: true,
};

const TenantContext = createContext<TenantContextValue>({
  tenantId: 'org_atlas_uk_001',
  tenantSlug: 'atlas',
  tenantName: 'Project Atlas Global Ltd',
  branding: DEFAULT_BRANDING,
  pointConfig: DEFAULT_POINT_CONFIG,
  enabledGames: ['matka', 'carrom', 'ludo', 'pool', 'other-games', 'casino'],
  isLoading: false,
  switchTenant: () => {},
  isGameEnabled: () => true,
  refreshTenant: async () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState('org_atlas_uk_001');
  const [tenantSlug, setTenantSlug] = useState('atlas');
  const [tenantName, setTenantName] = useState('Project Atlas Global Ltd');
  const [branding, setBranding] = useState<TenantBrandingConfig>(DEFAULT_BRANDING);
  const [pointConfig, setPointConfig] = useState<TenantPointConfig>(DEFAULT_POINT_CONFIG);
  const [enabledGames, setEnabledGames] = useState<GameKey[]>([
    'matka',
    'carrom',
    'ludo',
    'pool',
    'other-games',
    'casino',
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenantData = async () => {
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const res = await fetch(`/api/v1/categories${search}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.tenant) {
          const t = json.data.tenant;
          setTenantId(t.id);
          setTenantSlug(t.slug);
          setTenantName(t.name);
          if (t.branding) setBranding(t.branding);
          if (t.pointConfig) setPointConfig(t.pointConfig);
          if (t.enabledGames) setEnabledGames(t.enabledGames);
        }
      }
    } catch (e) {
      console.error('Failed to load tenant context:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();

    const handleUpdate = () => {
      fetchTenantData();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atlas_point_config_updated') {
        fetchTenantData();
      }
    };

    window.addEventListener('atlas-tenant-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('atlas-tenant-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const switchTenant = (slug: string) => {
    document.cookie = `atlas_tenant=${slug}; path=/; max-age=86400; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set('tenant', slug);
    window.location.href = url.pathname + url.search;
  };

  const isGameEnabled = (key: GameKey): boolean => {
    return enabledGames.includes(key);
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        tenantSlug,
        tenantName,
        branding,
        pointConfig,
        enabledGames,
        isLoading,
        switchTenant,
        isGameEnabled,
        refreshTenant: fetchTenantData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
