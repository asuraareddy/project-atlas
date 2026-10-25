'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Users,
  Trophy,
  Play,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Dice6,
  Info,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import LudoGameBoard from '@/components/ludo/LudoGameBoard';
import { LudoGameState, ValidMove, LudoGameMode } from '@/domain/games/ludo/types';
import { ThemeToggle } from '@/components/theme/ThemeProvider';

export default function LudoPage() {
  const [gameState, setGameState] = useState<LudoGameState | null>(null);
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<LudoGameMode>('vs_ai');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<2 | 4>(4);

  // Audio synthesis helper for dice roll & token moves
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
          osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'move') {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'capture') {
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'win') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {
        // AudioContext blocked by user gesture policy
      }
    },
    [soundEnabled]
  );

  // Initialize or Reset a Game Session
  const initGame = async (mode: LudoGameMode = selectedMode, count: 2 | 4 = selectedPlayerCount) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/ludo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, playerCount: count })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setGameState(json.data.session);
        setValidMoves(json.data.validMoves || []);
      }
    } catch (err) {
      console.error('Failed to init Ludo session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame('vs_ai', 4);
  }, []);

  // Bot Turn Automation Effect
  useEffect(() => {
    if (!gameState || gameState.status !== 'active') return;

    const activePlayer = gameState.players.find((p) => p.color === gameState.currentTurnColor);
    if (!activePlayer || !activePlayer.isBot) return;

    // Trigger bot action after a natural human-like delay (700ms)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/games/ludo/bot-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: gameState.sessionId })
        });
        const json = await res.json();
        if (res.ok && json.data) {
          playSound('move');
          setGameState(json.data.session);
          setValidMoves(json.data.validMoves || []);
        }
      } catch (e) {
        console.error('Bot turn failed:', e);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [gameState, playSound]);

  // Handle Human Dice Roll
  const handleRollDice = async () => {
    if (!gameState || isRolling) return;
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
    if (!gameState || gameState.turnPhase !== 'need_move') return;

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
        playSound('move');
        setGameState(json.data.session);
        setValidMoves(json.data.validMoves || []);

        if (json.data.session.status === 'completed') {
          playSound('win');
        }
      }
    } catch (err) {
      console.error('Move failed:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
            <Link href="/" className="hover:text-white">
              Lobby
            </Link>
            <span>/</span>
            <span className="text-[#b45df0] font-semibold">Ludo Circuit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Gamepad2 className="w-8 h-8 text-[#b45df0]" />
            <span>Ludo Grand Circuit</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-0.5">
            Authoritative deterministic 2-4 player Ludo board with exact safe-zone and capture rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRulesOpen(!rulesOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Rules</span>
          </button>

          <button
            onClick={() => initGame()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>New Game</span>
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Real-Money Wagering Guardrail Notice (Document 19) */}
      <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 font-medium text-[#10b981]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Practice Mode Active: Real-money wagering and cash settlements are disabled by default for Ludo.
          </span>
        </div>
        <span className="text-[10px] text-white/60 font-mono uppercase bg-[#1f1f1f] px-2 py-0.5 rounded self-start sm:self-auto">
          Testnet RNG Active
        </span>
      </div>

      {/* Mode Selector Segmented Controls */}
      <div className="p-3.5 rounded-2xl bg-[#242424] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-white uppercase text-[11px] tracking-wider shrink-0">
            Game Mode:
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-white/10 flex-1 sm:flex-initial">
            <button
              onClick={() => {
                setSelectedMode('vs_ai');
                setSelectedPlayerCount(4);
                initGame('vs_ai', 4);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                selectedMode === 'vs_ai' && selectedPlayerCount === 4
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              4-Player (AI)
            </button>

            <button
              onClick={() => {
                setSelectedMode('vs_ai');
                setSelectedPlayerCount(2);
                initGame('vs_ai', 2);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                selectedMode === 'vs_ai' && selectedPlayerCount === 2
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              1v1 Quick
            </button>

            <button
              onClick={() => {
                setSelectedMode('pass_play');
                setSelectedPlayerCount(4);
                initGame('pass_play', 4);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                selectedMode === 'pass_play'
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              Pass & Play
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#c4bfd0] flex items-center gap-2">
          <span>Board Status:</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">
            ONLINE (CSPRNG Engine)
          </span>
        </div>
      </div>

      {/* Rules Explainer Accordion Modal */}
      {rulesOpen && (
        <div className="p-5 rounded-2xl bg-[#1f1f1f] border border-white/15 space-y-3 text-xs text-[#c4bfd0] animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#b45df0]" />
              <span>Official Tournament Ludo Rules</span>
            </h3>
            <button
              onClick={() => setRulesOpen(false)}
              className="text-white/60 hover:text-white text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <strong className="text-white block">1. Exiting Starting Base</strong>
              <p>A token can only exit the colored yard into the track when you roll a <strong>6</strong>.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block">2. Captures & Safe Zones</strong>
              <p>Landing on an opponent's token sends it back to base and awards you a <strong>Bonus Free Roll</strong>! Starting squares and Star (★) tiles are safe from capture.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block">3. Extra Rolls</strong>
              <p>Rolling a 6, capturing an opponent, or reaching the center goal grants an immediate extra roll. Three consecutive 6s forfeits your turn.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block">4. Winning Condition</strong>
              <p>The first player to move all 4 colored tokens into the center goal triangle wins the championship!</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Playable Ludo Gameboard Area */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-[#242424] border border-white/10 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#b45df0] animate-spin" />
          <p className="text-xs text-[#c4bfd0]">Initializing authoritative Ludo circuit...</p>
        </div>
      ) : gameState ? (
        <LudoGameBoard
          state={gameState}
          validMoves={validMoves}
          onRollDice={handleRollDice}
          onMoveToken={handleMoveToken}
          onResetGame={() => initGame()}
          isRolling={isRolling}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />
      ) : null}
    </div>
  );
}
