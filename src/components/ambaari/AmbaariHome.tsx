'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Sparkles,
  Radio,
  Flame,
  ChevronRight,
  TrendingUp,
  Clock,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

interface MatchItem {
  id: string;
  sportId: string;
  sportName: string;
  competition: string;
  name: string;
  status: 'IN_PLAY' | 'UPCOMING';
  startTime: string;
  scoreText?: string;
  overs?: string;
  crr?: string;
  backPrice1: number;
  backSize1: string;
  layPrice1: number;
  laySize1: string;
  backPrice2: number;
  backSize2: string;
  layPrice2: number;
  laySize2: string;
  backPriceDraw?: number;
  layPriceDraw?: number;
}

const SAMPLE_MATCHES: MatchItem[] = [
  {
    id: 'cricket_ind_aus_2026',
    sportId: '4',
    sportName: 'Cricket',
    competition: 'ICC T20 Championship 2026',
    name: 'India vs Australia',
    status: 'IN_PLAY',
    startTime: 'LIVE NOW',
    scoreText: 'IND 184/4 (18.2) • AUS 180/7 (20.0)',
    overs: '18.2 Overs',
    crr: '10.04',
    backPrice1: 1.85,
    backSize1: '₹4.5L',
    layPrice1: 1.88,
    laySize1: '₹3.2L',
    backPrice2: 2.14,
    backSize2: '₹3.8L',
    layPrice2: 2.18,
    laySize2: '₹2.9L',
    backPriceDraw: 45.0,
    layPriceDraw: 55.0,
  },
  {
    id: 'cricket_csk_mi_2026',
    sportId: '4',
    sportName: 'Cricket',
    competition: 'Indian Premier League (IPL)',
    name: 'Chennai Super Kings vs Mumbai Indians',
    status: 'IN_PLAY',
    startTime: 'LIVE NOW',
    scoreText: 'CSK 142/3 (14.5) • Target: 188',
    overs: '14.5 Overs',
    crr: '9.57',
    backPrice1: 1.95,
    backSize1: '₹8.2L',
    layPrice1: 1.98,
    laySize1: '₹6.1L',
    backPrice2: 2.04,
    backSize2: '₹7.5L',
    layPrice2: 2.08,
    laySize2: '₹5.4L',
  },
  {
    id: 'cricket_eng_pak_2026',
    sportId: '4',
    sportName: 'Cricket',
    competition: 'Bilateral T20 Series',
    name: 'England vs Pakistan',
    status: 'UPCOMING',
    startTime: 'Today, 19:30',
    backPrice1: 1.72,
    backSize1: '₹2.1L',
    layPrice1: 1.75,
    laySize1: '₹1.8L',
    backPrice2: 2.26,
    backSize2: '₹1.9L',
    layPrice2: 2.30,
    laySize2: '₹1.4L',
  },
  {
    id: 'soccer_rma_bar_2026',
    sportId: '1',
    sportName: 'Football',
    competition: 'Spanish La Liga',
    name: 'Real Madrid vs FC Barcelona',
    status: 'IN_PLAY',
    startTime: '68\' In-Play',
    scoreText: '2 - 1 (2nd Half)',
    backPrice1: 1.45,
    backSize1: '₹12.4L',
    layPrice1: 1.48,
    laySize1: '₹9.2L',
    backPrice2: 4.80,
    backSize2: '₹4.1L',
    layPrice2: 5.20,
    laySize2: '₹3.5L',
  },
];

const CASINO_FEATURED = [
  { id: 'c_roulette_live', title: 'Lightning Roulette Live', category: 'Live Dealer', provider: 'Evolution', rtp: '97.3%', badge: 'HOT' },
  { id: 'c_teen_patti', title: 'Live Teen Patti 20-20', category: 'Indian Card Games', provider: 'Ezugi', rtp: '96.8%', badge: 'POPULAR' },
  { id: 'c_blackjack_vip', title: 'VIP Infinite Blackjack', category: 'Live Dealer', provider: 'Pragmatic Live', rtp: '99.5%', badge: 'HIGH ROLLER' },
  { id: 'c_dragon_tiger', title: 'Speed Dragon Tiger', category: 'Live Dealer', provider: 'Super Spade', rtp: '96.27%', badge: 'LIVE' },
  { id: 'c_baccarat_squeeze', title: 'Speed Baccarat Squeeze', category: 'Live Dealer', provider: 'Evolution', rtp: '98.94%', badge: 'HOT' },
  { id: 'c_andar_bahar', title: 'Live Andar Bahar Pro', category: 'Indian Card Games', provider: 'Ezugi', rtp: '95.0%', badge: 'TRENDING' },
  { id: 'c_sweet_bonanza', title: 'Sweet Bonanza 1000', category: 'Vegas Slots', provider: 'Pragmatic Play', rtp: '96.53%', badge: 'JACKPOT' },
  { id: 'c_gates_olympus', title: 'Gates of Olympus', category: 'Vegas Slots', provider: 'Pragmatic Play', rtp: '96.5%', badge: 'MEGA WIN' },
];

