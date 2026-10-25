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
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, ShieldCheck, Crown } from 'lucide-react';

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

  // Ludo King Arcade Dice Pip Renderer
  const renderDiceFace = (val: number | null) => {
    if (!val) {
      return (
        <div className="text-center font-black text-xs uppercase tracking-wider text-[#04093A]">
          ROLL
        </div>
      );
    }

    const pipClass = 'w-2.5 h-2.5 rounded-full bg-[#04093A] shadow-sm';
    return (
      <div className="w-10 h-10 grid grid-cols-3 grid-rows-3 p-1.5 items-center justify-items-center bg-white rounded-xl shadow-inner border border-black/10">
        {val === 1 && <div className={`${pipClass} col-start-2 row-start-2 w-3.5 h-3.5 bg-[#E52424]`} />}
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
            <div className={`${pipClass} col-start-2 row-start-2 bg-[#E52424]`} />
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
      {/* Ludo King Active Turn Header Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#0c1f69] border border-[#162a7d] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-lg bg-gradient-to-br ${activeStyle.gradient} ring-2 ring-white/20`}
            style={{ color: activeStyle.text }}
          >
            {activeColor.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-[#FBD706] text-[#04093A]">
                Current Turn
              </span>
              {activePlayer?.isBot && (
                <span className="text-[9px] bg-white/20 font-bold px-1.5 py-0.5 rounded text-white">
                  BOT
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white capitalize mt-0.5 tracking-tight">
              {activePlayer?.name || activeColor}
            </h3>
          </div>
        </div>

        {/* Dice & Controls Box */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-2xl bg-[#08164B] hover:bg-white/10 border border-[#162a7d] text-white/80 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FBD706]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Ludo King Playful Arcade Primary CTA Dice Button */}
          <button
            type="button"
            disabled={state.turnPhase !== 'need_roll' || isRolling || activePlayer?.isBot}
            onClick={onRollDice}
            className={`h-14 px-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2.5 shadow-xl select-none cursor-pointer ${
              state.turnPhase === 'need_roll' && !activePlayer?.isBot
                ? 'bg-[#FBD706] text-[#04093A] hover:bg-[#FFE84A] active:scale-95 shadow-[#FBD706]/40 ring-4 ring-[#FBD706]/30 animate-bounce'
                : 'bg-[#08164B] text-white/30 border border-[#162a7d] cursor-not-allowed'
            }`}
          >
            <div className={`transition-transform duration-300 ${isRolling ? 'animate-spin' : ''}`}>
              {renderDiceFace(state.currentDiceRoll)}
            </div>
            {state.turnPhase === 'need_roll' && !activePlayer?.isBot && (
              <span className="font-black text-sm uppercase tracking-wide pr-1">ROLL</span>
            )}
          </button>
        </div>
      </div>

      {/* Ludo King Status Notice Banner */}
      <div className="px-4 py-2.5 rounded-2xl bg-[#0c1f69] border border-[#162a7d] text-xs flex items-center justify-between text-white shadow-md">
        <span className="truncate pr-2 font-medium">{state.lastMoveNotice}</span>
        {state.currentDiceRoll !== null && (
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#FBD706] text-[#04093A] font-black text-xs shadow-sm">
            DICE: {state.currentDiceRoll}
          </span>
        )}
      </div>

      {/* 15x15 LUDO KING BOARD SVG CONTAINER */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#04093A] bg-[#08164B] ring-2 ring-[#FBD706]/20">
        <svg
          viewBox="0 0 1500 1500"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS & GRADIENTS PER LUDO KING SPEC */}
          <defs>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E52424" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#12A04A" />
              <stop offset="100%" stopColor="#0DBA78" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBD706" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D6EFD" />
              <stop offset="100%" stopColor="#04093A" />
            </linearGradient>
            <filter id="tokenGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. CORNER YARDS */}
          {/* Red Yard (Top Left: 0..600, 0..600) */}
          <rect x="0" y="0" width="600" height="600" fill="url(#redGrad)" />
          <rect x="100" y="100" width="400" height="400" rx="45" fill="#FFFFFF" stroke="#04093A" strokeWidth="6" />
          <circle cx="250" cy="250" r="55" fill="#E52424" stroke="#04093A" strokeWidth="4" />
          <circle cx="350" cy="250" r="55" fill="#E52424" stroke="#04093A" strokeWidth="4" />
          <circle cx="250" cy="350" r="55" fill="#E52424" stroke="#04093A" strokeWidth="4" />
          <circle cx="350" cy="350" r="55" fill="#E52424" stroke="#04093A" strokeWidth="4" />

          {/* Green Yard (Top Right: 900..1500, 0..600) */}
          <rect x="900" y="0" width="600" height="600" fill="url(#greenGrad)" />
          <rect x="1000" y="100" width="400" height="400" rx="45" fill="#FFFFFF" stroke="#04093A" strokeWidth="6" />
          <circle cx="1150" cy="250" r="55" fill="#12A04A" stroke="#04093A" strokeWidth="4" />
          <circle cx="1250" cy="250" r="55" fill="#12A04A" stroke="#04093A" strokeWidth="4" />
          <circle cx="1150" cy="350" r="55" fill="#12A04A" stroke="#04093A" strokeWidth="4" />
          <circle cx="1250" cy="350" r="55" fill="#12A04A" stroke="#04093A" strokeWidth="4" />

          {/* Yellow Yard (Bottom Right: 900..1500, 900..1500) */}
          <rect x="900" y="900" width="600" height="600" fill="url(#yellowGrad)" />
          <rect x="1000" y="1000" width="400" height="400" rx="45" fill="#FFFFFF" stroke="#04093A" strokeWidth="6" />
          <circle cx="1150" cy="1150" r="55" fill="#FBD706" stroke="#04093A" strokeWidth="4" />
          <circle cx="1250" cy="1150" r="55" fill="#FBD706" stroke="#04093A" strokeWidth="4" />
          <circle cx="1150" cy="1250" r="55" fill="#FBD706" stroke="#04093A" strokeWidth="4" />
          <circle cx="1250" cy="1250" r="55" fill="#FBD706" stroke="#04093A" strokeWidth="4" />

          {/* Blue Yard (Bottom Left: 0..600, 900..1500) */}
          <rect x="0" y="900" width="600" height="600" fill="url(#blueGrad)" />
          <rect x="100" y="1000" width="400" height="400" rx="45" fill="#FFFFFF" stroke="#04093A" strokeWidth="6" />
          <circle cx="250" cy="1150" r="55" fill="#0D6EFD" stroke="#04093A" strokeWidth="4" />
          <circle cx="350" cy="1150" r="55" fill="#0D6EFD" stroke="#04093A" strokeWidth="4" />
          <circle cx="250" cy="1250" r="55" fill="#0D6EFD" stroke="#04093A" strokeWidth="4" />
          <circle cx="350" cy="1250" r="55" fill="#0D6EFD" stroke="#04093A" strokeWidth="4" />

          {/* 2. TRACK GRID TILES (100x100) */}
          {TRACK_COORDS.map((coord, idx) => {
            let fillColor = '#FFFFFF';
            let strokeColor = '#04093A';

            // Start squares with vivid Ludo King colors
            if (idx === 0) fillColor = '#FEE2E2'; // Red start
            if (idx === 13) fillColor = '#D1FAE5'; // Green start
            if (idx === 26) fillColor = '#FEF9C3'; // Yellow start
            if (idx === 39) fillColor = '#DBEAFE'; // Blue start

            // Safe stars
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
                  strokeWidth="2.5"
                />
                {isSafe && (
                  <text
                    x={coord.c * 100 + 50}
                    y={coord.r * 100 + 64}
                    fontSize="42"
                    textAnchor="middle"
                    fill={
                      idx === 0
                        ? '#E52424'
                        : idx === 13
                        ? '#12A04A'
                        : idx === 26
                        ? '#FBD706'
                        : idx === 39
                        ? '#0D6EFD'
                        : '#FBD706'
                    }
                    stroke="#04093A"
                    strokeWidth="1.5"
                    fontWeight="bold"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* 3. HOME PATH COLUMNS */}
          {/* Red Home Path */}
          {HOME_PATH_COORDS.red.map((coord, i) => (
            <rect
              key={`h_red_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#E52424"
              stroke="#04093A"
              strokeWidth="2.5"
            />
          ))}

          {/* Green Home Path */}
          {HOME_PATH_COORDS.green.map((coord, i) => (
            <rect
              key={`h_green_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#12A04A"
              stroke="#04093A"
              strokeWidth="2.5"
            />
          ))}

          {/* Yellow Home Path */}
          {HOME_PATH_COORDS.yellow.map((coord, i) => (
            <rect
              key={`h_yellow_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#FBD706"
              stroke="#04093A"
              strokeWidth="2.5"
            />
          ))}

          {/* Blue Home Path */}
          {HOME_PATH_COORDS.blue.map((coord, i) => (
            <rect
              key={`h_blue_${i}`}
              x={coord.c * 100}
              y={coord.r * 100}
              width="100"
              height="100"
              fill="#0D6EFD"
              stroke="#04093A"
              strokeWidth="2.5"
            />
          ))}

          {/* 4. CENTER HOME TRIANGLES */}
          <polygon points="600,600 750,750 600,900" fill="#E52424" stroke="#04093A" strokeWidth="2.5" />
          <polygon points="600,600 750,750 900,600" fill="#12A04A" stroke="#04093A" strokeWidth="2.5" />
          <polygon points="900,600 750,750 900,900" fill="#FBD706" stroke="#04093A" strokeWidth="2.5" />
          <polygon points="600,900 750,750 900,900" fill="#0D6EFD" stroke="#04093A" strokeWidth="2.5" />
          <circle cx="750" cy="750" r="38" fill="#FBD706" stroke="#04093A" strokeWidth="4" />
          <text x="750" y="760" fontSize="32" textAnchor="middle" fill="#04093A" fontWeight="bold">
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
                {/* Ludo King Animated Pulsing Glow */}
                {hasMoveable && (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="48"
                    fill="none"
                    stroke="#FBD706"
                    strokeWidth="6"
                    className="animate-ping opacity-90"
                  />
                )}

                {/* Token Outer Rim */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="38"
                  fill={style.darkBg}
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  filter={hasMoveable ? 'url(#tokenGlow)' : undefined}
                />

                {/* Token Body */}
                <circle cx={centerX} cy={centerY} r="30" fill={style.bg} stroke="#04093A" strokeWidth="2" />

                {/* Token Crown / Core */}
                <circle cx={centerX} cy={centerY} r="15" fill="#FFFFFF" />
                <circle cx={centerX} cy={centerY} r="8" fill={style.darkBg} />

                {/* Stack Count Badge */}
                {items.length > 1 && (
                  <g>
                    <circle
                      cx={centerX + 26}
                      cy={centerY - 26}
                      r="17"
                      fill="#04093A"
                      stroke="#FBD706"
                      strokeWidth="2.5"
                    />
                    <text
                      x={centerX + 26}
                      y={centerY - 20}
                      fontSize="19"
                      textAnchor="middle"
                      fill="#FBD706"
                      fontWeight="black"
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

      {/* Ludo King Player Cards Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {state.players.map((p) => {
          const style = COLOR_STYLES[p.color];
          const isTurn = p.color === state.currentTurnColor;
          const homeCount = p.tokens.filter((t) => t.state === 'home').length;
          const trackCount = p.tokens.filter((t) => t.state === 'track' || t.state === 'home_path').length;
          const baseCount = p.tokens.filter((t) => t.state === 'base').length;

          return (
            <div
              key={p.color}
              className={`p-3 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-[#0c1f69] border-[#FBD706] ring-2 ring-[#FBD706]/50 shadow-xl'
                  : 'bg-[#08164B] border-[#162a7d] opacity-85'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-white flex items-center gap-1.5 capitalize text-xs">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: style.bg }}
                  />
                  {p.color}
                </span>
                {isTurn && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FBD706] text-[#04093A]">
                    TURN
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-bold">
                <div className="bg-[#04093A] p-1.5 rounded-xl border border-[#162a7d]/40">
                  <span className="text-[#9c9aa8] block text-[8px] uppercase">BASE</span>
                  <span className="text-white font-black">{baseCount}</span>
                </div>
                <div className="bg-[#04093A] p-1.5 rounded-xl border border-[#162a7d]/40">
                  <span className="text-[#9c9aa8] block text-[8px] uppercase">TRACK</span>
                  <span className="text-[#FBD706] font-black">{trackCount}</span>
                </div>
                <div className="bg-[#04093A] p-1.5 rounded-xl border border-[#162a7d]/40">
                  <span className="text-[#9c9aa8] block text-[8px] uppercase">HOME</span>
                  <span className="text-[#12A04A] font-black">{homeCount}/4</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LUDO KING CHAMPION VICTORY MODAL OVERLAY */}
      {state.status === 'completed' && state.winnerColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0c1f69] border-2 border-[#FBD706] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FBD706] to-[#FFE84A] mx-auto flex items-center justify-center text-[#04093A] shadow-2xl shadow-[#FBD706]/50">
              <Crown className="w-11 h-11" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-black tracking-widest text-[#FBD706]">
                Ludo King Champion
              </span>
              <h2 className="text-2xl font-black text-white capitalize">
                {state.winnerColor} Wins The Crown!
              </h2>
              <p className="text-xs text-[#c4bfd0]">
                All 4 tokens successfully entered Home. Congratulations!
              </p>
            </div>

            <button
              onClick={onResetGame}
              className="w-full py-3.5 rounded-2xl bg-[#FBD706] hover:bg-[#FFE84A] text-[#04093A] font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Match</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
