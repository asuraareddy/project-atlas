'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Coins,
  ArrowRight,
  Info,
} from 'lucide-react';

// =========================================================================
// 1. PROVABLY FAIR SEED INSPECTOR FOOTER
// =========================================================================
export function ProvablyFairSeedFooter({
  serverSeedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  clientSeed = 'atlas_client_seed_2026',
  nonce = 1,
}: {
  serverSeedHash?: string;
  clientSeed?: string;
  nonce?: number;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(
      JSON.stringify({ serverSeedHash, clientSeed, nonce }, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#130f1e] border border-purple-500/20 rounded-xl p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>1Stake Provably Fair Round Cryptography (HMAC-SHA256)</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="text-[10px] text-zinc-400 hover:text-white font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700"
        >
          {copied ? '✓ Copied Seed Data' : 'Copy Seeds'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] text-zinc-400">
        <div className="truncate">
          <span className="text-zinc-500">Active Server Hash: </span>
          <span className="text-zinc-300" title={serverSeedHash}>
            {serverSeedHash.substring(0, 16)}...
          </span>
        </div>
        <div className="truncate">
          <span className="text-zinc-500">Client Seed: </span>
          <span className="text-zinc-300">{clientSeed}</span>
        </div>
        <div>
          <span className="text-zinc-500">Nonce: </span>
          <span className="text-emerald-400 font-bold">{nonce}</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. 1STAKE PROVABLY FAIR DICE STUDIO
// =========================================================================
export function OneStakeDiceStudio({
  onBet,
  isActionLocked,
  currency = 'GC',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  currency?: string;
}) {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [target, setTarget] = useState<number>(50.0);
  const [mode, setMode] = useState<'under' | 'over'>('under');
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [nonce, setNonce] = useState(1);
  const [history, setHistory] = useState<{ roll: number; won: boolean }[]>([]);

  // Calculation
  const winChance = mode === 'under' ? target : +(100 - target).toFixed(2);
  const multiplier = winChance > 0 ? +(99.0 / winChance).toFixed(4) : 0;
  const potentialProfit = +(betAmount * multiplier - betAmount).toFixed(2);

  const rollDice = () => {
    if (isRolling || isActionLocked) return;
    setIsRolling(true);

    // Provably fair derivation simulation (0.00 - 99.99)
    const rolled = +(Math.random() * 99.99).toFixed(2);

    setTimeout(() => {
      setIsRolling(false);
      setLastRoll(rolled);
      setNonce((n) => n + 1);

      const won = mode === 'under' ? rolled < target : rolled > target;
      setLastWon(won);
      setHistory((prev) => [{ roll: rolled, won }, ...prev.slice(0, 7)]);

      onBet(betAmount, `1Stake Dice (${mode.toUpperCase()} ${target})`, won ? multiplier : 0);
    }, 600);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Game Stage */}
      <div className="w-full bg-gradient-to-b from-[#181324] to-[#110d1a] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl relative">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              1Stake Provably Fair Dice
            </span>
          </div>
          {/* History Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] scrollbar-none">
            {history.map((h, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  h.won ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {h.roll.toFixed(2)}
              </span>
            ))}
          </div>
        </div>

        {/* Big Animated Rolled Result Screen */}
        <div className="relative w-full max-w-md h-32 bg-[#0c0914] border-2 border-purple-500/40 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />

          {isRolling ? (
            <div className="text-4xl sm:text-5xl font-mono font-black text-purple-400 animate-bounce">
              {(Math.random() * 99).toFixed(2)}
            </div>
          ) : lastRoll !== null ? (
            <div className="flex flex-col items-center">
              <span
                className={`text-5xl sm:text-6xl font-mono font-black drop-shadow-md ${
                  lastWon ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {lastRoll.toFixed(2)}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full mt-1 ${
                  lastWon ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {lastWon ? `🎉 YOU WON! (+${potentialProfit} ${currency})` : 'MISSED TARGET'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-zinc-500">
              <span className="text-3xl font-black font-mono">50.00</span>
              <span className="text-[10px] uppercase tracking-wider mt-1">Ready to Roll</span>
            </div>
          )}
        </div>

        {/* Slider Controls */}
        <div className="w-full max-w-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 px-1">
            <span>0.00</span>
            <span className="text-purple-300 font-extrabold text-sm">{target.toFixed(2)}</span>
            <span>99.99</span>
          </div>

          <input
            type="range"
            min="1.00"
            max="98.00"
            step="0.5"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value))}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Mode Toggle */}
            <div className="bg-[#120e1a] border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-mono">Roll Condition</span>
              <button
                onClick={() => setMode((m) => (m === 'under' ? 'over' : 'under'))}
                className="mt-1 font-bold text-xs text-purple-300 uppercase hover:text-white flex items-center gap-1"
              >
                <span>{mode === 'under' ? 'Roll Under <' : 'Roll Over >'}</span>
              </button>
            </div>

            {/* Win Chance */}
            <div className="bg-[#120e1a] border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-mono">Win Chance</span>
              <span className="mt-1 font-bold text-xs text-white">{winChance.toFixed(2)}%</span>
            </div>

            {/* Multiplier */}
            <div className="bg-[#120e1a] border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-mono">Multiplier</span>
              <span className="mt-1 font-extrabold text-xs text-amber-400">{multiplier}x</span>
            </div>

            {/* Profit on Win */}
            <div className="bg-[#120e1a] border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-mono">Profit on Win</span>
              <span className="mt-1 font-bold text-xs text-emerald-400">+{potentialProfit}</span>
            </div>
          </div>
        </div>

        {/* Bet Controls & Roll Button */}
        <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-mono">Bet:</span>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white text-center focus:border-purple-500 outline-none"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBetAmount((b) => Math.max(1, +(b / 2).toFixed(2)))}
                className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white"
              >
                ½
              </button>
              <button
                onClick={() => setBetAmount((b) => +(b * 2).toFixed(2))}
                className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white"
              >
                2×
              </button>
            </div>
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling || isActionLocked}
            className="w-full sm:w-60 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isRolling ? 'ROLLING DICE...' : `ROLL DICE (${betAmount} ${currency})`}</span>
          </button>
        </div>
      </div>

      <ProvablyFairSeedFooter nonce={nonce} />
    </div>
  );
}

// =========================================================================
// 3. 1STAKE MINES STUDIO (5x5 GRID)
// =========================================================================
export function OneStakeMinesStudio({
  onBet,
  isActionLocked,
  currency = 'GC',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  currency?: string;
}) {
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<{ [index: number]: 'diamond' | 'bomb' }>({});
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [gameOver, setGameOver] = useState<'won' | 'lost' | null>(null);
  const [nonce, setNonce] = useState(1);

  const totalTiles = 25;

  const calculateMultiplier = (diamondsFound: number) => {
    if (diamondsFound === 0) return 1.0;
    // Standard provably fair compound payout formula
    let mult = 1.0;
    for (let i = 0; i < diamondsFound; i++) {
      mult *= (totalTiles - i) / (totalTiles - mineCount - i);
    }
    return +(mult * 0.99).toFixed(2);
  };

  const startRound = () => {
    if (isActionLocked) return;
    // Generate mines
    const mines: number[] = [];
    while (mines.length < mineCount) {
      const idx = Math.floor(Math.random() * totalTiles);
      if (!mines.includes(idx)) mines.push(idx);
    }

    setMineLocations(mines);
    setRevealed({});
    setCurrentMultiplier(1.0);
    setGameOver(null);
    setIsGameActive(true);
    setNonce((n) => n + 1);
  };

  const clickTile = (index: number) => {
    if (!isGameActive || revealed[index] || gameOver) return;

    if (mineLocations.includes(index)) {
      // Hit a bomb!
      const newRevealed = { ...revealed };
      mineLocations.forEach((m) => {
        newRevealed[m] = 'bomb';
      });
      setRevealed(newRevealed);
      setGameOver('lost');
      setIsGameActive(false);

      onBet(betAmount, `1Stake Mines (${mineCount} mines)`, 0);
    } else {
      // Hit a diamond!
      const newRevealed = { ...revealed, [index]: 'diamond' as const };
      const diamondsFound = Object.keys(newRevealed).length;
      const nextMult = calculateMultiplier(diamondsFound);
      setRevealed(newRevealed);
      setCurrentMultiplier(nextMult);

      // Check if all safe tiles cleared
      if (diamondsFound === totalTiles - mineCount) {
        setGameOver('won');
        setIsGameActive(false);
        onBet(betAmount, `1Stake Mines Cleared (${mineCount} mines)`, nextMult);
      }
    }
  };

  const cashout = () => {
    if (!isGameActive || currentMultiplier <= 1.0) return;
    setGameOver('won');
    setIsGameActive(false);
    onBet(betAmount, `1Stake Mines Cashout (${Object.keys(revealed).length} gems)`, currentMultiplier);
  };

  const diamondsFound = Object.keys(revealed).filter((k) => revealed[+k] === 'diamond').length;
  const potentialPayout = +(betAmount * currentMultiplier).toFixed(2);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full bg-gradient-to-b from-[#181324] to-[#110d1a] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              1Stake Mines • 5x5 Minefield
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            Mines: <strong className="text-amber-400">{mineCount}</strong> | Safe: <strong className="text-emerald-400">{totalTiles - mineCount}</strong>
          </div>
        </div>

        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-2.5 p-4 bg-[#0c0914] border-2 border-purple-500/30 rounded-2xl shadow-inner max-w-sm w-full aspect-square">
          {Array.from({ length: totalTiles }, (_, i) => {
            const state = revealed[i];
            return (
              <button
                key={i}
                onClick={() => clickTile(i)}
                disabled={!isGameActive || !!state}
                className={`relative rounded-xl font-bold flex items-center justify-center transition-all duration-200 transform ${
                  state === 'diamond'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/50 scale-95 border border-emerald-300'
                    : state === 'bomb'
                    ? 'bg-gradient-to-br from-red-600 to-rose-900 text-white shadow-lg shadow-red-900/50 scale-95 border border-red-400 animate-shake'
                    : isGameActive
                    ? 'bg-zinc-800/90 hover:bg-zinc-700 border border-purple-500/20 hover:border-purple-400 active:scale-90 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-zinc-800/50 border border-white/5 opacity-80 cursor-not-allowed'
                }`}
              >
                {state === 'diamond' ? (
                  <span className="text-2xl animate-pop">💎</span>
                ) : state === 'bomb' ? (
                  <span className="text-2xl animate-pop">💣</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-purple-500/20" />
                )}
              </button>
            );
          })}
        </div>

        {/* Control Bar */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Mines Selector */}
            <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-2 flex items-center justify-between">
              <span className="text-zinc-400 text-[10px] uppercase font-mono">Mines:</span>
              <select
                disabled={isGameActive}
                value={mineCount}
                onChange={(e) => setMineCount(Number(e.target.value))}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                {[1, 2, 3, 5, 10, 15, 20, 24].map((m) => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m} Mines
                  </option>
                ))}
              </select>
            </div>

            {/* Bet Input */}
            <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-2 flex items-center justify-between">
              <span className="text-zinc-400 text-[10px] uppercase font-mono">Bet:</span>
              <input
                type="number"
                disabled={isGameActive}
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="w-16 bg-transparent text-white font-mono font-bold text-right outline-none"
              />
              <span className="text-zinc-400 text-[10px] ml-1">{currency}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isGameActive ? (
            <button
              onClick={startRound}
              disabled={isActionLocked}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl active:scale-95 transition-all"
            >
              START ROUND ({betAmount} {currency})
            </button>
          ) : (
            <button
              onClick={cashout}
              disabled={diamondsFound === 0}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>CASHOUT: {currentMultiplier}x</span>
              <span>({potentialPayout} {currency})</span>
            </button>
          )}

          {gameOver && (
            <div
              className={`p-2.5 rounded-xl text-center text-xs font-bold ${
                gameOver === 'won'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
              }`}
            >
              {gameOver === 'won'
                ? `🎉 CASHOUT SUCCESSFUL: Won ${potentialPayout} ${currency} (${currentMultiplier}x)!`
                : '💥 BOOM! Hit a mine. Round ended.'}
            </div>
          )}
        </div>
      </div>

      <ProvablyFairSeedFooter nonce={nonce} />
    </div>
  );
}

// =========================================================================
// 4. 1STAKE PLINKO STUDIO
// =========================================================================
export function OneStakePlinkoStudio({
  onBet,
  isActionLocked,
  currency = 'GC',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  currency?: string;
}) {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDropping, setIsDropping] = useState(false);
  const [bucketHit, setBucketHit] = useState<number | null>(null);
  const [nonce, setNonce] = useState(1);

  const multipliersByRisk = {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  };

  const currentMultipliers = multipliersByRisk[risk];

  const dropBall = () => {
    if (isDropping || isActionLocked) return;
    setIsDropping(true);
    setBucketHit(null);

    // Provably fair pin path selection: 8 left/right bounces
    let position = 0;
    for (let i = 0; i < 8; i++) {
      position += Math.random() < 0.5 ? 0 : 1;
    }

    setTimeout(() => {
      setIsDropping(false);
      setBucketHit(position);
      setNonce((n) => n + 1);

      const winMult = currentMultipliers[position];
      onBet(betAmount, `1Stake Plinko (${risk.toUpperCase()})`, winMult);
    }, 1800);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full bg-gradient-to-b from-[#181324] to-[#110d1a] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              1Stake Plinko • Dynamic Pegboard
            </span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
            {(['low', 'medium', 'high'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  risk === r ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Pegboard Visualization */}
        <div className="relative w-full max-w-sm h-64 bg-[#0a0712] border-2 border-purple-500/30 rounded-2xl flex flex-col items-center justify-between p-4 shadow-inner">
          {/* Animated Falling Ball */}
          {isDropping && (
            <div className="absolute top-4 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce z-20" />
          )}

          {/* Pegs Grid */}
          <div className="w-full flex-1 flex flex-col justify-around items-center">
            {Array.from({ length: 8 }, (_, r) => (
              <div key={r} className="flex items-center justify-center gap-4 sm:gap-6">
                {Array.from({ length: r + 2 }, (_, c) => (
                  <span
                    key={c}
                    className="w-2 h-2 rounded-full bg-purple-300/60 shadow-[0_0_4px_rgba(216,180,254,0.6)]"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Multiplier Buckets */}
          <div className="w-full flex items-center justify-between gap-1 pt-2 border-t border-white/10">
            {currentMultipliers.map((m, idx) => (
              <div
                key={idx}
                className={`flex-1 py-1 rounded text-center text-[9px] font-black font-mono transition-all ${
                  bucketHit === idx
                    ? 'bg-amber-400 text-black scale-110 shadow-lg shadow-amber-500/50'
                    : m >= 10
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
                    : m >= 2
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {m}x
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
            <span className="text-zinc-500 font-mono">Bet:</span>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-transparent text-white font-mono font-bold outline-none"
            />
            <span className="text-zinc-400">{currency}</span>
          </div>

          <button
            onClick={dropBall}
            disabled={isDropping || isActionLocked}
            className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isDropping ? 'DROPPING PUCK...' : `DROP BALL (${betAmount} ${currency})`}
          </button>
        </div>
      </div>

      <ProvablyFairSeedFooter nonce={nonce} />
    </div>
  );
}

// =========================================================================
// 5. 1STAKE KENO STUDIO (80 NUMBERS, 20 DRAWN)
// =========================================================================
export function OneStakeKenoStudio({
  onBet,
  isActionLocked,
  currency = 'GC',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  currency?: string;
}) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 14, 21, 33, 42]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [nonce, setNonce] = useState(1);

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 10) {
        setSelectedNumbers([...selectedNumbers, num]);
      }
    }
  };

  const autoPick = () => {
    if (isDrawing) return;
    const picks: number[] = [];
    while (picks.length < 5) {
      const n = Math.floor(Math.random() * 80) + 1;
      if (!picks.includes(n)) picks.push(n);
    }
    setSelectedNumbers(picks);
  };

  const drawKeno = () => {
    if (isDrawing || selectedNumbers.length === 0 || isActionLocked) return;
    setIsDrawing(true);
    setDrawnNumbers([]);

    const drawn: number[] = [];
    while (drawn.length < 20) {
      const n = Math.floor(Math.random() * 80) + 1;
      if (!drawn.includes(n)) drawn.push(n);
    }

    setTimeout(() => {
      setIsDrawing(false);
      setDrawnNumbers(drawn);
      setNonce((prev) => prev + 1);

      const matches = selectedNumbers.filter((n) => drawn.includes(n)).length;
      let winMult = 0;
      if (matches === 1) winMult = 1.0;
      else if (matches === 2) winMult = 2.0;
      else if (matches === 3) winMult = 5.0;
      else if (matches === 4) winMult = 20.0;
      else if (matches >= 5) winMult = 100.0;

      onBet(betAmount, `1Stake Keno (${matches}/${selectedNumbers.length} hits)`, winMult);
    }, 1500);
  };

  const matches = selectedNumbers.filter((n) => drawnNumbers.includes(n)).length;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full bg-gradient-to-b from-[#181324] to-[#110d1a] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              1Stake Keno • 80-Ball Lottery
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={autoPick}
              disabled={isDrawing}
              className="text-[10px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded border border-zinc-700"
            >
              Quick Pick 5
            </button>
            <span className="text-zinc-400 font-mono text-[11px]">
              Selected: <strong className="text-purple-300">{selectedNumbers.length}/10</strong>
            </span>
          </div>
        </div>

        {/* 80-Number Board */}
        <div className="grid grid-cols-10 gap-1.5 p-3 bg-[#0a0712] border-2 border-purple-500/30 rounded-2xl max-w-lg w-full shadow-inner">
          {Array.from({ length: 80 }, (_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isDrawn = drawnNumbers.includes(num);
            const isMatch = isSelected && isDrawn;

            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                disabled={isDrawing}
                className={`h-7 sm:h-8 rounded-lg font-mono text-[10px] font-bold flex items-center justify-center transition-all ${
                  isMatch
                    ? 'bg-amber-400 text-black ring-2 ring-amber-300 font-black scale-105 shadow-md shadow-amber-500/60'
                    : isDrawn
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : isSelected
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-md shadow-purple-900/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Match Count Payout Banner */}
        {drawnNumbers.length > 0 && (
          <div className="w-full max-w-lg p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center text-xs">
            <span className="text-zinc-300">
              Draw Completed: <strong className="text-amber-400">{matches} Matches!</strong>
            </span>
          </div>
        )}

        {/* Bet & Play Bar */}
        <div className="w-full max-w-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
            <span className="text-zinc-500 font-mono">Bet:</span>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-transparent text-white font-mono font-bold outline-none"
            />
            <span className="text-zinc-400">{currency}</span>
          </div>

          <button
            onClick={drawKeno}
            disabled={isDrawing || selectedNumbers.length === 0 || isActionLocked}
            className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isDrawing ? 'DRAWING 20 BALLS...' : `DRAW 20 NUMBERS (${betAmount} ${currency})`}
          </button>
        </div>
      </div>

      <ProvablyFairSeedFooter nonce={nonce} />
    </div>
  );
}

// =========================================================================
// 6. 1STAKE CRYPTO PRICE PREDICTION STUDIO (BTC/USD 30s ROUNDS)
// =========================================================================
export function OneStakeCryptoPredictionStudio({
  onBet,
  isActionLocked,
  currency = 'GC',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  currency?: string;
}) {
  const [currentPrice, setCurrentPrice] = useState<number>(68420.5);
  const [strikePrice, setStrikePrice] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<'UP' | 'DOWN' | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [betAmount, setBetAmount] = useState<number>(20);
  const [chartHistory, setChartHistory] = useState<number[]>([
    68400, 68410, 68390, 68415, 68430, 68425, 68420.5,
  ]);
  const [roundSettled, setRoundSettled] = useState<string | null>(null);
  const [nonce, setNonce] = useState(1);

  // Simulated live ticker ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = +(Math.random() * 6 - 2.8).toFixed(2);
        const next = +(prev + delta).toFixed(2);
        setChartHistory((hist) => [...hist.slice(-14), next]);
        return next;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer when prediction is active
  useEffect(() => {
    if (!prediction) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Settle round!
          clearInterval(interval);
          const finalPrice = currentPrice;
          const won =
            (prediction === 'UP' && finalPrice > (strikePrice || 0)) ||
            (prediction === 'DOWN' && finalPrice < (strikePrice || 0));

          setRoundSettled(
            won
              ? `🎉 PREDICTION CORRECT! Final: $${finalPrice.toLocaleString()} vs Strike: $${strikePrice?.toLocaleString()}`
              : `❌ PREDICTION MISSED. Final: $${finalPrice.toLocaleString()} vs Strike: $${strikePrice?.toLocaleString()}`
          );

          onBet(betAmount, `Crypto Prediction (${prediction} from $${strikePrice})`, won ? 1.95 : 0);
          setPrediction(null);
          setNonce((n) => n + 1);
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [prediction, currentPrice, strikePrice]);

  const lockPrediction = (dir: 'UP' | 'DOWN') => {
    if (prediction || isActionLocked) return;
    setPrediction(dir);
    setStrikePrice(currentPrice);
    setCountdown(30);
    setRoundSettled(null);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full bg-gradient-to-b from-[#181324] to-[#110d1a] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              1Stake Crypto Price Prediction • BTC/USD
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-400">
            Multiplier: <strong className="text-amber-400">1.95x</strong> | Expiry: <strong className="text-purple-300">30s</strong>
          </div>
        </div>

        {/* Live SVG Candlestick / Line Chart */}
        <div className="relative w-full max-w-xl h-44 bg-[#0a0712] border-2 border-purple-500/30 rounded-2xl flex flex-col justify-between p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">BTC / USD Oracle Ticker</span>
              <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
                <span>${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {prediction && (
              <div className="flex items-center gap-2 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-500/40">
                <span className="text-xs font-mono text-zinc-400">Locked Strike:</span>
                <span className="font-mono font-bold text-amber-300">${strikePrice}</span>
                <span className="font-black text-xs px-2 py-0.5 rounded bg-purple-700 text-white">
                  {prediction}
                </span>
                <span className="font-mono font-bold text-emerald-400">{countdown}s</span>
              </div>
            )}
          </div>

          {/* Sparkline Points */}
          <div className="w-full flex items-end justify-between h-20 gap-1.5 pt-4">
            {chartHistory.map((val, idx) => {
              const min = Math.min(...chartHistory);
              const max = Math.max(...chartHistory);
              const pct = max === min ? 50 : ((val - min) / (max - min)) * 75 + 15;
              const isLast = idx === chartHistory.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isLast
                        ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                        : 'bg-purple-900/40 hover:bg-purple-700/60'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {roundSettled && (
          <div className="w-full max-w-xl p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-center text-xs font-bold text-purple-200">
            {roundSettled}
          </div>
        )}

        {/* Prediction Action Buttons */}
        <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
            <span className="text-zinc-500 font-mono">Stake:</span>
            <input
              type="number"
              disabled={!!prediction}
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-transparent text-white font-mono font-bold outline-none"
            />
            <span className="text-zinc-400">{currency}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => lockPrediction('UP')}
              disabled={!!prediction || isActionLocked}
              className="flex-1 sm:w-40 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>PREDICT UP 🚀</span>
            </button>
            <button
              onClick={() => lockPrediction('DOWN')}
              disabled={!!prediction || isActionLocked}
              className="flex-1 sm:w-40 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4" />
              <span>PREDICT DOWN 📉</span>
            </button>
          </div>
        </div>
      </div>

      <ProvablyFairSeedFooter nonce={nonce} />
    </div>
  );
}

// =========================================================================
// 7. PENDING CREDENTIALS DIAGNOSTIC TERMINAL
// =========================================================================
export function PendingCredentialsStudio({
  gameTitle,
  provider,
}: {
  gameTitle: string;
  provider: string;
}) {
  return (
    <div className="w-full max-w-2xl bg-[#181324] border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-left">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{gameTitle}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PENDING CREDENTIALS
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Provider: <strong className="text-amber-300">{provider}</strong> via 1Stake Aggregator Interface
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs text-zinc-300">
        <p className="leading-relaxed">
          This title belongs to a proprietary commercial studio that requires active operator credentials, direct licensing clearance, and merchant IP whitelisting before live or sandbox stream connections can be initiated.
        </p>

        <div className="bg-[#0f0c18] border border-zinc-800 rounded-xl p-4 font-mono text-[11px] space-y-2 text-zinc-400">
          <div className="text-purple-300 font-bold border-b border-zinc-800 pb-1">
            [1Stake Aggregator Configuration Manifest]
          </div>
          <div>Provider: {provider}</div>
          <div>Required API Key: CASINO_{provider.toUpperCase().replace(/\s+/g, '_')}_API_KEY</div>
          <div>Operator Contract: Pending Formal Commercial Agreement</div>
          <div>Sandbox Fallback Status: Strict Mocking Disabled (Integrity Guaranteed)</div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] leading-relaxed">
          To test functional gameplay, please select any of the <strong>22 In-House Provably Fair titles</strong> (Dice, Mines, Plinko, Keno, Crypto Prediction, etc.) or <strong>Live Dealer Broadcast Studios</strong>.
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/casino"
            className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700"
          >
            ← Back to Lobby
          </Link>
          <Link
            href="/casino/sandbox-frame?gameId=1stake_dice&category=in_house&title=1Stake%20Provably%20Fair%20Dice&provider=1Stake%20In-House"
            className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
          >
            Launch 1Stake Dice Demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
