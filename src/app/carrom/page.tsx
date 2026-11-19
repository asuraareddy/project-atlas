'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Target,
  Crown,
  Coins,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  RotateCcw,
  Users,
  Wifi,
  Sparkles,
  ArrowRight,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import CarromBoard from '@/components/carrom/CarromBoard';
import { CarromGameState } from '@/domain/games/carrom/types';
import { useTheme, ThemeToggle } from '@/components/theme/ThemeProvider';

interface StakeOption {
  label: string;
  stakeMinor: number;
  rakePercentage: number;
  badge?: string;
  isPractice?: boolean;
}

const STAKE_OPTIONS: StakeOption[] = [
  { label: 'Practice Table', stakeMinor: 0, rakePercentage: 0, badge: 'FREE', isPractice: true },
  { label: 'Rookie Match', stakeMinor: 100, rakePercentage: 10, badge: 'POPULAR' },
  { label: 'Standard Classic', stakeMinor: 200, rakePercentage: 10 },
  { label: 'Pro Arena', stakeMinor: 500, rakePercentage: 10, badge: 'HOT' },
  { label: 'Master Cup', stakeMinor: 1000, rakePercentage: 10 },
  { label: 'High Roller', stakeMinor: 2500, rakePercentage: 10, badge: 'VIP' }
];

