'use client';

import { useState, useEffect } from 'react';
import { Coins, RefreshCw, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

interface PointConfig {
  pointToCurrencyRate: number;
  currencyCode: string;
  currencySymbol?: string;
  pointUnitName: string;
  displayAsPointsOnly?: boolean;
}

interface TenantRow {
  id: string;
  slug: string;
  name: string;
  pointConfig: PointConfig;
}

interface Draft {
  rate: string;
  currencyCode: string;
  unit: string;
}

export default function AdminPointValuationPage() {
  const { refreshTenant } = useTenant();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/tenants', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows: TenantRow[] = json.data.tenants;
      setTenants(rows);
      const d: Record<string, Draft> = {};
      rows.forEach((t) => {
        d[t.id] = {
          rate: String(t.pointConfig?.pointToCurrencyRate ?? 1),
          currencyCode: t.pointConfig?.currencyCode ?? 'UNDEFINED',
          unit: t.pointConfig?.pointUnitName ?? 'PTS'
        };
      });
      setDrafts(d);
    } catch (e: any) {
      setFeedback({ type: 'err', text: e.message || 'Failed to load clients.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const isDirty = (t: TenantRow) => {
    const d = drafts[t.id];
    if (!d) return false;
    return (
      parseFloat(d.rate) !== t.pointConfig.pointToCurrencyRate ||
      d.currencyCode !== t.pointConfig.currencyCode ||
      d.unit !== t.pointConfig.pointUnitName
    );
  };

  const save = async (t: TenantRow) => {
    const d = drafts[t.id];
    const rate = parseFloat(d.rate);
    if (!isFinite(rate) || rate <= 0) {
      setFeedback({ type: 'err', text: `${t.name}: rate must be a number greater than 0.` });
      return;
    }
    if (!d.unit.trim()) {
      setFeedback({ type: 'err', text: `${t.name}: point unit name is required.` });
      return;
    }
    try {
      setSavingId(t.id);
      const res = await fetch(`/api/v1/admin/tenants/${t.id}/point-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointToCurrencyRate: rate,
          currencyCode: d.currencyCode.trim() || 'UNDEFINED',
          pointUnitName: d.unit.trim()
        })
      });
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status})`);
      setFeedback({ type: 'ok', text: `${t.name}: 1 ${d.unit.trim()} = ${rate} ${d.currencyCode.trim() || 'UNDEFINED'} saved.` });
      await load();
      await refreshTenant();
      window.dispatchEvent(new Event('atlas-tenant-updated'));
      try {
        localStorage.setItem('atlas_point_config_updated', Date.now().toString());
      } catch {}
    } catch (e: any) {
      setFeedback({ type: 'err', text: e.message || 'Save failed.' });
    } finally {
      setSavingId(null);
    }
  };

  const reset = (t: TenantRow) => update(t.id, { rate: '1', currencyCode: 'UNDEFINED', unit: 'PTS' });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-[#317CFF]" />
            <span>Point valuation & currency ratio</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1 max-w-2xl">
            Set per client how points convert to a currency reference (1 point = rate). Default is 1 point = 1 with currency undefined (points only).
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-medium text-[#191919] hover:bg-[#F8F8F8] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border ${
            feedback.type === 'ok'
              ? 'bg-[#1FAE5B]/10 border-[#1FAE5B]/20 text-[#1FAE5B]'
              : 'bg-[#E5484D]/10 border-[#E5484D]/20 text-[#E5484D]'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {feedback.text}
          </span>
          <button onClick={() => setFeedback(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-[#191919]">Client valuation settings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">1 point =</th>
                <th className="p-3 font-medium">Currency reference</th>
                <th className="p-3 font-medium">Point unit name</th>
                <th className="p-3 font-medium">Preview</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {tenants.map((t) => {
                const d = drafts[t.id];
                if (!d) return null;
                const dirty = isDirty(t);
                return (
                  <tr key={t.id} className="hover:bg-[#F8F8F8] transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-[#191919]">{t.name}</div>
                      <div className="text-[10px] font-mono text-[#6F6F6F]">{t.slug}</div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={d.rate}
                        onChange={(e) => update(t.id, { rate: e.target.value })}
                        className="w-28 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={d.currencyCode}
                        onChange={(e) => update(t.id, { currencyCode: e.target.value.toUpperCase() })}
                        className="w-32 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={d.unit}
                        onChange={(e) => update(t.id, { unit: e.target.value })}
                        className="w-24 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                      />
                    </td>
                    <td className="p-3 font-mono text-[#6F6F6F]">
                      1 {d.unit || 'PTS'} = {d.rate || '0'} {d.currencyCode || 'UNDEFINED'}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => reset(t)}
                        className="px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-medium hover:bg-[#F8F8F8]"
                      >
                        Reset default
                      </button>
                      <button
                        onClick={() => save(t)}
                        disabled={!dirty || savingId === t.id}
                        className="px-3.5 py-1.5 rounded-full bg-[#191919] text-white font-medium hover:bg-[#333333] disabled:opacity-40 inline-flex items-center gap-1.5"
                      >
                        {savingId === t.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#6F6F6F]">No clients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
