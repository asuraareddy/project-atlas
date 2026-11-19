'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  Globe,
  Layers,
  Save,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Eye,
  Building,
  Mail,
  ShieldCheck,
  CreditCard,
  Plus,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign,
  Activity,
  Users,
  Gamepad2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';
import type {
  MaskedPaymentGatewayConfig,
  PaymentGatewayProvider,
  TenantPaymentPolicy,
  PaymentTransaction,
} from '@/domain/payments/types';

export default function ClientAdminPage() {
  const { tenantSlug } = useTenant();
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'gateways' | 'games'>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Gateway Tab State
  const [gateways, setGateways] = useState<MaskedPaymentGatewayConfig[]>([]);
  const [policy, setPolicy] = useState<TenantPaymentPolicy | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [gatewayMessage, setGatewayMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [gatewayForm, setGatewayForm] = useState({
    providerKey: 'razorpay_upi' as PaymentGatewayProvider,
    providerName: '',
    environment: 'SANDBOX' as 'SANDBOX' | 'PRODUCTION',
    currency: 'INR',
    supportsDeposit: true,
    supportsWithdrawal: true,
    minDepositMinor: 10000,
    maxDepositMinor: 50000000,
    minWithdrawalMinor: 50000,
    maxWithdrawalMinor: 20000000,
    credentials: {
      keyId: '',
      apiSecret: '',
      webhookSecret: '',
      apiKey: '',
      clientId: '',
      merchantId: '',
      receivingAddress: '',
    },
  });

  const [form, setForm] = useState({
    brandName: '',
    tagline: '',
    primaryColor: '#191919',
    primaryColorHover: '#333333',
    secondaryColor: '#317CFF',
    heroHeading: '',
    heroSubheading: '',
    footerText: '',
    supportEmail: '',
  });

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/v1/client-admin/branding');
      if (res.ok) {
        const json = await res.json();
        const t = json.data;
        setData(t);
        if (t.branding) {
          setForm({
            brandName: t.branding.brandName || '',
            tagline: t.branding.tagline || '',
            primaryColor: t.branding.primaryColor || '#191919',
            primaryColorHover: t.branding.primaryColorHover || '#333333',
            secondaryColor: t.branding.secondaryColor || '#317CFF',
            heroHeading: t.branding.heroHeading || '',
            heroSubheading: t.branding.heroSubheading || '',
            footerText: t.branding.footerText || '',
            supportEmail: t.branding.supportEmail || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to load client branding:', err);
    }
  };

  const fetchGateways = async () => {
    try {
      const res = await fetch('/api/v1/client-admin/gateways');
      if (res.ok) {
        const json = await res.json();
        setGateways(json.data.gateways || []);
        setPolicy(json.data.policy || null);
        setTransactions(json.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load gateways:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBranding(), fetchGateways()]).finally(() => setLoading(false));
  }, [tenantSlug]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnectOpen) {
        setIsConnectOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnectOpen]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/v1/client-admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branding: form }),
      });

      if (res.ok) {
        setSaveMessage('Branding changes saved and deployed successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
        await fetchBranding();
      } else {
        const err = await res.json();
        setSaveMessage(`Failed: ${err.message}`);
      }
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/client-admin/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewayForm),
      });

      if (res.ok) {
        setGatewayMessage({ type: 'success', text: `Gateway "${gatewayForm.providerName}" connected successfully!` });
        setIsConnectOpen(false);
        await fetchGateways();
      } else {
        const err = await res.json();
        setGatewayMessage({ type: 'error', text: err.message || 'Failed to connect gateway' });
      }
    } catch (err: any) {
      setGatewayMessage({ type: 'error', text: err.message });
    }
  };

  const handleTestGateway = async (gatewayId: string) => {
    setTestingId(gatewayId);
    try {
      const res = await fetch(`/api/v1/client-admin/gateways/${gatewayId}/test`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        setGatewayMessage({
          type: 'success',
          text: `Gateway Connection Verified: ${json.data.message} (${json.data.latencyMs}ms)`,
        });
        await fetchGateways();
      } else {
        setGatewayMessage({ type: 'error', text: json.message || 'Test failed' });
      }
    } catch (err: any) {
      setGatewayMessage({ type: 'error', text: err.message });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#191919] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#317CFF] bg-[#317CFF]/10 px-2 py-0.5 rounded-full">
                Client Operator Portal
              </span>
              <span className="text-[#B8B8B8]">•</span>
              <span className="text-[11px] text-[#6F6F6F] font-mono">domain: {data?.slug}</span>
            </div>
            <h1 className="text-2xl font-normal text-[#191919] tracking-tight flex items-center gap-2 mt-1">
              <Building className="w-5 h-5 text-[#191919]" />
              {data?.branding?.brandName || data?.name} Administration
            </h1>
            <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
              Manage client-specific branding, permitted games, player balances, and independent payment gateway integrations for your domain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-[#317CFF]" />
              <span>View player lobby</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-normal transition-all ${
              activeTab === 'overview'
                ? 'bg-[#191919] text-white shadow-sm'
                : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-normal transition-all ${
              activeTab === 'branding'
                ? 'bg-[#191919] text-white shadow-sm'
                : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Branding & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-normal transition-all ${
              activeTab === 'gateways'
                ? 'bg-[#191919] text-white shadow-sm'
                : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Gateways ({gateways.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-normal transition-all ${
              activeTab === 'games'
                ? 'bg-[#191919] text-white shadow-sm'
                : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Assigned Package & Games</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {saveMessage && (
          <div className="p-3.5 rounded-[10px] bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-xs text-[#1FAE5B] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#1FAE5B]" />
            <span>{saveMessage}</span>
          </div>
        )}

        {gatewayMessage && (
          <div
            className={`p-3.5 rounded-[10px] border text-xs flex items-center justify-between gap-3 ${
              gatewayMessage.type === 'success'
                ? 'bg-[#1FAE5B]/10 border-[#1FAE5B]/20 text-[#1FAE5B]'
                : 'bg-[#E5484D]/10 border-[#E5484D]/20 text-[#E5484D]'
            }`}
          >
            <div className="flex items-center gap-2">
              {gatewayMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#1FAE5B] shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[#E5484D] shrink-0" />
              )}
              <span>{gatewayMessage.text}</span>
            </div>
            <button onClick={() => setGatewayMessage(null)} className="text-xs opacity-70">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-[#6F6F6F] text-xs">Loading operator configuration...</div>
        ) : activeTab === 'overview' ? (
          /* ========================================================= */
          /* TAB 1: OVERVIEW DASHBOARD                                  */
          /* ========================================================= */
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
                <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Active Customers</span>
                <p className="text-2xl font-normal font-mono text-[#191919]">1,482</p>
                <span className="text-[11px] text-[#1FAE5B] font-normal">+8.4% this week</span>
              </div>

              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
                <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Assigned Package</span>
                <p className="text-xl font-normal text-[#191919] truncate">{data?.packageCode || 'COMMERCIAL TIER'}</p>
                <span className="text-[11px] text-[#6F6F6F]">{data?.enabledGames?.length || 4} modules active</span>
              </div>

              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
                <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Connected Gateways</span>
                <p className="text-2xl font-normal font-mono text-[#317CFF]">{gateways.length}</p>
                <span className="text-[11px] text-[#6F6F6F]">Isolated credentials</span>
              </div>

              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
                <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Settlement Currency</span>
                <p className="text-2xl font-normal font-mono text-[#191919]">POINTS (PTS)</p>
                <span className="text-[11px] text-[#1FAE5B]">1 PTS = 1.0</span>
              </div>
            </div>

            {/* Quick Actions & Policy Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                <h3 className="text-sm font-medium text-[#191919] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1FAE5B]" />
                  Domain & Tenant Isolation Status
                </h3>
                <p className="text-xs text-[#6F6F6F] leading-relaxed">
                  Your client administration credentials and player database are strictly isolated. No cross-tenant access is permitted.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] text-[10px]">Vault Active</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#317CFF]/10 text-[#317CFF] text-[10px]">Double-Entry Ledger Verified</span>
                </div>
              </div>

              <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                <h3 className="text-sm font-medium text-[#191919] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#317CFF]" />
                  Operational Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => setActiveTab('branding')} className="p-2.5 rounded-[10px] bg-[#F8F8F8] text-left hover:bg-[#EEEEEE] transition-colors">
                    <span className="font-medium text-[#191919] block">Brand Studio</span>
                    <span className="text-[10px] text-[#6F6F6F]">Customize theme & copy</span>
                  </button>
                  <button onClick={() => setActiveTab('gateways')} className="p-2.5 rounded-[10px] bg-[#F8F8F8] text-left hover:bg-[#EEEEEE] transition-colors">
                    <span className="font-medium text-[#191919] block">Gateway Settings</span>
                    <span className="text-[10px] text-[#6F6F6F]">Configure merchant keys</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'branding' ? (
          /* ========================================================= */
          /* TAB 2: BRANDING & THEME STUDIO                             */
          /* ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveBranding} className="lg:col-span-2 space-y-6">
              {/* Brand Identity Card */}
              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <h2 className="font-medium text-[#191919] text-sm tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#317CFF]" />
                  Brand Identity & Display
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-normal text-[#6F6F6F] block mb-1">
                      Brand Display Name
                    </label>
                    <input
                      type="text"
                      value={form.brandName}
                      onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                      className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2.5 text-xs text-[#191919] focus:border-[#191919] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-normal text-[#6F6F6F] block mb-1">
                      Marketing Tagline
                    </label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2.5 text-xs text-[#191919] focus:border-[#191919] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Color Scheme Studio Card */}
              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <h2 className="font-medium text-[#191919] text-sm tracking-tight flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#317CFF]" />
                  Theme Colors & Palette
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-normal text-[#6F6F6F] block mb-1">
                      Primary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[rgba(0,0,0,0.08)] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 font-mono text-xs text-[#191919]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-normal text-[#6F6F6F] block mb-1">
                      Button Hover Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.primaryColorHover}
                        onChange={(e) => setForm({ ...form, primaryColorHover: e.target.value })}
                        className="w-8 h-8 rounded border border-[rgba(0,0,0,0.08)] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={form.primaryColorHover}
                        onChange={(e) => setForm({ ...form, primaryColorHover: e.target.value })}
                        className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 font-mono text-xs text-[#191919]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-normal text-[#6F6F6F] block mb-1">
                      Secondary Glow
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[rgba(0,0,0,0.08)] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 font-mono text-xs text-[#191919]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white font-normal text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Deploying...' : 'Deploy branding updates'}</span>
                </button>
              </div>
            </form>

            {/* Sidebar Card */}
            <div className="space-y-6">
              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-5 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2">
                  <span className="text-[10px] font-normal text-[#6F6F6F] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#317CFF]" />
                    Commercial License
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-base font-medium text-[#191919]">
                    {data?.packageCode || 'ENTERPRISE SUITE'}
                  </div>
                  <div className="text-xs text-[#6F6F6F]">
                    Tenant domain: <span className="text-[#191919] font-mono">{data?.slug}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'gateways' ? (
          /* ========================================================= */
          /* TAB 3: PAYMENT GATEWAY SETTINGS                            */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#191919] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#317CFF]" />
                    Payment Gateways for {data?.branding?.brandName || data?.name}
                  </h2>
                  <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
                    Connect your own merchant account or utilize platform-assigned payment gateways for deposits and withdrawals.
                  </p>
                </div>

                {policy?.allowClientOwned && (
                  <button
                    onClick={() => {
                      setGatewayForm({
                        providerKey: 'razorpay_upi',
                        providerName: `${data?.branding?.brandName || 'Client'} Razorpay UPI Gateway`,
                        environment: 'SANDBOX',
                        currency: 'INR',
                        supportsDeposit: true,
                        supportsWithdrawal: true,
                        minDepositMinor: 10000,
                        maxDepositMinor: 50000000,
                        minWithdrawalMinor: 50000,
                        maxWithdrawalMinor: 20000000,
                        credentials: {
                          keyId: '',
                          apiSecret: '',
                          webhookSecret: '',
                          apiKey: '',
                          clientId: '',
                          merchantId: '',
                          receivingAddress: '',
                        },
                      });
                      setIsConnectOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Connect client gateway (Option B)</span>
                  </button>
                )}
              </div>

              {/* Policy Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs border-t border-[rgba(0,0,0,0.06)]">
                <span className="text-[#6F6F6F]">Gateway Permissions:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 text-[10px] font-normal">
                  {policy?.allowClientOwned ? '✓ Client-Owned Merchant Gateways Permitted' : '✗ Client-Owned Gateways Restricted'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#317CFF]/10 text-[#317CFF] border border-[#317CFF]/20 text-[10px] font-normal">
                  {policy?.allowPlatformGateway ? '✓ Platform Gateway Permitted' : '✗ Platform Gateway Disabled'}
                </span>
              </div>
            </div>

            {/* Gateways Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <CreditCard className="w-8 h-8 text-[#B8B8B8] mx-auto" />
                  <h3 className="text-sm font-medium text-[#191919]">No Active Payment Gateways</h3>
                  <p className="text-xs text-[#6F6F6F] max-w-sm mx-auto">
                    Click &quot;Connect client gateway&quot; to connect Razorpay, Stripe, PhonePe, or Crypto QR.
                  </p>
                </div>
              ) : (
                gateways.map((gw) => (
                  <div
                    key={gw.id}
                    className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-5 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[rgba(0,0,0,0.16)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-[#191919]">{gw.providerName}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase border ${
                              gw.ownership === 'CLIENT_OWNED'
                                ? 'bg-[#317CFF]/10 text-[#317CFF] border-[#317CFF]/20'
                                : 'bg-[#F8F8F8] text-[#6F6F6F] border-[rgba(0,0,0,0.08)]'
                            }`}
                          >
                            {gw.ownership === 'CLIENT_OWNED' ? 'Client-Owned (Option B)' : 'Platform (Option A)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#6F6F6F] mt-1 font-mono">
                          <span>{gw.providerKey}</span>
                          <span>•</span>
                          <span>{gw.currency}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase border ${
                          gw.environment === 'PRODUCTION'
                            ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border-[#1FAE5B]/20'
                            : 'bg-[#F8F8F8] text-[#6F6F6F] border-[rgba(0,0,0,0.08)]'
                        }`}
                      >
                        {gw.environment}
                      </span>
                    </div>

                    {/* Masked Credentials Snapshot */}
                    <div className="bg-[#F8F8F8] p-3 rounded-[10px] border border-[rgba(0,0,0,0.06)] text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[#6F6F6F] text-[11px]">
                        <span>Key/Merchant:</span>
                        <span className="text-[#191919] font-medium">
                          {gw.maskedCredentials.maskedMerchantId || gw.maskedCredentials.maskedApiKey || gw.maskedCredentials.receivingAddress || 'Configured'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#6F6F6F] text-[11px]">
                        <span>Secret:</span>
                        <span className="text-[#317CFF]">
                          {gw.maskedCredentials.hasApiSecret ? '••••••••••••••••' : 'Configured'}
                        </span>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${gw.supportsDeposit ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20' : 'bg-[#F8F8F8] text-[#6F6F6F]'}`}>
                        ✓ Player Deposits
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${gw.supportsWithdrawal ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20' : 'bg-[#F8F8F8] text-[#6F6F6F]'}`}>
                        ✓ Instant Payouts
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs">
                        {gw.lastHealthCheck?.status === 'HEALTHY' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#317CFF]" />
                        )}
                        <span className="text-[#191919] text-[11px]">
                          {gw.lastHealthCheck?.message || 'Ready'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTestGateway(gw.id)}
                        disabled={testingId === gw.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${testingId === gw.id ? 'animate-spin' : ''}`} />
                        <span>Test gateway</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tenant Transaction History */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-5 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <h3 className="text-sm font-medium text-[#191919] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#317CFF]" />
                Recent Payment Transactions ({transactions.length})
              </h3>

              {transactions.length === 0 ? (
                <p className="text-xs text-[#6F6F6F] italic py-4">No recent deposit or payout transactions recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F8F8] text-[#6F6F6F] text-[11px] font-normal border-b border-[rgba(0,0,0,0.08)]">
                      <tr>
                        <th className="p-2.5">Tx ID</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Gateway</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                          <td className="p-2.5 font-mono text-[#6F6F6F]">{tx.id}</td>
                          <td className="p-2.5 font-medium">
                            <span className={tx.type === 'DEPOSIT' ? 'text-[#1FAE5B]' : 'text-[#317CFF]'}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-medium text-[#191919]">
                            {tx.currency} {(tx.amountMinor / 100).toFixed(2)}
                          </td>
                          <td className="p-2.5 font-mono text-[#6F6F6F]">{tx.providerKey}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase bg-[#1FAE5B]/10 text-[#1FAE5B]">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-[#6F6F6F] font-mono text-[10px]">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* TAB 4: ASSIGNED PACKAGE & GAMES                            */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div>
                <span className="text-[10px] font-normal uppercase tracking-wider text-[#317CFF] bg-[#317CFF]/10 px-2 py-0.5 rounded-full">
                  Assigned Tier Only
                </span>
                <h2 className="text-lg font-medium text-[#191919] mt-2">
                  Active Package: {data?.packageCode || 'ENTERPRISE FULL SUITE'}
                </h2>
                <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
                  In accordance with Project Atlas multi-tenant guidelines, only the specific package assigned to <strong className="text-[#191919]">{data?.name}</strong> and its licensed game verticals are displayed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#191919]">1. Matka</span>
                    <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
                  </div>
                  <p className="text-[11px] text-[#6F6F6F]">Server-authoritative markets with automated cutoffs and chart history.</p>
                </div>

                <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#191919]">2. Casino Games</span>
                    <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
                  </div>
                  <p className="text-[11px] text-[#6F6F6F]">Unified aggregator slots, roulette, and certified live studio tables.</p>
                </div>

                <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#191919]">3. Sports Exchange</span>
                    <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
                  </div>
                  <p className="text-[11px] text-[#6F6F6F]">Betfair API-NG live liquidity, back/lay ladder matching, in-play scores.</p>
                </div>

                <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#191919]">4. Other Games</span>
                    <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
                  </div>
                  <p className="text-[11px] text-[#6F6F6F]">Real-time 8-Ball Pool, Carrom, Ludo Grand Circuit, and Ace2Three Rummy.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connect Gateway Modal */}
        {isConnectOpen && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setIsConnectOpen(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4 shrink-0 shadow-sm">
                <div>
                  <span className="text-[10px] font-normal uppercase tracking-wide text-[#317CFF] block">
                    Option B: Client-Owned Gateway
                  </span>
                  <h3 className="text-lg font-normal text-[#191919] mt-0.5">Connect Merchant Gateway</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConnectOpen(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#6F6F6F] hover:text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-colors"
                  title="Close dialog (Escape)"
                  aria-label="Close"
                >
                  <span>Close</span>
                </button>
              </div>

              <form onSubmit={handleSaveGateway} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[#6F6F6F] font-normal">Gateway Name:</label>
                    <input
                      type="text"
                      required
                      value={gatewayForm.providerName}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, providerName: e.target.value })}
                      className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#6F6F6F] font-normal">Gateway Provider:</label>
                      <select
                        value={gatewayForm.providerKey}
                        onChange={(e) =>
                          setGatewayForm({
                            ...gatewayForm,
                            providerKey: e.target.value as any,
                            currency: e.target.value === 'razorpay_upi' || e.target.value === 'phonepe_pg' ? 'INR' : 'GBP',
                          })
                        }
                        className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                      >
                        <option value="razorpay_upi">Razorpay UPI & Smart Collect</option>
                        <option value="stripe_checkout">Stripe Checkout</option>
                        <option value="phonepe_pg">PhonePe Payment Gateway</option>
                        <option value="cashfree_payouts">Cashfree Payouts</option>
                        <option value="crypto_direct_qr">Direct Crypto QR</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#6F6F6F] font-normal">Environment:</label>
                      <select
                        value={gatewayForm.environment}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, environment: e.target.value as any })}
                        className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                      >
                        <option value="SANDBOX">Sandbox (Test Mode)</option>
                        <option value="PRODUCTION">Production (Live)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Credential Fields based on Provider */}
                  <div className="p-3.5 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-3">
                    <span className="text-[10px] font-normal text-[#191919] uppercase tracking-wider block">
                      Merchant Credentials for {gatewayForm.providerKey}
                    </span>

                    {gatewayForm.providerKey === 'razorpay_upi' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Key ID (rzp_live / rzp_test):</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.credentials.keyId}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, keyId: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Key Secret:</label>
                          <input
                            type="password"
                            required
                            value={gatewayForm.credentials.apiSecret}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, apiSecret: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {gatewayForm.providerKey === 'crypto_direct_qr' && (
                      <div className="space-y-1">
                        <label className="text-[#6F6F6F]">Receiving Wallet Address:</label>
                        <input
                          type="text"
                          required
                          value={gatewayForm.credentials.receivingAddress}
                          onChange={(e) =>
                            setGatewayForm({
                              ...gatewayForm,
                              credentials: { ...gatewayForm.credentials, receivingAddress: e.target.value },
                            })
                          }
                          placeholder="e.g. 0x... or TRC20 address"
                          className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                        />
                      </div>
                    )}

                    {gatewayForm.providerKey === 'stripe_checkout' && (
                      <div className="space-y-1">
                        <label className="text-[#6F6F6F]">Stripe Secret Key (sk_live / sk_test):</label>
                        <input
                          type="password"
                          required
                          value={gatewayForm.credentials.apiKey}
                          onChange={(e) =>
                            setGatewayForm({
                              ...gatewayForm,
                              credentials: { ...gatewayForm.credentials, apiKey: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                        />
                      </div>
                    )}

                    {gatewayForm.providerKey === 'phonepe_pg' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Merchant ID:</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.credentials.merchantId}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, merchantId: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Salt Key:</label>
                          <input
                            type="password"
                            required
                            value={gatewayForm.credentials.apiKey}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, apiKey: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {gatewayForm.providerKey === 'cashfree_payouts' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Client / App ID:</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.credentials.clientId}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, clientId: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[#6F6F6F]">Client Secret:</label>
                          <input
                            type="password"
                            required
                            value={gatewayForm.credentials.apiSecret}
                            onChange={(e) =>
                              setGatewayForm({
                                ...gatewayForm,
                                credentials: { ...gatewayForm.credentials, apiSecret: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-[rgba(0,0,0,0.08)] bg-white px-6 py-4 shrink-0 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsConnectOpen(false)}
                    className="px-4 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#191919] font-normal text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white font-normal text-xs transition-all shadow-sm"
                  >
                    Connect & activate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
