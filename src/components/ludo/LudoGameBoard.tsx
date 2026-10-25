'use client';

import React, { useMemo } from 'react';
import {
  LudoGameState,
  LudoColor,
  ValidMove,
  LudoToken
} from '@/domain/games/ludo/types';
import {
  TRACK_COORDS,
  HOME_PATH_COORDS,
  BASE_SLOT_COORDS,
  CENTER_GOAL_COORDS,
  COLOR_STYLES
} from './board-coords';
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface LudoGameBoardProps {
  state: LudoGameState;
  validMoves: ValidMove[];
  onRollDice: () => void;
  onMoveToken: (tokenId: number) => void;
  onResetGame: () => void;
  isRolling: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function LudoGameBoard({
  state,
  validMoves,
  onRollDice,
  onMoveToken,
  onResetGame,
  isRolling,
  soundEnabled,
  onToggleSound
}: LudoGameBoardProps) {
  const activeColor = state.currentTurnColor;
  const activePlayer = state.players.find((p) => p.color === activeColor);
  const activeStyle = COLOR_STYLES[activeColor];

  // Group tokens by their (row, col) location on the 15x15 grid
  const tokenMap = useMemo(() => {
    const map = new Map<string, Array<{ token: LudoToken; isMoveable: boolean }>>();

    state.players.forEach((player) => {
      player.tokens.forEach((token) => {
        let coord: { r: number; c: number } | null = null;

        if (token.state === 'base') {
          coord = BASE_SLOT_COORDS[token.color][token.id];
        } else if (token.state === 'track') {
          coord = TRACK_COORDS[token.position];
        } else if (token.state === 'home_path') {
          coord = HOME_PATH_COORDS[token.color][token.position];
        } else if (token.state === 'home') {
          coord = CENTER_GOAL_COORDS[token.color];
        }

        if (coord) {
          const key = `${coord.r}_${coord.c}`;
          if (!map.has(key)) map.set(key, []);

          const isMoveable =
            state.turnPhase === 'need_move' &&
            token.color === activeColor &&
            validMoves.some((m) => m.tokenId === token.id);

          map.get(key)!.push({ token, isMoveable });
        }
      });
    });

    return map;
  }, [state.players, state.turnPhase, activeColor, validMoves]);

  // Dice Pip Renderer
  const renderDiceFace = (val: number | null) => {
    if (!val) {
      return (
        <div className="text-center font-bold text-xs uppercase tracking-wider text-white/70">
          Roll
        </div>
      );
    }

    const pipClass = 'w-2.5 h-2.5 rounded-full bg-white shadow-sm';
    return (
      <div className="w-9 h-9 grid grid-cols-3 grid-rows-3 p-1 items-center justify-items-center">
        {val === 1 && <div className={`${pipClass} col-start-2 row-start-2 w-3.5 h-3.5`} />}
        {val === 2 && (
          <>
            <div className={`${pipClass} col-start-1 row-start-1`} />
            <div className={`${pipClass} col-start-3 row-start-3`} />
          </>
        )}
        {val === 3 && (
          <>
            <div className={`${pipClass} col-start-1 row-start-1`} />
            <div className={`${pipClass} col-start-2 row-start-2`} />
            <div className={`${pipClass} col-start-3 row-start-3`} />
          </>
        )}
        {val === 4 && (
          <>
            <div className={`${pipClass} col-start-1 row-start-1`} />
            <div className={`${pipClass} col-start-3 row-start-1`} />
            <div className={`${pipClass} col-start-1 row-start-3`} />
            <div className={`${pipClass} col-start-3 row-start-3`} />
          </>
        )}
        {val === 5 && (
          <>
            <div className={`${pipClass} col-start-1 row-start-1`} />
            <div className={`${pipClass} col-start-3 row-start-1`} />
            <div className={`${pipClass} col-start-2 row-start-2`} />
            <div className={`${pipClass} col-start-1 row-start-3`} />
            <div className={`${pipClass} col-start-3 row-start-3`} />
          </>
        )}
        {val === 6 && (
          <>
            <div className={`${pipClass} col-start-1 row-start-1`} />
            <div className={`${pipClass} col-start-3 row-start-1`} />
            <div className={`${pipClass} col-start-1 row-start-2`} />
            <div className={`${pipClass} col-start-3 row-start-2`} />
            <div className={`${pipClass} col-start-1 row-start-3`} />
            <div className={`${pipClass} col-start-3 row-start-3`} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Active Turn Header Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#242424] border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg bg-gradient-to-br ${activeStyle.gradient}`}
          >
            {activeColor.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#b45df0]">
                Current Turn
              </span>
              {activePlayer?.isBot && (
                <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded text-[#c4bfd0]">
                  AI
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {activePlayer?.name || activeColor.toUpperCase()}
            </h3>
          </div>
        </div>

        {/* Dice & Controls Box */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[#1f1f1f] hover:bg-white/5 border border-white/10 text-white/70 hover:text-white"
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dice Button */}
          <button
            type="button"
            disabled={state.turnPhase !== 'need_roll' || isRolling || activePlayer?.isBot}
            onClick={onRollDice}
            className={`h-12 px-3.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg select-none cursor-pointer ${
              state.turnPhase === 'need_roll' && !activePlayer?.isBot
                ? `bg-gradient-to-r ${activeStyle.gradient} text-white hover:brightness-110 active:scale-95 shadow-[#7e0ac2]/40 ring-2 ring-white/30 animate-pulse`
                : 'bg-[#1f1f1f] text-white/40 border border-white/5 cursor-not-allowed'
            }`}
          >
            <div className={`transition-transform duration-300 ${isRolling ? 'animate-spin' : ''}`}>
              {renderDiceFace(state.currentDiceRoll)}
            </div>
            {state.turnPhase === 'need_roll' && !activePlayer?.isBot && (
              <span className="font-bold text-xs uppercase tracking-wide">Roll</span>
            )}
          </button>
        </div>
      </div>

      {/* Status Notice Banner */}
      <div className="px-3.5 py-2 rounded-xl bg-[#1f1f1f] border border-white/10 text-xs flex items-center justify-between text-[#c4bfd0]">
        <span className="truncate pr-2 font-medium">{state.lastMoveNotice}</span>
        {state.currentDiceRoll !== null && (
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#7e0ac2] text-white font-mono font-bold text-xs">
            Dice: {state.currentDiceRoll}
          </span>
        )}
      </div>

      {/* 15x15 LUDO BOARD SVG CONTAINER */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1f1f1f] bg-[#1a1a1a]">
        <svg
          viewBox="0 0 1500 1500"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS & PATTERNS */}
          <defs>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="tokenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. CORNER YARDS */}
          {/* Red Yard (Top Left: 0..600, 0..600) */}
          <rect x="0" y="0" width="600" height="600" fill="url(#redGrad)" />
          <rect x="100" y="100" width="400" height="400" rx="40" fill="#ffffff" />
          <circle cx="250" cy="250" r="55" fill="#ef4444" />
          <circle cx="350" cy="250" r="55" fill="#ef4444" />
          <circle cx="250" cy="350" r="55" fill="#ef4444" />
          <circle cx="350" cy="350" r="55" fill="#ef4444" />

          {/* Green Yard (Top Right: 900..1500, 0..600) */}
          <rect x="900" y="0" width="600" height="600" fill="url(#greenGrad)" />
          <rect x="1000" y="100" width="400" height="400" rx="40" fill="#ffffff" />
          <circle cx="1150" cy="250" r="55" fill="#10b981" />
          <circle cx="1250" cy="250" r="55" fill="#10b981" />
          <circle cx="1150" cy="350" r="55" fill="#10b981" />
          <circle cx="1250" cy="350" r="55" fill="#10b981" />

          {/* Yellow Yard (Bottom Right: 900..1500, 900..1500) */}
          <rect x="900" y="900" width="600" height="600" fill="url(#yellowGrad)" />
          <rect x="1000" y="1000" width="400" height="400" rx="40" fill="#ffffff" />
          <circle cx="1150" cy="1150" r="55" fill="#f59e0b" />
          <circle cx="1250" cy="1150" r="55" fill="#f59e0b" />
          <circle cx="1150" cy="1250" r="55" fill="#f59e0b" />
          <circle cx="1250" cy="1250" r="55" fill="#f59e0b" />

          {/* Blue Yard (Bottom Left: 0..600, 900..1500) */}
          <rect x="0" y="900" width="600" height="600" fill="url(#blueGrad)" />
          <rect x="100" y="1000" width="400" height="400" rx="40" fill="#ffffff" />
          <circle cx="250" cy="1150" r="55" fill="#3b82f6" />
          <circle cx="350" cy="1150" r="55" fill="#3b82f6" />
          <circle cx="250" cy="1250" r="55" fill="#3b82f6" />
          <circle cx="350" cy="1250" r="55" fill="#3b82f6" />

          {/* 2. TRACK GRID TILES (Each tile is 100x100) */}
          {TRACK_COORDS.map((coord, idx) => {
            let fillColor = '#ffffff';
            let strokeColor = '#e2e8f0';

            // Start squares
            if (idx === 0) fillColor = '#fee2e2'; // Red start
            if (idx === 13) fillColor = '#d1fae5'; // Green start
            if (idx === 26) fillColor = '#fef3c7'; // Yellow start
            if (idx === 39) fillColor = '#dbeafe'; // Blue start

            // Star/safe squares
            const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(idx);

            return (
              <g key={`track_${idx}`}>
                <rect
                  x={coord.c * 100}
                  y={coord.r * 100}
                  width="100"
                  height="100"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                {isSafe && (
                  <text
                    x={coord.c * 100 + 50}
                    y={coord.r * 100 + 60}
                    fontSize="38"
                    textAnchor="middle"
                    fill={idx === 0 ? '#ef4444' : idx === 13 ? '#10b981' : idx === 26 ? '#f59e0b' : idx === 39 ? '#3b82f6' : '#94a3b8'}
                    fontWeight="bold"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* 3. HOME PATH COLUMNS (Colored tiles) */}
          {/* Red Home Path (row 7, cols 1..5) */}
          {HOME_PATH_COORDS.red.map((coord, i) => (
            <rect
              key={`h_red_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="2"
            />
          ))}

          {/* Green Home Path (col 7, rows 1..5) */}
          {HOME_PATH_COORDS.green.map((coord, i) => (
            <rect
              key={`h_green_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#10b981"
              stroke="#047857"
              strokeWidth="2"
            />
          ))}

          {/* Yellow Home Path (row 7, cols 9..13) */}
          {HOME_PATH_COORDS.yellow.map((coord, i) => (
            <rect
              key={`h_yellow_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="2"
            />
          ))}

          {/* Blue Home Path (col 7, rows 9..13) */}
          {HOME_PATH_COORDS.blue.map((coord, i) => (
            <rect
              key={`h_blue_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#3b82f6"
              stroke="#1d4ed8"
              strokeWidth="2"
            />
          ))}

          {/* 4. CENTER HOME TRIANGLES */}
          {/* Center coordinate is 600..900, 600..900 */}
          {/* Red Left Triangle */}
          <polygon points="600,600 750,750 600,900" fill="#ef4444" />
          {/* Green Top Triangle */}
          <polygon points="600,600 750,750 900,600" fill="#10b981" />
          {/* Yellow Right Triangle */}
          <polygon points="900,600 750,750 900,900" fill="#f59e0b" />
          {/* Blue Bottom Triangle */}
          <polygon points="600,900 750,750 900,900" fill="#3b82f6" />
          <circle cx="750" cy="750" r="30" fill="#ffffff" />
          <text x="750" y="758" fontSize="26" textAnchor="middle" fill="#000000" fontWeight="bold">
            👑
          </text>

          {/* 5. TOKENS LAYER */}
          {Array.from(tokenMap.entries()).map(([key, items]) => {
            const [rStr, cStr] = key.split('_');
            const r = parseInt(rStr, 10);
            const c = parseInt(cStr, 10);
            const centerX = c * 100 + 50;
            const centerY = r * 100 + 50;

            const hasMoveable = items.some((item) => item.isMoveable);
            const topToken = items[items.length - 1].token;
            const style = COLOR_STYLES[topToken.color];

            return (
              <g
                key={`tokens_${key}`}
                onClick={() => {
                  if (hasMoveable) {
                    const moveable = items.find((i) => i.isMoveable);
                    if (moveable) onMoveToken(moveable.token.id);
                  }
                }}
                className={hasMoveable ? 'cursor-pointer' : ''}
              >
                {/* Pulsing ring for moveable token */}
                {hasMoveable && (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="46"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Token Outer Rim */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="36"
                  fill={style.darkBg}
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  filter={hasMoveable ? 'url(#tokenGlow)' : undefined}
                />

                {/* Token Body */}
                <circle cx={centerX} cy={centerY} r="28" fill={style.bg} />

                {/* Token Crown / Core */}
                <circle cx={centerX} cy={centerY} r="14" fill="#ffffff" />
                <circle cx={centerX} cy={centerY} r="8" fill={style.darkBg} />

                {/* Stack Count Badge if more than 1 token on this square */}
                {items.length > 1 && (
                  <g>
                    <circle cx={centerX + 24} cy={centerY - 24} r="16" fill="#171717" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={centerX + 24}
                      y={centerY - 18}
                      fontSize="18"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontWeight="bold"
                    >
                      {items.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Player Scores & Token Status Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {state.players.map((p) => {
          const style = COLOR_STYLES[p.color];
          const isTurn = p.color === state.currentTurnColor;
          const homeCount = p.tokens.filter((t) => t.state === 'home').length;
          const trackCount = p.tokens.filter((t) => t.state === 'track' || t.state === 'home_path').length;
          const baseCount = p.tokens.filter((t) => t.state === 'base').length;

          return (
            <div
              key={p.color}
              className={`p-2.5 rounded-xl border transition-all ${
                isTurn
                  ? `bg-[#242424] border-white/40 ring-1 ring-[#b45df0] shadow-md`
                  : 'bg-[#1a1a1a] border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5 capitalize">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.bg }} />
                  {p.color}
                </span>
                {isTurn && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#7e0ac2] text-white">
                    TURN
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
                <div className="bg-[#1f1f1f] p-1 rounded">
                  <span className="text-[#9c9aa8] block text-[8px]">BASE</span>
                  <span className="text-white font-bold">{baseCount}</span>
                </div>
                <div className="bg-[#1f1f1f] p-1 rounded">
                  <span className="text-[#9c9aa8] block text-[8px]">TRACK</span>
                  <span className="text-[#b45df0] font-bold">{trackCount}</span>
                </div>
                <div className="bg-[#1f1f1f] p-1 rounded">
                  <span className="text-[#9c9aa8] block text-[8px]">HOME</span>
                  <span className="text-[#10b981] font-bold">{homeCount}/4</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GAME OVER VICTORY MODAL OVERLAY */}
      {state.status === 'completed' && state.winnerColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#242424] border border-white/20 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] mx-auto flex items-center justify-center text-white shadow-xl shadow-[#f59e0b]/40">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b]">
                Champion Declared
              </span>
              <h2 className="text-2xl font-black text-white capitalize">
                {state.winnerColor} Player Wins!
              </h2>
              <p className="text-xs text-[#c4bfd0]">
                All 4 tokens successfully completed the circuit and reached the center goal.
              </p>
            </div>

            <button
              onClick={onResetGame}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7e0ac2] to-[#b45df0] text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Game</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
