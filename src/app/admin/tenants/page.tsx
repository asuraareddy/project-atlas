'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Globe,
  Package,
  Layers,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Palette,
  X,
  LogOut,
  Coins,
} from 'lucide-react';
import { TenantRecord, GameKey } from '@/domain/tenant/types';
import { useTenant } from '@/components/tenant/TenantContext';

export default function AdminTenantsPage() {
  const { switchTenant } = useTenant();
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [isEditingGames, setIsEditingGames] = useState(false);
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states for point configuration & currency
  const [pointRateInput, setPointRateInput] = useState('1.0');
  const [currencyCodeInput, setCurrencyCodeInput] = useState('UNDEFINED');
  const [pointUnitInput, setPointUnitInput] = useState('PTS');

  // Form states for new tenant
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    primaryHostname: '',
    packageCode: 'MATKA_ONLY',
    primaryColor: '#7e0ac2',
  });

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/v1/admin/tenants');
      if (res.ok) {
        const json = await res.json();
        setTenants(json.data.tenants || []);
        setPackages(json.data.packages || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Handle Escape key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingGames) setIsEditingGames(false);
        if (isEditingPoints) setIsEditingPoints(false);
        if (isCreating) setIsCreating(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingGames, isEditingPoints, isCreating]);

  const handleUpdatePointConfig = async () => {
    if (!selectedTenant) return;
    try {
      setSaveStatus('Saving point valuation & currency configuration...');
      const rate = parseFloat(pointRateInput) || 1.0;
      const currency = currencyCodeInput.trim() || 'UNDEFINED';
      const unit = pointUnitInput.trim() || 'PTS';

      const res = await fetch(`/api/v1/admin/tenants/${selectedTenant.id}/point-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointToCurrencyRate: rate,
          currencyCode: currency,
          pointUnitName: unit,
        }),
      });

      if (res.ok) {
        setSaveStatus(`Point configuration updated: 1 Point = ${rate} (Currency: ${currency})`);
        setIsEditingPoints(false);
        await fetchTenants();
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        const err = await res.json();
        setSaveStatus(`Failed: ${err.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      setSaveStatus(`Error: ${e.message}`);
    }
  };

  const handleUpdateGames = async (tenant: TenantRecord, packageCode: string, gameConfigs: any[]) => {
    try {
      setSaveStatus('Saving changes...');
      const res = await fetch(`/api/v1/admin/tenants/${tenant.id}/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageCode, gameConfigs }),
      });

      if (res.ok) {
        setSaveStatus('Game entitlements successfully updated!');
        setTimeout(() => setSaveStatus(null), 3000);
        await fetchTenants();
        if (selectedTenant && selectedTenant.id === tenant.id) {
          setSelectedTenant({ ...selectedTenant, packageCode: packageCode as any, gameConfigs });
        }
      } else {
        const err = await res.json();
        setSaveStatus(`Failed: ${err.message}`);
      }
    } catch (e: any) {
      setSaveStatus(`Error: ${e.message}`);
    }
  };

  const handleToggleGame = (gameKey: GameKey) => {
    if (!selectedTenant) return;
    const updated = selectedTenant.gameConfigs.map((cfg) => {
      if (cfg.gameKey === gameKey) {
        return { ...cfg, isEnabled: !cfg.isEnabled };
      }
      return cfg;
    });
    setSelectedTenant({ ...selectedTenant, gameConfigs: updated });
  };

  const handlePackageChange = (packageCode: string) => {
    if (!selectedTenant) return;
    const pkg = packages.find((p) => p.code === packageCode);
    if (!pkg) return;

    const updatedConfigs = selectedTenant.gameConfigs.map((cfg) => ({
      ...cfg,
      isEnabled: pkg.includedGames.includes(cfg.gameKey),
    }));

    setSelectedTenant({
      ...selectedTenant,
      packageCode: packageCode as any,
      gameConfigs: updatedConfigs,
    });
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('Provisioning new tenant...');
      const res = await fetch('/api/v1/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTenantForm,
          branding: {
            brandName: newTenantForm.name.toUpperCase(),
            primaryColor: newTenantForm.primaryColor,
          },
        }),
      });

      if (res.ok) {
        setSaveStatus('Tenant provisioned successfully!');
        setIsCreating(false);
        setNewTenantForm({
          name: '',
          slug: '',
          contactEmail: '',
          primaryHostname: '',
          packageCode: 'MATKA_ONLY',
          primaryColor: '#7e0ac2',
        });
        await fetchTenants();
      } else {
        const err = await res.json();
        setSaveStatus(`Failed: ${err.message}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const allAvailableGames: { key: GameKey; label: string; desc: string }[] = [
    { key: 'sports', label: 'Sports Exchange & Bookmaker', desc: 'Betfair API-NG live exchange markets, in-play cricket scoreboards & liquidity' },
    { key: 'casino', label: 'Casino Games (1Stake Suite)', desc: 'Unified iGaming aggregation (slots, roulette, blackjack, live dealer) via Flexrix API' },
    { key: 'matka', label: 'Matka Live Markets', desc: 'Direct provider live number draws & charts' },
    { key: 'carrom', label: 'Carrom Tabletop', desc: 'Rigid body disc physics & drag shooting' },
    { key: 'ludo', label: 'Ludo Grand Circuit', desc: 'CSPRNG multiplayer board racing' },
    { key: 'pool', label: '8-Ball Pool Pro', desc: 'Billiards cue simulation & pocketing' },
    { key: 'other-games', label: 'Other Games Hub', desc: 'Lounge skill game tournament directory' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b45df0]">
              Enterprise Multi-Tenant Engine
            </span>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/admin/dashboard" 
              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Platform Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            B2B White-Label Tenants & Packages
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Centrally manage clients, domains, custom branding, and modular game packages (Matka Only, Matka + Ludo, Matka + Carrom, Complete Pro Suite).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-all shadow-sm"
            title="Exit Admin and Return to Player Lobby"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Exit to Lobby</span>
          </Link>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-lg bg-zinc-800 border border-purple-500/40 text-xs text-purple-300 flex items-center justify-between">
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#242424] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] text-[#c4bfd0] uppercase font-bold tracking-wider">Active Tenants</span>
          <div className="text-2xl font-black text-white mt-1">{tenants.length}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Isolated Data</span>
        </div>
        <div className="bg-[#242424] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] text-[#c4bfd0] uppercase font-bold tracking-wider">Configured Packages</span>
          <div className="text-2xl font-black text-white mt-1">{packages.length}</div>
          <span className="text-[10px] text-purple-400 font-semibold">Modular Subscriptions</span>
        </div>
        <div className="bg-[#242424] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] text-[#c4bfd0] uppercase font-bold tracking-wider">Verified Domains</span>
          <div className="text-2xl font-black text-white mt-1">
            {tenants.reduce((acc, t) => acc + (t.domains?.length || 0), 0)}
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold">SSL Edge Mapped</span>
        </div>
        <div className="bg-[#242424] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] text-[#c4bfd0] uppercase font-bold tracking-wider">Route Gating</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">ACTIVE</div>
          <span className="text-[10px] text-[#c4bfd0]">Hard 403 Server Blocking</span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-[#242424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm tracking-wide">Client Operator Directory</h2>
          <span className="text-[10px] text-zinc-400">One Shared Central Codebase</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading B2B tenants...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 border-b border-white/10 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Tenant Brand</th>
                  <th className="p-3.5">Commercial Tier</th>
                  <th className="p-3.5">Mapped Domains</th>
                  <th className="p-3.5">Enabled Games</th>
                  <th className="p-3.5">Point Valuation</th>
                  <th className="p-3.5">Monthly Fee</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {tenants.map((tenant) => {
                  const pkg = packages.find((p) => p.code === tenant.packageCode);
                  const enabledCount = tenant.gameConfigs?.filter((c) => c.isEnabled).length || 0;

                  return (
                    <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-zinc-800"
                            style={{ backgroundColor: tenant.branding?.primaryColor || '#7e0ac2' }}
                          />
                          <div>
                            <div className="font-bold text-white text-sm">
                              {tenant.branding?.brandName || tenant.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              slug: {tenant.slug} • id: {tenant.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {tenant.packageCode}
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{pkg?.name}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          {tenant.domains?.slice(0, 2).map((dom) => (
                            <div key={dom.id} className="flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                              <Globe className="w-3 h-3 text-cyan-400" />
                              <span>{dom.hostname}</span>
                            </div>
                          ))}
                          {(tenant.domains?.length || 0) > 2 && (
                            <span className="text-[9px] text-zinc-500 font-mono">
                              +{tenant.domains.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tenant.gameConfigs
                            ?.filter((c) => c.isEnabled)
                            .map((c) => (
                              <span
                                key={c.gameKey}
                                className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700"
                              >
                                {c.gameKey}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 w-fit">
                            1 pt = {tenant.pointConfig?.pointToCurrencyRate ?? 1.0}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            Ref: {tenant.pointConfig?.currencyCode || 'UNDEFINED'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-zinc-200">
                        {pkg ? `£${(pkg.monthlyPriceMinor / 100).toFixed(2)}/mo` : 'Custom'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => switchTenant(tenant.slug)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 border border-zinc-700"
                            title="Preview tenant lounge"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setPointRateInput(tenant.pointConfig?.pointToCurrencyRate?.toString() || '1.0');
                              setCurrencyCodeInput(tenant.pointConfig?.currencyCode || 'UNDEFINED');
                              setPointUnitInput(tenant.pointConfig?.pointUnitName || 'PTS');
                              setIsEditingPoints(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                            title="Configure point-to-currency ratio and client reference currency"
                          >
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span>Valuation</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsEditingGames(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center gap-1 border border-purple-500/40"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Package</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Package & Game Config Modal */}
      {isEditingGames && selectedTenant && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditingGames(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Configure Subscribed Titles"
        >
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Sticky Header with Always-Visible Close Button */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/98 backdrop-blur px-6 py-4 shrink-0 shadow-md">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">
                  Configure Subscribed Titles
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedTenant.branding?.brandName} ({selectedTenant.slug})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGames(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-700 transition-colors shadow-sm"
                title="Close dialog (Escape)"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Commercial Package Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Preset Commercial Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {packages.map((pkg) => {
                    const isSelected = selectedTenant.packageCode === pkg.code;
                    return (
                      <button
                        key={pkg.code}
                        type="button"
                        onClick={() => handlePackageChange(pkg.code)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500 text-white'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>{pkg.name}</span>
                          <span className="font-mono text-purple-300">
                            £{(pkg.monthlyPriceMinor / 100).toFixed(0)}/mo
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">{pkg.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Game Toggles */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Granular Game Entitlements</span>
                  <span className="text-[10px] text-zinc-500">Hard Server Route Gating</span>
                </label>
                <div className="space-y-2">
                  {allAvailableGames.map((game) => {
                    const cfg = selectedTenant.gameConfigs.find((c) => c.gameKey === game.key);
                    const isEnabled = cfg ? cfg.isEnabled : false;

                    return (
                      <div
                        key={game.key}
                        onClick={() => handleToggleGame(game.key)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isEnabled
                            ? 'bg-zinc-800/80 border-purple-500/50'
                            : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-2">
                            <span>{game.label}</span>
                            <span className="font-mono text-[9px] text-zinc-500">/{game.key}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400">{game.desc}</div>
                        </div>

                        <div
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                            isEnabled ? 'bg-purple-600 justify-end' : 'bg-zinc-700 justify-start'
                          }`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Footer with Cancel & Save */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-900/98 backdrop-blur px-6 py-4 shrink-0 shadow-md">
              <button
                type="button"
                onClick={() => setIsEditingGames(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateGames(
                    selectedTenant,
                    selectedTenant.packageCode,
                    selectedTenant.gameConfigs
                  );
                  setIsEditingGames(false);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Package & Permissions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Tenant Modal */}
      {isCreating && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsCreating(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Onboard New B2B Operator"
        >
          <form
            onSubmit={handleCreateTenant}
            className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
          >
            {/* Sticky Header with Always-Visible Close Button */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/98 backdrop-blur px-6 py-4 shrink-0 shadow-md">
              <h3 className="font-bold text-white text-base">Onboard New B2B Operator</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-colors shadow-sm"
                title="Close dialog (Escape)"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Form Body Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Legal Operator Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantForm.name}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                  placeholder="e.g. Vegas Masters International"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  URL-Safe Tenant Slug *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantForm.slug}
                  onChange={(e) =>
                    setNewTenantForm({
                      ...newTenantForm,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  placeholder="e.g. vegas-masters"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Contact & Billing Email *
                </label>
                <input
                  type="email"
                  required
                  value={newTenantForm.contactEmail}
                  onChange={(e) =>
                    setNewTenantForm({ ...newTenantForm, contactEmail: e.target.value })
                  }
                  placeholder="ops@vegasmasters.uk"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Primary Hostname / Custom Domain
                </label>
                <input
                  type="text"
                  value={newTenantForm.primaryHostname}
                  onChange={(e) =>
                    setNewTenantForm({ ...newTenantForm, primaryHostname: e.target.value })
                  }
                  placeholder="play.vegasmasters.uk"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Starting Package
                  </label>
                  <select
                    value={newTenantForm.packageCode}
                    onChange={(e) =>
                      setNewTenantForm({ ...newTenantForm, packageCode: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                  >
                    {packages.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTenantForm.primaryColor}
                      onChange={(e) =>
                        setNewTenantForm({ ...newTenantForm, primaryColor: e.target.value })
                      }
                      className="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-950 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newTenantForm.primaryColor}
                      onChange={(e) =>
                        setNewTenantForm({ ...newTenantForm, primaryColor: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer with Cancel & Submit */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-900/98 backdrop-blur px-6 py-4 shrink-0 shadow-md">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40"
              >
                Provision Tenant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Point Valuation & Currency Management Modal */}
      {isEditingPoints && selectedTenant && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditingPoints(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Point Valuation & Reference Currency"
        >
          <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/98 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Point Valuation & Currency Ratio
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {selectedTenant.branding?.brandName} ({selectedTenant.slug})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPoints(false)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                <p className="font-bold">System Default Rules:</p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Currency is undefined (not EUR or other fiat). Customer websites strictly display points only.
                  By default, <strong>1 point = 1</strong>. Super Admin can adjust the point-to-currency ratio per client operator.
                </p>
              </div>

              {/* Point to Currency Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  Point to Currency Ratio (1 Point = X Currency Units)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={pointRateInput}
                    onChange={(e) => setPointRateInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    placeholder="1.0"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-amber-400">
                    Rate
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Default is 1.0 (1 pt = 1 unit). For example: 1.0 means 100 points = 100 units.
                </p>
              </div>

              {/* Reference Currency Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  Reference Currency Code (Client-Specific)
                </label>
                <input
                  type="text"
                  value={currencyCodeInput}
                  onChange={(e) => setCurrencyCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono uppercase"
                  placeholder="UNDEFINED"
                />
                <p className="text-[10px] text-zinc-500">
                  Default: UNDEFINED. Can also be set to client-specific references (e.g. UNDEFINED, INR, USD, POINTS).
                </p>
              </div>

              {/* Point Unit Display Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  Point Unit Display Name
                </label>
                <input
                  type="text"
                  value={pointUnitInput}
                  onChange={(e) => setPointUnitInput(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono uppercase"
                  placeholder="PTS"
                />
                <p className="text-[10px] text-zinc-500">
                  Label displayed on client tables and player balances (default: PTS).
                </p>
              </div>

              {/* Live Conversion Preview */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 font-mono text-[11px]">
                <div className="text-zinc-400 font-bold">Live Conversion Preview:</div>
                <div className="text-emerald-400">
                  • 1 {pointUnitInput || 'PTS'} = {parseFloat(pointRateInput) || 1.0} {currencyCodeInput || 'UNDEFINED'}
                </div>
                <div className="text-amber-300">
                  • 1,000 {pointUnitInput || 'PTS'} = {(1000 * (parseFloat(pointRateInput) || 1.0)).toLocaleString()} {currencyCodeInput || 'UNDEFINED'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-900/98 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsEditingPoints(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePointConfig}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-900/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Point Valuation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
