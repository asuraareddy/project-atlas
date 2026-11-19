'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Sparkles,
  Radio,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

export function AmbaariSports() {
  const { tenantSlug } = useTenant();
  const [selectedSport, setSelectedSport] = useState<'4' | '1' | '2'>('4'); // 4 = Cricket
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PLAY' | 'UPCOMING'>('ALL');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  // Bet Slip State
  const [activeBet, setActiveBet] = useState<{
    match: string;
    runner: string;
    type: 'BACK' | 'LAY';
    price: number;
  } | null>({
    match: 'India vs Australia (2nd T20I)',
    runner: 'India',
    type: 'BACK',
    price: 1.85,
  });

  const [stake, setStake] = useState<number>(1000);
  const [betSuccess, setBetSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSportsEvents = async () => {
      try {
        const res = await fetch(`/api/v1/games/sports/events?eventTypeId=${selectedSport}`);
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.events || json.events || [];
          setEvents(list);
          if (list.length > 0) {
            setSelectedMatch(list[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load sports events:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSportsEvents();
  }, [selectedSport]);

  const handlePlaceBet = () => {
    if (!activeBet) return;
    setBetSuccess(
      `Bet placed on ${activeBet.runner} (${activeBet.type}) @ ${activeBet.price.toFixed(2)} with Stake ₹${stake}`
    );
    setTimeout(() => setBetSuccess(null), 4000);
  };

  return (
    <div className="w-full bg-[#f2f4f7] text-[#1f2937] font-['Roboto_Condensed',sans-serif] min-h-screen pb-16">
      {/* Top Breadcrumb & Sport Filter Bar */}
      <div className="bg-[#2C3E50] border-b border-[#3d5166] px-4 py-2 text-white">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-amber-400">AMBAARI999 SPORTS EXCHANGE</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Live Cricket, Betfair Odds & Liquidity</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedSport('4')}
              className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1 ${
                selectedSport === '4' ? 'bg-[#0088CC] text-white' : 'bg-[#1b2836] text-slate-300 hover:bg-[#25374a]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Cricket (IPL)</span>
            </button>

            <button
              onClick={() => setSelectedSport('1')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                selectedSport === '1' ? 'bg-[#0088CC] text-white' : 'bg-[#1b2836] text-slate-300 hover:bg-[#25374a]'
              }`}
            >
              Football
            </button>

            <button
              onClick={() => setSelectedSport('2')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                selectedSport === '2' ? 'bg-[#0088CC] text-white' : 'bg-[#1b2836] text-slate-300 hover:bg-[#25374a]'
              }`}
            >
              Tennis
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Sports Layout */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main Matches & Exchange Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Live In-Play Cricket Scoreboard Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#2C3E50] text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  ICC T20 Championship 2026 • Live Cricket
                </span>
                <h2 className="text-lg font-black text-white">
                  India vs Australia (2nd T20I, Melbourne)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="px-2 py-0.5 rounded bg-red-600 font-black text-[10px] uppercase tracking-wider">
                  IN PLAY
                </span>
              </div>
            </div>

            {/* Scorecard Strip */}
            <div className="bg-[#1c2936] text-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#2d4054]">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Batting (1st Innings)</div>
                <div className="text-xl font-black text-amber-400 font-mono">IND 184/4 (18.2)</div>
                <div className="text-[11px] text-slate-300">CRR: <span className="font-bold text-emerald-400">10.04</span> • Projected: <span className="font-bold">206</span></div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">On Crease</div>
                <div className="text-xs font-bold text-white">H. Pandya: 42* (21b, 4x4, 2x6)</div>
                <div className="text-xs text-slate-300">R. Jadeja: 18* (10b, 2x4)</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Bowler</div>
                <div className="text-xs font-bold text-white">M. Starc (3.2-0-38-2)</div>
                <div className="text-[11px] text-emerald-400 font-mono">Last ball: 4 runs</div>
              </div>
            </div>

            {/* Betfair Match Odds Exchange Ladder */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">
                    Match Odds (Betfair API-NG Live Exchange)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Matched Liquidity: <span className="font-bold text-emerald-700 font-mono">₹1.84 Crore</span>
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-bold">
                  <span className="text-[#0088CC]">BACK (ALL)</span>
                  <span className="text-pink-600">LAY (ALL)</span>
                </div>
              </div>

              {/* Runners Odds Table */}
              <div className="space-y-2">
                {/* Runner 1: India */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="font-black text-sm text-slate-800">
                    India
                  </div>

                  <div className="flex items-center gap-1 justify-end">
                    {/* Back 3 Depth */}
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'BACK',
                          price: 1.83,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#72bbef]/60 hover:bg-[#72bbef] text-[#0f3453] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">1.83</span>
                      <span className="text-[9px] font-mono">₹2.1L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'BACK',
                          price: 1.84,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#72bbef]/80 hover:bg-[#72bbef] text-[#0f3453] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">1.84</span>
                      <span className="text-[9px] font-mono">₹3.8L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'BACK',
                          price: 1.85,
                        })
                      }
                      className="w-16 py-1 text-center rounded bg-[#72bbef] hover:bg-[#5caee6] text-[#0f3453] transition-all flex flex-col justify-center ring-2 ring-[#0088CC]/30 shadow-xs"
                    >
                      <span className="font-black text-xs font-mono">1.85</span>
                      <span className="text-[9px] font-mono">₹5.4L</span>
                    </button>

                    {/* Lay 3 Depth */}
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'LAY',
                          price: 1.88,
                        })
                      }
                      className="w-16 py-1 text-center rounded bg-[#faa9ba] hover:bg-[#f794a9] text-[#6d1326] transition-all flex flex-col justify-center ring-2 ring-pink-500/30 shadow-xs"
                    >
                      <span className="font-black text-xs font-mono">1.88</span>
                      <span className="text-[9px] font-mono">₹4.2L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'LAY',
                          price: 1.89,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#faa9ba]/80 hover:bg-[#faa9ba] text-[#6d1326] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">1.89</span>
                      <span className="text-[9px] font-mono">₹3.1L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'India',
                          type: 'LAY',
                          price: 1.90,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#faa9ba]/60 hover:bg-[#faa9ba] text-[#6d1326] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">1.90</span>
                      <span className="text-[9px] font-mono">₹1.9L</span>
                    </button>
                  </div>
                </div>

                {/* Runner 2: Australia */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="font-black text-sm text-slate-800">
                    Australia
                  </div>

                  <div className="flex items-center gap-1 justify-end">
                    {/* Back 3 Depth */}
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'BACK',
                          price: 2.10,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#72bbef]/60 hover:bg-[#72bbef] text-[#0f3453] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">2.10</span>
                      <span className="text-[9px] font-mono">₹1.8L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'BACK',
                          price: 2.12,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#72bbef]/80 hover:bg-[#72bbef] text-[#0f3453] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">2.12</span>
                      <span className="text-[9px] font-mono">₹2.4L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'BACK',
                          price: 2.14,
                        })
                      }
                      className="w-16 py-1 text-center rounded bg-[#72bbef] hover:bg-[#5caee6] text-[#0f3453] transition-all flex flex-col justify-center ring-2 ring-[#0088CC]/30 shadow-xs"
                    >
                      <span className="font-black text-xs font-mono">2.14</span>
                      <span className="text-[9px] font-mono">₹4.1L</span>
                    </button>

                    {/* Lay 3 Depth */}
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'LAY',
                          price: 2.18,
                        })
                      }
                      className="w-16 py-1 text-center rounded bg-[#faa9ba] hover:bg-[#f794a9] text-[#6d1326] transition-all flex flex-col justify-center ring-2 ring-pink-500/30 shadow-xs"
                    >
                      <span className="font-black text-xs font-mono">2.18</span>
                      <span className="text-[9px] font-mono">₹3.5L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'LAY',
                          price: 2.20,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#faa9ba]/80 hover:bg-[#faa9ba] text-[#6d1326] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">2.20</span>
                      <span className="text-[9px] font-mono">₹2.0L</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveBet({
                          match: 'India vs Australia',
                          runner: 'Australia',
                          type: 'LAY',
                          price: 2.22,
                        })
                      }
                      className="w-14 py-1 text-center rounded bg-[#faa9ba]/60 hover:bg-[#faa9ba] text-[#6d1326] transition-all flex flex-col justify-center"
                    >
                      <span className="font-black text-xs font-mono">2.22</span>
                      <span className="text-[9px] font-mono">₹1.2L</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bet Slip Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-20">
            <div className="bg-[#2C3E50] text-white px-4 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Ambaari Bet Slip
              </span>
              <span className="text-[10px] text-amber-300 font-mono">Single</span>
            </div>

            {activeBet ? (
              <div className="p-4 space-y-3">
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    activeBet.type === 'BACK'
                      ? 'bg-[#72bbef]/15 border-[#72bbef] text-[#0f3453]'
                      : 'bg-[#faa9ba]/15 border-[#faa9ba] text-[#6d1326]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{activeBet.runner}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-black ${
                        activeBet.type === 'BACK'
                          ? 'bg-[#72bbef] text-[#0f3453]'
                          : 'bg-[#faa9ba] text-[#6d1326]'
                      }`}
                    >
                      {activeBet.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{activeBet.match}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-600">Odds:</span>
                    <span className="font-black font-mono text-base">{activeBet.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Stake Amount (₹):</label>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0088CC]"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {[500, 1000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setStake(val)}
                      className="py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    >
                      +₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Potential Return:</span>
                    <span className="font-bold text-slate-800">
                      ₹{(stake * activeBet.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {betSuccess && (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{betSuccess}</span>
                  </div>
                )}

                <button
                  onClick={handlePlaceBet}
                  className="w-full py-2.5 rounded-lg bg-[#0088CC] hover:bg-[#0077b5] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  CONFIRM BET
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Select an odds button to place a bet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

