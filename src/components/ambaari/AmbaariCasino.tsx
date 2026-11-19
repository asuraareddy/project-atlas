'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Filter,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  Award,
  Zap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

interface CasinoGameItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  rtp: string;
  badge?: string;
  popular?: boolean;
}

const AMBAARI_CASINO_GAMES: CasinoGameItem[] = [
  { id: '1stake_lightning_roulette', name: 'Lightning Roulette Live', category: 'Live Dealer', provider: 'Evolution', rtp: '97.3%', badge: 'HOT', popular: true },
  { id: '1stake_teen_patti', name: '20-20 Teen Patti', category: 'Indian Games', provider: 'Ezugi', rtp: '96.8%', badge: 'TOP RATED', popular: true },
  { id: '1stake_vip_blackjack', name: 'Infinite Blackjack Live', category: 'Live Dealer', provider: 'Evolution', rtp: '99.5%', badge: 'HIGH ROLLER', popular: true },
  { id: '1stake_speed_dragon_tiger', name: 'Speed Dragon Tiger Live', category: 'Live Dealer', provider: 'Super Spade', rtp: '96.27%', badge: 'FAST' },
  { id: '1stake_andar_bahar', name: 'Super Andar Bahar', category: 'Indian Games', provider: 'Ezugi', rtp: '95.5%', badge: 'POPULAR', popular: true },
  { id: '1stake_speed_baccarat', name: 'Speed Baccarat Cricket Studio', category: 'Live Dealer', provider: 'Evolution', rtp: '98.9%', badge: 'LIVE' },
  { id: '1stake_sweet_bonanza', name: 'Sweet Bonanza 1000', category: 'Slots', provider: 'Pragmatic Play', rtp: '96.53%', badge: 'JACKPOT', popular: true },
  { id: '1stake_gates_olympus', name: 'Gates of Olympus', category: 'Slots', provider: 'Pragmatic Play', rtp: '96.5%', badge: 'MEGA WIN', popular: true },
  { id: '1stake_crazy_time', name: 'Crazy Time Live Show', category: 'Live Dealer', provider: 'Evolution', rtp: '96.08%', badge: 'BONUS WHEEL' },
  { id: '1stake_european_roulette', name: 'European VIP Roulette 3D', category: 'Table Games', provider: 'NetEnt', rtp: '97.3%' },
  { id: '1stake_single_deck_blackjack', name: 'Single Deck Blackjack Pro', category: 'Table Games', provider: 'Betsoft', rtp: '99.6%' },
  { id: '1stake_sugar_rush', name: 'Sugar Rush Super Jackpot', category: 'Slots', provider: 'Pragmatic Play', rtp: '96.5%' },
];

export function AmbaariCasino() {
  const { tenantSlug } = useTenant();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGame, setActiveGame] = useState<CasinoGameItem | null>(null);
  const [isGameLaunched, setIsGameLaunched] = useState(false);

  const categories = [
    { key: 'ALL', label: 'All Games' },
    { key: 'Live Dealer', label: 'Live Casino' },
    { key: 'Indian Games', label: 'Teen Patti & Andar Bahar' },
    { key: 'Slots', label: 'Vegas Slots' },
    { key: 'Table Games', label: 'Roulette & Tables' },
  ];

  const filteredGames = AMBAARI_CASINO_GAMES.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunchGame = (game: CasinoGameItem) => {
    setActiveGame(game);
    setIsGameLaunched(true);
  };

  return (
    <div className="w-full bg-[#f2f4f7] text-[#1f2937] font-['Roboto_Condensed',sans-serif] min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-[#2C3E50] border-b border-[#3d5166] px-4 py-3 text-white">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              AMBAARI999 CASINO LOUNGE
            </span>
            <h1 className="text-xl font-black text-white">
              Live Dealer Tables, Slots & Indian Card Games
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search games or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1c2836] border border-[#3d5166] rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0088CC] w-48 sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="bg-[#0088CC] px-4 py-2 text-white shadow-inner">
        <div className="max-w-[1400px] mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-[#2C3E50] text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        
        {/* Game Modal / Active Game Launcher */}
        {isGameLaunched && activeGame && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-black text-base text-white">{activeGame.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-bold uppercase">
                  {activeGame.provider}
                </span>
              </div>
              <button
                onClick={() => setIsGameLaunched(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Close Table ✕
              </button>
            </div>

            {/* Simulated Live Table / Interactive Frame */}
            <div className="aspect-video w-full max-h-[500px] rounded-xl overflow-hidden bg-black/90 border border-slate-800 relative flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#0088CC]/20 border border-[#0088CC] flex items-center justify-center text-[#0088CC] animate-bounce">
                <Play className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-xl font-black text-white">{activeGame.name}</h4>
              <p className="text-xs text-slate-400 max-w-md">
                Certified Provably Fair RNG • RTP: {activeGame.rtp} • Test Credits Mode Active.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Connected to Authorized Server
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono">
                  Session Token: AMB_TEST_7891
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Casino Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0088CC] transition-all flex flex-col justify-between"
            >
              {/* Game Card Header Image Art */}
              <div className="h-28 bg-gradient-to-tr from-[#1a2530] via-[#243545] to-[#0088CC]/80 p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  {game.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-400 text-black">
                      {game.badge}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-slate-300 ml-auto">{game.provider}</span>
                </div>

                <div className="z-10">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase">{game.category}</div>
                  <div className="text-[9px] font-mono text-slate-400">RTP: {game.rtp}</div>
                </div>

                {/* Subtle Backdrop Icon */}
                <Sparkles className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
              </div>

              {/* Game Body & Launch Button */}
              <div className="p-2.5 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-[#0088CC] transition-colors truncate">
                  {game.name}
                </h4>

                <button
                  onClick={() => handleLaunchGame(game)}
                  className="w-full py-1.5 rounded-lg bg-[#0088CC] hover:bg-[#0077b5] text-white text-center font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>PLAY NOW</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

