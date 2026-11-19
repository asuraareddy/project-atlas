'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Lock,
  Layers,
  Settings,
  ShieldCheck,
  Zap,
  Sliders,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type {
  MaskedPaymentGatewayConfig,
  PaymentGatewayProvider,
  TenantPaymentPolicy,
} from '@/domain/payments/types';

interface TenantPolicyItem {
  tenant: { id: string; slug: string; brandName: string };
  policy: TenantPaymentPolicy;
}

export default function AdminPaymentGatewaysPage() {
  const [platformGateways, setPlatformGateways] = useState<MaskedPaymentGatewayConfig[]>([]);
  const [allTenantGateways, setAllTenantGateways] = useState<MaskedPaymentGatewayConfig[]>([]);
  const [policies, setPolicies] = useState<TenantPolicyItem[]>([]);
  const [activeTab, setActiveTab] = useState<'platform' | 'tenants' | 'policies'>('platform');
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<TenantPolicyItem | null>(null);

  const [formData, setFormData] = useState({
    providerKey: 'crypto_direct_qr' as PaymentGatewayProvider,
    providerName: '',
    environment: 'SANDBOX' as 'SANDBOX' | 'PRODUCTION',
    currency: 'USDT',
    supportsDeposit: true,
    supportsWithdrawal: true,
    minDepositMinor: 1000,
    maxDepositMinor: 10000000,
    minWithdrawalMinor: 2000,
    maxWithdrawalMinor: 5000000,
    credentials: {
      merchantId: '',
      apiKey: '',
      apiSecret: '',
      receivingAddress: '',
      webhookSecret: '',
    },
    assignedTenantIds: ['*'],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGw, resPol] = await Promise.all([
        fetch('/api/v1/admin/gateways'),
        fetch('/api/v1/admin/gateways/policies'),
      ]);

      if (resGw.ok) {
        const json = await resGw.json();
        setPlatformGateways(json.data.platformGateways || []);
        setAllTenantGateways(json.data.allTenantGateways || []);
      }

      if (resPol.ok) {
        const json = await resPol.json();
        setPolicies(json.data.policies || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Escape key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingPolicy) setEditingPolicy(null);
        if (isCreateOpen) setIsCreateOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingPolicy, isCreateOpen]);

  const handleTestConnection = async (gatewayId: string) => {
    setTestingId(gatewayId);
    try {
      const res = await fetch(`/api/v1/admin/gateways/${gatewayId}/test`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Connection Verified: ${json.data.message} (${json.data.latencyMs}ms)`,
        });
        await fetchData();
      } else {
        setFeedback({ type: 'error', message: json.message || 'Connection test failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setTestingId(null);
    }
  };

  const handleCreatePlatformGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Platform gateway registered successfully.' });
        setIsCreateOpen(false);
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    try {
      const res = await fetch(`/api/v1/admin/gateways/policies/${editingPolicy.tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPolicy.policy),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `Updated payment policy for ${editingPolicy.tenant.brandName}.` });
        setEditingPolicy(null);
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-full bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-normal tracking-wide text-[#6F6F6F]">
              White-Label Super Admin • Two-Tier Payment Infrastructure
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#191919]">
            Payment Gateway Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6F6F] mt-1 max-w-3xl font-normal">
            Configure platform-wide payment integrations, manage tenant allocations, permit client-owned gateway connections, and govern deposit and payout policies across all client domains.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add platform gateway</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-[10px] border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-[#1FAE5B]/10 border-[#1FAE5B]/20 text-[#1FAE5B]'
              : 'bg-[#E5484D]/10 border-[#E5484D]/20 text-[#E5484D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1FAE5B] shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-[#E5484D] shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-normal transition-all ${
            activeTab === 'platform'
              ? 'bg-[#191919] text-white shadow-sm'
              : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Gateways (Option A)</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-normal transition-all ${
            activeTab === 'tenants'
              ? 'bg-[#191919] text-white shadow-sm'
              : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tenant Gateways ({allTenantGateways.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-normal transition-all ${
            activeTab === 'policies'
              ? 'bg-[#191919] text-white shadow-sm'
              : 'bg-white text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Client Policies</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#191919] animate-spin mx-auto" />
          <p className="text-xs text-[#6F6F6F]">Loading gateway data...</p>
        </div>
      ) : activeTab === 'platform' ? (
        /* PLATFORM GATEWAYS TAB */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {platformGateways.map((gw) => (
            <div
              key={gw.id}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-5 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-center text-sm text-[#191919] shrink-0">
                    💳
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#191919]">{gw.providerName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#6F6F6F] mt-0.5">
                      <span className="font-mono text-[#191919]">{gw.providerKey}</span>
                      <span>•</span>
                      <span>Currency: {gw.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase border ${
                      gw.environment === 'PRODUCTION'
                        ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border-[#1FAE5B]/20'
                        : 'bg-[#F8F8F8] text-[#6F6F6F] border-[rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {gw.environment}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]">
                    Platform-Owned
                  </span>
                </div>
              </div>

              {/* Supported Ops */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    gw.supportsDeposit ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20' : 'bg-[#F8F8F8] text-[#6F6F6F]'
                  }`}
                >
                  ✓ Deposits
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    gw.supportsWithdrawal ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20' : 'bg-[#F8F8F8] text-[#6F6F6F]'
                  }`}
                >
                  ✓ Payouts / Withdrawals
                </span>
              </div>

              {/* Credentials / Address Preview */}
              <div className="bg-[#F8F8F8] p-3 rounded-[10px] border border-[rgba(0,0,0,0.06)] text-xs space-y-1 font-mono">
                <div className="text-[11px] text-[#6F6F6F] flex items-center justify-between">
                  <span>Merchant/Account:</span>
                  <span className="text-[#191919] font-medium">{gw.maskedCredentials.maskedMerchantId || gw.maskedCredentials.maskedClientId || 'PLATFORM_VAULT'}</span>
                </div>
                {gw.maskedCredentials.receivingAddress && (
                  <div className="text-[11px] text-[#6F6F6F] flex items-center justify-between">
                    <span>Deposit Address:</span>
                    <span className="text-[#317CFF] truncate max-w-[240px]">{gw.maskedCredentials.receivingAddress}</span>
                  </div>
                )}
              </div>

              {/* Health and Test Button */}
              <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  {gw.lastHealthCheck?.status === 'HEALTHY' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#317CFF]" />
                  )}
                  <span className="text-[#191919] text-[11px]">{gw.lastHealthCheck?.message || 'Untested'}</span>
                </div>

                <button
                  onClick={() => handleTestConnection(gw.id)}
                  disabled={testingId === gw.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${testingId === gw.id ? 'animate-spin' : ''}`} />
                  <span>Test gateway</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'tenants' ? (
        /* ALL TENANT GATEWAYS OVERVIEW */
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] text-xs text-[#6F6F6F] flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <Lock className="w-4 h-4 text-[#317CFF] shrink-0" />
            <span>
              <strong className="text-[#191919]">Zero Secret Exposure Guarantee:</strong> Super Admin monitors gateway status and tenant routing across all client domains, but <strong>cannot access or retrieve raw client-owned gateway secrets</strong>.
            </span>
          </div>

          <div className="overflow-x-auto rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F8] text-[#6F6F6F] text-[11px] font-normal border-b border-[rgba(0,0,0,0.08)]">
                <tr>
                  <th className="p-3">Gateway Name</th>
                  <th className="p-3">Tenant / Client Domain</th>
                  <th className="p-3">Ownership</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Capabilities</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {allTenantGateways.map((gw) => (
                  <tr key={gw.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                    <td className="p-3 font-medium text-[#191919]">{gw.providerName}</td>
                    <td className="p-3 font-mono text-[#6F6F6F]">
                      {gw.tenantSlug || gw.tenantId}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase ${
                          gw.ownership === 'CLIENT_OWNED'
                            ? 'bg-[#317CFF]/10 text-[#317CFF] border border-[#317CFF]/20'
                            : 'bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]'
                        }`}
                      >
                        {gw.ownership}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[#191919]">{gw.providerKey}</td>
                    <td className="p-3 font-medium">{gw.currency}</td>
                    <td className="p-3 text-[#6F6F6F]">
                      {gw.supportsDeposit ? 'Dep ' : ''}
                      {gw.supportsWithdrawal ? '• Payout' : ''}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase ${
                          gw.status === 'ACTIVE' ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]' : 'bg-[#F8F8F8] text-[#6F6F6F]'
                        }`}
                      >
                        {gw.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleTestConnection(gw.id)}
                        className="px-3 py-1 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-[11px] font-normal border border-[rgba(0,0,0,0.08)] transition-all"
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TENANT POLICIES TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => (
            <div
              key={p.tenant.id}
              className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-[#191919]">{p.tenant.brandName}</h3>
                  <span className="text-[11px] font-mono text-[#6F6F6F]">id: {p.tenant.id}</span>
                </div>
                <button
                  onClick={() => setEditingPolicy(JSON.parse(JSON.stringify(p)))}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] text-xs font-normal transition-all"
                >
                  Configure policy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[10px] text-[#6F6F6F] block uppercase">Client-Owned Gateways:</span>
                  <span className={`font-medium ${p.policy.allowClientOwned ? 'text-[#1FAE5B]' : 'text-[#E5484D]'}`}>
                    {p.policy.allowClientOwned ? 'ENABLED (Option B)' : 'DISABLED'}
                  </span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[10px] text-[#6F6F6F] block uppercase">Platform Gateways:</span>
                  <span className={`font-medium ${p.policy.allowPlatformGateway ? 'text-[#1FAE5B]' : 'text-[#E5484D]'}`}>
                    {p.policy.allowPlatformGateway ? 'PERMITTED (Option A)' : 'RESTRICTED'}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-[10px] text-[#6F6F6F] block uppercase font-normal">Permitted Gateway Providers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {p.policy.permittedProviders.map((prov) => (
                    <span key={prov} className="px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#191919] text-[10px] font-mono border border-[rgba(0,0,0,0.08)]">
                      {prov}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policy Edit Modal */}
      {editingPolicy && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setEditingPolicy(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4 shrink-0 shadow-sm">
              <h3 className="text-lg font-normal text-[#191919]">
                Edit Payment Policy: {editingPolicy.tenant.brandName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#6F6F6F] hover:text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-colors"
                title="Close dialog (Escape)"
                aria-label="Close"
              >
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <label className="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPolicy.policy.allowClientOwned}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      policy: { ...editingPolicy.policy, allowClientOwned: e.target.checked },
                    })
                  }
                  className="rounded text-[#191919]"
                />
                <span className="text-[#191919] font-normal">
                  Allow Client Admin to add & manage Client-Owned Gateways (Option B)
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPolicy.policy.allowPlatformGateway}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      policy: { ...editingPolicy.policy, allowPlatformGateway: e.target.checked },
                    })
                  }
                  className="rounded text-[#191919]"
                />
                <span className="text-[#191919] font-normal">
                  Permit Client to use Platform-Provided Gateways (Option A)
                </span>
              </label>

              <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 pt-3 border-t border-[rgba(0,0,0,0.08)] bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 rounded-full bg-[#F8F8F8] text-[#191919] font-normal hover:bg-[#EEEEEE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#191919] text-white font-normal hover:bg-[#333333]"
                >
                  Save policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Platform Gateway Modal */}
      {isCreateOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-6 py-4 shrink-0 shadow-sm">
              <h3 className="text-lg font-normal text-[#191919]">Register Platform Gateway</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#6F6F6F] hover:text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-colors"
                title="Close dialog (Escape)"
                aria-label="Close"
              >
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlatformGateway} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#6F6F6F] font-normal">Gateway Name:</label>
                <input
                  type="text"
                  required
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  placeholder="e.g. Platform Direct Crypto Vault"
                  className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Provider:</label>
                  <select
                    value={formData.providerKey}
                    onChange={(e) => setFormData({ ...formData, providerKey: e.target.value as any })}
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                  >
                    <option value="crypto_direct_qr">Direct Crypto QR (On-Chain)</option>
                    <option value="stripe_checkout">Stripe Checkout</option>
                    <option value="razorpay_upi">Razorpay UPI</option>
                    <option value="phonepe_pg">PhonePe PG</option>
                    <option value="cashfree_payouts">Cashfree Payouts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Environment:</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                  >
                    <option value="SANDBOX">Sandbox</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#6F6F6F] font-normal">Receiving Address / API Key:</label>
                <input
                  type="text"
                  value={formData.credentials.receivingAddress || formData.credentials.apiKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credentials: {
                        ...formData.credentials,
                        receivingAddress: e.target.value,
                        apiKey: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter platform receiving wallet or API key"
                  className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                />
              </div>

              <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 pt-3 border-t border-[rgba(0,0,0,0.08)] bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#F8F8F8] text-[#191919] font-normal hover:bg-[#EEEEEE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#191919] text-white font-normal hover:bg-[#333333]"
                >
                  Deploy gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
