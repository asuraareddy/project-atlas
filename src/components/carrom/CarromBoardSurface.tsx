'use client';

import React, { memo } from 'react';
import type { CarromPocket } from '@/domain/games/carrom/types';
import { BOARD_SIZE, BOARD_PADDING } from '@/domain/games/carrom/physics';
import {
  BASELINE_MIN_X,
  BASELINE_MAX_X,
  BASELINE_BOTTOM_Y
} from '@/domain/games/carrom/engine';

/**
 * Static Carrom board artwork (wooden frame, plywood surface, four baselines,
 * base circles, diagonal arrows, centre circles and four corner pockets).
 *
 * Original SVG artwork drawn for Project Atlas, proportioned on standard
 * tournament board ratios and mapped onto the existing 800×800 physics
 * coordinate system (playing area 48..752). It is memoised so the 60fps
 * coin animation never re-renders these layers.
 */

const C = BOARD_SIZE / 2; // 400
const INK = '#3A2312';
const RED = '#C4182C';

// Baseline rails sit ±12 px either side of the striker line (engine baseline Y)
const RAIL_OFFSET = 12;
const BASE_CIRCLE_R = 12;

// Diagonal arrow (drawn for the top-left pocket, rotated for the other three)
const ARROW_START = 112;
const ARROW_END = 270;

interface CarromBoardSurfaceProps {
  pockets: CarromPocket[];
}

function SideMarkings() {
  const y = BASELINE_BOTTOM_Y;
  const s = ARROW_START;
  const e = ARROW_END;
  // Arrowhead pointing toward the pocket
  const head = 11;
  return (
    <g>
      {/* Double baseline rails */}
      <line x1={BASELINE_MIN_X} y1={y - RAIL_OFFSET} x2={BASELINE_MAX_X} y2={y - RAIL_OFFSET} stroke={INK} strokeWidth="2.2" />
      <line x1={BASELINE_MIN_X} y1={y + RAIL_OFFSET} x2={BASELINE_MAX_X} y2={y + RAIL_OFFSET} stroke={INK} strokeWidth="2.2" />
      {/* Red base circles at both ends */}
      {[BASELINE_MIN_X, BASELINE_MAX_X].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={y} r={BASE_CIRCLE_R} fill="#F6E3BE" stroke={INK} strokeWidth="2" />
          <circle cx={cx} cy={y} r={BASE_CIRCLE_R - 3.5} fill={RED} />
        </g>
      ))}

      {/* Diagonal arrow from the top-left pocket toward the centre */}
      <line x1={s} y1={s} x2={e} y2={e} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path
        d={`M ${s - 3} ${s - 3} L ${s - 3 + head} ${s - 3 + head * 0.25} M ${s - 3} ${s - 3} L ${s - 3 + head * 0.25} ${s - 3 + head}`}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Open arc capping the inner end of the arrow */}
      <path
        d={`M ${e + 13} ${e - 13} A 18.4 18.4 0 1 1 ${e - 13} ${e + 13}`}
        stroke={INK}
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
}

