'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  CarromGameState,
  CarromCoin
} from '@/domain/games/carrom/types';
import {
  BOARD_SIZE,
  STRIKER_RADIUS,
  MIN_BOUND,
  MAX_BOUND,
  CarromPhysicsEngine
} from '@/domain/games/carrom/physics';
import {
  BASELINE_MIN_X,
  BASELINE_MAX_X,
  BASELINE_BOTTOM_Y,
  BASELINE_TOP_Y
} from '@/domain/games/carrom/engine';
import {
  Target,
  Coins,
  Crown,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Hand,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import CarromBoardSurface from '@/components/carrom/CarromBoardSurface';
import {
  Point,
  PullShot,
  DEFAULT_PULL_CONFIG,
  clientToBoard,
  clampStrikerX,
  computePullShot,
  defaultAimAngle,
  isPointerOnBaseline,
  isPointerOnStriker,
  nudgeAngle,
  powerColor,
  projectAimGuide
} from '@/components/carrom/aiming';

type DragMode = 'pull' | 'position' | 'direction';

interface DragState {
  mode: DragMode;
  pointerId: number;
  start: Point;
  /** Pull gestures that start on the striker decide pull-vs-slide on first movement. */
  decided: boolean;
  lastShot: PullShot | null;
  lastX: number | null;
}

// Mirrors CarromEngine.processShot impulse mapping and simulateShot step cap
const SPEED_PER_POWER = 0.26;
const MAX_SIM_STEPS = 700;
const POSITION_COMMIT_DEBOUNCE_MS = 150;

interface CarromBoardProps {
  state: CarromGameState;
  onShot: (angle: number, power: number) => Promise<void>;
  onPositionStriker: (x: number) => void | Promise<void>;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playAudio?: (type: 'strike' | 'hit' | 'cushion' | 'pocket' | 'foul' | 'win') => void;
}

export default function CarromBoard({
  state,
  onShot,
  onPositionStriker,
  onResetGame,
  soundEnabled,
  onToggleSound,
  playAudio
}: CarromBoardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
  const isHumanTurn = activePlayer && !activePlayer.isBot;
  const activeSide = activePlayer?.side;
  const activeBaselineY = activeSide === 'top' ? BASELINE_TOP_Y : BASELINE_BOTTOM_Y;
  const minStrikerX = state.strikerPlacement.minX ?? BASELINE_MIN_X;
  const maxStrikerX = state.strikerPlacement.maxX ?? BASELINE_MAX_X;

  // Local animated coins for 60fps physics simulation
  const [localCoins, setLocalCoins] = useState<CarromCoin[]>(state.coins);
  const [isSimulating, setIsSimulating] = useState(false);

  // Aiming state
  const [aimAngle, setAimAngle] = useState<number>(defaultAimAngle(activeSide));
  const [shotPower, setShotPower] = useState<number>(65); // 0..100
  const [strikerX, setStrikerX] = useState<number>(state.strikerPlacement.x);

  // Touch / pointer gesture state
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [pullPoint, setPullPoint] = useState<Point | null>(null);
  const [pullArmed, setPullArmed] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Striker placement is committed to the server (debounced) and awaited before a shot
  const positionCommitRef = useRef<Promise<unknown>>(Promise.resolve());
  const positionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPositionRef = useRef<number | null>(null);

  const canInteract = !!isHumanTurn && !isSimulating && state.status === 'active';

  // Sync state coins when server updates
  useEffect(() => {
    if (!isSimulating) {
      setLocalCoins(state.coins);
      setStrikerX(state.strikerPlacement.x);
    }
  }, [state.coins, state.strikerPlacement.x, isSimulating]);

  // Reset aim to "straight ahead" for whoever owns the next turn
  useEffect(() => {
    setAimAngle(defaultAimAngle(activeSide));
  }, [state.currentTurnPlayerId, state.turnNumber, activeSide]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (positionTimerRef.current) {
        clearTimeout(positionTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------
  // Striker placement
  // ---------------------------------------------------------------
  const flushStrikerPosition = useCallback(() => {
    if (positionTimerRef.current) {
      clearTimeout(positionTimerRef.current);
      positionTimerRef.current = null;
    }
    const x = pendingPositionRef.current;
    if (x === null) return;
    pendingPositionRef.current = null;
    positionCommitRef.current = Promise.resolve(onPositionStriker(x)).catch(() => undefined);
  }, [onPositionStriker]);

  const scheduleStrikerCommit = (x: number, immediate = false) => {
    pendingPositionRef.current = x;
    if (positionTimerRef.current) clearTimeout(positionTimerRef.current);
    if (immediate) {
      flushStrikerPosition();
    } else {
      positionTimerRef.current = setTimeout(flushStrikerPosition, POSITION_COMMIT_DEBOUNCE_MS);
    }
  };

  /** Moves the rendered striker along the active baseline (local, instant). */
  const moveStrikerLocal = (x: number): number => {
    const clamped = clampStrikerX(x, minStrikerX, maxStrikerX);
    setStrikerX(clamped);
    setLocalCoins((prev) =>
      prev.map((c) =>
        c.type === 'striker' ? { ...c, x: clamped, y: activeBaselineY, vx: 0, vy: 0 } : c
      )
    );
    return clamped;
  };

  // ---------------------------------------------------------------
  // Shot execution (existing physics engine drives the animation)
  // ---------------------------------------------------------------
  const finishShot = async (angle: number, power: number) => {
    try {
      await positionCommitRef.current;
      await onShot(angle, power);
    } catch (err) {
      console.error('Carrom shot submission failed:', err);
    } finally {
      // Released only after the authoritative state arrives, so coins never snap back
      setIsSimulating(false);
    }
  };

  const executeShot = (angle: number, power: number) => {
    if (!canInteract) return;
    const clampedPower = Math.max(DEFAULT_PULL_CONFIG.minPower, Math.min(100, Math.round(power)));

    flushStrikerPosition();
    if (playAudio) playAudio('strike');
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }

    setAimAngle(angle);
    setShotPower(clampedPower);
    setIsSimulating(true);

    const speed = clampedPower * SPEED_PER_POWER;
    const currentCoins = localCoins.map((c) => {
      if (c.type === 'striker') {
        return {
          ...c,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          isPocketed: false
        };
      }
      return { ...c, vx: 0, vy: 0 };
    });

    let stepCount = 0;

    const runPhysicsLoop = () => {
      // Advance physics sub-step
      const res = CarromPhysicsEngine.step(currentCoins, state.pockets);

      if ((res.pocketed.length > 0 || res.strikerPocketed) && playAudio) {
        playAudio('pocket');
      }

      stepCount++;
      setLocalCoins([...currentCoins]);

      if (CarromPhysicsEngine.areCoinsInMotion(currentCoins) && stepCount < MAX_SIM_STEPS) {
        animationFrameRef.current = requestAnimationFrame(runPhysicsLoop);
      } else {
        animationFrameRef.current = null;
        void finishShot(angle, clampedPower);
      }
    };

    animationFrameRef.current = requestAnimationFrame(runPhysicsLoop);
  };

  const handleExecuteShot = () => executeShot(aimAngle, shotPower);

  // ---------------------------------------------------------------
  // Pointer / touch gestures on the board
  //  - press striker & pull back  -> slingshot aim + power, release to shoot
  //  - press striker & slide along baseline, or press the baseline strip -> position
  //  - press anywhere else        -> aim toward that point (use STRIKE button)
  // ---------------------------------------------------------------
  const toBoardPoint = (e: React.PointerEvent<SVGSVGElement>): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    return clientToBoard(e.clientX, e.clientY, svg.getBoundingClientRect(), BOARD_SIZE);
  };

  const handleBoardPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!canInteract || dragRef.current) return;

    const p = toBoardPoint(e);
    const striker = localCoins.find((c) => c.type === 'striker' && !c.isPocketed);
    if (!p || !striker) return;

    const drag: DragState = { mode: 'direction', pointerId: e.pointerId, start: p, decided: false, lastShot: null, lastX: null };

    if (isPointerOnStriker(p, striker, STRIKER_RADIUS)) {
      drag.mode = 'pull';
      setPullPoint(p);
      setPullArmed(false);
    } else if (isPointerOnBaseline(p, activeBaselineY, minStrikerX, maxStrikerX)) {
      drag.mode = 'position';
      drag.decided = true;
      drag.lastX = moveStrikerLocal(p.x);
    } else {
      drag.decided = true;
      setAimAngle(Math.atan2(p.y - striker.y, p.x - striker.x));
    }

    dragRef.current = drag;
    setDragMode(drag.mode);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture unsupported — gesture still works while inside the board
    }
    e.preventDefault();
  };

  const handleBoardPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !canInteract) return;

    const p = toBoardPoint(e);
    const striker = localCoins.find((c) => c.type === 'striker' && !c.isPocketed);
    if (!p || !striker) return;

    if (drag.mode === 'pull') {
      if (!drag.decided) {
        const mdx = p.x - drag.start.x;
        const mdy = p.y - drag.start.y;
        if (Math.hypot(mdx, mdy) >= 8) {
          drag.decided = true;
          // Mostly-horizontal slide that stays on the baseline => reposition striker
          if (Math.abs(mdy) < Math.abs(mdx) * 0.5 && Math.abs(p.y - activeBaselineY) <= 24) {
            drag.mode = 'position';
            setDragMode('position');
            setPullPoint(null);
            setPullArmed(false);
            drag.lastX = moveStrikerLocal(p.x);
            return;
          }
        }
      }

      const shot = computePullShot(striker, p);
      drag.lastShot = shot;
      setPullPoint(p);
      setPullArmed(shot.isArmed);
      if (shot.isArmed) {
        setAimAngle(shot.angle);
        setShotPower(shot.power);
      }
    } else if (drag.mode === 'position') {
      drag.lastX = moveStrikerLocal(p.x);
    } else {
      setAimAngle(Math.atan2(p.y - striker.y, p.x - striker.x));
    }
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setDragMode(null);
    setPullPoint(null);
    setPullArmed(false);

    if (drag.mode === 'position' && drag.lastX !== null) {
      scheduleStrikerCommit(drag.lastX, true);
    } else if (drag.mode === 'pull' && !cancelled && drag.lastShot?.isArmed) {
      executeShot(drag.lastShot.angle, drag.lastShot.power);
    }
  };

  const handleBoardPointerUp = (e: React.PointerEvent<SVGSVGElement>) => endDrag(e, false);
  const handleBoardPointerCancel = (e: React.PointerEvent<SVGSVGElement>) => endDrag(e, true);

  // Striker baseline placement handler (slider)
  const handleStrikerSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newX = moveStrikerLocal(Number(e.target.value));
    scheduleStrikerCommit(newX);
  };

  const currentStriker = localCoins.find((c) => c.type === 'striker' && !c.isPocketed);

  // Aim guide: first coin contact or cushion bounce (visual aid only)
  const aimObstacles = useMemo(
    () =>
      localCoins
        .filter((c) => !c.isPocketed && c.type !== 'striker')
        .map(({ id, x, y, radius }) => ({ id, x, y, radius })),
    [localCoins]
  );
  const showAim = canInteract && !!currentStriker && dragMode !== 'position';
  const aimGuide = useMemo(() => {
    if (!showAim || !currentStriker) return null;
    return projectAimGuide(
      { x: currentStriker.x, y: currentStriker.y },
      aimAngle,
      currentStriker.radius,
      aimObstacles,
      { min: MIN_BOUND, max: MAX_BOUND }
    );
  }, [showAim, currentStriker, aimAngle, aimObstacles]);
  const guideHitCoin = aimGuide?.hitCoinId != null ? aimObstacles.find((o) => o.id === aimGuide.hitCoinId) : undefined;

  const isPulling = dragMode === 'pull' && pullArmed && !!pullPoint && !!currentStriker;
  const powerTint = powerColor(shotPower);
  const aimDir = { x: Math.cos(aimAngle), y: Math.sin(aimAngle) };
  const aimDegrees = Math.round(
    ((activeSide === 'top' ? aimAngle : -aimAngle) * 180) / Math.PI
  );

  // Clamp the rubber band to the max pull length for display
  let bandEnd: Point | null = null;
  if (isPulling && pullPoint && currentStriker) {
    const bx = pullPoint.x - currentStriker.x;
    const by = pullPoint.y - currentStriker.y;
    const bl = Math.hypot(bx, by) || 1;
    const l = Math.min(bl, DEFAULT_PULL_CONFIG.maxPull);
    bandEnd = { x: currentStriker.x + (bx / bl) * l, y: currentStriker.y + (by / bl) * l };
  }

  const whiteCount = localCoins.filter((c) => !c.isPocketed && c.type === 'white').length;
  const blackCount = localCoins.filter((c) => !c.isPocketed && c.type === 'black').length;
  const queenOnBoard = localCoins.some((c) => !c.isPocketed && c.type === 'queen');

  return (
    <div className={`w-full max-w-xl mx-auto space-y-4 select-none ${isDark ? 'text-white' : 'text-[#0C0D14]'}`}>
      {/* FINANCIAL & TOURNAMENT HUD (CRAZY GAMES DARK PALETTE) */}
      {state.betting && (
        <div
          className={`p-3.5 rounded-[16px] border flex items-center justify-between shadow-xl text-xs ${
            isDark ? 'bg-[#151722] border-[#374151]' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-[12px] ${
                isDark ? 'bg-[#2F3148] text-[#7361FF]' : 'bg-[#EEF0FA] text-[#7361FF]'
              }`}
            >
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-black tracking-wider block ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                {state.betting.stakeMinor > 0 ? 'Tournament Stake' : 'Practice Arcade'}
              </span>
              <span className="font-black text-sm">
                {state.betting.stakeMinor > 0 ? `${(state.betting.stakeMinor / 100).toFixed(2)}` : 'FREE (Practice)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className={`text-[10px] uppercase font-black tracking-wider block ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                Prize Pool
              </span>
              <span className="font-black text-[#7361FF] text-sm">
                {state.betting.prizePoolMinor > 0 ? `${(state.betting.prizePoolMinor / 100).toFixed(2)}` : '200 Pts'}
              </span>
            </div>

            <div className={`hidden sm:block text-right border-l pl-3 ${isDark ? 'border-[#374151]' : 'border-zinc-200'}`}>
              <span className={`text-[9px] uppercase font-bold block ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                Rake ({state.betting.rakePercentage}%)
              </span>
              <span className="text-xs font-semibold opacity-75">
                {(state.betting.platformFeeMinor / 100).toFixed(2)}
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-[30px] text-[10px] font-black uppercase tracking-wider border ${
                isDark
                  ? 'bg-[#7361FF]/20 text-[#A48EFF] border-[#7361FF]/40'
                  : 'bg-[#EEF0FA] text-[#7361FF] border-[#7361FF]/30'
              }`}
            >
              {state.betting.settlementStatus.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* ACTIVE TURN & SCORE BAR */}
      <div
        className={`p-3.5 rounded-[16px] border flex items-center justify-between shadow-2xl ${
          isDark ? 'bg-[#151722] border-[#374151]' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-[12px] border flex items-center justify-center font-black text-lg shadow-sm ${
              isDark ? 'bg-[#2F3148] border-[#7361FF]/40 text-white' : 'bg-[#EEF0FA] border-[#7361FF]/30 text-[#0C0D14]'
            }`}
          >
            {activePlayer?.avatar || '🎯'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-[30px] bg-[#7361FF] text-white">
                Current Turn
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-[30px] capitalize ${
                  isDark ? 'bg-[#2F3148] text-[#A48EFF]' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {activePlayer?.assignedColor}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black capitalize mt-0.5">
              {activePlayer?.name}
            </h3>
          </div>
        </div>

        {/* Controls & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-[30px] border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#2F3148] hover:bg-[#374151] border-[#374151] text-white'
                : 'bg-[#EEF0FA] hover:bg-zinc-200 border-zinc-200 text-[#7361FF]'
            }`}
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#7361FF]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* STRIKE PRIMARY BUTTON (BUTTON-PRIMARY) */}
          <button
            id="carrom-strike-button"
            disabled={!canInteract}
            onClick={handleExecuteShot}
            className={`h-11 px-6 rounded-[30px] font-black text-xs transition-all flex items-center gap-2 shadow-xl cursor-pointer ${
              isHumanTurn && !isSimulating && state.status === 'active'
                ? isDark
                  ? 'bg-[#F9FAFF] hover:bg-white text-[#0C0D14] shadow-lg shadow-[#7361FF]/25 active:scale-95 animate-pulse'
                  : 'bg-[#7361FF] hover:bg-[#6250e6] text-white shadow-md active:scale-95'
                : isDark
                ? 'bg-[#2F3148] text-white/30 border border-[#374151] cursor-not-allowed'
                : 'bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>STRIKE ({shotPower}%)</span>
          </button>
        </div>
      </div>

      {/* GAME NOTICE BANNER & QUEEN COVER STATUS */}
      <div
        className={`px-4 py-2.5 rounded-[12px] border text-xs flex items-center justify-between shadow-sm ${
          isDark ? 'bg-[#151722] border-[#374151] text-[#9CA3AF]' : 'bg-white border-zinc-200 text-zinc-600'
        }`}
      >
        <span className="truncate pr-2 font-semibold">{state.lastNotice}</span>

        {/* Queen Status Pill */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-[30px] border text-[10px] ${
            isDark ? 'bg-[#2F3148] border-[#374151] text-white' : 'bg-[#EEF0FA] border-[#7361FF]/30 text-[#0C0D14]'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F] animate-pulse" />
          <span className="font-extrabold">
            {state.queenState.isCovered
              ? 'Queen Covered'
              : state.queenState.isPocketed
              ? 'Queen Pending Cover!'
              : 'Queen In Play'}
          </span>
        </div>
      </div>

      {/* 800x800 TOURNAMENT CARROM BOARD (wooden frame, maple surface, engine coordinates) */}
      <div
        className={`relative aspect-square w-full rounded-[24px] overflow-hidden shadow-2xl border-4 ${
          isDark ? 'border-[#374151] bg-[#151722] shadow-[#7361FF]/10' : 'border-zinc-300 bg-zinc-100 shadow-md'
        }`}
      >
        <svg
          id="carrom-board-svg"
          ref={svgRef}
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          className={`w-full h-full select-none touch-none ${
            !canInteract
              ? 'cursor-default'
              : dragMode === 'pull'
              ? 'cursor-grabbing'
              : dragMode === 'position'
              ? 'cursor-ew-resize'
              : 'cursor-crosshair'
          }`}
          onPointerDown={handleBoardPointerDown}
          onPointerMove={handleBoardPointerMove}
          onPointerUp={handleBoardPointerUp}
          onPointerCancel={handleBoardPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          role="img"
          aria-label="Carrom board. Drag the striker back and release to shoot."
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. STATIC BOARD ARTWORK (memoised) */}
          <CarromBoardSurface pockets={state.pockets} />

          {/* 2. ACTIVE BASELINE PLACEMENT ZONE */}
          {canInteract && (
            <rect
              x={minStrikerX - 16}
              y={activeBaselineY - 18}
              width={maxStrikerX - minStrikerX + 32}
              height={36}
              rx={18}
              fill={dragMode === 'position' ? 'rgba(115,97,255,0.22)' : 'rgba(115,97,255,0.08)'}
              stroke="rgba(115,97,255,0.55)"
              strokeWidth={dragMode === 'position' ? 2.5 : 1.5}
              strokeDasharray={dragMode === 'position' ? undefined : '8 6'}
              pointerEvents="none"
            />
          )}

          {/* 3. AIM GUIDE (first contact preview) */}
          {aimGuide && currentStriker && (
            <g pointerEvents="none" opacity={isPulling ? 1 : 0.8}>
              <line
                x1={currentStriker.x}
                y1={currentStriker.y}
                x2={aimGuide.end.x}
                y2={aimGuide.end.y}
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1={currentStriker.x}
                y1={currentStriker.y}
                x2={aimGuide.end.x}
                y2={aimGuide.end.y}
                stroke="#7361FF"
                strokeWidth="3"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
              {guideHitCoin && aimGuide.targetDirection ? (
                <>
                  <circle
                    cx={aimGuide.end.x}
                    cy={aimGuide.end.y}
                    r={currentStriker.radius}
                    fill="rgba(115,97,255,0.12)"
                    stroke="#7361FF"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />
                  <line
                    x1={guideHitCoin.x}
                    y1={guideHitCoin.y}
                    x2={guideHitCoin.x + aimGuide.targetDirection.x * 70}
                    y2={guideHitCoin.y + aimGuide.targetDirection.y * 70}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                aimGuide.reflectedEnd && (
                  <line
                    x1={aimGuide.end.x}
                    y1={aimGuide.end.y}
                    x2={aimGuide.reflectedEnd.x}
                    y2={aimGuide.reflectedEnd.y}
                    stroke="#7361FF"
                    strokeWidth="2.5"
                    strokeDasharray="6 7"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                )
              )}
            </g>
          )}

          {/* 4. COINS AND STRIKER LAYER */}
          {localCoins.map((c) => {
            if (c.isPocketed) return null;

            const isStriker = c.type === 'striker';
            const isQueen = c.type === 'queen';
            const isWhite = c.type === 'white';

            const fill = isStriker
              ? 'url(#cbStriker)'
              : isQueen
              ? 'url(#cbCoinQueen)'
              : isWhite
              ? 'url(#cbCoinWhite)'
              : 'url(#cbCoinBlack)';
            const rim = isStriker ? '#7361FF' : isQueen ? '#7E0A14' : isWhite ? '#B89B66' : '#000000';
            const groove = isStriker
              ? 'rgba(115,97,255,0.75)'
              : isQueen
              ? 'rgba(255,255,255,0.7)'
              : isWhite
              ? 'rgba(140,105,50,0.55)'
              : 'rgba(255,255,255,0.22)';

            return (
              <g key={`coin_${c.id}`} pointerEvents="none">
                {/* Cheap contact shadow (no SVG filter — keeps 60fps on mobile) */}
                <circle cx={c.x + 2} cy={c.y + 3} r={c.radius} fill="rgba(45,22,6,0.32)" />
                <circle cx={c.x} cy={c.y} r={c.radius} fill={fill} stroke={rim} strokeWidth={isStriker ? 3 : 1.5} />
                <circle cx={c.x} cy={c.y} r={c.radius * 0.68} fill="none" stroke={groove} strokeWidth={1.4} />
                <circle cx={c.x} cy={c.y} r={c.radius * 0.38} fill="none" stroke={groove} strokeWidth={1.1} />
                {isStriker && <circle cx={c.x} cy={c.y} r={c.radius * 0.16} fill="#7361FF" />}
              </g>
            );
          })}

          {/* 5. SLINGSHOT FEEDBACK: rubber band, power ring & shot arrow */}
          {isPulling && currentStriker && bandEnd && (
            <g pointerEvents="none">
              <line
                x1={currentStriker.x}
                y1={currentStriker.y}
                x2={bandEnd.x}
                y2={bandEnd.y}
                stroke={powerTint}
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <circle cx={bandEnd.x} cy={bandEnd.y} r="9" fill={powerTint} stroke="#FFFFFF" strokeWidth="2.5" />

              {/* Power ring */}
              <circle
                cx={currentStriker.x}
                cy={currentStriker.y}
                r={currentStriker.radius + 12}
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="6"
              />
              <circle
                cx={currentStriker.x}
                cy={currentStriker.y}
                r={currentStriker.radius + 12}
                fill="none"
                stroke={powerTint}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(2 * Math.PI * (currentStriker.radius + 12) * shotPower) / 100} ${
                  2 * Math.PI * (currentStriker.radius + 12)
                }`}
                transform={`rotate(-90 ${currentStriker.x} ${currentStriker.y})`}
              />

              {/* Shot direction arrow (length grows with power) */}
              {(() => {
                const R = currentStriker.radius;
                const start = { x: currentStriker.x + aimDir.x * (R + 20), y: currentStriker.y + aimDir.y * (R + 20) };
                const len = 30 + shotPower * 0.9;
                const tip = { x: start.x + aimDir.x * len, y: start.y + aimDir.y * len };
                const perp = { x: -aimDir.y, y: aimDir.x };
                const back = { x: tip.x - aimDir.x * 16, y: tip.y - aimDir.y * 16 };
                return (
                  <>
                    <line x1={start.x} y1={start.y} x2={back.x} y2={back.y} stroke={powerTint} strokeWidth="6" strokeLinecap="round" />
                    <polygon
                      points={`${tip.x},${tip.y} ${back.x + perp.x * 10},${back.y + perp.y * 10} ${back.x - perp.x * 10},${back.y - perp.y * 10}`}
                      fill={powerTint}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* 6. "GRAB ME" AFFORDANCE AROUND THE STRIKER */}
          {canInteract && !dragMode && currentStriker && (
            <circle
              cx={currentStriker.x}
              cy={currentStriker.y}
              r={currentStriker.radius + 8}
              fill="none"
              stroke="#7361FF"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              pointerEvents="none"
            >
              <animate
                attributeName="r"
                values={`${currentStriker.radius + 6};${currentStriker.radius + 12};${currentStriker.radius + 6}`}
                dur="1.4s"
                repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {/* Live power read-out / gesture hint (placed on the side away from the striker) */}
        {canInteract && (
          <div
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${
              activeSide === 'top' ? 'bottom-3' : 'top-3'
            }`}
          >
            {isPulling ? (
              <div
                className="px-4 py-1.5 rounded-[30px] text-xs font-black text-white shadow-lg backdrop-blur-sm flex items-center gap-1.5"
                style={{ backgroundColor: 'rgba(12,13,20,0.78)', border: `2px solid ${powerTint}` }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: powerTint }} />
                <span>POWER {shotPower}%</span>
              </div>
            ) : dragMode === 'pull' ? (
              <div className="px-3.5 py-1.5 rounded-[30px] text-[11px] font-bold text-white bg-black/60 backdrop-blur-sm">
                Pull further back to arm the shot · release here to cancel
              </div>
            ) : dragMode === 'position' ? (
              <div className="px-3.5 py-1.5 rounded-[30px] text-[11px] font-bold text-white bg-[#7361FF]/85 backdrop-blur-sm">
                Positioning striker…
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-[30px] text-[11px] font-bold text-white bg-black/55 backdrop-blur-sm flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5" />
                <span>Pull the striker back &amp; release to shoot</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE CONTROLS: STRIKER POSITIONING, POWER & FINE AIM */}
      {isHumanTurn && !isSimulating && (
        <div
          className={`p-4 rounded-[16px] border space-y-3.5 shadow-xl text-xs ${
            isDark ? 'bg-[#151722] border-[#374151]' : 'bg-white border-zinc-200'
          }`}
        >
          {/* Gesture help */}
          <div
            className={`flex items-start gap-2 p-2.5 rounded-[12px] text-[11px] leading-snug ${
              isDark ? 'bg-[#0C0D14] text-[#9CA3AF]' : 'bg-[#F4F5FA] text-zinc-600'
            }`}
          >
            <Hand className="w-4 h-4 shrink-0 text-[#7361FF] mt-0.5" />
            <span>
              <strong className={isDark ? 'text-white' : 'text-[#0C0D14]'}>Shoot:</strong> press the striker, pull back
              and release. <strong className={isDark ? 'text-white' : 'text-[#0C0D14]'}>Position:</strong> slide it along
              your baseline. <strong className={isDark ? 'text-white' : 'text-[#0C0D14]'}>Aim only:</strong> tap the
              board, then press STRIKE.
            </span>
          </div>

          {/* Striker Horizontal Placement Slider */}
          <div className="space-y-1.5">
            <div className={`flex justify-between font-bold ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-600'}`}>
              <label htmlFor="carrom-striker-position" className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#7361FF]" />
                <span>Striker Placement Along Baseline</span>
              </label>
              <span className="text-[#7361FF] font-mono font-black">{Math.round(strikerX)} px</span>
            </div>
            <input
              id="carrom-striker-position"
              type="range"
              min={minStrikerX}
              max={maxStrikerX}
              value={strikerX}
              onChange={handleStrikerSliderChange}
              disabled={!canInteract}
              className={`w-full accent-[#7361FF] cursor-pointer h-2 rounded-[30px] ${
                isDark ? 'bg-[#2F3148]' : 'bg-zinc-200'
              }`}
            />
          </div>

          {/* Shot Power Gauge */}
          <div className="space-y-1.5">
            <div className={`flex justify-between font-bold ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-600'}`}>
              <label htmlFor="carrom-shot-power" className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#7361FF]" />
                <span>Shot Power</span>
              </label>
              <span className="font-mono font-black" style={{ color: powerTint }}>{shotPower}%</span>
            </div>
            <input
              id="carrom-shot-power"
              type="range"
              min="10"
              max="100"
              value={shotPower}
              onChange={(e) => setShotPower(Number(e.target.value))}
              disabled={!canInteract}
              className={`w-full accent-[#7361FF] cursor-pointer h-2 rounded-[30px] ${
                isDark ? 'bg-[#2F3148]' : 'bg-zinc-200'
              }`}
            />
          </div>

          {/* Fine aim nudge + strike (thumb-reachable) */}
          <div className="flex items-center gap-2">
            <button
              id="carrom-aim-left"
              type="button"
              disabled={!canInteract}
              onClick={() => setAimAngle((a) => nudgeAngle(a, activeSide === 'top' ? 1 : -1))}
              className={`h-11 w-11 shrink-0 rounded-[30px] border flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:opacity-40 ${
                isDark ? 'bg-[#2F3148] border-[#374151] text-white' : 'bg-[#EEF0FA] border-zinc-200 text-[#7361FF]'
              }`}
              aria-label="Rotate aim left by 1 degree"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div
              className={`h-11 px-3 rounded-[30px] border flex flex-col items-center justify-center min-w-[72px] ${
                isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
              }`}
            >
              <span className={`text-[8px] uppercase font-black ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>Aim</span>
              <span className="font-mono font-black text-[#7361FF]">{aimDegrees}°</span>
            </div>
            <button
              id="carrom-aim-right"
              type="button"
              disabled={!canInteract}
              onClick={() => setAimAngle((a) => nudgeAngle(a, activeSide === 'top' ? -1 : 1))}
              className={`h-11 w-11 shrink-0 rounded-[30px] border flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:opacity-40 ${
                isDark ? 'bg-[#2F3148] border-[#374151] text-white' : 'bg-[#EEF0FA] border-zinc-200 text-[#7361FF]'
              }`}
              aria-label="Rotate aim right by 1 degree"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              id="carrom-strike-button-mobile"
              type="button"
              disabled={!canInteract}
              onClick={handleExecuteShot}
              className="h-11 flex-1 rounded-[30px] font-black text-xs text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#7361FF] to-[#A48EFF] shadow-[#7361FF]/30"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>STRIKE {shotPower}%</span>
            </button>
          </div>
        </div>
      )}

      {/* PLAYER CARDS & REMAINING COIN TRAYS */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {state.players.map((p) => {
          const isTurn = p.id === state.currentTurnPlayerId;
          const isWhite = p.assignedColor === 'white';
          const coinsLeft = isWhite ? whiteCount : blackCount;

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-[16px] border transition-all ${
                isTurn
                  ? 'border-[#7361FF] ring-2 ring-[#7361FF]/40 shadow-xl shadow-[#7361FF]/15'
                  : isDark
                  ? 'bg-[#151722] border-[#374151] opacity-90'
                  : 'bg-white border-zinc-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black flex items-center gap-1.5 text-xs">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: isWhite ? '#FFFFFF' : '#151722' }}
                  />
                  {p.name.split(' ')[0]}
                </span>
                {isTurn && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-[30px] bg-[#7361FF] text-white">
                    TURN
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                <div
                  className={`p-2 rounded-[10px] border ${
                    isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
                  }`}
                >
                  <span className={`block text-[8px] uppercase ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>SCORE</span>
                  <span className="text-base font-black">{p.score}</span>
                </div>
                <div
                  className={`p-2 rounded-[10px] border ${
                    isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
                  }`}
                >
                  <span className={`block text-[8px] uppercase ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>REMAINING</span>
                  <span className="text-[#7361FF] text-base font-black">{coinsLeft}/9</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MATCH VICTORY OVERLAY */}
      {state.status === 'completed' && state.winnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className={`border-2 rounded-[24px] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl ${
              isDark ? 'bg-[#151722] border-[#7361FF]' : 'bg-white border-[#7361FF]'
            }`}
          >
            <div className="w-20 h-20 rounded-[30px] bg-gradient-to-tr from-[#7361FF] to-[#A48EFF] mx-auto flex items-center justify-center text-white shadow-2xl shadow-[#7361FF]/40">
              <Crown className="w-11 h-11" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-black tracking-widest text-[#7361FF]">
                Carrom Tournament Champion
              </span>
              <h2 className="text-2xl font-black">
                {state.players.find((p) => p.id === state.winnerId)?.name} Wins!
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                All coins successfully pocketed. Server ledger settlement verified.
              </p>
            </div>

            {state.betting && state.betting.prizePoolMinor > 0 && (
              <div
                className={`p-3.5 rounded-[16px] border text-xs space-y-1 ${
                  isDark ? 'bg-[#0C0D14] border-[#374151]' : 'bg-[#F4F5FA] border-zinc-200'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-[#9CA3AF]' : 'text-zinc-500'}`}>
                  Authoritative Payout Settled
                </span>
                <span className="text-xl font-black text-[#7361FF]">
                  +{(state.betting.prizePoolMinor / 100).toFixed(2)}
                </span>
                <p className="text-[10px] text-[#10b981] font-semibold">
                  Credited to Player Cash Balance via Double-Entry Ledger
                </p>
              </div>
            )}

            <button
              onClick={onResetGame}
              className={`w-full py-3.5 rounded-[30px] font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDark ? 'bg-[#F9FAFF] hover:bg-white text-[#0C0D14]' : 'bg-[#7361FF] hover:bg-[#6250e6] text-white'
              }`}
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
