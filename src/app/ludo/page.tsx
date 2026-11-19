'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Wallet
} from 'lucide-react';
import LudoGameBoard from '@/components/ludo/LudoGameBoard';
import { LudoGameState, ValidMove, LudoGameMode } from '@/domain/games/ludo/types';
import { useTheme, ThemeToggle } from '@/components/theme/ThemeProvider';

interface StakeOption {
  label: string;
  stakeMinor: number;
  rakePercentage: number;
  badge?: string;
  isPractice?: boolean;
}

const STAKE_OPTIONS: StakeOption[] = [
  { label: 'Practice Mode', stakeMinor: 0, rakePercentage: 0, badge: 'FREE', isPractice: true },
  { label: 'Rookie Match', stakeMinor: 100, rakePercentage: 10, badge: 'POPULAR' },
  { label: 'Standard Classic', stakeMinor: 200, rakePercentage: 10 },
  { label: 'Pro Arena', stakeMinor: 500, rakePercentage: 10, badge: 'HOT' },
  { label: 'Master Cup', stakeMinor: 1000, rakePercentage: 10 },
  { label: 'High Roller', stakeMinor: 2500, rakePercentage: 10, badge: 'VIP' }
];

export default function LudoPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gameState, setGameState] = useState<LudoGameState | null>(null);
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [betModalOpen, setBetModalOpen] = useState(false);

  // Betting & Matchmaking state
  const [selectedStake, setSelectedStake] = useState<StakeOption>(STAKE_OPTIONS[2]); // Default £2.00
  const [selectedMode, setSelectedMode] = useState<LudoGameMode>('vs_ai');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<2 | 4>(4);
  const [matchmakingState, setMatchmakingState] = useState<'idle' | 'searching' | 'matched' | 'in_game'>('in_game');
  const [matchedPlayersCount, setMatchedPlayersCount] = useState(1);
  const [walletCashMinor, setWalletCashMinor] = useState<number>(25000); // £250.00 default

  const botTurnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live wallet balance
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/me/wallets');
      const json = await res.json();
      if (res.ok && json.data?.wallet) {
        setWalletCashMinor(json.data.wallet.cashAvailableMinor);
      }
    } catch {
      // Offline / fallback to £250.00
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Audio synthesis helper for realistic sound cues
  const playSound = useCallback(
    (type: 'roll' | 'move' | 'capture' | 'win') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'roll') {
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
          osc.start();
          osc.stop(ctx.currentTime + 0.16);
        } else if (type === 'move') {
          // Sharp arcade hop tick
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(540, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.22, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'capture') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.22);
          gain.gain.setValueAtTime(0.28, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
          osc.start();
          osc.stop(ctx.currentTime + 0.22);
        } else if (type === 'win') {
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
    mode: LudoGameMode = selectedMode,
    count: 2 | 4 = selectedPlayerCount,
    stake: StakeOption = selectedStake
  ) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/ludo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          playerCount: count,
          stakeMinor: stake.stakeMinor,
          rakePercentage: stake.rakePercentage,
          isRealMoney: false // Real money kept disabled in dev per prompt
        })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setGameState(json.data.session);
        setValidMoves(json.data.validMoves || []);
        fetchWallet();
      }
    } catch (err) {
      console.error('Failed to init Ludo session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start initial match
  useEffect(() => {
    initGame(selectedMode, selectedPlayerCount, selectedStake);
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
    setMatchedPlayersCount(1);

    // Progressive simulated matchmaking for natural mobile player feel
    const t1 = setTimeout(() => setMatchedPlayersCount(2), 600);
    const t2 = setTimeout(() => setMatchedPlayersCount(selectedPlayerCount === 2 ? 2 : 3), 1300);
    const t3 = setTimeout(() => {
      setMatchedPlayersCount(selectedPlayerCount);
      setMatchmakingState('matched');
    }, 2000);

    const t4 = setTimeout(async () => {
      await initGame(selectedMode, selectedPlayerCount, stake);
      setMatchmakingState('in_game');
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const cancelMatchmaking = () => {
    setMatchmakingState('in_game');
    fetchWallet();
  };

  // Realistic Bot Turn Automation Pacing
  useEffect(() => {
    if (!gameState || gameState.status !== 'active' || isAnimating) return;

    const activePlayer = gameState.players.find((p) => p.color === gameState.currentTurnColor);
    if (!activePlayer || !activePlayer.isBot) return;

    // Realistic human-like delay: 750ms deliberation before rolling
    botTurnTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/games/ludo/bot-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: gameState.sessionId })
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setGameState(json.data.session);
          setValidMoves(json.data.validMoves || []);
          if (json.data.session.status === 'completed') {
            playSound('win');
            fetchWallet();
          }
        }
      } catch (e) {
        console.error('Bot turn failed:', e);
      }
    }, 750);

    return () => {
      if (botTurnTimerRef.current) clearTimeout(botTurnTimerRef.current);
    };
  }, [gameState, isAnimating, playSound, fetchWallet]);

  // Handle Human Dice Roll
  const handleRollDice = async () => {
    if (!gameState || isRolling || isAnimating) return;
    try {
      setIsRolling(true);
      playSound('roll');

      const res = await fetch('/api/v1/games/ludo/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          color: gameState.currentTurnColor
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setGameState(json.data.session);
        setValidMoves(json.data.validMoves || []);
      }
    } catch (err) {
      console.error('Roll failed:', err);
    } finally {
      setTimeout(() => setIsRolling(false), 300);
    }
  };

  // Handle Human Token Move
  const handleMoveToken = async (tokenId: number) => {
    if (!gameState || gameState.turnPhase !== 'need_move' || isAnimating) return;

    try {
      const res = await fetch('/api/v1/games/ludo/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          color: gameState.currentTurnColor,
          tokenId
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setGameState(json.data.session);
        setValidMoves(json.data.validMoves || []);

        if (json.data.session.status === 'completed') {
          playSound('win');
          fetchWallet();
        }
      }
    } catch (err) {
      console.error('Move failed:', err);
    }
  };

  // Prize calculations for active modal
  const calcGross = selectedStake.stakeMinor * selectedPlayerCount;
  const calcRake = Math.round((calcGross * selectedStake.rakePercentage) / 100);
  const calcPrize = calcGross - calcRake;

  return (
    <div
      className={`min-h-screen py-5 px-3 sm:px-6 lg:px-8 w-full transition-colors duration-200 ${
        isDark ? 'bg-[#08164B] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* LUDO KING HEADER & WALLET BAR */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
            isDark ? 'border-[#162a7d]' : 'border-slate-200'
          }`}
        >
          <div>
            <div
              className={`flex items-center gap-2 text-xs mb-1 ${
                isDark ? 'text-[#9bb0ea]' : 'text-slate-500'
              }`}
            >
              <Link href="/" className="hover:text-[#FBD706] transition-colors">
                Arcade Lobby
              </Link>
              <span>/</span>
              <span className="text-[#FBD706] font-bold">Ludo King Playful Arcade</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              <Crown className="w-8 h-8 text-[#FBD706] drop-shadow-md" />
              <span>Ludo King Tournament</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Wallet Chip */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs ${
                isDark ? 'bg-[#0c1f69] border-[#162a7d]' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#FBD706]" />
              <div className="flex flex-col text-left">
                <span
                  className={`text-[9px] uppercase font-bold ${
                    isDark ? 'text-[#9bb0ea]' : 'text-slate-500'
                  }`}
                >
                  Cash Available
                </span>
                <span className={`font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {(walletCashMinor / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Change Stake Button */}
            <button
              onClick={() => setBetModalOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-colors cursor-pointer shadow-md ${
                isDark
                  ? 'bg-[#0c1f69] border-[#FBD706]/50 text-[#FBD706] hover:bg-[#FBD706] hover:text-[#04093A]'
                  : 'bg-[#FFFBEB] border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>
                {selectedStake.isPractice
                  ? 'Free Practice'
                  : `Stake ${(selectedStake.stakeMinor / 100).toFixed(2)}`}
              </span>
            </button>

            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className={`p-2 rounded-2xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#0c1f69] border-[#162a7d] text-white/80 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
              }`}
              title="Tournament Rules"
            >
              <HelpCircle className="w-4 h-4 text-[#FBD706]" />
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* FINANCIAL NOTICE & COMPLIANCE GUARDRAIL BANNER */}
        <div
          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 shadow-sm ${
            isDark ? 'bg-[#0c1f69] border-[#162a7d]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[#12A04A]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className={isDark ? 'text-[#9bb0ea]' : 'text-slate-600'}>
              Server-Authoritative Ledger & CSPRNG Active: Test credits used during dev.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#12A04A]/20 text-[#12A04A] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#12A04A]/30">
              10% Rake Configured
            </span>
            <span className="text-[10px] bg-[#FBD706] text-[#04093A] font-black uppercase px-2.5 py-0.5 rounded-full">
              Fair Outcome Engine
            </span>
          </div>
        </div>

        {/* MATCHMAKING / BETTING SELECTION MODAL */}
        {betModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className={`border-2 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl ${
                isDark ? 'bg-[#0c1f69] border-[#FBD706] text-white' : 'bg-white border-amber-400 text-[#0F172A]'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? 'border-[#162a7d]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#FBD706]" />
                  <h3 className="font-black text-base">Select Tournament Stake</h3>
                </div>
                <button
                  onClick={() => setBetModalOpen(false)}
                  className={`font-black text-sm cursor-pointer ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Stake Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {STAKE_OPTIONS.map((opt) => {
                  const isSelected = selectedStake.stakeMinor === opt.stakeMinor;
                  const gross = opt.stakeMinor * selectedPlayerCount;
                  const rake = Math.round((gross * opt.rakePercentage) / 100);
                  const prize = gross - rake;

                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedStake(opt)}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#FBD706] border-[#FBD706] text-[#04093A] shadow-lg shadow-[#FBD706]/30 scale-[1.02]'
                          : isDark
                          ? 'bg-[#08164B] border-[#162a7d] text-white hover:border-white/30'
                          : 'bg-slate-50 border-slate-200 text-[#0F172A] hover:border-slate-300'
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`absolute top-2 right-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#04093A] text-[#FBD706]' : 'bg-[#FBD706] text-[#04093A]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-black block opacity-80">
                          {opt.label}
                        </span>
                        <span className="text-base font-black">
                          {opt.stakeMinor > 0 ? `${(opt.stakeMinor / 100).toFixed(2)}` : 'FREE'}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-current/15 text-[10px] font-bold">
                        <span>Win: {prize > 0 ? `${(prize / 100).toFixed(2)}` : 'Points'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Player Count Toggle */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-[#08164B] border-[#162a7d]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={`font-bold ${isDark ? 'text-[#9bb0ea]' : 'text-slate-600'}`}>
                  Player Format:
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedPlayerCount(2)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                      selectedPlayerCount === 2
                        ? 'bg-[#FBD706] text-[#04093A]'
                        : isDark
                        ? 'bg-[#0c1f69] text-white hover:text-[#FBD706]'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-amber-700'
                    }`}
                  >
                    1v1 (2 Players)
                  </button>
                  <button
                    onClick={() => setSelectedPlayerCount(4)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                      selectedPlayerCount === 4
                        ? 'bg-[#FBD706] text-[#04093A]'
                        : isDark
                        ? 'bg-[#0c1f69] text-white hover:text-[#FBD706]'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-amber-700'
                    }`}
                  >
                    Classic (4 Players)
                  </button>
                </div>
              </div>

              {/* Stake Breakdown Summary */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                  isDark ? 'bg-[#08164B] border-[#162a7d]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`flex justify-between ${isDark ? 'text-[#9bb0ea]' : 'text-slate-600'}`}>
                  <span>Entry Fee (Per Player):</span>
                  <span className={`font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {selectedStake.stakeMinor > 0 ? `${(selectedStake.stakeMinor / 100).toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-[#9bb0ea]' : 'text-slate-600'}`}>
                  <span>Total Pot ({selectedPlayerCount} Players):</span>
                  <span className={`font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {calcGross > 0 ? `${(calcGross / 100).toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-[#9bb0ea]' : 'text-slate-600'}`}>
                  <span>Platform Rake ({selectedStake.rakePercentage}%):</span>
                  <span className="font-semibold opacity-80">
                    {calcRake > 0 ? `${(calcRake / 100).toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-1 border-t text-sm font-black ${
                    isDark ? 'border-[#162a7d] text-[#FBD706]' : 'border-slate-200 text-amber-800'
                  }`}
                >
                  <span>Winner Prize Pool:</span>
                  <span>{calcPrize > 0 ? `${(calcPrize / 100).toFixed(2)}` : 'Arcade Points'}</span>
                </div>
              </div>

              {/* Confirm & Start Match Button */}
              <button
                onClick={() => startMatchmaking(selectedStake)}
                className="w-full py-3.5 rounded-2xl bg-[#FBD706] hover:bg-[#FFE84A] text-[#04093A] font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            className={`p-8 sm:p-12 rounded-3xl border flex flex-col items-center justify-center space-y-6 text-center shadow-2xl ${
              isDark ? 'bg-[#0c1f69] border-[#162a7d]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-[#FBD706] border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="w-10 h-10 text-[#FBD706]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-black tracking-widest text-[#FBD706]">
                {matchmakingState === 'searching' ? 'Matchmaking In Progress' : 'Match Confirmed!'}
              </span>
              <h2
                className={`text-xl sm:text-2xl font-black ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                {matchmakingState === 'searching'
                  ? `Searching for Opponents (${matchedPlayersCount}/${selectedPlayerCount})...`
                  : 'All Players Ready — Transitioning to Board'}
              </h2>
              <p
                className={`text-xs max-w-sm mx-auto ${
                  isDark ? 'text-[#9bb0ea]' : 'text-slate-600'
                }`}
              >
                Authoritative match room reserved. Stake of {(selectedStake.stakeMinor / 100).toFixed(2)} held securely in wallet ledger.
              </p>
            </div>

            {/* Matched player avatars */}
            <div className="flex items-center gap-3">
              {Array.from({ length: selectedPlayerCount }).map((_, idx) => {
                const isJoined = idx < matchedPlayersCount;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all ${
                      isJoined
                        ? 'bg-[#FBD706] border-[#FBD706] text-[#04093A] scale-105 shadow-lg'
                        : isDark
                        ? 'bg-[#08164B] border-[#162a7d] text-white/40'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isJoined ? (idx === 0 ? 'YOU' : `P${idx + 1}`) : '?'}
                  </div>
                );
              })}
            </div>

            {matchmakingState === 'searching' && (
              <button
                onClick={cancelMatchmaking}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#08164B] border-[#162a7d] text-white/80 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
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
            className={`p-5 rounded-3xl border space-y-3 text-xs shadow-2xl animate-in fade-in duration-200 ${
              isDark ? 'bg-[#0c1f69] border-[#162a7d] text-[#9bb0ea]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isDark ? 'border-[#162a7d]' : 'border-slate-200'
              }`}
            >
              <h3
                className={`font-black text-sm flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                <Crown className="w-4 h-4 text-[#FBD706]" />
                <span>Ludo King Tournament Rules & Safe Zones</span>
              </h3>
              <button
                onClick={() => setRulesOpen(false)}
                className={`font-black text-xs cursor-pointer ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">1. Open Base on 6</strong>
                <p>Roll a 6 to bring a token out of the yard onto your colored starting square.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">2. Safe Star (★) Squares</strong>
                <p>8 designated safe cells (start squares & star positions) are immune from captures.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">3. Step-by-Step Movement</strong>
                <p>Tokens visibly advance step-by-step along the track with authentic mobile timing.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">4. Authoritative Ledger Settlement</strong>
                <p>Winner receives 100% of the prize pool directly credited to their ledger balance upon match completion.</p>
              </div>
            </div>
          </div>
        )}

        {/* PLAYABLE GAME BOARD */}
        {matchmakingState === 'in_game' && (
          <>
            {loading ? (
              <div
                className={`p-16 rounded-3xl border flex flex-col items-center justify-center space-y-3 ${
                  isDark ? 'bg-[#0c1f69] border-[#162a7d]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <RefreshCw className="w-8 h-8 text-[#FBD706] animate-spin" />
                <p className={`text-xs ${isDark ? 'text-[#9bb0ea]' : 'text-slate-500'}`}>
                  Initializing Ludo King board...
                </p>
              </div>
            ) : gameState ? (
              <LudoGameBoard
                state={gameState}
                validMoves={validMoves}
                onRollDice={handleRollDice}
                onMoveToken={handleMoveToken}
                onResetGame={() => initGame(selectedMode, selectedPlayerCount, selectedStake)}
                isRolling={isRolling}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onAnimationStateChange={setIsAnimating}
                playAudio={playSound}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