export default function CarromPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gameState, setGameState] = useState<CarromGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [betModalOpen, setBetModalOpen] = useState(false);

  // Betting & Matchmaking state
  const [selectedStake, setSelectedStake] = useState<StakeOption>(STAKE_OPTIONS[2]); // Default £2.00
  const [selectedMode, setSelectedMode] = useState<'vs_ai' | 'pass_play'>('vs_ai');
  const [matchmakingState, setMatchmakingState] = useState<'idle' | 'searching' | 'matched' | 'in_game'>('in_game');
  const [matchedCount, setMatchedCount] = useState(1);
  const [walletCashMinor, setWalletCashMinor] = useState<number>(25000);

  const botShotTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live wallet balance
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/me/wallets');
      const json = await res.json();
      if (res.ok && json.data?.wallet) {
        setWalletCashMinor(json.data.wallet.cashAvailableMinor);
      }
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Web Audio API acoustic sound synthesis
  const playSound = useCallback(
    (type: 'strike' | 'hit' | 'cushion' | 'pocket' | 'foul' | 'win') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'strike') {
          // Deep wooden striker impact
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } else if (type === 'hit') {
          // Crisp coin-to-coin clack
          osc.type = 'sine';
          osc.frequency.setValueAtTime(680, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.06);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'cushion') {
          // Dull wooden rebound
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.09);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        } else if (type === 'pocket') {
          // Pocket drop whoosh
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'foul') {
          // Buzzer foul tone
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, ctx.currentTime);
          osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.28, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'win') {
          // Victory fanfare
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.36);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch {
        // AudioContext muted/blocked
      }
    },
    [soundEnabled]
  );

  // Initialize or Reset Game Session
  const initGame = async (
    mode: 'vs_ai' | 'pass_play' = selectedMode,
    stake: StakeOption = selectedStake
  ) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/carrom/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          stakeMinor: stake.stakeMinor,
          rakePercentage: stake.rakePercentage,
          isRealMoney: false
        })
      });
      const json = await res.json();
      if (res.ok && json.data?.session) {
        setGameState(json.data.session);
        fetchWallet();
      }
    } catch (err) {
      console.error('Failed to init Carrom session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame(selectedMode, selectedStake);
  }, []);

  // Matchmaking simulation workflow
  const startMatchmaking = (stake: StakeOption) => {
    setSelectedStake(stake);
    setBetModalOpen(false);

    if (stake.stakeMinor > walletCashMinor) {
      alert(`Insufficient funds. Your wallet balance is ${(walletCashMinor / 100).toFixed(2)}.`);
      return;
    }

    setMatchmakingState('searching');
    setMatchedCount(1);

    const t1 = setTimeout(() => setMatchedCount(2), 1200);
    const t2 = setTimeout(async () => {
      setMatchmakingState('matched');
    }, 1800);

    const t3 = setTimeout(async () => {
      await initGame(selectedMode, stake);
      setMatchmakingState('in_game');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const cancelMatchmaking = () => {
    setMatchmakingState('in_game');
    fetchWallet();
  };

  // Bot Turn Automation Pacing
  useEffect(() => {
    if (!gameState || gameState.status !== 'active') return;

    const activePlayer = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
    if (!activePlayer || !activePlayer.isBot) return;

    botShotTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/games/carrom/bot-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: gameState.sessionId })
        });
        const json = await res.json();
        if (res.ok && json.data?.session) {
          playSound('strike');
          setGameState(json.data.session);
          if (json.data.session.status === 'completed') {
            playSound('win');
            fetchWallet();
          }
        }
      } catch (e) {
        console.error('Bot shot failed:', e);
      }
    }, 900);

    return () => {
      if (botShotTimerRef.current) clearTimeout(botShotTimerRef.current);
    };
  }, [gameState, playSound, fetchWallet]);

  // Handle Player Shot
  const handleShot = async (angle: number, power: number) => {
    if (!gameState) return;

    try {
      const res = await fetch('/api/v1/games/carrom/shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          angle,
          power
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.session) {
        setGameState(json.data.session);
        if (json.data.session.status === 'completed') {
          playSound('win');
          fetchWallet();
        }
      }
    } catch (err) {
      console.error('Shot failed:', err);
    }
  };

  // Handle Striker Placement Along Baseline
  const handlePositionStriker = async (x: number) => {
    if (!gameState) return;

    try {
      await fetch('/api/v1/games/carrom/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          x
        })
      });
    } catch (err) {
      console.error('Position failed:', err);
    }
  };

  const calcGross = selectedStake.stakeMinor * 2;
  const calcRake = Math.round((calcGross * selectedStake.rakePercentage) / 100);
  const calcPrize = calcGross - calcRake;

  return (
    <div
      className={`min-h-screen py-5 px-3 sm:px-6 lg:px-8 w-full transition-colors duration-200 ${
        isDark ? 'bg-[#0C0D14] text-white' : 'bg-white text-[#0C0D14]'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* CARROM HEADER & WALLET BAR (CRAZY GAMES DARK PALETTE) */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
            isDark ? 'border-[#374151]' : 'border-zinc-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <Link
                href="/"
                className={`transition-colors ${
                  isDark ? 'text-[#9CA3AF] hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Lobby
              </Link>
              <span className={isDark ? 'text-[#374151]' : 'text-zinc-300'}>/</span>
              <span className="text-[#7361FF] font-black">Carrom Championship</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
                isDark ? 'text-white' : 'text-[#0C0D14]'
              }`}
            >
              <Target className="w-8 h-8 text-[#7361FF]" />
              <span>Carrom Tournament Arena</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Wallet Chip */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[30px] border text-xs ${
                isDark ? 'bg-[#151722] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200 shadow-sm'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#7361FF]" />
              <div className="flex flex-col text-left">
                <span className={`text-[9px] uppercase font-extrabold ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                  Available
                </span>
                <span className={`font-black ${isDark ? 'text-white' : 'text-[#0C0D14]'}`}>
                  {(walletCashMinor / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Change Stake Button (Chip Style) */}
            <button
              onClick={() => setBetModalOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[30px] border text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 ${
                isDark
                  ? 'bg-[#2F3148] border-[#7361FF]/40 text-white hover:bg-[#7361FF]'
                  : 'bg-[#EEF0FA] border-[#7361FF]/30 text-[#7361FF] hover:bg-[#7361FF] hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-[#7361FF]" />
              <span>
                {selectedStake.isPractice ? 'Free Practice' : `Stake ${(selectedStake.stakeMinor / 100).toFixed(2)}`}
              </span>
            </button>

            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className={`p-2 rounded-[30px] border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#151722] border-[#374151] text-[#9CA3AF] hover:text-white'
                  : 'bg-[#F4F5FA] border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'
              }`}
              title="Official Rules"
            >
              <HelpCircle className="w-4 h-4 text-[#7361FF]" />
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* FINANCIAL NOTICE & COMPLIANCE GUARDRAIL BANNER */}
        <div
          className={`p-3.5 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 shadow-sm ${
            isDark ? 'bg-[#151722] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[#7361FF]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#7361FF]" />
            <span className={isDark ? 'text-[#9CA3AF]' : 'text-zinc-600'}>
              Server-Authoritative Physics & Double-Entry Ledger Active: Test credits used during dev.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-[30px] border ${
                isDark
                  ? 'bg-[#2F3148] text-[#A48EFF] border-[#7361FF]/30'
                  : 'bg-[#EEF0FA] text-[#7361FF] border-[#7361FF]/30'
              }`}
            >
              10% Rake Configured
            </span>
            <span className="text-[10px] bg-[#7361FF] text-white font-extrabold uppercase px-3 py-1 rounded-[30px]">
              Queen Cover Rule Active
            </span>
          </div>
        </div>

        {/* BETTING & STAKE SELECTION MODAL */}
        {betModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className={`border-2 rounded-[24px] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl ${
                isDark ? 'bg-[#151722] border-[#374151] text-white' : 'bg-white border-zinc-200 text-[#0C0D14]'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? 'border-[#374151]' : 'border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#7361FF]" />
                  <h3 className="font-black text-base">Select Carrom Tournament Stake</h3>
                </div>
                <button
                  onClick={() => setBetModalOpen(false)}
                  className={`font-black text-sm cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Stake Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {STAKE_OPTIONS.map((opt) => {
                  const isSelected = selectedStake.stakeMinor === opt.stakeMinor;
                  const gross = opt.stakeMinor * 2;
                  const rake = Math.round((gross * opt.rakePercentage) / 100);
                  const prize = gross - rake;

                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedStake(opt)}
                      className={`p-3.5 rounded-[16px] border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#7361FF] border-[#A48EFF] text-white shadow-lg shadow-[#7361FF]/30 scale-[1.02]'
                          : isDark
                          ? 'bg-[#0C0D14] border-[#374151] text-white hover:border-[#7361FF]/50'
                          : 'bg-[#F4F5FA] border-zinc-200 text-[#0C0D14] hover:border-[#7361FF]/50'
                      }`}
                    >
                      {opt.badge && (
                        <span className="absolute top-2 right-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF4D4F] text-white">
                          {opt.badge}
                        </span>
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-black block opacity-80">{opt.label}</span>
                        <span className="text-base font-black">
                          {opt.stakeMinor > 0 ? `${(opt.stakeMinor / 100).toFixed(2)}` : 'FREE'}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-current/15 text-[10px] font-extrabold">
                        <span>Win: {prize > 0 ? `${(prize / 100).toFixed(2)}` : 'Points'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Game Mode Toggle */}
              <div
                className={`p-3 rounded-[16px] border flex items-center justify-between text-xs ${
                  isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
                }`}
              >
                <span className={`font-black ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>Opponent Mode:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedMode('vs_ai')}
                    className={`px-3.5 py-1.5 rounded-[30px] font-black text-xs cursor-pointer transition-all ${
                      selectedMode === 'vs_ai'
                        ? 'bg-[#7361FF] text-white shadow-md shadow-[#7361FF]/30'
                        : isDark
                        ? 'bg-[#2F3148] text-[#9CA3AF] hover:text-white'
                        : 'bg-[#EEF0FA] text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    AI Bot (AceStriker)
                  </button>
                  <button
                    onClick={() => setSelectedMode('pass_play')}
                    className={`px-3.5 py-1.5 rounded-[30px] font-black text-xs cursor-pointer transition-all ${
                      selectedMode === 'pass_play'
                        ? 'bg-[#7361FF] text-white shadow-md shadow-[#7361FF]/30'
                        : isDark
                        ? 'bg-[#2F3148] text-[#9CA3AF] hover:text-white'
                        : 'bg-[#EEF0FA] text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Pass & Play (Local 2P)
                  </button>
                </div>
              </div>

              {/* Stake Breakdown Summary */}
              <div
                className={`p-4 rounded-[16px] border space-y-2 text-xs ${
                  isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}>Entry Fee (Per Player):</span>
                  <span className="font-black">
                    {selectedStake.stakeMinor > 0 ? `${(selectedStake.stakeMinor / 100).toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}>Gross Pot (2 Players):</span>
                  <span className="font-black">{calcGross > 0 ? `${(calcGross / 100).toFixed(2)}` : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}>
                    Platform Rake ({selectedStake.rakePercentage}%):
                  </span>
                  <span className="font-bold opacity-80">{calcRake > 0 ? `${(calcRake / 100).toFixed(2)}` : '0.00'}</span>
                </div>
                <div
                  className={`flex justify-between pt-1 border-t text-sm font-black text-[#7361FF] ${
                    isDark ? 'border-[#374151]' : 'border-zinc-200'
                  }`}
                >
                  <span>Winner Prize Pool:</span>
                  <span>{calcPrize > 0 ? `${(calcPrize / 100).toFixed(2)}` : 'Arcade Points'}</span>
                </div>
              </div>

              {/* Confirm & Start Match Button (Button-Primary from Design Specs) */}
              <button
                onClick={() => startMatchmaking(selectedStake)}
                className={`w-full h-12 rounded-[30px] font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-[#F9FAFF] hover:bg-white text-[#0C0D14] shadow-[#7361FF]/20'
                    : 'bg-[#7361FF] hover:bg-[#6250e6] text-white shadow-md'
                }`}
              >
                <span>Confirm & Enter Matchmaking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MATCHMAKING SEARCH OVERLAY */}
        {matchmakingState !== 'in_game' && (
          <div
            className={`p-8 sm:p-12 rounded-[24px] border flex flex-col items-center justify-center space-y-6 text-center shadow-2xl ${
              isDark ? 'bg-[#151722] border-[#374151]' : 'bg-white border-zinc-200'
            }`}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-[#7361FF] border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-10 h-10 text-[#7361FF]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-black tracking-widest text-[#A48EFF]">
                {matchmakingState === 'searching' ? 'Matchmaking In Progress' : 'Match Confirmed!'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                {matchmakingState === 'searching'
                  ? `Finding Table Opponent (${matchedCount}/2)...`
                  : 'Table Ready — Transitioning to Board'}
              </h2>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                Authoritative match room reserved. Stake of {(selectedStake.stakeMinor / 100).toFixed(2)} held securely in
                wallet ledger.
              </p>
            </div>

            {matchmakingState === 'searching' && (
              <button
                onClick={cancelMatchmaking}
                className={`px-5 py-2.5 rounded-[30px] border text-xs font-black cursor-pointer transition-all ${
                  isDark
                    ? 'bg-[#2F3148] border-[#374151] text-white hover:bg-[#374151]'
                    : 'bg-[#EEF0FA] border-zinc-200 text-[#0C0D14] hover:bg-zinc-200'
                }`}
              >
                Cancel & Refund Stake
              </button>
            )}
          </div>
        )}

        {/* RULES MODAL */}
        {rulesOpen && (
          <div
            className={`p-5 rounded-[20px] border space-y-3 text-xs shadow-2xl animate-in fade-in duration-200 ${
              isDark ? 'bg-[#151722] border-[#374151] text-[#9CA3AF]' : 'bg-white border-zinc-200 text-zinc-600'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isDark ? 'border-[#374151]' : 'border-zinc-200'
              }`}
            >
              <h3 className="font-black text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-[#7361FF]" />
                <span className={isDark ? 'text-white' : 'text-[#0C0D14]'}>Carrom Championship Rules & Fouls</span>
              </h3>
              <button
                onClick={() => setRulesOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 font-black text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <strong className="text-[#7361FF] block font-extrabold">1. Coin Scoring & Extra Turn</strong>
                <p>White coin = 1 pt, Black coin = 1 pt. Pocketing your assigned coin earns an immediate extra turn.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#7361FF] block font-extrabold">2. Queen Cover Rule</strong>
                <p>
                  Pocketing the Red Queen (+3 pts) requires pocketing one of your own coins on the same or next shot to
                  cover it. Otherwise, the Queen returns to the center!
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#7361FF] block font-extrabold">3. Striker Foul Penalty</strong>
                <p>If the Striker falls into any pocket, a penalty coin is deducted and returned to the center, forfeiting your turn.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#7361FF] block font-extrabold">4. Win Condition</strong>
                <p>The player who pockets all coins of their color first wins the match and receives the prize pool!</p>
              </div>
            </div>
          </div>
        )}

        {/* PLAYABLE CARROM GAME BOARD */}
        {matchmakingState === 'in_game' && (
          <>
            {loading ? (
              <div
                className={`p-16 rounded-[24px] border flex flex-col items-center justify-center space-y-3 ${
                  isDark ? 'bg-[#151722] border-[#374151]' : 'bg-white border-zinc-200'
                }`}
              >
                <RefreshCw className="w-8 h-8 text-[#7361FF] animate-spin" />
                <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                  Initializing Carrom tournament board...
                </p>
              </div>
            ) : gameState ? (
              <CarromBoard
                state={gameState}
                onShot={handleShot}
                onPositionStriker={handlePositionStriker}
                onResetGame={() => initGame(selectedMode, selectedStake)}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                playAudio={playSound}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
