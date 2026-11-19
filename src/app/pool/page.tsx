'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CircleDot,
  RotateCcw,
  Sparkles,
  Trophy,
  ShieldCheck,
  HelpCircle,
  Users,
  Bot,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useTheme, ThemeToggle } from '@/components/theme/ThemeProvider';
import { PoolTable } from '@/components/pool/PoolTable';
import { PoolGameState, PoolGameMode, PoolShotEvent } from '@/domain/games/pool/types';
import { BALL_COLOR_MAP } from '@/domain/games/pool/engine';

export default function PoolPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gameState, setGameState] = useState<PoolGameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMode, setSelectedMode] = useState<PoolGameMode>('vs_bot');
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string>('Welcome to 8-Ball Pool Pro!');

  // Start new game session
  const startNewGame = useCallback(
    async (mode: PoolGameMode = selectedMode) => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/games/pool/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            player1Name: 'Player 1',
            player2Name: mode === 'vs_bot' ? 'AceCue (Pro)' : 'Player 2',
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setGameState(json.data);
          setSelectedMode(mode);
          setLastMessage(`New ${mode === 'vs_bot' ? 'VS AI' : mode === 'pvp_local' ? '2-Player' : 'Practice'} match started!`);
        }
      } catch (err) {
        console.error('Failed to create pool session:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedMode]
  );

  useEffect(() => {
    startNewGame('vs_bot');
  }, [startNewGame]);

  const handleShotComplete = (
    nextState: PoolGameState,
    shotEv: PoolShotEvent,
    message: string
  ) => {
    setGameState(nextState);
    setLastMessage(message);
  };

  const p1 = gameState?.players[0];
  const p2 = gameState?.players[1];
  const activeIdx = gameState?.activePlayerIndex ?? 0;

  // Count remaining balls for each player
  const p1Remaining = gameState?.balls.filter(
    (b) =>
      !b.isPocketed &&
      b.id !== 0 &&
      ((p1?.group === 'solids' && b.type === 'solid') ||
        (p1?.group === 'stripes' && b.type === 'stripe'))
  ).length ?? 7;

  const p2Remaining = gameState?.balls.filter(
    (b) =>
      !b.isPocketed &&
      b.id !== 0 &&
      ((p2?.group === 'solids' && b.type === 'solid') ||
        (p2?.group === 'stripes' && b.type === 'stripe'))
  ).length ?? 7;

  // Pocketed balls list
  const pocketedBalls =
    gameState?.balls.filter((b) => b.isPocketed && b.id !== 0) || [];

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-zinc-900'
      }`}
    >
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div
            className={`flex items-center gap-2 text-xs mb-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            <Link href="/" className={isDark ? 'hover:text-white' : 'hover:text-zinc-900'}>
              Lobby
            </Link>
            <span>/</span>
            <Link href="/other-games" className={isDark ? 'hover:text-white' : 'hover:text-zinc-900'}>
              Other Games
            </Link>
            <span>/</span>
            <span className="text-[#b45df0] font-semibold">8-Ball Pool Pro</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md">
              <CircleDot className="w-5 h-5" />
            </div>
            <span>8-Ball Pool Pro Championship</span>
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            BCA/WPA Regulation 8-Ball Physics, Ray-Cast Aim Guideline, and Intelligent AceCue AI.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mode Switcher */}
          <div
            className={`flex p-1 rounded-full border text-xs font-semibold ${
              isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <button
              onClick={() => startNewGame('vs_bot')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                selectedMode === 'vs_bot'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>VS AI</span>
            </button>
            <button
              onClick={() => startNewGame('pvp_local')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                selectedMode === 'pvp_local'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2-Player</span>
            </button>
            <button
              onClick={() => startNewGame('practice')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                selectedMode === 'practice'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solo</span>
            </button>
          </div>

          {/* New Game / Reset Button */}
          <button
            onClick={() => startNewGame(selectedMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'
                : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 shadow-sm'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Re-Rack</span>
          </button>

          {/* Rules Modal Button */}
          <button
            onClick={() => setRulesOpen(!rulesOpen)}
            className={`p-2 rounded-full border text-xs transition-colors ${
              isDark
                ? 'bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
            }`}
            title="8-Ball Rules"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Rules Explainer Accordion Modal */}
      {rulesOpen && (
        <div
          className={`p-5 rounded-2xl border space-y-3 animate-fade-in ${
            isDark ? 'bg-zinc-900/90 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-cyan-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Standard 8-Ball Official Rules</span>
            </h3>
            <button
              onClick={() => setRulesOpen(false)}
              className="text-xs font-semibold px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-zinc-400">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <p className="font-bold text-white">1. Break & Open Table</p>
              <p>
                The table is OPEN until a player legally pockets an object ball on a shot after the break. First pocketed group (Solids 1-7 or Stripes 9-15) determines assignment.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <p className="font-bold text-white">2. Legal Shot & Fouls</p>
              <p>
                Cue ball must contact your assigned group first. Scratching or failing to hit your ball awards Ball-in-Hand to your opponent (place cue ball anywhere).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <p className="font-bold text-white">3. Winning with the 8-Ball</p>
              <p>
                Clear all 7 balls of your group first, then legally pocket the 8-Ball to WIN. Pocketing the 8-Ball early or scratching on the 8-Ball results in an instant loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Turn & Scoreboard Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Player 1 Card */}
        <div
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
            activeIdx === 0 && gameState?.status !== 'completed'
              ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : isDark
              ? 'bg-zinc-900 border-white/10'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-amber-500 flex items-center justify-center text-lg">
              {p1?.avatar || '🎱'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{p1?.name || 'Player 1'}</span>
                {activeIdx === 0 && gameState?.status !== 'completed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 animate-pulse">
                    SHOOTING
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 capitalize">
                Group: <strong className="text-white">{p1?.group || 'Open Table'}</strong>
              </p>
            </div>
          </div>

          {/* Remaining Balls Indicator */}
          {p1?.group && (
            <div className="text-right">
              <span className="text-xs text-zinc-400">Remaining</span>
              <p className="font-mono font-bold text-base text-amber-400">{p1Remaining}</p>
            </div>
          )}
        </div>

        {/* Center Match Info / Status */}
        <div
          className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 ${
            isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
            <Flame className="w-3.5 h-3.5" />
            <span>Turn #{gameState?.turnCount || 1}</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium truncate max-w-full px-2">
            {lastMessage}
          </p>
        </div>

        {/* Player 2 Card */}
        <div
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
            activeIdx === 1 && gameState?.status !== 'completed'
              ? 'border-cyan-500/80 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
              : isDark
              ? 'bg-zinc-900 border-white/10'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-cyan-500 flex items-center justify-center text-lg">
              {p2?.avatar || '🤖'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{p2?.name || 'AceCue (Pro)'}</span>
                {activeIdx === 1 && gameState?.status !== 'completed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-zinc-950 animate-pulse">
                    SHOOTING
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 capitalize">
                Group: <strong className="text-white">{p2?.group || 'Open Table'}</strong>
              </p>
            </div>
          </div>

          {/* Remaining Balls Indicator */}
          {p2?.group && (
            <div className="text-right">
              <span className="text-xs text-zinc-400">Remaining</span>
              <p className="font-mono font-bold text-base text-cyan-400">{p2Remaining}</p>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Victory Overlay Banner */}
      {gameState?.status === 'completed' && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 border-2 border-amber-500 text-center space-y-3 animate-fade-in shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">MATCH FINISHED!</h2>
          <p className="text-sm text-amber-200 font-semibold max-w-xl mx-auto">
            {gameState.winReason || 'Winner crowned in 8-Ball Pool Pro!'}
          </p>
          <button
            onClick={() => startNewGame(selectedMode)}
            className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Ball In Hand Alert Banner */}
      {gameState?.ballInHand && (
        <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
          <AlertTriangle className="w-4 h-4 text-cyan-400" />
          <span>
            FOUL! {gameState.players[activeIdx].name} has Ball In Hand! Touch anywhere on the table to place the cue ball.
          </span>
        </div>
      )}

      {/* Interactive Pool Table Canvas */}
      {gameState && (
        <PoolTable
          initialState={gameState}
          onStateChange={setGameState}
          onShotComplete={handleShotComplete}
        />
      )}

      {/* Pocketed Balls Rack Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Pocketed Balls Tray ({pocketedBalls.length}/15)
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-center min-h-[30px]">
          {pocketedBalls.length === 0 ? (
            <span className="text-xs text-zinc-500 italic">No balls pocketed yet. Break the rack!</span>
          ) : (
            pocketedBalls.map((b) => (
              <div
                key={`pocketed-${b.id}`}
                className="w-7 h-7 rounded-full border border-black/40 flex items-center justify-center text-[10px] font-bold text-zinc-950 shadow-sm"
                style={{ backgroundColor: b.color }}
                title={`Ball #${b.number} (${b.type})`}
              >
                {b.number}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
