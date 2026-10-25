'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Crown
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
          osc.frequency.setValueAtTime(340, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'move') {
          osc.frequency.setValueAtTime(480, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'capture') {
          osc.frequency.setValueAtTime(260, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'win') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {
        // AudioContext blocked
      }
    },
    [soundEnabled]
  );

  // Initialize or Reset Game Session
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
    }, 650);

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
    <div className="min-h-screen bg-[#08164B] py-6 px-3 sm:px-6 lg:px-8 w-full text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Ludo King Arcade Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#162a7d]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#9bb0ea] mb-1">
              <Link href="/" className="hover:text-[#FBD706] transition-colors">
                Lobby
              </Link>
              <span>/</span>
              <span className="text-[#FBD706] font-bold">Ludo King Playful Arcade</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Crown className="w-8 h-8 text-[#FBD706] drop-shadow-md" />
              <span>Ludo King Circuit</span>
            </h1>
            <p className="text-xs text-[#9bb0ea] mt-0.5">
              High-energy board race with vivid token pathways, live bot opponents, and exact safe spots.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0c1f69] border border-[#162a7d] text-xs font-bold text-white hover:border-[#FBD706] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FBD706]" />
              <span>Rules</span>
            </button>

            <button
              onClick={() => initGame()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FBD706] text-[#04093A] text-xs font-black hover:bg-[#FFE84A] active:scale-95 transition-all shadow-md shadow-[#FBD706]/30 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Restart</span>
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* Practice Mode Guardrail Banner */}
        <div className="p-3.5 rounded-2xl bg-[#0c1f69] border border-[#162a7d] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 font-bold text-[#12A04A]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[#9bb0ea]">
              Practice Arcade Active: Real-money wagering and cashouts disabled by default.
            </span>
          </div>
          <span className="text-[10px] bg-[#FBD706] text-[#04093A] font-black uppercase px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            CSPRNG Verified
          </span>
        </div>

        {/* Mode Selector Segmented Controls (Ludo King Playful Arcade) */}
        <div className="p-4 rounded-3xl bg-[#0c1f69] border border-[#162a7d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="font-black text-[#FBD706] uppercase text-xs tracking-wider shrink-0">
              Select Mode:
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-[#08164B] p-1.5 rounded-2xl border border-[#162a7d] flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  setSelectedMode('vs_ai');
                  setSelectedPlayerCount(4);
                  initGame('vs_ai', 4);
                }}
                className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedMode === 'vs_ai' && selectedPlayerCount === 4
                    ? 'bg-[#FBD706] text-[#04093A] shadow-md'
                    : 'text-white/80 hover:text-white'
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
                className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedMode === 'vs_ai' && selectedPlayerCount === 2
                    ? 'bg-[#FBD706] text-[#04093A] shadow-md'
                    : 'text-white/80 hover:text-white'
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
                className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedMode === 'pass_play'
                    ? 'bg-[#FBD706] text-[#04093A] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Pass & Play
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#9bb0ea] flex items-center gap-2">
            <span>Circuit Status:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#12A04A] text-white">
              ONLINE
            </span>
          </div>
        </div>

        {/* Official Rules Modal */}
        {rulesOpen && (
          <div className="p-5 rounded-3xl bg-[#0c1f69] border border-[#162a7d] space-y-3 text-xs text-[#9bb0ea] shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#162a7d] pb-2.5">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#FBD706]" />
                <span>Ludo King Tournament Rules</span>
              </h3>
              <button
                onClick={() => setRulesOpen(false)}
                className="text-white/60 hover:text-white font-black text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">1. Open Base on 6</strong>
                <p>Roll a 6 to bring a token out of the yard onto the starting square.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">2. Safe Star (★) Squares</strong>
                <p>Starting squares and star tiles are 100% safe from opponent captures.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">3. Captures & Extra Turn</strong>
                <p>Landing on an opponent's token sends it home and grants you an immediate bonus roll!</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#FBD706] block">4. Win Condition</strong>
                <p>First player to move all 4 colored tokens into the central crown wins!</p>
              </div>
            </div>
          </div>
        )}

        {/* Playable Game Board Area */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-[#0c1f69] border border-[#162a7d] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#FBD706] animate-spin" />
            <p className="text-xs text-[#9bb0ea]">Initializing Ludo King board...</p>
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
    </div>
  );
}
