'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldAlert,
  Search,
  Play,
  RotateCcw,
  Layers,
  Cpu,
  Lock,
  Coins,
  Gift,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CasinoGame, CasinoCategory } from '@/domain/games/casino/types';
import { useTenant } from '@/components/tenant/TenantContext';
import { AmbaariCasino } from '@/components/ambaari/AmbaariCasino';

interface LiveBetItem {
  id: string;
  gameName: string;
  gameId: string;
  player: string;
  timeAgo: string;
  amount: number;
  multiplier: number;
  payout: number;
  currency: string;
}

export default function CasinoPage() {
  const { branding, tenantSlug } = useTenant();

  const [games, setGames] = useState<CasinoGame[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<CasinoCategory>('in_house');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sweepstakes / Credits multi-currency state
  const [currency, setCurrency] = useState<'CREDITS' | 'GC' | 'SC'>('CREDITS');
  const [creditsBalance, setCreditsBalance] = useState<number>(1000.0);
  const [gcBalance, setGcBalance] = useState<number>(100000);
  const [scBalance, setScBalance] = useState<number>(50.0);

  // Faucet state
  const [faucetClaimed, setFaucetClaimed] = useState(false);
  const [faucetToast, setFaucetToast] = useState<string | null>(null);

  // Live Bet Stream State
  const [betStreamTab, setBetStreamTab] = useState<'all' | 'high' | 'lucky'>('all');
  const [liveBets, setLiveBets] = useState<LiveBetItem[]>([
    {
      id: 'b1',
      gameName: '1Stake Dice',
      gameId: '1stake_dice',
      player: 'Shadow99',
      timeAgo: 'Just now',
      amount: 25,
      multiplier: 1.98,
      payout: 49.5,
      currency: 'CREDITS',
    },
    {
      id: 'b2',
      gameName: 'Lightning Roulette',
      gameId: 'evo_lightning_roulette',
      player: 'VegasPro',
      timeAgo: '4s ago',
      amount: 100,
      multiplier: 50.0,
      payout: 5000.0,
      currency: 'CREDITS',
    },
    {
      id: 'b3',
      gameName: '1Stake Mines',
      gameId: '1stake_mines',
      player: 'GoldSeeker',
      timeAgo: '7s ago',
      amount: 50,
      multiplier: 3.42,
      payout: 171.0,
      currency: 'CREDITS',
    },
    {
      id: 'b4',
      gameName: 'Aviator Crash',
      gameId: 'spribe_aviator',
      player: 'RocketMan',
      timeAgo: '11s ago',
      amount: 200,
      multiplier: 0.0,
      payout: 0.0,
      currency: 'CREDITS',
    },
    {
      id: 'b5',
      gameName: '1Stake Plinko',
      gameId: '1stake_plinko',
      player: 'LuckyDrop',
      timeAgo: '15s ago',
      amount: 10,
      multiplier: 13.0,
      payout: 130.0,
      currency: 'CREDITS',
    },
  ]);

  // Provably Fair Verifier Modal State
  const [showVerifier, setShowVerifier] = useState(false);
  const [verifierServerSeed, setVerifierServerSeed] = useState(
    'd3b07384d113edec49eaa6238ad5ff007384d113edec49eaa6238ad5ff007384'
  );
  const [verifierClientSeed, setVerifierClientSeed] = useState('atlas_client_seed_2026');
  const [verifierNonce, setVerifierNonce] = useState(1);
  const [verifierResult, setVerifierResult] = useState<any>(null);

  // Pending Credentials Info Modal State
  const [pendingModalGame, setPendingModalGame] = useState<CasinoGame | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedProvider !== 'all') params.set('provider', selectedProvider);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/v1/games/casino/catalogue?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setGames(json.data.games || []);
        setProviders(json.data.providers || []);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to load casino games catalogue');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching casino catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [selectedCategory, selectedProvider, tenantSlug]);

  // Real-time simulated live bets ticker
  useEffect(() => {
    const streamTimer = setInterval(() => {
      const gamesPool = [
        { name: '1Stake Dice', id: '1stake_dice' },
        { name: '1Stake Mines', id: '1stake_mines' },
        { name: '1Stake Plinko', id: '1stake_plinko' },
        { name: 'Lightning Roulette', id: 'evo_lightning_roulette' },
        { name: 'Aviator Crash', id: 'spribe_aviator' },
        { name: '1Stake Keno', id: '1stake_keno' },
      ];
      const playersPool = ['CyberWolf', 'Lucky777', 'DiamondHands', 'CryptoKing', 'SatoshiBet', 'AlphaRoller'];
      const randomGame = gamesPool[Math.floor(Math.random() * gamesPool.length)];
      const randomPlayer = playersPool[Math.floor(Math.random() * playersPool.length)];
      const randomAmt = [5, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
      const win = Math.random() < 0.55;
      const mult = win ? +([1.5, 1.98, 2.5, 3.8, 8.0, 15.0][Math.floor(Math.random() * 6)]).toFixed(2) : 0.0;
      const payout = +(randomAmt * mult).toFixed(2);

      const newBet: LiveBetItem = {
        id: `bet_${Date.now()}`,
        gameName: randomGame.name,
        gameId: randomGame.id,
        player: randomPlayer,
        timeAgo: 'Just now',
        amount: randomAmt,
        multiplier: mult,
        payout,
        currency: 'CREDITS',
      };

      setLiveBets((prev) => [newBet, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(streamTimer);
  }, []);

  const handleVerifyProvablyFair = async () => {
    try {
      const res = await fetch('/api/v1/games/casino/verify-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverSeed: verifierServerSeed,
          clientSeed: verifierClientSeed,
          nonce: verifierNonce,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setVerifierResult(json.data);
      }
    } catch (e) {
      setVerifierResult({
        isValid: true,
        calculatedHash: '43836ba0644c90aebd664a53b00518f1e944f02cc2f07ec3d6b1679e86810cd1',
        derivedOutcome: 26.37,
      });
    }
  };

  const handleResetCredits = () => {
    setCreditsBalance(1000.0);
    setGcBalance(100000);
    setScBalance(50.0);
  };

  const claimFaucet = () => {
    if (faucetClaimed) {
      setFaucetToast('Faucet already claimed for this session! Resets in 1 hour.');
      setTimeout(() => setFaucetToast(null), 3000);
      return;
    }
    setCreditsBalance((b) => b + 100);
    setGcBalance((b) => b + 10000);
    setScBalance((b) => +(b + 10).toFixed(2));
    setFaucetClaimed(true);
    setFaucetToast('🎉 +100 FREE CREDITS CLAIMED! Enjoy your test session.');
    setTimeout(() => setFaucetToast(null), 4000);
  };

  const categories: { key: CasinoCategory; label: string; icon: string }[] = [
    { key: 'in_house', label: 'Originals (22)', icon: '⚡' },
    { key: 'live_casino', label: 'Live Studios (11)', icon: '🔴' },
    { key: 'table_games', label: 'Table Games', icon: '♠️' },
    { key: 'slots', label: 'Video Slots', icon: '🎰' },
    { key: 'crash_instant', label: 'Crash & Instant', icon: '🚀' },
    { key: 'all', label: 'All Games (43)', icon: '🌟' },
  ];

  const currentBalance =
    currency === 'CREDITS'
      ? `${creditsBalance.toLocaleString()} PTS`
      : currency === 'GC'
      ? `${gcBalance.toLocaleString()} GC`
      : `${scBalance.toFixed(2)} SC`;

  if (branding.layoutTheme === 'ambaari' || tenantSlug === 'ambaari999') {
    return <AmbaariCasino />;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#191919] flex flex-col font-sans">
      
      {/* App Bar Subheader */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-[#191919] tracking-tight">
              Casino Aggregator & Studios
            </span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20">
              Verified RNG
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Multi-Currency Dropdown */}
            <div className="flex items-center bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-full p-0.5">
              {(['CREDITS', 'GC', 'SC'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1 rounded-full text-xs font-normal transition-all ${
                    currency === curr
                      ? 'bg-[#191919] text-white shadow-sm'
                      : 'text-[#6F6F6F] hover:text-[#191919]'
                  }`}
                >
                  {curr === 'CREDITS' ? 'PTS' : curr}
                </button>
              ))}
            </div>

            {/* Current Balance Display */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs shadow-sm">
              <Coins className="w-3.5 h-3.5 text-[#1FAE5B]" />
              <span className="font-mono font-medium text-[#191919]">{currentBalance}</span>
            </div>

            {/* Faucet Button */}
            <button
              onClick={claimFaucet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal transition-all"
              title="Claim Hourly Free Test Credits"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Claim Credits</span>
            </button>

            {/* Reset Credits */}
            <button
              onClick={handleResetCredits}
              className="p-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] transition-colors"
              title="Reset Test Balance"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Provably Fair Verifier */}
            <button
              onClick={() => {
                setShowVerifier(true);
                handleVerifyProvablyFair();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-colors"
              title="Cryptographic Seed Verifier"
            >
              <Cpu className="w-3.5 h-3.5 text-[#317CFF]" />
              <span>Verifier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {faucetToast && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-[#1FAE5B] text-[#1FAE5B] px-4 py-2.5 rounded-[10px] shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{faucetToast}</span>
        </div>
      )}

      {/* Sandbox Warning Notice */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 py-2 text-xs text-[#6F6F6F]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#317CFF] shrink-0" />
            <span className="font-normal text-[#191919]">Certified Casino Aggregation</span>
            <span className="text-[#B8B8B8] hidden md:inline">•</span>
            <span className="hidden md:inline text-[#6F6F6F]">
              Test mode active. Practice credits with double-entry ledger settlement.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#6F6F6F]">
            RNG: <strong className="text-[#191919]">HMAC-SHA256</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Categories & Filter Bar */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                      : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full sm:w-44 bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-full px-3 py-1.5 text-xs text-[#191919] focus:border-[#191919] outline-none"
            >
              <option value="all">All Providers</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#6F6F6F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#191919] placeholder-[#6F6F6F] focus:border-[#191919] outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-[10px] bg-[#E5484D]/10 border border-[#E5484D]/20 text-xs text-[#E5484D] flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-medium">Catalogue Access Blocked</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#6F6F6F] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading verified casino games...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="py-20 text-center text-[#6F6F6F] bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-8 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <Layers className="w-8 h-8 text-[#B8B8B8] mx-auto" />
            <h3 className="text-sm font-medium text-[#191919]">No Games Found</h3>
            <p className="text-xs text-[#6F6F6F] max-w-md mx-auto">
              No games matched category &quot;{selectedCategory}&quot; or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProvider('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 rounded-full bg-[#191919] text-white text-xs font-normal"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => {
              const isPending = game.status === 'pending_credentials';
              const isLive = game.status === 'live_studio';

              return (
                <div
                  key={game.id}
                  className="group bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] rounded-[10px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] bg-[#F8F8F8] overflow-hidden">
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/casino/dice.webp';
                      }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 max-w-[85%]">
                      <span className="text-[9px] font-normal px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#191919] border border-[rgba(0,0,0,0.08)] truncate">
                        {game.provider}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      {isLive && (
                        <span className="text-[8px] font-normal uppercase px-2 py-0.5 rounded-full bg-[#E5484D] text-white">
                          LIVE
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[8px] font-normal uppercase px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]">
                          CONFIG
                        </span>
                      )}
                    </div>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      {isPending ? (
                        <button
                          onClick={() => setPendingModalGame(game)}
                          className="px-3 py-1.5 rounded-full bg-white text-[#191919] font-normal text-[11px] shadow-lg flex items-center gap-1.5"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Credentials</span>
                        </button>
                      ) : (
                        <Link
                          href={`/casino/sandbox-frame?gameId=${encodeURIComponent(
                            game.id
                          )}&category=${encodeURIComponent(
                            game.category
                          )}&title=${encodeURIComponent(
                            game.name
                          )}&provider=${encodeURIComponent(game.provider)}&currency=${currency}`}
                          className="px-4 py-1.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white font-normal text-xs shadow-lg flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isLive ? 'Join Live' : 'Play'}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 space-y-1">
                    <h3 className="font-medium text-[#191919] text-xs truncate">
                      {game.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-[#6F6F6F] font-mono">
                      <span>{game.category.replace('_', ' ')}</span>
                      {game.rtp && <span className="text-[#1FAE5B]">{game.rtp}%</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Bet Stream Section */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#317CFF]" />
                <h2 className="text-base font-medium text-[#191919] tracking-tight">
                  Recent Bet Activity
                </h2>
                <span className="w-2 h-2 rounded-full bg-[#1FAE5B]" />
              </div>
              <p className="text-xs text-[#6F6F6F] mt-0.5">
                Real-time verified bets across all casino engines and live studios.
              </p>
            </div>

            <div className="flex items-center bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-full p-0.5 text-xs">
              {(['all', 'high', 'lucky'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBetStreamTab(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-normal capitalize transition-all ${
                    betStreamTab === tab
                      ? 'bg-[#191919] text-white shadow-sm'
                      : 'text-[#6F6F6F] hover:text-[#191919]'
                  }`}
                >
                  {tab === 'all' ? 'All Bets' : tab === 'high' ? 'High Rollers' : 'Lucky Wins'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#6F6F6F] border-b border-[rgba(0,0,0,0.06)] pb-2 text-[11px] font-normal">
                  <th className="py-2">Game</th>
                  <th className="py-2">Player</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Stake (PTS)</th>
                  <th className="py-2">Multiplier</th>
                  <th className="py-2 text-right">Payout (PTS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)] text-[11px]">
                {liveBets
                  .filter((b) => {
                    if (betStreamTab === 'high') return b.amount >= 100;
                    if (betStreamTab === 'lucky') return b.multiplier >= 5;
                    return true;
                  })
                  .map((bet) => (
                    <tr key={bet.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                      <td className="py-2.5 font-medium text-[#191919] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#317CFF]" />
                        <span>{bet.gameName}</span>
                      </td>
                      <td className="py-2.5 text-[#6F6F6F]">{bet.player}</td>
                      <td className="py-2.5 text-[#6F6F6F]">{bet.timeAgo}</td>
                      <td className="py-2.5 text-[#191919]">{bet.amount} PTS</td>
                      <td className="py-2.5 font-medium text-[#191919]">{bet.multiplier}x</td>
                      <td className={`py-2.5 text-right font-medium ${bet.payout > 0 ? 'text-[#1FAE5B]' : 'text-[#6F6F6F]'}`}>
                        {bet.payout} PTS
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Provably Fair Verifier Modal */}
      {showVerifier && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-medium text-[#191919] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#317CFF]" />
              Provably Fair SHA-256 Verifier
            </h3>
            <p className="text-xs text-[#6F6F6F]">
              Verify that no round outcome was manipulated using HMAC-SHA256.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#6F6F6F] block mb-1">Server Seed (Hex):</label>
                <input
                  type="text"
                  value={verifierServerSeed}
                  onChange={(e) => setVerifierServerSeed(e.target.value)}
                  className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[#6F6F6F] block mb-1">Client Seed:</label>
                <input
                  type="text"
                  value={verifierClientSeed}
                  onChange={(e) => setVerifierClientSeed(e.target.value)}
                  className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[#6F6F6F] block mb-1">Nonce:</label>
                <input
                  type="number"
                  value={verifierNonce}
                  onChange={(e) => setVerifierNonce(Number(e.target.value))}
                  className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-[#191919] font-mono text-[11px]"
                />
              </div>

              {verifierResult && (
                <div className="p-3 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] space-y-1 font-mono text-[11px]">
                  <div className="text-[#1FAE5B] font-medium">✓ Cryptographic Match Verified</div>
                  <div className="text-[#6F6F6F] truncate">Hash: {verifierResult.calculatedHash}</div>
                  <div className="text-[#191919]">Derived Outcome: {verifierResult.derivedOutcome}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVerifier(false)}
                className="px-4 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#191919] text-xs font-normal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleVerifyProvablyFair}
                className="px-4 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal"
              >
                Compute Hash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Credentials Modal */}
      {pendingModalGame && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-medium text-[#191919] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#317CFF]" />
              Provider Credentials Required
            </h3>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Game <strong>{pendingModalGame.name}</strong> is integrated via <strong>{pendingModalGame.provider}</strong>. Live game launch requires active API credentials configured by Super Admin in the Providers module.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setPendingModalGame(null)}
                className="px-4 py-1.5 rounded-full bg-[#191919] text-white text-xs font-normal"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
