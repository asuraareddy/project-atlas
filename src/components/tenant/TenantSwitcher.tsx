'use client';

import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import { Building2, ChevronDown, Check, Sparkles } from 'lucide-react';

interface TenantOption {
  slug: string;
  name: string;
  badge: string;
  themeColor: string;
  games: string;
}

const TENANTS: TenantOption[] = [
  {
    slug: 'atlas',
    name: 'Project Atlas (Default)',
    badge: 'ALL GAMES',
    themeColor: '#7e0ac2',
    games: 'Matka + Carrom + Ludo + Pool + Casino + Sports',
  },
  {
    slug: 'apex-sports',
    name: 'Apex Sports',
    badge: 'SPORTS ONLY',
    themeColor: '#2563eb',
    games: 'Betfair Live Cricket Exchange',
  },
  {
    slug: 'royal-casino',
    name: 'Royal Casino',
    badge: 'CASINO ONLY',
    themeColor: '#dc2626',
    games: '1Stake Vegas Slots & Live Tables',
  },
  {
    slug: 'ambaari999',
    name: 'AMBAARI999 (Client Redesign)',
    badge: 'SPORTS + CASINO',
    themeColor: '#0088CC',
    games: 'ambaari999.com Exchange & Casino Theme',
  },
  {
    slug: 'titan-gaming',
    name: 'Titan Gaming',
    badge: 'SPORTS + CASINO',
    themeColor: '#7c3aed',
    games: 'Live Sports Exchange & Vegas Casino',
  },
  {
    slug: 'kalyan-club',
    name: 'Kalyan Club',
    badge: 'MATKA ONLY',
    themeColor: '#f59e0b',
    games: 'Matka Draws',
  },
  {
    slug: 'board-masters',
    name: 'Board Masters UK',
    badge: 'MATKA + LUDO',
    themeColor: '#10b981',
    games: 'Matka + Ludo Circuit',
  },
  {
    slug: 'pro-cue',
    name: 'Pro Cue Lounge',
    badge: 'CARROM + POOL',
    themeColor: '#0284c7',
    games: 'Carrom + 8-Ball Pool Pro',
  },
];

export function TenantSwitcher() {
  const { tenantSlug, switchTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = TENANTS.find((t) => t.slug === tenantSlug) || TENANTS[0];

  return (
    <div className="relative inline-block text-left text-xs z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.12)] shadow-md backdrop-blur-md transition-all text-[#191919]"
        title="Switch B2B White-Label Tenant"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
          style={{ backgroundColor: activeOption.themeColor }}
        />
        <span className="font-semibold text-[#191919] tracking-wide">{activeOption.name}</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
          {activeOption.badge}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl backdrop-blur-lg z-50 p-2 space-y-1">
            <div className="px-3 py-2 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6F6F6F] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#317CFF]" />
                B2B White-Label Tenants
              </span>
              <span className="text-[9px] text-[#6F6F6F] font-mono">Multi-Tenant</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
              {TENANTS.map((t) => {
                const isSelected = t.slug === tenantSlug;
                return (
                  <button
                    key={t.slug}
                    onClick={() => {
                      setIsOpen(false);
                      switchTenant(t.slug);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-[#F8F8F8] border border-[rgba(0,0,0,0.12)]'
                        : 'hover:bg-[#F8F8F8] border border-transparent'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full mt-0.5 shrink-0 ring-2 ring-white"
                      style={{ backgroundColor: t.themeColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#191919] text-xs truncate">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1FAE5B] shrink-0" />}
                      </div>
                      <div className="text-[10px] text-[#6F6F6F] truncate mt-0.5">{t.games}</div>
                      <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
                        {t.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
