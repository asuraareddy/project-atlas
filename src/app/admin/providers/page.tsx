'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Building2,
  Lock,
  Activity,
  History,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Search,
} from 'lucide-react';
import type {
  MaskedProviderRecord,
  ProviderCategory,
  ProviderHealthCheck,
  ProviderAuditLog,
  ProviderStatus,
} from '@/domain/providers/types';

interface TenantSummary {
  id: string;
  slug: string;
  name: string;
  brandName: string;
}

const CATEGORIES: { key: ProviderCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All providers', icon: '🌐' },
  { key: 'sports_odds', label: 'Sports odds (Betfair)', icon: '🏏' },
  { key: 'sports_data', label: 'Sports data (Radar)', icon: '📊' },
  { key: 'casino', label: 'Casino aggregators', icon: '🎰' },
  { key: 'live_casino', label: 'Live studios (Evolution)', icon: '🔴' },
  { key: 'lottery_matka', label: 'Matka & lottery', icon: '🎲' },
  { key: 'payment_crypto', label: 'Payment & crypto', icon: '💳' },
];

export default function ProviderManagementPage() {
  const [providers, setProviders] = useState<MaskedProviderRecord[]>([]);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals
  const [editingProvider, setEditingProvider] = useState<MaskedProviderRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ providerId: string; health: ProviderHealthCheck } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ProviderAuditLog[]>([]);
  const [historyProviderId, setHistoryProviderId] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'sports_odds' as ProviderCategory,
    categoryLabel: '',
    apiBaseUrl: '',
    apiVersion: 'v1.0',
    authMethod: 'API_KEY_HEADER',
    environment: 'SANDBOX' as 'SANDBOX' | 'PRODUCTION',
    status: 'ACTIVE' as ProviderStatus,
    notes: '',
    clientId: '',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    accessToken: '',
    assignedTenantIds: [] as string[],
  });

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Providers and Tenants
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProv, resTenants] = await Promise.all([
        fetch('/api/v1/admin/providers'),
        fetch('/api/v1/admin/tenants'),
      ]);

      if (resProv.ok) {
        const json = await resProv.json();
        setProviders(json.data.providers || []);
      }

      if (resTenants.ok) {
        const json = await resTenants.json();
        setTenants(
          (json.data.tenants || []).map((t: any) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            brandName: t.branding?.brandName || t.name,
          }))
        );
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: `Failed to load data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Escape key to close modal or drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingProvider) setEditingProvider(null);
        if (isCreateOpen) setIsCreateOpen(false);
        if (auditLogsOpen) setAuditLogsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingProvider, isCreateOpen, auditLogsOpen]);

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.apiBaseUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handle Test Connection
  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    setTestResult(null);
    try {
      const res = await fetch(`/api/v1/admin/providers/${providerId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok) {
        setTestResult({ providerId, health: json.data });
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, lastHealthCheck: json.data } : p))
        );
      } else {
        setTestResult({
          providerId,
          health: {
            status: 'DOWN',
            checkedAt: new Date().toISOString(),
            message: json.message || 'Connection failed',
          },
        });
      }
    } catch (err: any) {
      setTestResult({
        providerId,
        health: {
          status: 'DOWN',
          checkedAt: new Date().toISOString(),
          message: err.message,
        },
      });
    } finally {
      setTestingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: MaskedProviderRecord) => {
    setEditingProvider(p);
    setFormData({
      name: p.name,
      category: p.category,
      categoryLabel: p.categoryLabel || '',
      apiBaseUrl: p.apiBaseUrl,
      apiVersion: p.apiVersion,
      authMethod: p.authMethod,
      environment: p.environment,
      status: p.status,
      notes: p.notes || '',
      clientId: p.maskedCredentials.clientId || '',
      apiKey: '',
      apiSecret: '',
      username: p.maskedCredentials.maskedUsername || '',
      password: '',
      accessToken: '',
      assignedTenantIds: p.assignedTenantIds || [],
    });
  };

  // Save Provider Updates
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        const updates: any = {
          name: formData.name,
          category: formData.category,
          categoryLabel: formData.categoryLabel,
          apiBaseUrl: formData.apiBaseUrl,
          apiVersion: formData.apiVersion,
          authMethod: formData.authMethod,
          environment: formData.environment,
          status: formData.status,
          notes: formData.notes,
          assignedTenantIds: formData.assignedTenantIds,
          credentials: {
            ...(formData.clientId ? { clientId: formData.clientId } : {}),
            ...(formData.apiKey ? { apiKey: formData.apiKey } : {}),
            ...(formData.apiSecret ? { apiSecret: formData.apiSecret } : {}),
            ...(formData.username ? { username: formData.username } : {}),
            ...(formData.password ? { password: formData.password } : {}),
            ...(formData.accessToken ? { accessToken: formData.accessToken } : {}),
          },
        };

        const res = await fetch(`/api/v1/admin/providers/${editingProvider.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (res.ok) {
          setFeedbackMessage({ type: 'success', text: `Provider "${formData.name}" updated successfully.` });
          setEditingProvider(null);
          await fetchData();
        } else {
          const err = await res.json();
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to update' });
        }
      } else {
        const res = await fetch('/api/v1/admin/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            categoryLabel: formData.categoryLabel,
            apiBaseUrl: formData.apiBaseUrl,
            apiVersion: formData.apiVersion,
            authMethod: formData.authMethod,
            environment: formData.environment,
            status: formData.status,
            notes: formData.notes,
            assignedTenantIds: formData.assignedTenantIds,
            credentials: {
              ...(formData.clientId ? { clientId: formData.clientId } : {}),
              ...(formData.apiKey ? { apiKey: formData.apiKey } : {}),
              ...(formData.apiSecret ? { apiSecret: formData.apiSecret } : {}),
              ...(formData.username ? { username: formData.username } : {}),
              ...(formData.password ? { password: formData.password } : {}),
              ...(formData.accessToken ? { accessToken: formData.accessToken } : {}),
            },
          }),
        });

        if (res.ok) {
          setFeedbackMessage({ type: 'success', text: `New provider "${formData.name}" registered successfully.` });
          setIsCreateOpen(false);
          await fetchData();
        } else {
          const err = await res.json();
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to register' });
        }
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Unexpected error' });
    }
  };

  // Open Audit Logs Drawer
  const openAuditLogs = async (providerId?: string) => {
    try {
      const url = providerId
        ? `/api/v1/admin/providers/${providerId}/audit`
        : `/api/v1/admin/providers/audit`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.data.logs || []);
        setHistoryProviderId(providerId || null);
        setAuditLogsOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    }
  };

  // Handle Rollback
  const handleRollback = async (providerId: string, version: number) => {
    if (!confirm(`Are you sure you want to rollback to configuration version ${version}?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/providers/${providerId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: `Provider restored to version ${version}!` });
        await fetchData();
        await openAuditLogs(providerId);
      } else {
        const err = await res.json();
        setFeedbackMessage({ type: 'error', text: err.message });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-full bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-normal tracking-wide text-[#6F6F6F]">
              White-Label Super Admin • Central Integration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#191919]">
            API & Provider Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6F6F] mt-1 max-w-3xl font-normal">
            Centralized management of API credentials, Client IDs, live odds feeds, casino aggregators, and dynamic endpoint configurations for 20+ independent white-label client domains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openAuditLogs()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F8F8F8] text-xs font-normal text-[#191919] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all"
          >
            <History className="w-3.5 h-3.5 text-[#6F6F6F]" />
            <span>Audit history</span>
          </button>

          <button
            onClick={() => {
              setEditingProvider(null);
              setFormData({
                name: '',
                category: 'sports_odds',
                categoryLabel: '',
                apiBaseUrl: '',
                apiVersion: 'v1.0',
                authMethod: 'API_KEY_HEADER',
                environment: 'SANDBOX',
                status: 'ACTIVE',
                notes: '',
                clientId: '',
                apiKey: '',
                apiSecret: '',
                username: '',
                password: '',
                accessToken: '',
                assignedTenantIds: [],
              });
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register provider</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-[10px] border text-xs flex items-center justify-between gap-3 ${
            feedbackMessage.type === 'success'
              ? 'bg-[#1FAE5B]/10 border-[#1FAE5B]/20 text-[#1FAE5B]'
              : 'bg-[#E5484D]/10 border-[#E5484D]/20 text-[#E5484D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1FAE5B] shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-[#E5484D] shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <div className="text-[11px] font-normal text-[#6F6F6F] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#317CFF]" />
            Total Providers
          </div>
          <div className="text-xl font-normal text-[#191919] font-mono">{providers.length}</div>
          <div className="text-[11px] text-[#6F6F6F]">Across 6 categories</div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <div className="text-[11px] font-normal text-[#6F6F6F] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#1FAE5B]" />
            Healthy Connections
          </div>
          <div className="text-xl font-normal text-[#1FAE5B] font-mono">
            {providers.filter((p) => p.lastHealthCheck?.status === 'HEALTHY').length} / {providers.length}
          </div>
          <div className="text-[11px] text-[#6F6F6F]">Verified handshakes</div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <div className="text-[11px] font-normal text-[#6F6F6F] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#191919]" />
            Environments
          </div>
          <div className="text-xl font-normal text-[#191919] font-mono flex items-center gap-2">
            <span className="text-[#1FAE5B] text-sm">
              {providers.filter((p) => p.environment === 'PRODUCTION').length} Live
            </span>
            <span className="text-[#B8B8B8]">/</span>
            <span className="text-[#6F6F6F] text-sm">
              {providers.filter((p) => p.environment === 'SANDBOX').length} Sandbox
            </span>
          </div>
          <div className="text-[11px] text-[#6F6F6F]">Isolated vaults</div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <div className="text-[11px] font-normal text-[#6F6F6F] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#317CFF]" />
            Tenant Routing
          </div>
          <div className="text-xl font-normal text-[#191919] font-mono">{tenants.length} Tenants</div>
          <div className="text-[11px] text-[#6F6F6F]">Multi-domain isolation</div>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-all border ${
                selectedCategory === cat.key
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6F6F6F]" />
          <input
            type="text"
            placeholder="Search providers or endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-full py-1.5 pl-8 pr-3 text-xs text-[#191919] placeholder-[#6F6F6F] focus:outline-none focus:border-[#191919]"
          />
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#191919] animate-spin mx-auto" />
          <p className="text-xs text-[#6F6F6F]">Loading provider registry...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <KeyRound className="w-8 h-8 text-[#B8B8B8] mx-auto" />
          <h3 className="text-sm font-medium text-[#191919]">No providers found</h3>
          <p className="text-xs text-[#6F6F6F] max-w-sm mx-auto">
            No API providers match your current filter. Register a new integration or adjust search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredProviders.map((prov) => {
            const isTesting = testingId === prov.id;
            const health = prov.lastHealthCheck;

            return (
              <div
                key={prov.id}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-5 space-y-4 hover:border-[rgba(0,0,0,0.16)] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              >
                {/* Header row: Identity & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-center text-sm font-normal text-[#191919] shrink-0">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-[#191919] leading-tight">{prov.name}</h3>
                        {prov.isDefaultFallback && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
                            Global Fallback
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6F6F6F] mt-0.5">
                        <span className="capitalize">{prov.categoryLabel || prov.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="font-mono text-[#6F6F6F]">{prov.apiVersion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase border ${
                        prov.environment === 'PRODUCTION'
                          ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border-[#1FAE5B]/20'
                          : 'bg-[#F8F8F8] text-[#6F6F6F] border-[rgba(0,0,0,0.08)]'
                      }`}
                    >
                      {prov.environment}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase border ${
                        prov.status === 'ACTIVE'
                          ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border-[#1FAE5B]/20'
                          : 'bg-[#F8F8F8] text-[#6F6F6F] border-[rgba(0,0,0,0.08)]'
                      }`}
                    >
                      {prov.status}
                    </span>
                  </div>
                </div>

                {/* API Base URL & Credentials Snapshot */}
                <div className="bg-[#F8F8F8] rounded-[10px] p-3 border border-[rgba(0,0,0,0.06)] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6F6F6F] font-mono">Endpoint:</span>
                    <span className="text-[#191919] font-mono font-medium truncate max-w-[280px]">
                      {prov.apiBaseUrl}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[rgba(0,0,0,0.06)] text-[11px]">
                    <div>
                      <span className="text-[#6F6F6F] block text-[10px]">Client ID:</span>
                      <span className="font-mono text-[#191919] font-medium">
                        {prov.maskedCredentials.clientId || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6F6F6F] block text-[10px]">API Key / Secret:</span>
                      <span className="font-mono text-[#317CFF] font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#317CFF]" />
                        {prov.maskedCredentials.maskedApiKey || (prov.maskedCredentials.hasApiKey ? '••••••••••••' : 'None')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Client Tenants */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-normal text-[#6F6F6F] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#6F6F6F]" />
                    Assigned Client Tenants ({prov.assignedTenantIds.length}):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {prov.assignedTenantIds.length === 0 ? (
                      <span className="text-[11px] text-[#6F6F6F] italic">No direct assignments</span>
                    ) : (
                      prov.assignedTenantIds.map((tid) => {
                        const t = tenants.find((item) => item.id === tid);
                        return (
                          <span
                            key={tid}
                            className="px-2 py-0.5 rounded-full text-[10px] font-normal border bg-[#F8F8F8] text-[#191919] border-[rgba(0,0,0,0.08)]"
                          >
                            {t ? t.brandName : tid}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Health Check Bar */}
                <div className="p-2 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {health?.status === 'HEALTHY' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" />
                    ) : health?.status === 'DEGRADED' ? (
                      <AlertTriangle className="w-4 h-4 text-[#317CFF]" />
                    ) : health?.status === 'DOWN' ? (
                      <XCircle className="w-4 h-4 text-[#E5484D]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#6F6F6F]" />
                    )}
                    <span className="text-[11px] text-[#191919]">
                      {health?.message || 'Untested connection'}
                    </span>
                  </div>

                  {health?.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] text-[#1FAE5B]">
                      {health.latencyMs}ms
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(prov.id)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test connection'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openAuditLogs(prov.id)}
                      className="px-2.5 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#6F6F6F] text-xs border border-[rgba(0,0,0,0.08)]"
                      title="Configuration History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openEditModal(prov)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Provider Modal */}
      {(editingProvider || isCreateOpen) && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingProvider(null);
              setIsCreateOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-4">
              <div>
                <span className="text-[10px] font-mono font-normal tracking-wide text-[#6F6F6F] uppercase">
                  {editingProvider ? 'Dynamic Credential Vault' : 'Register New Integration'}
                </span>
                <h3 className="text-xl font-normal text-[#191919]">
                  {editingProvider ? `Configure ${editingProvider.name}` : 'New API Provider'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setIsCreateOpen(false);
                }}
                className="text-[#6F6F6F] hover:text-[#191919]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Provider Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Betfair API-NG Exchange"
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-normal focus:border-[#191919] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-normal focus:border-[#191919] focus:outline-none"
                  >
                    <option value="sports_odds">Sports Odds (Exchange / Bookmaker)</option>
                    <option value="sports_data">Sports Data & Radar</option>
                    <option value="casino">Casino Games Aggregator</option>
                    <option value="live_casino">Live Dealer Tables</option>
                    <option value="lottery_matka">Matka & Lottery Result Feed</option>
                    <option value="payment_crypto">Payment / Crypto QR</option>
                    <option value="custom">Custom API Integration</option>
                  </select>
                </div>
              </div>

              {/* Endpoints & Environment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#6F6F6F] font-normal">API Base URL:</label>
                  <input
                    type="url"
                    required
                    value={formData.apiBaseUrl}
                    onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                    placeholder="https://api.provider.com/v1"
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Environment:</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-normal focus:border-[#191919] focus:outline-none"
                  >
                    <option value="SANDBOX">Sandbox (Test Mode)</option>
                    <option value="PRODUCTION">Production (Live)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Credentials Section */}
              <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-3">
                <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2">
                  <span className="text-[11px] font-normal text-[#191919] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#317CFF]" />
                    Credentials & Secrets Vault
                  </span>
                  <span className="text-[10px] text-[#6F6F6F]">
                    Encrypted at rest • Zero code deployment required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#6F6F6F] font-normal">Client ID / App Key:</label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      placeholder="e.g. BF_CLIENT_ATLAS_99"
                      className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6F6F6F] font-normal">API Key / Token:</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder={editingProvider ? 'Enter new key to rotate (or leave empty)' : 'API key'}
                      className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6F6F6F] font-normal">API Secret / HMAC Key:</label>
                    <input
                      type="password"
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      placeholder={editingProvider ? 'Enter new secret to rotate (or leave empty)' : 'API secret'}
                      className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6F6F6F] font-normal">Username / Service Account:</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Username, if required"
                      className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tenant Assignments Selection */}
              <div className="space-y-2">
                <label className="text-[#6F6F6F] font-normal block">
                  Assign to White-Label Client Tenants:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.08)]">
                  {tenants.map((t) => {
                    const isChecked = formData.assignedTenantIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 p-2 rounded-[10px] border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-[#191919] text-[#191919]'
                            : 'bg-white border-[rgba(0,0,0,0.06)] text-[#6F6F6F] hover:text-[#191919]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedTenantIds: [...formData.assignedTenantIds, t.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedTenantIds: formData.assignedTenantIds.filter((id) => id !== t.id),
                              });
                            }
                          }}
                          className="rounded text-[#191919] focus:ring-0"
                        />
                        <span className="text-[11px] font-normal truncate">{t.brandName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-normal focus:border-[#191919] focus:outline-none"
                  >
                    <option value="ACTIVE">Active (Live in Routing)</option>
                    <option value="INACTIVE">Inactive (Disabled)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#6F6F6F] font-normal">Notes:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Internal operator notes..."
                    className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] focus:border-[#191919] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProvider(null);
                    setIsCreateOpen(false);
                  }}
                  className="px-4 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#191919] font-normal transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white font-normal transition-all shadow-sm"
                >
                  {editingProvider ? 'Deploy configuration' : 'Create & register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Drawer */}
      {auditLogsOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setAuditLogsOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl h-full bg-white border-l border-[rgba(0,0,0,0.08)] p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-4">
              <div>
                <span className="text-[10px] font-mono font-normal tracking-wide text-[#6F6F6F] uppercase">
                  Security & Compliance
                </span>
                <h3 className="text-lg font-normal text-[#191919]">Provider Audit & Rollback History</h3>
              </div>
              <button onClick={() => setAuditLogsOpen(false)} className="text-[#6F6F6F] hover:text-[#191919]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-[#6F6F6F] italic py-8 text-center">No audit logs recorded.</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-normal uppercase bg-white text-[#191919] border border-[rgba(0,0,0,0.08)]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#6F6F6F] font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[#191919]">
                      <strong>{log.providerName}</strong>: {JSON.stringify(log.details)}
                    </div>

                    <div className="text-[10px] text-[#6F6F6F]">
                      Actor: <span className="font-mono text-[#191919]">{log.userId}</span>
                    </div>

                    {log.action === 'UPDATE_CONFIG' && log.details.fromVersion && (
                      <button
                        onClick={() => handleRollback(log.providerId, log.details.fromVersion)}
                        className="flex items-center gap-1 text-[11px] text-[#317CFF] hover:underline font-normal pt-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback to version {log.details.fromVersion}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
