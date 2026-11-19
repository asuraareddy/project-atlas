'use client';

import React, { memo } from 'react';
import { POOL_TABLE_CONFIG, POOL_POCKETS } from '@/domain/games/pool/physics';

interface PoolTableSurfaceProps {
  clothColor?: 'green' | 'blue';
}

/**
 * 8-Ball Pool Pro - Vector SVG Pool Table Surface
 * High-definition tournament table artwork:
 * - Handcrafted mahogany wooden frame with gold corner castings
 * - Pearl inlaid diamond sights on all four rails
 * - Cushioned rail bumpers with corner angles
 * - Worsted felt cloth with subtle radial illumination
 * - Head string, head spot, center spot, and foot spot markings
 * - 6 recessed leather drop pockets
 *
 * Proportioned strictly to regulation 2:1 playing surface.
 * Memoized to isolate 60fps ball animation from static vector redraws.
 */
function PoolTableSurfaceComponent({ clothColor = 'green' }: PoolTableSurfaceProps) {
  const isBlue = clothColor === 'blue';

  const feltPrimary = isBlue ? '#1e40af' : '#15803d';
  const feltSecondary = isBlue ? '#172554' : '#14532d';
  const feltHighlight = isBlue ? '#2563eb' : '#16a34a';

  const railColor = isBlue ? '#1d4ed8' : '#166534';
  const railShadow = isBlue ? '#1e3a8a' : '#0f3d21';

  return (
    <g id="pool-table-surface" pointerEvents="none">
      <defs>
        {/* Wood frame gradient */}
        <linearGradient id="pool-wood-frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d1d11" />
          <stop offset="35%" stopColor="#251009" />
          <stop offset="70%" stopColor="#3d1d11" />
          <stop offset="100%" stopColor="#1a0a05" />
        </linearGradient>

        {/* Felt radial spotlight */}
        <radialGradient id="pool-felt-gradient" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={feltHighlight} stopOpacity="0.9" />
          <stop offset="55%" stopColor={feltPrimary} />
          <stop offset="100%" stopColor={feltSecondary} />
        </radialGradient>

        {/* Metallic gold casting */}
        <linearGradient id="pool-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#ca8a04" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Pocket deep drop shadow */}
        <radialGradient id="pool-pocket-depth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#050505" />
          <stop offset="75%" stopColor="#121212" />
          <stop offset="100%" stopColor="#27272a" />
        </radialGradient>

        {/* Soft shadow filter */}
        <filter id="table-drop-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* 1. Outer Wooden Cabinet Frame */}
      <rect
        x="-38"
        y="-38"
        width="1076"
        height="576"
        rx="26"
        fill="url(#pool-wood-frame)"
        stroke="#1a0a05"
        strokeWidth="4"
        filter="url(#table-drop-shadow)"
      />

      {/* Wood rim inner bevel */}
      <rect
        x="-32"
        y="-32"
        width="1064"
        height="564"
        rx="22"
        fill="none"
        stroke="#5a2d18"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* 2. Playing Surface Felt Cloth */}
      <rect
        x="44"
        y="44"
        width="912"
        height="412"
        fill="url(#pool-felt-gradient)"
      />

      {/* 3. Cushion Rail Bumpers with 3D Bevels */}
      {/* Top Rails */}
      <polygon points="76,44 470,44 460,20 86,20" fill={railColor} />
      <polygon points="530,44 924,44 914,20 540,20" fill={railColor} />
      <line x1="76" y1="44" x2="470" y2="44" stroke={railShadow} strokeWidth="3" />
      <line x1="530" y1="44" x2="924" y2="44" stroke={railShadow} strokeWidth="3" />

      {/* Bottom Rails */}
      <polygon points="76,456 470,456 460,480 86,480" fill={railColor} />
      <polygon points="530,456 924,456 914,480 540,480" fill={railColor} />
      <line x1="76" y1="456" x2="470" y2="456" stroke={railShadow} strokeWidth="3" />
      <line x1="530" y1="456" x2="924" y2="456" stroke={railShadow} strokeWidth="3" />

      {/* Left Rail */}
      <polygon points="44,76 44,424 20,414 20,86" fill={railColor} />
      <line x1="44" y1="76" x2="44" y2="424" stroke={railShadow} strokeWidth="3" />

      {/* Right Rail */}
      <polygon points="956,76 956,424 980,414 980,86" fill={railColor} />
      <line x1="956" y1="76" x2="956" y2="424" stroke={railShadow} strokeWidth="3" />

      {/* 4. Table Markings */}
      {/* Head String Chalk Line */}
      <line
        x1={POOL_TABLE_CONFIG.headStringX}
        y1="44"
        x2={POOL_TABLE_CONFIG.headStringX}
        y2="456"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.35"
      />

      {/* Head Spot */}
      <circle
        cx={POOL_TABLE_CONFIG.headStringX}
        cy={POOL_TABLE_CONFIG.centerSpotY}
        r="3"
        fill="#ffffff"
        opacity="0.5"
      />

      {/* Center Spot */}
      <circle
        cx="500"
        cy={POOL_TABLE_CONFIG.centerSpotY}
        r="3"
        fill="#ffffff"
        opacity="0.4"
      />

      {/* Foot Spot (Rack Apex/Center) */}
      <circle
        cx={POOL_TABLE_CONFIG.footSpotX}
        cy={POOL_TABLE_CONFIG.centerSpotY}
        r="3.5"
        fill="#ffffff"
        opacity="0.5"
      />

      {/* 5. Rail Sights (Inlaid Pearl Diamonds) */}
      {/* Top Rail Sights */}
      {[175, 275, 375, 625, 725, 825].map((x, i) => (
        <circle key={`sight-top-${i}`} cx={x} cy="-10" r="3.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      ))}
      {/* Bottom Rail Sights */}
      {[175, 275, 375, 625, 725, 825].map((x, i) => (
        <circle key={`sight-bot-${i}`} cx={x} cy="510" r="3.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      ))}
      {/* Left Rail Sights */}
      {[145, 250, 355].map((y, i) => (
        <circle key={`sight-left-${i}`} cx="-10" cy={y} r="3.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      ))}
      {/* Right Rail Sights */}
      {[145, 250, 355].map((y, i) => (
        <circle key={`sight-right-${i}`} cx="1010" cy={y} r="3.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      ))}

      {/* 6. Gold Corner & Side Pocket Castings */}
      {/* Corner Top-Left */}
      <path d="M -30,-30 L 15,-30 L 15,-10 L -10,15 L -30,15 Z" fill="url(#pool-gold-metal)" />
      {/* Corner Top-Right */}
      <path d="M 1030,-30 L 985,-30 L 985,-10 L 1010,15 L 1030,15 Z" fill="url(#pool-gold-metal)" />
      {/* Corner Bottom-Left */}
      <path d="M -30,530 L 15,530 L 15,510 L -10,485 L -30,485 Z" fill="url(#pool-gold-metal)" />
      {/* Corner Bottom-Right */}
      <path d="M 1030,530 L 985,530 L 985,510 L 1010,485 L 1030,485 Z" fill="url(#pool-gold-metal)" />

      {/* Side Pocket Castings */}
      <rect x="475" y="-34" width="50" height="20" rx="4" fill="url(#pool-gold-metal)" />
      <rect x="475" y="514" width="50" height="20" rx="4" fill="url(#pool-gold-metal)" />

      {/* 7. Six Pocket Drop Openings */}
      {POOL_POCKETS.map((pocket) => (
        <g key={`pocket-${pocket.id}`}>
          {/* Pocket Outer Leather Rim */}
          <circle
            cx={pocket.x}
            cy={pocket.y}
            r={pocket.radius + 3}
            fill="#1c1917"
            stroke="#44403c"
            strokeWidth="2"
          />
          {/* Deep Drop Cavity */}
          <circle
            cx={pocket.x}
            cy={pocket.y}
            r={pocket.radius}
            fill="url(#pool-pocket-depth)"
          />
          {/* Inner Shadow Arc */}
          <circle
            cx={pocket.x}
            cy={pocket.y}
            r={pocket.dropRadius}
            fill="#09090b"
            opacity="0.95"
          />
        </g>
      ))}
    </g>
  );
}

export const PoolTableSurface = memo(PoolTableSurfaceComponent);
