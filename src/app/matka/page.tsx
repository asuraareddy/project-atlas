'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Dice5, Search, Filter, Clock, Calendar, BarChart2, ShieldCheck, 
  AlertCircle, ChevronRight, CheckCircle2, RefreshCw, X, PlayCircle 
} from 'lucide-react';
import { MarketSummary, ChartRecord } from '@/domain/games/adapters/types';
import PattiParticipationSection from '@/components/matka/PattiParticipationSection';

export default function MatkaPage() {
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'declared' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [selectedMarketForChart, setSelectedMarketForChart] = useState<MarketSummary | null>(null);
  const [chartData, setChartData] = useState<ChartRecord[]>([]);
  const [selectedMarketForPlay, setSelectedMarketForPlay] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/matka/markets');
      if (res.ok) {
        const json = await res.json();
        setMarkets(json.data.markets);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load Matka markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    // Auto-poll every 30 seconds per provider rate-limit guidelines
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  const openChart = async (market: MarketSummary) => {
    setSelectedMarketForChart(market);
    try {
      const res = await fetch(`/api/v1/games/matka/markets/${market.id}/chart`);
      if (res.ok) {
        const json = await res.json();
        setChartData(json.data.chart);
      }
    } catch (err) {
      console.error('Failed to load chart:', err);
    }
  };

  const filteredMarkets = markets.filter((m) => {
    let matchesFilter = true;
    if (filter === 'open') matchesFilter = m.status === 'open';
    if (filter === 'closed') matchesFilter = m.status === 'closed';
    if (filter === 'declared') matchesFilter = m.latestResult?.resultState === 'declared';
    if (filter === 'pending') matchesFilter = m.latestResult?.resultState === 'pending';

    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.providerRef.externalId.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
            <Link href="/" className="hover:text-white">Lobby</Link>
            <span>/</span>
            <span className="text-[#b45df0] font-semibold">Matka Markets</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Dice5 className="w-8 h-8 text-[#b45df0]" />
            <span>Matka Official Draw Hub</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Live results synchronized with provider API, authoritative draw schedules, and server-verified participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMarkets}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed (30s)</span>
          </button>
          <div className="text-[11px] text-[#c4bfd0] bg-[#242424] px-3 py-2 rounded-lg border border-white/10">
            Feed Updated: <span className="text-white font-mono">{lastRefreshed || 'Live'}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Live Draw Markets & Panels */}
      <section className="space-y-4">
        {/* Controls & Search */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#242424] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#c4bfd0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search market or API ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1f1f1f] text-xs sm:text-sm text-white rounded-xl border border-white/10 focus:border-[#b45df0] focus:outline-none"
            />
          </div>

          {/* Status Filters - Mobile scrollable / flex */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                filter === 'all'
                  ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                  : 'bg-[#1f1f1f] text-[#c4bfd0] hover:text-white border border-white/10'
              }`}
            >
              All ({markets.length})
            </button>
            <button
              onClick={() => setFilter('declared')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                filter === 'declared'
                  ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/40'
                  : 'bg-[#1f1f1f] text-[#c4bfd0] hover:text-white border border-white/10'
              }`}
            >
              Declared ({markets.filter(m => m.latestResult?.resultState === 'declared').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                filter === 'pending'
                  ? 'bg-[#f59e0b] text-black shadow-md shadow-[#f59e0b]/40'
                  : 'bg-[#1f1f1f] text-[#c4bfd0] hover:text-white border border-white/10'
              }`}
            >
              Pending ({markets.filter(m => m.latestResult?.resultState === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                filter === 'open'
                  ? 'bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/40'
                  : 'bg-[#1f1f1f] text-[#c4bfd0] hover:text-white border border-white/10'
              }`}
            >
              Open for Play
            </button>
          </div>
        </div>

        {/* Markets Cards Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-h-[380px] overflow-y-auto pr-1">
        {filteredMarkets.map((market) => (
          <div
            key={market.id}
            className="card-dark p-5 bg-[#242424] border border-white/10 hover:border-[#b45df0]/50 rounded-xl space-y-4 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#b45df0] tracking-wider uppercase">
                  {market.timezone}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    market.status === 'open'
                      ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40'
                      : 'bg-[#ff5a7a]/15 text-[#ff5a7a] border border-[#ff5a7a]/40'
                  }`}
                >
                  {market.status === 'open' ? 'Open for Play' : 'Closed'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-wide">{market.name}</h3>

              {/* Timing */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#c4bfd0] bg-[#1f1f1f] p-2.5 rounded-lg border border-white/5">
                <div>
                  <span className="text-[10px] text-[#9c9aa8] block">Opens (IST)</span>
                  <span className="font-semibold text-white">{market.opensAt}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9c9aa8] block">Closes (IST)</span>
                  <span className="font-semibold text-white">{market.closesAt}</span>
                </div>
              </div>

              {/* Latest Result Card */}
              <div className="mt-4 p-3.5 rounded-lg bg-[#2a2a2a] border border-white/10 text-center">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#b45df0] font-semibold">
                    Official API Result
                  </span>
                  <span className="text-[9px] font-mono text-[#9c9aa8]" title="Exact provider identifier">
                    ID: {market.providerRef.externalId}
                  </span>
                </div>

                {market.latestResult?.resultState === 'declared' ? (
                  <div>
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-lg text-white">
                      <span className="text-[#10b981]">{market.latestResult.openPana}</span>
                      <span className="text-xl text-[#b45df0]">- {market.latestResult.jodi} -</span>
                      <span className="text-[#10b981]">{market.latestResult.closePana}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Result Declared
                      </span>
                    </div>
                  </div>
                ) : market.latestResult?.resultState === 'open_declared' ? (
                  <div>
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-lg text-white">
                      <span className="text-[#10b981]">{market.latestResult.openPana}</span>
                      <span className="text-xl text-[#b45df0]">- {market.latestResult.jodi} -</span>
                      <span className="text-[#c4bfd0]/50">***</span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 animate-spin" /> Open Declared • Close Pending
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="py-1 text-center">
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-base text-[#f59e0b]">
                        <Clock className="w-4 h-4 text-[#f59e0b] animate-pulse" />
                        Pending Result
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9c9aa8] block">
                      Awaiting official draw declaration
                    </span>
                  </div>
                )}

                {market.isStale && (
                  <div className="mt-2 text-[9px] text-[#f59e0b] bg-[#f59e0b]/10 py-0.5 px-2 rounded border border-[#f59e0b]/20">
                    ⚠ Reconnecting to provider feed (serving cached state)
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => openChart(market)}
                className="flex-1 py-2 px-3 rounded-full bg-[#1f1f1f] hover:bg-white/10 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#b45df0]" />
                <span>Panel Chart</span>
              </button>

              <button
                disabled={market.status !== 'open'}
                onClick={() => {
                  setSelectedMarketForPlay(market);
                  const el = document.getElementById('patti-console');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  market.status === 'open'
                    ? 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-md shadow-[#7e0ac2]/40'
                    : 'bg-white/5 text-[#6b6975] cursor-not-allowed border border-white/5'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Play Patti</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      </section>

      {/* Section 2: Patti Selection Console Directly Under Markets & Panels */}
      <PattiParticipationSection
        markets={markets}
        preselectedMarketId={selectedMarketForPlay?.id}
        onMarketChange={(m) => setSelectedMarketForPlay(m)}
      />

      {/* Panel Chart Modal */}
      {selectedMarketForChart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#b45df0]" />
                  <span>{selectedMarketForChart.name} — Panel Record Chart</span>
                </h3>
                <p className="text-xs text-[#c4bfd0]">Historical verified result archive with audit references</p>
              </div>
              <button
                onClick={() => setSelectedMarketForChart(null)}
                className="w-8 h-8 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                    <th className="p-3">Date</th>
                    <th className="p-3">Day</th>
                    <th className="p-3 text-center">Open Pana</th>
                    <th className="p-3 text-center text-[#b45df0]">Jodi</th>
                    <th className="p-3 text-center">Close Pana</th>
                    <th className="p-3 text-right">Audit Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {chartData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="p-3 text-white">{row.date}</td>
                      <td className="p-3 text-[#c4bfd0]">{row.day}</td>
                      <td className="p-3 text-center text-[#10b981] font-semibold">{row.openPana}</td>
                      <td className="p-3 text-center text-[#b45df0] font-bold text-sm">{row.jodi}</td>
                      <td className="p-3 text-center text-[#10b981] font-semibold">{row.closePana}</td>
                      <td className="p-3 text-right text-[10px] text-[#9c9aa8]">{row.sourceResultRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-[#c4bfd0] bg-[#1f1f1f] p-3 rounded-lg border border-white/5">
              Verified historical panel chart synchronized with client provider result feeds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
