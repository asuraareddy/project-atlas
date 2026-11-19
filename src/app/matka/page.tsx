'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Dice5, Search, Clock, BarChart2, CheckCircle2, RefreshCw, X, PlayCircle 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 text-[#6F6F6F]">
            <Link href="/" className="hover:text-[#191919]">Lobby</Link>
            <span>/</span>
            <span className="text-[#317CFF] font-medium">Matka Markets</span>
          </div>
          <h1 className="text-3xl font-normal tracking-tight flex items-center gap-3 text-[#191919]">
            <Dice5 className="w-7 h-7 text-[#191919]" />
            <span>Matka Official Draw Hub</span>
          </h1>
          <p className="text-xs mt-1 text-[#6F6F6F] font-normal">
            Live results synchronized with provider API, authoritative draw schedules, and server-verified participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMarkets}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-xs font-normal text-[#191919] hover:bg-[#F8F8F8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh feed (30s)</span>
          </button>
          <div className="text-[11px] px-3.5 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[#6F6F6F] shadow-sm">
            Updated: <span className="font-mono text-[#191919]">{lastRefreshed || 'Live'}</span>
          </div>
        </div>
      </div>

      {/* Live Draw Markets & Panels */}
      <section className="space-y-4">
        {/* Controls & Search */}
        <div className="p-3.5 sm:p-4 rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6F6F]" />
            <input
              type="text"
              placeholder="Search market or API ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-[rgba(0,0,0,0.08)] bg-[#F8F8F8] text-[#191919] placeholder-[#6F6F6F] focus:border-[#191919] focus:outline-none"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition-all flex-shrink-0 border ${
                filter === 'all'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
              }`}
            >
              All ({markets.length})
            </button>
            <button
              onClick={() => setFilter('declared')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition-all flex-shrink-0 border ${
                filter === 'declared'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
              }`}
            >
              Declared ({markets.filter(m => m.latestResult?.resultState === 'declared').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition-all flex-shrink-0 border ${
                filter === 'pending'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
              }`}
            >
              Pending ({markets.filter(m => m.latestResult?.resultState === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition-all flex-shrink-0 border ${
                filter === 'open'
                  ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                  : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
              }`}
            >
              Open for Play
            </button>
          </div>
        </div>

        {/* Markets Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1">
          {filteredMarkets.map((market) => (
            <div
              key={market.id}
              className="p-5 rounded-[10px] space-y-4 flex flex-col justify-between border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[rgba(0,0,0,0.16)] transition-all text-[#191919]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#6F6F6F] uppercase">
                    {market.timezone}
                  </span>
                  <span
                    className={`text-[10px] font-normal px-2.5 py-0.5 rounded-full uppercase ${
                      market.status === 'open'
                        ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20'
                        : 'bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {market.status === 'open' ? 'Open for Play' : 'Closed'}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-[#191919] tracking-tight">{market.name}</h3>

                {/* Timing */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs p-2.5 rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8F8]">
                  <div>
                    <span className="text-[10px] block text-[#6F6F6F]">Opens (IST)</span>
                    <span className="font-medium text-[#191919]">{market.opensAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] block text-[#6F6F6F]">Closes (IST)</span>
                    <span className="font-medium text-[#191919]">{market.closesAt}</span>
                  </div>
                </div>

                {/* Latest Result Card */}
                <div className="mt-4 p-3.5 rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8F8] text-center">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] uppercase text-[#6F6F6F]">
                      Official Result
                    </span>
                    <span className="text-[10px] font-mono text-[#6F6F6F]">
                      ID: {market.providerRef.externalId}
                    </span>
                  </div>

                  {market.latestResult?.resultState === 'declared' ? (
                    <div>
                      <div className="flex items-center justify-center gap-3 font-mono text-lg">
                        <span className="text-[#1FAE5B] font-medium">{market.latestResult.openPana}</span>
                        <span className="text-xl text-[#191919]">- {market.latestResult.jodi} -</span>
                        <span className="text-[#1FAE5B] font-medium">{market.latestResult.closePana}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#1FAE5B] bg-[#1FAE5B]/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Result Declared
                        </span>
                      </div>
                    </div>
                  ) : market.latestResult?.resultState === 'open_declared' ? (
                    <div>
                      <div className="flex items-center justify-center gap-3 font-mono text-lg">
                        <span className="text-[#1FAE5B] font-medium">{market.latestResult.openPana}</span>
                        <span className="text-xl text-[#191919]">- {market.latestResult.jodi} -</span>
                        <span className="text-[#B8B8B8]">***</span>
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#317CFF] bg-[#317CFF]/10 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Open Declared • Close Pending
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="py-1 text-center">
                        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[#6F6F6F]">
                          <Clock className="w-3.5 h-3.5 text-[#317CFF]" />
                          Pending Result
                        </span>
                      </div>
                      <span className="text-[10px] block text-[#6F6F6F]">
                        Awaiting official draw declaration
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => openChart(market)}
                  className="flex-1 py-1.5 px-3 rounded-full border border-[rgba(0,0,0,0.08)] bg-white hover:bg-[#F8F8F8] text-xs font-normal text-[#191919] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#317CFF]" />
                  <span>Panel Chart</span>
                </button>

                <button
                  disabled={market.status !== 'open'}
                  onClick={() => {
                    setSelectedMarketForPlay(market);
                    const el = document.getElementById('patti-console');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-normal flex items-center justify-center gap-1.5 transition-all ${
                    market.status === 'open'
                      ? 'bg-[#191919] hover:bg-[#333333] text-white shadow-sm'
                      : 'bg-[#F8F8F8] text-[#B8B8B8] cursor-not-allowed border border-[rgba(0,0,0,0.08)]'
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

      {/* Patti Participation Console */}
      <PattiParticipationSection
        markets={markets}
        preselectedMarketId={selectedMarketForPlay?.id}
        onMarketChange={(m) => setSelectedMarketForPlay(m)}
      />

      {/* Panel Chart Modal */}
      {selectedMarketForChart && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-[rgba(0,0,0,0.08)] rounded-[10px] max-w-2xl w-full p-6 space-y-4 shadow-2xl bg-white text-[#191919] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2 text-[#191919]">
                  <BarChart2 className="w-5 h-5 text-[#317CFF]" />
                  <span>{selectedMarketForChart.name} — Panel Record Chart</span>
                </h3>
                <p className="text-xs text-[#6F6F6F]">Historical verified result archive with audit references</p>
              </div>
              <button
                onClick={() => setSelectedMarketForChart(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#6F6F6F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.08)] bg-[#F8F8F8] text-[#6F6F6F]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Day</th>
                    <th className="p-3 text-center">Open Pana</th>
                    <th className="p-3 text-center text-[#191919]">Jodi</th>
                    <th className="p-3 text-center">Close Pana</th>
                    <th className="p-3 text-right">Audit Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                  {chartData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F8F8]/60 transition-colors">
                      <td className="p-3 text-[#191919]">{row.date}</td>
                      <td className="p-3 text-[#6F6F6F]">{row.day}</td>
                      <td className="p-3 text-center text-[#1FAE5B] font-medium">{row.openPana}</td>
                      <td className="p-3 text-center text-[#191919] font-medium">{row.jodi}</td>
                      <td className="p-3 text-center text-[#1FAE5B] font-medium">{row.closePana}</td>
                      <td className="p-3 text-right text-[10px] text-[#6F6F6F]">{row.sourceResultRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] p-3 rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8F8] text-[#6F6F6F]">
              Verified historical panel chart synchronized with client provider result feeds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
