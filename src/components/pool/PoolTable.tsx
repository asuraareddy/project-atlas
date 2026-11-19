'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PoolGameState,
  PoolBall,
  PoolShotCommand,
  PoolShotEvent,
  Vector2D,
} from '@/domain/games/pool/types';
import {
  POOL_TABLE_CONFIG,
  stepPhysics,
} from '@/domain/games/pool/physics';
import { computeAimGuide, AimGuideResult } from './PoolAimGuide';
import { PoolTableSurface } from './PoolTableSurface';
import { poolAudio } from './PoolAudio';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Move,
  Flame,
} from 'lucide-react';

interface PoolTableProps {
  initialState: PoolGameState;
  onStateChange?: (state: PoolGameState) => void;
  onShotComplete?: (state: PoolGameState, event: PoolShotEvent, message: string) => void;
}

export function PoolTable({ initialState, onStateChange, onShotComplete }: PoolTableProps) {
  const [gameState, setGameState] = useState<PoolGameState>(initialState);
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(0.55); // 0.05 to 1.0
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<'pull' | 'aim' | null>(null);
  const [pullPoint, setPullPoint] = useState<Vector2D | null>(null);
  const [pullArmed, setPullArmed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [guideMode, setGuideMode] = useState<'standard' | 'extended' | 'off'>('extended');
  const [clothColor, setClothColor] = useState<'green' | 'blue'>('green');
  const [statusMessage, setStatusMessage] = useState<string>('Drag cue back from ball and release to shoot!');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stateRef = useRef<PoolGameState>(initialState);
  stateRef.current = gameState;

  // Sync when initialState prop updates
  useEffect(() => {
    setGameState(initialState);
    stateRef.current = initialState;
  }, [initialState]);

  // Find cue ball
  const cueBall = gameState.balls.find((b) => b.id === 0) || gameState.balls[0];

  // Auto-aim at closest object ball on turn start
  useEffect(() => {
    if (gameState.turnPhase === 'aiming' && !isSimulating && cueBall && !cueBall.isPocketed) {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const unpocketedTargets = gameState.balls.filter((b) => {
        if (b.id === 0 || b.isPocketed) return false;
        if (gameState.openTable) return b.id !== 8;
        if (activePlayer.group === 'solids') return b.type === 'solid';
        if (activePlayer.group === 'stripes') return b.type === 'stripe';
        return b.id === 8;
      });

      const targets = unpocketedTargets.length > 0 ? unpocketedTargets : gameState.balls.filter(b => b.id !== 0 && !b.isPocketed);
      if (targets.length > 0) {
        let closestDist = Infinity;
        let chosen = targets[0];
        for (const t of targets) {
          const d = Math.hypot(t.x - cueBall.x, t.y - cueBall.y);
          if (d < closestDist) {
            closestDist = d;
            chosen = t;
          }
        }
        const initialAngle = Math.atan2(chosen.y - cueBall.y, chosen.x - cueBall.x);
        setAimAngle(initialAngle);
      }
    }
  }, [gameState.turnCount, gameState.turnPhase, gameState.activePlayerIndex, isSimulating]);

  // Compute live aim trajectory
  const aimGuide: AimGuideResult | null =
    guideMode !== 'off' && !isSimulating && cueBall && !cueBall.isPocketed
      ? computeAimGuide(cueBall, aimAngle, gameState.balls)
      : null;

  // Convert client viewport coordinates to SVG table coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number): Vector2D | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  // Handle table click/touch for Ball In Hand or Aiming / Pulling
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isSimulating || gameState.status === 'completed') return;

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords || !cueBall) return;

    // 1. Ball in hand placement mode
    if (gameState.ballInHand) {
      placeBallInHand(coords.x, coords.y);
      return;
    }

    // 2. Determine if pointer is on cue ball, cue stick, or pulling back
    const dx = coords.x - cueBall.x;
    const dy = coords.y - cueBall.y;
    const distToCue = Math.hypot(dx, dy);

    // If clicking on or near the cue ball (within 55px) or pulling back:
    if (distToCue <= 55) {
      setDragMode('pull');
      setPullPoint(coords);
      setPullArmed(false);
    } else {
      // Aiming towards tapped point
      const angle = Math.atan2(dy, dx);
      setAimAngle(angle);
      setDragMode('aim');
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragMode || isSimulating || !cueBall) return;
    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (dragMode === 'pull') {
      const dx = coords.x - cueBall.x;
      const dy = coords.y - cueBall.y;
      const pullDist = Math.hypot(dx, dy);

      // Deadzone of 10px, max pull of 150px
      const deadZone = 10;
      const maxPull = 150;
      setPullPoint(coords);

      if (pullDist > deadZone) {
        // Shot angle fires opposite to pull vector (slingshot aim)
        const shotAngle = Math.atan2(-dy, -dx);
        const t = Math.min(1, Math.max(0, (pullDist - deadZone) / (maxPull - deadZone)));
        const pwr = Math.round((0.15 + t * 0.85) * 100) / 100;

        setAimAngle(shotAngle);
        setShotPower(pwr);
        setPullArmed(true);
      } else {
        setPullArmed(false);
      }
    } else if (dragMode === 'aim') {
      const dx = coords.x - cueBall.x;
      const dy = coords.y - cueBall.y;
      setAimAngle(Math.atan2(dy, dx));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (dragMode === 'pull' && pullArmed) {
      // Fire shot immediately upon releasing cursor pull!
      executeShot(aimAngle, shotPower);
    }

    setDragMode(null);
    setPullPoint(null);
    setPullArmed(false);
  };

  // Fine-aim adjustments
  const nudgeAim = (deltaDegrees: number) => {
    setAimAngle((prev) => {
      let next = prev + (deltaDegrees * Math.PI) / 180;
      while (next < -Math.PI) next += 2 * Math.PI;
      while (next > Math.PI) next -= 2 * Math.PI;
      return next;
    });
  };

  // Ball in Hand placement via API
  const placeBallInHand = async (x: number, y: number) => {
    try {
      const res = await fetch('/api/v1/games/pool/ball-in-hand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          x: Math.round(x),
          y: Math.round(y),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGameState(json.data.state);
        onStateChange?.(json.data.state);
        setStatusMessage('Cue ball placed. Drag back to shoot!');
      } else {
        setStatusMessage(json.error || 'Cannot place cue ball here.');
      }
    } catch {
      setStatusMessage('Failed to place cue ball.');
    }
  };

  // Trigger Human Shot
  const executeShot = async (customAngle?: number, customPower?: number) => {
    if (isSimulating || gameState.status === 'completed' || gameState.ballInHand) return;
    setIsSimulating(true);

    const shotAngleToUse = typeof customAngle === 'number' ? customAngle : aimAngle;
    const shotPowerToUse = typeof customPower === 'number' ? customPower : shotPower;

    const command: PoolShotCommand = {
      angle: shotAngleToUse,
      power: shotPowerToUse,
    };

    // Play strike sound
    poolAudio.playCueStrike(shotPowerToUse);

    // Copy balls array for local 60fps physical animation
    const liveBalls = gameState.balls.map((b) => ({ ...b }));
    const cue = liveBalls.find((b) => b.id === 0)!;
    const impulse = shotPowerToUse * POOL_TABLE_CONFIG.maxImpulse;
    cue.vx = Math.cos(shotAngleToUse) * impulse;
    cue.vy = Math.sin(shotAngleToUse) * impulse;

    let steps = 0;
    const maxSteps = 1200;

    const runFrame = () => {
      // Step physics 2-3 times per animation frame for high sub-stepping stability
      for (let sub = 0; sub < 2; sub++) {
        const { anyMoving, newPocketed } = stepPhysics(liveBalls);
        steps++;

        if (newPocketed.length > 0) {
          poolAudio.playPocketDrop();
        }

        if (!anyMoving || steps >= maxSteps) {
          // Simulation ended
          finishShot(command);
          return;
        }
      }

      // Update state for smooth visual render
      setGameState((prev) => ({
        ...prev,
        balls: liveBalls.map((b) => ({ ...b })),
      }));

      animFrameRef.current = requestAnimationFrame(runFrame);
    };

    animFrameRef.current = requestAnimationFrame(runFrame);
  };

  // Finalize shot with authoritative server rules
  const finishShot = async (command: PoolShotCommand) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    try {
      const res = await fetch('/api/v1/games/pool/shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameState.sessionId,
          angle: command.angle,
          power: command.power,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const nextState: PoolGameState = json.data.state;
        const shotEv: PoolShotEvent = json.data.shotEvent;
        const msg: string = json.data.message;

        setGameState(nextState);
        setStatusMessage(msg);
        setIsSimulating(false);
        onStateChange?.(nextState);
        onShotComplete?.(nextState, shotEv, msg);

        if (shotEv.foul) {
          poolAudio.playFoulBuzzer();
        }

        if (nextState.status === 'completed') {
          poolAudio.playVictoryFanfare();
        } else if (
          nextState.mode === 'vs_bot' &&
          nextState.activePlayerIndex === 1 &&
          nextState.players[1].isBot
        ) {
          // Trigger bot AI turn after realistic pause
          triggerBotTurn(nextState.sessionId);
        }
      } else {
        setIsSimulating(false);
      }
    } catch {
      setIsSimulating(false);
    }
  };

  // Trigger AceCue AI turn
  const triggerBotTurn = async (sessionId: string) => {
    setStatusMessage('AceCue is calculating angles & bank trajectories...');
    setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/games/pool/bot-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const botCommand = json.data.command;
          setAimAngle(botCommand.angle);
          setShotPower(botCommand.power);

          // Animate bot shot
          poolAudio.playCueStrike(botCommand.power);
          setIsSimulating(true);

          const liveBalls = stateRef.current.balls.map((b) => ({ ...b }));
          const cue = liveBalls.find((b) => b.id === 0)!;
          const impulse = botCommand.power * POOL_TABLE_CONFIG.maxImpulse;
          cue.vx = Math.cos(botCommand.angle) * impulse;
          cue.vy = Math.sin(botCommand.angle) * impulse;

          let steps = 0;
          const maxSteps = 1200;

          const runBotFrame = () => {
            for (let sub = 0; sub < 2; sub++) {
              const { anyMoving, newPocketed } = stepPhysics(liveBalls);
              steps++;
              if (newPocketed.length > 0) {
                poolAudio.playPocketDrop();
              }
              if (!anyMoving || steps >= maxSteps) {
                setGameState(json.data.state);
                setStatusMessage(json.data.message);
                setIsSimulating(false);
                onStateChange?.(json.data.state);
                onShotComplete?.(json.data.state, json.data.shotEvent, json.data.message);
                if (json.data.shotEvent?.foul) {
                  poolAudio.playFoulBuzzer();
                }
                if (json.data.state.status === 'completed') {
                  poolAudio.playVictoryFanfare();
                }
                return;
              }
            }

            setGameState((prev) => ({
              ...prev,
              balls: liveBalls.map((b) => ({ ...b })),
            }));

            animFrameRef.current = requestAnimationFrame(runBotFrame);
          };

          animFrameRef.current = requestAnimationFrame(runBotFrame);
        }
      } catch (err) {
        console.error('Bot turn failed:', err);
        setIsSimulating(false);
      }
    }, 1200);
  };

  // Helper for power color ramp (green -> amber -> red)
  const getPowerColor = (p: number) => {
    const t = Math.max(0, Math.min(1, p));
    const hue = Math.round(130 - 130 * t);
    return `hsl(${hue}, 90%, 50%)`;
  };

  // Cue stick geometry - tracks cursor directly when pulling!
  const cueLength = 270;
  const cuePullBack =
    dragMode === 'pull' && pullPoint
      ? Math.max(20, Math.min(160, Math.hypot(pullPoint.x - cueBall.x, pullPoint.y - cueBall.y)))
      : 25 + shotPower * 85;
  const cueEndX = cueBall.x - Math.cos(aimAngle) * cuePullBack;
  const cueEndY = cueBall.y - Math.sin(aimAngle) * cuePullBack;
  const cueTailX = cueEndX - Math.cos(aimAngle) * cueLength;
  const cueTailY = cueEndY - Math.sin(aimAngle) * cueLength;

  return (
    <div className="w-full flex flex-col items-center select-none space-y-4">
      {/* Table Interactive SVG Canvas */}
      <div className="w-full max-w-5xl relative aspect-[1080/580] bg-zinc-950/40 rounded-2xl p-1 sm:p-3 shadow-2xl border border-white/10 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="-40 -40 1080 580"
          className={`w-full h-full select-none touch-none ${
            isSimulating
              ? 'cursor-wait'
              : dragMode === 'pull'
              ? 'cursor-grabbing'
              : gameState.ballInHand
              ? 'cursor-pointer'
              : 'cursor-crosshair'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Static Table Surface (Wood, Felt, Rails, Pockets) */}
          <PoolTableSurface clothColor={clothColor} />

          {/* Aim Guidelines (Trajectory & Ghost Ball) */}
          {aimGuide && !isSimulating && (
            <g id="aim-guidelines" pointerEvents="none">
              {/* Cue aim line */}
              <line
                x1={aimGuide.cueStart.x}
                y1={aimGuide.cueStart.y}
                x2={aimGuide.aimRayEnd.x}
                y2={aimGuide.aimRayEnd.y}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.8"
              />

              {/* Ghost Ball Preview */}
              {aimGuide.ghostBall && (
                <g>
                  <circle
                    cx={aimGuide.ghostBall.x}
                    cy={aimGuide.ghostBall.y}
                    r={POOL_TABLE_CONFIG.ballRadius}
                    fill="#ffffff"
                    fillOpacity="0.25"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />

                  {/* Contact point highlight */}
                  <circle
                    cx={aimGuide.ghostBall.x}
                    cy={aimGuide.ghostBall.y}
                    r="3"
                    fill="#38bdf8"
                  />

                  {/* Object ball target trajectory line */}
                  {aimGuide.targetLineEnd && aimGuide.targetBall && (
                    <g>
                      <line
                        x1={aimGuide.targetBall.x}
                        y1={aimGuide.targetBall.y}
                        x2={aimGuide.targetLineEnd.x}
                        y2={aimGuide.targetLineEnd.y}
                        stroke={aimGuide.isPotCandidate ? '#22c55e' : '#f59e0b'}
                        strokeWidth="2.5"
                        strokeDasharray={aimGuide.isPotCandidate ? 'none' : '5 4'}
                        opacity="0.9"
                      />
                      {aimGuide.isPotCandidate && (
                        <circle
                          cx={aimGuide.targetLineEnd.x}
                          cy={aimGuide.targetLineEnd.y}
                          r="12"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  )}

                  {/* Cue ball tangent deflection line */}
                  {aimGuide.cueDeflectEnd && (
                    <line
                      x1={aimGuide.ghostBall.x}
                      y1={aimGuide.ghostBall.y}
                      x2={aimGuide.cueDeflectEnd.x}
                      y2={aimGuide.cueDeflectEnd.y}
                      stroke="#94a3b8"
                      strokeWidth="1.6"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                  )}
                </g>
              )}
            </g>
          )}

          {/* Cue Stick */}
          {!isSimulating && !gameState.ballInHand && cueBall && !cueBall.isPocketed && (
            <g id="cue-stick" pointerEvents="none">
              {/* Cue Stick Shadow */}
              <line
                x1={cueEndX + 5}
                y1={cueEndY + 5}
                x2={cueTailX + 5}
                y2={cueTailY + 5}
                stroke="#000000"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.35"
              />
              {/* Cue Stick Wooden Shaft */}
              <line
                x1={cueEndX}
                y1={cueEndY}
                x2={cueTailX}
                y2={cueTailY}
                stroke="#e29b58"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Cue Butt Grip */}
              <line
                x1={cueEndX - Math.cos(aimAngle) * (cueLength * 0.6)}
                y1={cueEndY - Math.sin(aimAngle) * (cueLength * 0.6)}
                x2={cueTailX}
                y2={cueTailY}
                stroke="#27272a"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* White Ferrule & Blue Chalk Tip */}
              <circle
                cx={cueEndX}
                cy={cueEndY}
                r="3.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Slingshot Pull Feedback at Cursor (identical to Carrom) */}
          {dragMode === 'pull' && pullPoint && (
            <g id="slingshot-pull-feedback" pointerEvents="none">
              {/* Tension line from cue ball to cursor pull point */}
              <line
                x1={cueBall.x}
                y1={cueBall.y}
                x2={pullPoint.x}
                y2={pullPoint.y}
                stroke={getPowerColor(shotPower)}
                strokeWidth={pullArmed ? '3.5' : '1.8'}
                strokeDasharray={pullArmed ? undefined : '4 3'}
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Cursor pull knob */}
              <circle
                cx={pullPoint.x}
                cy={pullPoint.y}
                r={pullArmed ? '11' : '8'}
                fill={getPowerColor(shotPower)}
                stroke="#ffffff"
                strokeWidth="2.5"
                className={pullArmed ? 'animate-pulse' : undefined}
              />

              {/* Expanding power ring */}
              {pullArmed && (
                <circle
                  cx={pullPoint.x}
                  cy={pullPoint.y}
                  r={14 + shotPower * 14}
                  fill="none"
                  stroke={getPowerColor(shotPower)}
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
              )}

              {/* Power badge pill next to cursor */}
              {pullArmed && (
                <g transform={`translate(${pullPoint.x}, ${pullPoint.y - 24})`}>
                  <rect
                    x="-55"
                    y="-11"
                    width="110"
                    height="22"
                    rx="11"
                    fill="#09090b"
                    fillOpacity="0.88"
                    stroke={getPowerColor(shotPower)}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {Math.round(shotPower * 100)}% RELEASE
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Ball In Hand Highlight Target */}
          {gameState.ballInHand && (
            <g pointerEvents="none">
              <circle
                cx={cueBall.x}
                cy={cueBall.y}
                r={POOL_TABLE_CONFIG.ballRadius + 14}
                fill="#38bdf8"
                fillOpacity="0.2"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                className="animate-pulse"
              />
              <text
                x={cueBall.x}
                y={cueBall.y - 25}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="12"
                fontWeight="bold"
              >
                Touch Table to Place Cue Ball
              </text>
            </g>
          )}

          {/* Pool Balls Layer */}
          {gameState.balls.map((ball) => {
            if (ball.isPocketed) return null;
            const isCue = ball.id === 0;
            const isEight = ball.id === 8;
            const isStripe = ball.type === 'stripe';

            return (
              <g key={`ball-${ball.id}`} transform={`translate(${ball.x}, ${ball.y})`}>
                {/* Ball Drop Shadow */}
                <circle
                  cx="2"
                  cy="2.5"
                  r={ball.radius}
                  fill="#000000"
                  opacity="0.4"
                />

                {/* Base Sphere */}
                <circle
                  cx="0"
                  cy="0"
                  r={ball.radius}
                  fill={isStripe ? '#f8fafc' : ball.color}
                  stroke="#18181b"
                  strokeWidth="0.8"
                />

                {/* Stripe Colored Center Band */}
                {isStripe && (
                  <rect
                    x={-ball.radius}
                    y={-ball.radius * 0.55}
                    width={ball.radius * 2}
                    height={ball.radius * 1.1}
                    fill={ball.color}
                    clipPath={`url(#ball-clip-${ball.id})`}
                  />
                )}

                {/* Number Circle Badge (for object balls) */}
                {!isCue && (
                  <g>
                    <circle cx="0" cy="0" r={ball.radius * 0.48} fill="#ffffff" />
                    <text
                      x="0"
                      y="3.2"
                      textAnchor="middle"
                      fill="#09090b"
                      fontSize={ball.number >= 10 ? '7.5' : '8.5'}
                      fontWeight="bold"
                      fontFamily="Arial, sans-serif"
                    >
                      {ball.number}
                    </text>
                  </g>
                )}

                {/* Red English Dot on Cue Ball */}
                {isCue && (
                  <circle cx="0" cy="0" r="1.8" fill="#dc2626" opacity="0.85" />
                )}

                {/* Top-Left 3D Specular Highlight */}
                <ellipse
                  cx={-ball.radius * 0.3}
                  cy={-ball.radius * 0.35}
                  rx={ball.radius * 0.4}
                  ry={ball.radius * 0.25}
                  fill="#ffffff"
                  opacity="0.5"
                  transform={`rotate(-25, ${-ball.radius * 0.3}, ${-ball.radius * 0.35})`}
                />
              </g>
            );
          })}
        </svg>

        {/* Status Pill in Table Top */}
        <div className="absolute top-2 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{statusMessage}</span>
          </div>

          {aimGuide && aimGuide.isPotCandidate && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce">
              <Flame className="w-3.5 h-3.5" />
              <span>Pocket Aligned ({aimGuide.cutAngleDeg}°)</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Console (Fine Aim, Power Slider, Shoot Button) */}
      <div className="w-full max-w-5xl bg-zinc-900/90 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Fine Aim Buttons */}
        <div className="flex items-center gap-1.5 order-2 md:order-1">
          <button
            onClick={() => nudgeAim(-5)}
            disabled={isSimulating}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors disabled:opacity-50"
          >
            -5°
          </button>
          <button
            onClick={() => nudgeAim(-1)}
            disabled={isSimulating}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 rounded-lg bg-black/50 text-white font-mono text-xs border border-white/10 min-w-[70px] text-center">
            {Math.round((aimAngle * 180) / Math.PI)}°
          </div>
          <button
            onClick={() => nudgeAim(1)}
            disabled={isSimulating}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => nudgeAim(5)}
            disabled={isSimulating}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors disabled:opacity-50"
          >
            +5°
          </button>
        </div>

        {/* Shot Power Gauge & Slider */}
        <div className="flex items-center gap-3 w-full md:w-80 order-1 md:order-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span>Shot Power</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(shotPower * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.02"
              value={shotPower}
              disabled={isSimulating}
              onChange={(e) => setShotPower(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>

        {/* Shoot & Quick Action Buttons */}
        <div className="flex items-center gap-3 order-3">
          {/* Aim Guide Toggle */}
          <button
            onClick={() =>
              setGuideMode((prev) =>
                prev === 'extended' ? 'standard' : prev === 'standard' ? 'off' : 'extended'
              )
            }
            title="Toggle Aim Guideline"
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline capitalize">{guideMode}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              poolAudio.setMuted(nextMuted);
            }}
            title="Audio Mute Toggle"
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Cloth Color Selector */}
          <button
            onClick={() => setClothColor((prev) => (prev === 'green' ? 'blue' : 'green'))}
            title="Change Cloth Color"
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-colors flex items-center justify-center"
          >
            <span
              className={`w-4 h-4 rounded-full border border-white/30 ${
                clothColor === 'green' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            />
          </button>

          {/* Main SHOOT Button */}
          <button
            onClick={() => executeShot()}
            disabled={isSimulating || gameState.status === 'completed' || gameState.ballInHand}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center gap-2 ${
              isSimulating || gameState.status === 'completed' || gameState.ballInHand
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/25 cursor-pointer active:scale-95'
            }`}
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>{isSimulating ? 'SIMULATING...' : 'SHOOT CUE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