export function AmbaariHome() {
  const { tenantSlug } = useTenant();
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRICKET' | 'FOOTBALL' | 'TENNIS'>('ALL');
  const [selectedBet, setSelectedBet] = useState<{
    match: string;
    selection: string;
    type: 'BACK' | 'LAY';
    odds: number;
  } | null>({
    match: 'India vs Australia',
    selection: 'India',
    type: 'BACK',
    odds: 1.85,
  });

  const [stake, setStake] = useState<number>(1000);
  const [betSuccess, setBetSuccess] = useState<string | null>(null);

  const quickStakes = [100, 500, 1000, 5000, 10000];

  const handlePlaceBet = () => {
    if (!selectedBet) return;
    setBetSuccess(`Bet placed successfully on ${selectedBet.selection} (${selectedBet.type}) @ ${selectedBet.odds.toFixed(2)}`);
    setTimeout(() => setBetSuccess(null), 4000);
  };

  const calculateReturn = () => {
    if (!selectedBet) return 0;
    if (selectedBet.type === 'BACK') {
      return (stake * selectedBet.odds).toFixed(2);
    } else {
      // Lay bet: backer stake won = stake
      return stake.toFixed(2);
    }
  };

  const calculateProfitOrLiability = () => {
    if (!selectedBet) return 0;
    if (selectedBet.type === 'BACK') {
      return (stake * (selectedBet.odds - 1)).toFixed(2);
    } else {
      // Lay Liability = Stake * (Odds - 1)
      return (stake * (selectedBet.odds - 1)).toFixed(2);
    }
  };

  return (
    <div className="w-full bg-[#f2f4f7] text-[#1f2937] font-['Roboto_Condensed',sans-serif] min-h-screen">
      {/* Promotional Top Hero Banner Slider */}
      <div className="w-full bg-[#2C3E50] border-b border-[#3d5166] py-3 px-3 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#17222d] via-[#1f3142] to-[#0088CC] p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>AMBAARI999 EXCLUSIVE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
                IPL 2026 CRICKET EXCHANGE & LIVE CASINO
              </h1>
              <p className="text-xs text-slate-200 leading-relaxed">
                Zero Commission Bookmaker Markets, Instant Betfair Back/Lay Liquidity, and 100+ Live Dealer Casino Tables.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/sports?tenant=${tenantSlug}`}
                className="px-5 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>BET ON CRICKET</span>
              </Link>
              <Link
                href={`/casino?tenant=${tenantSlug}`}
                className="px-5 py-2.5 rounded-lg bg-[#0088CC] hover:bg-[#0077b5] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>LIVE CASINO</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Ambaari Layout */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (2.5 Cols): Sports Navigation Tree & Categories */}
        {/* ========================================================= */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Quick Sports Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#2C3E50] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#0088CC]" />
                All Sports Exchange
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 font-bold">LIVE</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <button
                onClick={() => setActiveTab('CRICKET')}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                  activeTab === 'CRICKET' ? 'bg-[#0088CC]/10 text-[#0088CC] font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Cricket (IPL / ICC)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">2 LIVE</span>
              </button>

              <button
                onClick={() => setActiveTab('FOOTBALL')}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                  activeTab === 'FOOTBALL' ? 'bg-[#0088CC]/10 text-[#0088CC] font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>Football / Soccer</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">1 LIVE</span>
              </button>

              <button
                onClick={() => setActiveTab('TENNIS')}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                  activeTab === 'TENNIS' ? 'bg-[#0088CC]/10 text-[#0088CC] font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>Tennis Tournaments</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">Upcoming</span>
              </button>
            </div>
          </div>

          {/* Casino Categories Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#2C3E50] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Casino Suites
              </span>
              <span className="text-[10px] text-amber-300 font-bold">1Stake</span>
            </div>

            <div className="p-2 space-y-1 text-xs">
              <Link
                href={`/casino?tenant=${tenantSlug}&cat=live`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>Live Dealer Roulette</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href={`/casino?tenant=${tenantSlug}&cat=live`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>Teen Patti & Andar Bahar</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href={`/casino?tenant=${tenantSlug}&cat=live`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>Infinite Blackjack</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href={`/casino?tenant=${tenantSlug}&cat=slots`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <span>Vegas Video Slots</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* 24/7 Deposit & Support Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0088CC] to-[#005580] text-white space-y-2 shadow-sm">
            <div className="font-extrabold text-sm uppercase">Instant 24/7 WhatsApp Deposit</div>
            <p className="text-[11px] text-white/90">
              Get direct Indian banking accounts or instant Crypto QR within 60 seconds.
            </p>
            <div className="pt-2">
              <Link
                href="/player/deposit"
                className="block text-center py-2 rounded bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Deposit Online Now
              </Link>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN (6.5 Cols): Live Matches & Casino Showcase */}
        {/* ========================================================= */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* Sports Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-[#0088CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Markets
              </button>
              <button
                onClick={() => setActiveTab('CRICKET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'CRICKET'
                    ? 'bg-[#0088CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Cricket</span>
              </button>
              <button
                onClick={() => setActiveTab('FOOTBALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'FOOTBALL'
                    ? 'bg-[#0088CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Football
              </button>
              <button
                onClick={() => setActiveTab('TENNIS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'TENNIS'
                    ? 'bg-[#0088CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tennis
              </button>
            </div>

            <Link
              href={`/sports?tenant=${tenantSlug}`}
              className="text-xs font-bold text-[#0088CC] hover:underline flex items-center gap-1 whitespace-nowrap px-2"
            >
              <span>Full Sportsbook</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* In-Play Matches Table (Ambaari Reference Design) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#2C3E50] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                <span>Live In-Play Matches (Cricket & Football)</span>
              </div>
              <div className="hidden sm:flex items-center gap-12 text-[10px] text-slate-300 font-mono pr-4">
                <span>1 (BACK / LAY)</span>
                <span>X (DRAW)</span>
                <span>2 (BACK / LAY)</span>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {SAMPLE_MATCHES.map((match) => (
                <div key={match.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Match Info & Score */}
                    <div className="space-y-1 max-w-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {match.competition}
                      </div>
                      <Link
                        href={`/sports/${match.id}?tenant=${tenantSlug}`}
                        className="font-bold text-sm text-[#1f2937] hover:text-[#0088CC] transition-colors block"
                      >
                        {match.name}
                      </Link>

                      {match.scoreText && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                            {match.status}
                          </span>
                          <span className="font-mono text-emerald-700 font-semibold">{match.scoreText}</span>
                        </div>
                      )}
                    </div>

                    {/* Odds Matrix: 1 | X | 2 Back (Blue #72bbef) & Lay (Pink #faa9ba) */}
                    <div className="flex items-center gap-1.5 justify-end shrink-0">
                      {/* Team 1 Odds */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setSelectedBet({
                              match: match.name,
                              selection: match.name.split(' vs ')[0] || 'Team 1',
                              type: 'BACK',
                              odds: match.backPrice1,
                            })
                          }
                          className="w-14 sm:w-16 py-1 text-center rounded bg-[#72bbef] hover:bg-[#5caee6] text-[#0f3453] transition-all flex flex-col justify-center shadow-xs"
                        >
                          <span className="font-black text-xs font-mono">{match.backPrice1.toFixed(2)}</span>
                          <span className="text-[9px] font-mono text-[#0f3453]/80">{match.backSize1}</span>
                        </button>

                        <button
                          onClick={() =>
                            setSelectedBet({
                              match: match.name,
                              selection: match.name.split(' vs ')[0] || 'Team 1',
                              type: 'LAY',
                              odds: match.layPrice1,
                            })
                          }
                          className="w-14 sm:w-16 py-1 text-center rounded bg-[#faa9ba] hover:bg-[#f794a9] text-[#6d1326] transition-all flex flex-col justify-center shadow-xs"
                        >
                          <span className="font-black text-xs font-mono">{match.layPrice1.toFixed(2)}</span>
                          <span className="text-[9px] font-mono text-[#6d1326]/80">{match.laySize1}</span>
                        </button>
                      </div>

                      {/* Team 2 Odds */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setSelectedBet({
                              match: match.name,
                              selection: match.name.split(' vs ')[1] || 'Team 2',
                              type: 'BACK',
                              odds: match.backPrice2,
                            })
                          }
                          className="w-14 sm:w-16 py-1 text-center rounded bg-[#72bbef] hover:bg-[#5caee6] text-[#0f3453] transition-all flex flex-col justify-center shadow-xs"
                        >
                          <span className="font-black text-xs font-mono">{match.backPrice2.toFixed(2)}</span>
                          <span className="text-[9px] font-mono text-[#0f3453]/80">{match.backSize2}</span>
                        </button>

                        <button
                          onClick={() =>
                            setSelectedBet({
                              match: match.name,
                              selection: match.name.split(' vs ')[1] || 'Team 2',
                              type: 'LAY',
                              odds: match.layPrice2,
                            })
                          }
                          className="w-14 sm:w-16 py-1 text-center rounded bg-[#faa9ba] hover:bg-[#f794a9] text-[#6d1326] transition-all flex flex-col justify-center shadow-xs"
                        >
                          <span className="font-black text-xs font-mono">{match.layPrice2.toFixed(2)}</span>
                          <span className="text-[9px] font-mono text-[#6d1326]/80">{match.laySize2}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Casino Showcase (Ambaari Grid) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#2C3E50] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Featured Live Dealer Casino
              </span>
              <Link
                href={`/casino?tenant=${tenantSlug}`}
                className="text-[11px] text-[#0088CC] hover:underline font-bold"
              >
                View All Games →
              </Link>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CASINO_FEATURED.map((game) => (
                <div
                  key={game.id}
                  className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-md flex flex-col justify-between p-3 h-36 hover:border-[#0088CC] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black">
                      {game.badge}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{game.provider}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {game.title}
                    </h3>
                    <div className="text-[10px] text-slate-400">{game.category}</div>
                  </div>

                  <Link
                    href={`/casino?tenant=${tenantSlug}&game=${game.id}`}
                    className="w-full py-1.5 rounded bg-[#0088CC] hover:bg-[#0077b5] text-white text-center font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all"
                  >
                    PLAY NOW
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (3.0 Cols): Interactive Bet Slip & Match Tracker */}
        {/* ========================================================= */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* Bet Slip Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-20">
            <div className="bg-[#2C3E50] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Live Bet Slip
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0088CC] text-[10px] font-bold">1 SELECTION</span>
            </div>

            {selectedBet ? (
              <div className="p-4 space-y-3">
                {/* Active Selection Pill */}
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    selectedBet.type === 'BACK'
                      ? 'bg-[#72bbef]/15 border-[#72bbef] text-[#0f3453]'
                      : 'bg-[#faa9ba]/15 border-[#faa9ba] text-[#6d1326]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{selectedBet.selection}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-black ${
                        selectedBet.type === 'BACK'
                          ? 'bg-[#72bbef] text-[#0f3453]'
                          : 'bg-[#faa9ba] text-[#6d1326]'
                      }`}
                    >
                      {selectedBet.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedBet.match}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-600">Odds:</span>
                    <span className="font-black font-mono text-sm">{selectedBet.odds.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stake Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Stake Amount (₹):</label>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0088CC]"
                  />
                </div>

                {/* Quick Stake Chips */}
                <div className="grid grid-cols-5 gap-1">
                  {quickStakes.map((val) => (
                    <button
                      key={val}
                      onClick={() => setStake(val)}
                      className={`py-1 text-[10px] font-bold rounded border transition-all ${
                        stake === val
                          ? 'bg-[#0088CC] text-white border-[#0088CC]'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>

                {/* Return / Liability Summary */}
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Potential Profit:</span>
                    <span className="font-bold text-emerald-600">₹{calculateProfitOrLiability()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Total Return:</span>
                    <span className="font-bold text-slate-800">₹{calculateReturn()}</span>
                  </div>
                </div>

                {betSuccess && (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{betSuccess}</span>
                  </div>
                )}

                {/* Place Bet Action Button */}
                <button
                  onClick={handlePlaceBet}
                  className="w-full py-2.5 rounded-lg bg-[#0088CC] hover:bg-[#0077b5] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  PLACE BET (TEST MODE)
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Click any Back or Lay odds button to add a selection to your Bet Slip.
              </div>
            )}
          </div>

          {/* Live Match Audio / Visualizer Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                Live Match Tracker
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">2.4k VIEWING</span>
            </div>

            <div className="bg-[#18232e] text-white p-3 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>ICC T20 Championship</span>
                <span className="text-red-400 font-bold">18.2 OV</span>
              </div>
              <div className="font-black text-sm text-amber-400">
                India 184/4 vs Australia 180/7
              </div>
              <div className="text-[11px] text-slate-300">
                Last Ball: <span className="text-emerald-400 font-bold">FOUR!</span> Hardik Pandya drives through extra cover.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