function CarromBoardSurfaceImpl({ pockets }: CarromBoardSurfaceProps) {
  const inner = BOARD_SIZE - BOARD_PADDING * 2; // 704

  return (
    <g pointerEvents="none">
      <defs>
        {/* Rosewood frame */}
        <linearGradient id="cbFrameWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B3418" />
          <stop offset="45%" stopColor="#4A220F" />
          <stop offset="100%" stopColor="#2E1407" />
        </linearGradient>
        <pattern id="cbGrainH" width="160" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 3 Q40 1 80 3.5 T160 3" stroke="rgba(0,0,0,0.22)" strokeWidth="1" fill="none" />
          <path d="M0 8.5 Q50 10 100 8 T160 8.5" stroke="rgba(255,214,170,0.08)" strokeWidth="1" fill="none" />
        </pattern>
        <pattern id="cbGrainV" width="160" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
          <path d="M0 3 Q40 1 80 3.5 T160 3" stroke="rgba(0,0,0,0.22)" strokeWidth="1" fill="none" />
          <path d="M0 8.5 Q50 10 100 8 T160 8.5" stroke="rgba(255,214,170,0.08)" strokeWidth="1" fill="none" />
        </pattern>

        {/* Light maple playing surface */}
        <linearGradient id="cbSurface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7E2B6" />
          <stop offset="50%" stopColor="#F1D49C" />
          <stop offset="100%" stopColor="#E8C384" />
        </linearGradient>
        <pattern id="cbSurfaceGrain" width="240" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 5 Q60 2 120 5 T240 5" stroke="rgba(150,96,40,0.10)" strokeWidth="1.2" fill="none" />
          <path d="M0 13 Q80 15 160 12.5 T240 13" stroke="rgba(150,96,40,0.07)" strokeWidth="1" fill="none" />
        </pattern>
        <radialGradient id="cbVignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(90,50,15,0.22)" />
        </radialGradient>

        {/* Pocket */}
        <radialGradient id="cbPocket" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="75%" stopColor="#0B0603" />
          <stop offset="100%" stopColor="#24130A" />
        </radialGradient>

        {/* Coin & striker bodies (used by the dynamic coin layer) */}
        <radialGradient id="cbCoinWhite" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="100%" stopColor="#E6D6B2" />
        </radialGradient>
        <radialGradient id="cbCoinBlack" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#4A3426" />
          <stop offset="100%" stopColor="#120B07" />
        </radialGradient>
        <radialGradient id="cbCoinQueen" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FF5A66" />
          <stop offset="100%" stopColor="#A50F1C" />
        </radialGradient>
        <radialGradient id="cbStriker" cx="38%" cy="35%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D9D2F5" />
        </radialGradient>
      </defs>

      {/* 1. WOODEN FRAME */}
      <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_SIZE} rx="26" fill="url(#cbFrameWood)" />
      <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_PADDING} fill="url(#cbGrainH)" />
      <rect x="0" y={BOARD_SIZE - BOARD_PADDING} width={BOARD_SIZE} height={BOARD_PADDING} fill="url(#cbGrainH)" />
      <rect x="0" y="0" width={BOARD_PADDING} height={BOARD_SIZE} fill="url(#cbGrainV)" />
      <rect x={BOARD_SIZE - BOARD_PADDING} y="0" width={BOARD_PADDING} height={BOARD_SIZE} fill="url(#cbGrainV)" />
      <rect x="3" y="3" width={BOARD_SIZE - 6} height={BOARD_SIZE - 6} rx="24" fill="none" stroke="rgba(255,220,180,0.14)" strokeWidth="2" />
      <rect x={BOARD_PADDING - 7} y={BOARD_PADDING - 7} width={inner + 14} height={inner + 14} rx="6" fill="none" stroke="#1E0D04" strokeWidth="5" />

      {/* 2. PLAYING SURFACE */}
      <rect x={BOARD_PADDING} y={BOARD_PADDING} width={inner} height={inner} fill="url(#cbSurface)" />
      <rect x={BOARD_PADDING} y={BOARD_PADDING} width={inner} height={inner} fill="url(#cbSurfaceGrain)" />
      <rect x={BOARD_PADDING} y={BOARD_PADDING} width={inner} height={inner} fill="url(#cbVignette)" />
      <rect x={BOARD_PADDING + 1.5} y={BOARD_PADDING + 1.5} width={inner - 3} height={inner - 3} fill="none" stroke="rgba(70,35,10,0.35)" strokeWidth="3" />

      {/* 3. FOUR BASELINES, BASE CIRCLES & DIAGONAL ARROWS */}
      {[0, 90, 180, 270].map((deg) => (
        <g key={`side_${deg}`} transform={`rotate(${deg} ${C} ${C})`}>
          <SideMarkings />
        </g>
      ))}

      {/* 4. CENTRE CIRCLES & ROSETTE */}
      <circle cx={C} cy={C} r="92" fill="none" stroke={INK} strokeWidth="2.2" />
      <circle cx={C} cy={C} r="86" fill="none" stroke={INK} strokeWidth="1" opacity="0.7" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const tip = { x: C + Math.cos(a) * 80, y: C + Math.sin(a) * 80 };
        const l = { x: C + Math.cos(a - 0.32) * 40, y: C + Math.sin(a - 0.32) * 40 };
        const r = { x: C + Math.cos(a + 0.32) * 40, y: C + Math.sin(a + 0.32) * 40 };
        const base = { x: C + Math.cos(a) * 20, y: C + Math.sin(a) * 20 };
        return (
          <path
            key={`petal_${i}`}
            d={`M ${base.x} ${base.y} Q ${l.x} ${l.y} ${tip.x} ${tip.y} Q ${r.x} ${r.y} ${base.x} ${base.y} Z`}
            fill={i % 2 === 0 ? RED : INK}
            fillOpacity="0.10"
            stroke={i % 2 === 0 ? RED : INK}
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
        );
      })}
      <circle cx={C} cy={C} r="17" fill="none" stroke={INK} strokeWidth="2" />
      <circle cx={C} cy={C} r="13" fill={RED} opacity="0.9" />

      {/* 5. FOUR CORNER POCKETS (positions/radii from the engine) */}
      {pockets.map((p) => (
        <g key={`pocket_${p.id}`}>
          <circle cx={p.x} cy={p.y} r={p.radius + 5} fill="#1A0C04" />
          <circle cx={p.x} cy={p.y} r={p.radius} fill="url(#cbPocket)" />
          <circle cx={p.x} cy={p.y} r={p.radius * 0.7} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx={p.x} cy={p.y} r={p.radius * 0.4} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx={p.x} cy={p.y} r={p.radius + 5} fill="none" stroke="rgba(255,210,160,0.18)" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

const CarromBoardSurface = memo(CarromBoardSurfaceImpl);
export default CarromBoardSurface;
