'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Layers, Mail, CheckCircle } from 'lucide-react';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const gameKey = searchParams.get('game') || 'Unknown Game';
  const tenantSlug = searchParams.get('tenant') || 'current';

  const gameTitles: Record<string, string> = {
    matka: 'Matka Live Markets',
    ludo: 'Ludo Classic Grand Circuit',
    carrom: 'Carrom Tabletop Tournament',
    pool: '8-Ball Pool Pro',
    'other-games': 'Other Games Hub',
    super_admin: 'Platform Super Admin Portal',
    client_admin: 'Client Administration Dashboard',
  };

  const isAdministrative = gameKey === 'super_admin' || gameKey === 'client_admin';
  const gameTitle = gameTitles[gameKey] || gameKey;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 mb-3">
            {isAdministrative ? 'Security & Isolation Policy' : 'B2B Commercial Package Restriction'}
          </span>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            {isAdministrative ? 'Access Restricted' : 'Game Not Enabled'}
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            {isAdministrative
              ? `The ${gameTitle} is isolated to internal platform operators and cannot be accessed from client customer domains.`
              : `The title ${gameTitle} is not included in the active subscription tier for this domain.`}
          </p>
        </div>

        <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800 text-left space-y-2 text-xs">
          <div className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            White-Label Package Info
          </div>
          <p className="text-zinc-400">
            Tenant: <span className="text-white font-mono">{tenantSlug}</span>
          </p>
          <p className="text-zinc-400">
            Direct route access to disabled games is strictly blocked at server edge.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Available Games
          </Link>

          <Link
            href="/admin/tenants"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all border border-zinc-700"
          >
            Upgrade via B2B Super Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Verifying tenant entitlement...</div>}>
      <AccessDeniedContent />
    </Suspense>
  );
}
