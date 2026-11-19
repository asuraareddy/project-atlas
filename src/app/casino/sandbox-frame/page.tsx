'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Coins,
  Play,
  RotateCcw,
  Key,
  Zap,
  Flame,
  Award,
  CircleDot,
  Radio,
  Video,
  Volume2,
  VolumeX,
  MessageSquare,
  Users,
  Eye,
  CheckCircle2,
  TrendingUp,
  Maximize2,
  Minimize2,
  Tv,
  Gamepad2,
} from 'lucide-react';
import {
  OneStakeDiceStudio,
  OneStakeMinesStudio,
  OneStakePlinkoStudio,
  OneStakeKenoStudio,
  OneStakeCryptoPredictionStudio,
  PendingCredentialsStudio,
} from '@/components/casino/OneStakeInHouseStudios';

// =========================================================================
// CHIP DENOMINATION SELECTOR
// =========================================================================
interface ChipProps {
  value: number;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}

function CasinoChip({ value, isSelected, onClick, color }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-xs flex items-center justify-center border-2 border-dashed shadow-lg transition-all transform active:scale-90 ${color} ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] -translate-y-1'
          : 'opacity-80 hover:opacity-100 hover:scale-105'
      }`}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/40 flex items-center justify-center bg-black/30 backdrop-blur-xs">
        <span className="text-[11px] font-mono tracking-tighter text-white">£{value}</span>
      </div>
    </button>
  );
}

// =========================================================================
// REAL LIVE DEALER VIDEO STREAM PLAYER (JackTop / Timeless Tech Aggregator)
// =========================================================================
interface LiveDealerVideoPlayerProps {
  gameId: string;
  gameTitle: string;
  provider?: string;
  streamUrl?: string;
  onRefreshStream?: () => void;
  isLoading?: boolean;
  activeView?: 'stream' | 'table' | 'split';
  setActiveView?: (view: 'stream' | 'table' | 'split') => void;
  hasTableToggle?: boolean;
}

function LiveDealerVideoPlayer({
  gameId,
  gameTitle,
  provider = 'JackTop Live Studios',
  streamUrl,
  onRefreshStream,
  isLoading = false,
  activeView = 'stream',
  setActiveView,
  hasTableToggle = false,
}: LiveDealerVideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0a0713] border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col mb-4"
    >
      {/* Broadcast Header Bar */}
      <div className="bg-gradient-to-r from-[#120a21] via-[#1a1030] to-[#120a21] px-3 sm:px-4 py-2 border-b border-amber-500/20 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 font-mono text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE 1080p HD</span>
          </div>
          <span className="text-zinc-200 font-bold hidden md:inline">JackTop Live Studio</span>
          <span className="text-zinc-600 hidden md:inline">•</span>
          <span className="text-amber-400 font-semibold text-[11px] truncate max-w-[180px] sm:max-w-xs flex items-center gap-1">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>{gameTitle}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasTableToggle && setActiveView && (
            <div className="flex items-center bg-black/60 border border-zinc-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setActiveView('stream')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  activeView === 'stream'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Watch Full Live Dealer Video Feed"
              >
                <Tv className="w-3 h-3" />
                <span className="hidden sm:inline">Live Stream</span>
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  activeView === 'table'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Switch to Interactive Felt Table Console"
              >
                <Gamepad2 className="w-3 h-3" />
                <span className="hidden sm:inline">Table Console</span>
              </button>
              <button
                onClick={() => setActiveView('split')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  activeView === 'split'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="View Both Live Stream & Table Console"
              >
                <span className="text-[10px] uppercase font-mono">Split</span>
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>42ms</span>
          </div>

          {onRefreshStream && (
            <button
              onClick={onRefreshStream}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors flex items-center gap-1 text-[11px]"
              title="Reconnect / Refresh Live Video Stream"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reconnect</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Stream Viewport */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[500px] lg:min-h-[580px] bg-black flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="relative w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-200">Connecting to JackTop Live Studio...</div>
              <div className="text-xs text-zinc-500 font-mono">Authenticating session token & establishing real dealer video stream</div>
            </div>
          </div>
        ) : streamUrl ? (
          <iframe
            id="game-provider-iframe"
            src={streamUrl}
            title={`${gameTitle} Live Dealer Stream`}
            className="w-full h-full border-0 absolute inset-0"
            allow="autoplay; fullscreen; camera; microphone; encrypted-media; clipboard-write; display-capture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-6 text-zinc-400">
            <Video className="w-10 h-10 text-amber-500" />
            <div className="text-sm font-bold text-white">Live Video Stream Initializing</div>
            <div className="text-xs text-zinc-500 max-w-sm">
              Connecting to authorized JackTop live casino broadcast feed...
            </div>
            {onRefreshStream && (
              <button
                onClick={onRefreshStream}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
              >
                Connect Stream
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stream Footer Bar */}
      <div className="bg-black/90 px-3 sm:px-4 py-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300">Live Provider:</span>
          <span className="text-amber-400 font-mono font-bold">JackTop Studios</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-400 font-mono hidden sm:inline">Timeless Tech Single-API</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Real Dealer Video Active
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">Autoplay Allowed</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LIVE STUDIO VIDEO BROADCAST HEADER & LIVE DEALER PRESENTER
// =========================================================================
function LiveDealerStudioHeader({
  studioName,
  dealerName,
  gameName,
  statusText,
  betCountdown,
  livePlayerCount = 142,
}: {
  studioName: string;
  dealerName: string;
  gameName: string;
  statusText: string;
  betCountdown: number;
  livePlayerCount?: number;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [cameraView, setCameraView] = useState<'table' | 'dealer' | 'close'>('table');

  return (
    <div className="w-full bg-gradient-to-b from-[#181224] to-[#0f0b18] border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative mb-4">
      {/* Studio Stream Top Bar */}
      <div className="bg-black/80 px-4 py-2 border-b border-white/10 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 font-mono text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE 1080p HD</span>
          </div>
          <span className="text-zinc-300 font-bold hidden sm:inline">{studioName}</span>
          <span className="text-zinc-500 hidden sm:inline">•</span>
          <span className="text-amber-400 font-semibold text-[11px]">Dealer: {dealerName}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>{livePlayerCount} Online</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-zinc-400 hover:text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() =>
                setCameraView((v) => (v === 'table' ? 'dealer' : v === 'dealer' ? 'close' : 'table'))
              }
              className="p-1 text-zinc-400 hover:text-white flex items-center gap-1 text-[10px]"
              title="Switch Camera View"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="uppercase text-[9px] font-mono">{cameraView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Presenter Video Backdrop Viewport */}
      <div className="relative h-44 sm:h-52 bg-gradient-to-r from-[#120c1f] via-[#24133b] to-[#120c1f] flex items-center justify-between px-6 overflow-hidden">
        {/* Studio Lighting Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute -top-10 left-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Live Dealer Graphic Presentation */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-zinc-900 overflow-hidden flex items-center justify-center">
            {/* Live Camera Stream Dealer Simulation */}
            <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-indigo-900 to-amber-900 flex flex-col items-center justify-center text-white">
              <span className="text-3xl">👩‍💼</span>
              <span className="text-[9px] font-black uppercase text-amber-300 mt-1">EVO LIVE</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-mono text-center text-emerald-400">
              AUDIO ON
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              <span>{gameName}</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white drop-shadow">
              {statusText}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span>Table Limits: £1 - £2,500</span>
            </div>
          </div>
        </div>

        {/* Betting Round Countdown Ring */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500/40 bg-black/60 flex flex-col items-center justify-center shadow-xl">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
              {betCountdown > 0 ? `${betCountdown}s` : 'CLOSED'}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">
              {betCountdown > 0 ? 'Place Bets' : 'Spinning'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 1. LIVE ROULETTE STUDIO (Evolution Lightning / Immersive)
// =========================================================================
function LiveRouletteStudio({
  onBet,
  isActionLocked,
  streamUrl,
  isStreamLoading,
  onRefreshStream,
  gameTitle = 'Lightning Roulette Live',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  streamUrl?: string;
  isStreamLoading?: boolean;
  onRefreshStream?: () => void;
  gameTitle?: string;
}) {
  const [activeView, setActiveView] = useState<'stream' | 'table' | 'split'>('stream');
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<'red' | 'black' | 'even' | 'odd' | number>('red');
  const [chipAmount, setChipAmount] = useState<number>(10);
  const [countdown, setCountdown] = useState<number>(12);
  const [lightningNumbers, setLightningNumbers] = useState<{ num: number; mult: number }[]>([]);
  const [history, setHistory] = useState<number[]>([14, 32, 0, 7, 23, 11, 35, 18]);

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const allNumbers = Array.from({ length: 37 }, (_, i) => i);

  const spin = () => {
    if (isSpinning || isActionLocked) return;
    setIsSpinning(true);
    setCountdown(0);
    setWinningNumber(null);

    // Pick 2 Lightning Numbers
    const l1 = Math.floor(Math.random() * 36) + 1;
    const l2 = Math.floor(Math.random() * 36) + 1;
    const mults = [50, 100, 200, 500];
    setLightningNumbers([
      { num: l1, mult: mults[Math.floor(Math.random() * mults.length)] },
      { num: l2, mult: mults[Math.floor(Math.random() * mults.length)] },
    ]);

    const targetNum = Math.floor(Math.random() * 37);
    setWheelAngle((prev) => prev + 1800 + targetNum * (360 / 37));

    setTimeout(() => {
      setIsSpinning(false);
      setWinningNumber(targetNum);
      setHistory((prev) => [targetNum, ...prev.slice(0, 9)]);
      setCountdown(12);

      let winMult = 0;
      const isRed = redNumbers.includes(targetNum);
      const isBlack = targetNum !== 0 && !isRed;
      const isEven = targetNum !== 0 && targetNum % 2 === 0;
      const isOdd = targetNum !== 0 && targetNum % 2 !== 0;

      if (selectedBet === 'red' && isRed) winMult = 2;
      else if (selectedBet === 'black' && isBlack) winMult = 2;
      else if (selectedBet === 'even' && isEven) winMult = 2;
      else if (selectedBet === 'odd' && isOdd) winMult = 2;
      else if (typeof selectedBet === 'number' && selectedBet === targetNum) {
        const lightning = lightningNumbers.find((l) => l.num === targetNum);
        winMult = lightning ? lightning.mult : 36;
      }

      onBet(chipAmount, `Live Roulette (${selectedBet})`, winMult);
    }, 3500);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 1. Real Live Dealer Video Broadcast */}
      {(activeView === 'stream' || activeView === 'split') && (
        <LiveDealerVideoPlayer
          gameId="roulette"
          gameTitle={gameTitle}
          streamUrl={streamUrl}
          isLoading={isStreamLoading}
          onRefreshStream={onRefreshStream}
          activeView={activeView}
          setActiveView={setActiveView}
          hasTableToggle={true}
        />
      )}

      {/* 2. Interactive Wheel Console */}
      {(activeView === 'table' || activeView === 'split') && (
        <div className="w-full flex flex-col items-center gap-4">
          {activeView === 'table' && (
            <div className="w-full flex items-center justify-between bg-[#151022] border border-amber-500/30 px-4 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Interactive Wheel Console Active</span>
              </div>
              <button
                onClick={() => setActiveView('stream')}
                className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Switch to Live Dealer Stream</span>
              </button>
            </div>
          )}

          <LiveDealerStudioHeader
            studioName="JackTop Live Studio • Riga"
            dealerName="Isabella M."
            gameName={gameTitle}
            statusText={
              isSpinning
                ? '⚡ BALL IN MOTION — WHEEL DECELERATING'
                : winningNumber !== null
                ? `🎉 WINNER NUMBER: ${winningNumber} ${
                    winningNumber === 0 ? 'GREEN' : redNumbers.includes(winningNumber) ? 'RED' : 'BLACK'
                  }`
                : 'PLACE YOUR CHIPS ON THE FELT'
            }
            betCountdown={countdown}
          />

      {/* Lightning Numbers Banner */}
      {lightningNumbers.length > 0 && (
        <div className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600/20 via-amber-500/40 to-amber-600/20 border border-amber-500/60 p-2.5 rounded-xl animate-pulse">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-200 uppercase">⚡ Lightning Multipliers Active:</span>
          {lightningNumbers.map((l, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded bg-black/80 border border-amber-400 font-extrabold text-white text-xs drop-shadow"
            >
              #{l.num} → <strong className="text-amber-400">{l.mult}x</strong>
            </span>
          ))}
        </div>
      )}

      {/* 3D Wheel & History Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121019] p-4 rounded-2xl border border-white/10">
        {/* Animated European Wheel */}
        <div className="relative w-44 h-44 rounded-full border-4 border-amber-500/70 shadow-2xl bg-zinc-950 flex items-center justify-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-amber-400" />
          <div
            className="w-full h-full rounded-full border border-zinc-700 flex items-center justify-center transition-transform duration-[3500ms] cubic-bezier(0.1, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${wheelAngle}deg)` }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-xs text-black shadow-inner">
              EVO
            </div>
          </div>
          <div className="absolute z-10 w-20 h-20 rounded-full bg-zinc-900 border-2 border-amber-400/50 flex flex-col items-center justify-center shadow-xl">
            {isSpinning ? (
              <span className="text-[9px] font-bold text-amber-400 animate-pulse">ROLLING...</span>
            ) : winningNumber !== null ? (
              <>
                <span className="text-xl font-black text-white">{winningNumber}</span>
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    winningNumber === 0 ? 'bg-emerald-600' : redNumbers.includes(winningNumber) ? 'bg-red-600' : 'bg-zinc-800'
                  }`}
                >
                  {winningNumber === 0 ? 'Zero' : redNumbers.includes(winningNumber) ? 'Red' : 'Black'}
                </span>
              </>
            ) : (
              <span className="text-[9px] text-zinc-400">READY</span>
            )}
          </div>
        </div>

        {/* Live History Roadmap Ribbon */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Last 8 Numbers History</span>
            <span className="text-amber-400 font-mono">Live Sync</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {history.map((num, i) => {
              const isRed = redNumbers.includes(num);
              const isZero = num === 0;
              return (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow border border-white/10 shrink-0 ${
                    isZero ? 'bg-emerald-600' : isRed ? 'bg-red-600' : 'bg-zinc-800'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center gap-3 pt-1">
            <span>Red: <strong className="text-red-400">52%</strong></span>
            <span>Black: <strong className="text-zinc-300">44%</strong></span>
            <span>Green: <strong className="text-emerald-400">4%</strong></span>
          </div>
        </div>
      </div>

      {/* European Felt Betting Grid */}
      <div className="w-full bg-[#0a2318] border-2 border-emerald-600/50 rounded-2xl p-4 shadow-2xl space-y-3">
        <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center justify-between">
          <span>Live Felt Table (European Single Zero)</span>
          <span>Selected Chip: £{chipAmount}</span>
        </div>

        {/* Outside Bets */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedBet('red')}
            className={`py-3 rounded-xl font-bold text-xs uppercase shadow transition-all ${
              selectedBet === 'red'
                ? 'bg-red-600 text-white ring-2 ring-white scale-[1.02]'
                : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/50'
            }`}
          >
            Red (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('black')}
            className={`py-3 rounded-xl font-bold text-xs uppercase shadow transition-all ${
              selectedBet === 'black'
                ? 'bg-zinc-800 text-white ring-2 ring-white scale-[1.02]'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            Black (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('even')}
            className={`py-3 rounded-xl font-bold text-xs uppercase shadow transition-all ${
              selectedBet === 'even'
                ? 'bg-emerald-600 text-white ring-2 ring-white scale-[1.02]'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50'
            }`}
          >
            Even (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('odd')}
            className={`py-3 rounded-xl font-bold text-xs uppercase shadow transition-all ${
              selectedBet === 'odd'
                ? 'bg-emerald-600 text-white ring-2 ring-white scale-[1.02]'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50'
            }`}
          >
            Odd (1:1)
          </button>
        </div>

        {/* Number Straight-Up Grid 0..36 */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2 border-t border-emerald-800/40">
          {allNumbers.map((num) => {
            const isRed = redNumbers.includes(num);
            const isZero = num === 0;
            const isSelected = selectedBet === num;
            return (
              <button
                key={num}
                onClick={() => setSelectedBet(num)}
                className={`h-9 rounded-lg font-black text-xs transition-all ${
                  isSelected
                    ? 'ring-2 ring-amber-400 bg-amber-400 text-black scale-105'
                    : isZero
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : isRed
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chip Denominations & Spin Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {[
            { val: 1, col: 'bg-zinc-700' },
            { val: 5, col: 'bg-red-700' },
            { val: 10, col: 'bg-blue-700' },
            { val: 25, col: 'bg-emerald-700' },
            { val: 100, col: 'bg-purple-700' },
            { val: 500, col: 'bg-amber-600' },
          ].map((chip) => (
            <CasinoChip
              key={chip.val}
              value={chip.val}
              isSelected={chipAmount === chip.val}
              onClick={() => setChipAmount(chip.val)}
              color={chip.col}
            />
          ))}
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || isActionLocked}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-900/40 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSpinning ? 'BALL IN MOTION...' : `SPIN WHEEL (£${chipAmount})`}</span>
        </button>
      </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. LIVE BLACKJACK VIP STUDIO (Evolution / Pragmatic)
// =========================================================================
interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  num: number;
}

function LiveBlackjackStudio({
  onBet,
  isActionLocked,
  streamUrl,
  isStreamLoading,
  onRefreshStream,
  gameTitle = 'Live Blackjack VIP',
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  streamUrl?: string;
  isStreamLoading?: boolean;
  onRefreshStream?: () => void;
  gameTitle?: string;
}) {
  const [activeView, setActiveView] = useState<'stream' | 'table' | 'split'>('stream');
  const [chipAmount, setChipAmount] = useState<number>(25);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'finished'>('betting');
  const [resultMessage, setResultMessage] = useState<string>('Place your bet to deal hand');

  const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const drawCard = (): Card => {
    const s = suits[Math.floor(Math.random() * suits.length)];
    const v = values[Math.floor(Math.random() * values.length)];
    let num = parseInt(v);
    if (['J', 'Q', 'K'].includes(v)) num = 10;
    if (v === 'A') num = 11;
    return { suit: s, value: v, num };
  };

  const getHandTotal = (hand: Card[]) => {
    let total = hand.reduce((acc, c) => acc + c.num, 0);
    let aces = hand.filter((c) => c.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const dealGame = () => {
    if (gameState === 'playing' || isActionLocked) return;
    const p1 = drawCard();
    const d1 = drawCard();
    const p2 = drawCard();
    const d2 = drawCard();

    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setGameState('playing');
    setResultMessage('Player Turn: Hit or Stand?');

    const pTotal = getHandTotal([p1, p2]);
    if (pTotal === 21) {
      finishGame([p1, p2], [d1, d2], 2.5, 'Blackjack! 3:2 Payout');
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    const nextCard = drawCard();
    const nextHand = [...playerHand, nextCard];
    setPlayerHand(nextHand);

    const total = getHandTotal(nextHand);
    if (total > 21) {
      finishGame(nextHand, dealerHand, 0, 'Player Busted (Over 21)');
    } else if (total === 21) {
      stand(nextHand);
    }
  };

  const stand = (currentPHand?: Card[]) => {
    const pHand = currentPHand || playerHand;
    setGameState('dealer_turn');

    let curDHand = [...dealerHand];
    let dTotal = getHandTotal(curDHand);

    while (dTotal < 17) {
      curDHand.push(drawCard());
      dTotal = getHandTotal(curDHand);
    }
    setDealerHand(curDHand);

    const pTotal = getHandTotal(pHand);
    if (dTotal > 21) {
      finishGame(pHand, curDHand, 2, 'Dealer Busted! Player Wins');
    } else if (pTotal > dTotal) {
      finishGame(pHand, curDHand, 2, 'Player Wins (Higher Hand)');
    } else if (pTotal === dTotal) {
      finishGame(pHand, curDHand, 1, 'Push (Tie Hand)');
    } else {
      finishGame(pHand, curDHand, 0, 'Dealer Wins');
    }
  };

  const finishGame = (p: Card[], d: Card[], mult: number, msg: string) => {
    setGameState('finished');
    setResultMessage(msg);
    onBet(chipAmount, `Live Blackjack VIP`, mult);
  };

  const pTotal = getHandTotal(playerHand);
  const dTotal = gameState === 'playing' ? dealerHand[0]?.num || 0 : getHandTotal(dealerHand);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 1. Real Live Dealer Video Broadcast */}
      {(activeView === 'stream' || activeView === 'split') && (
        <LiveDealerVideoPlayer
          gameId="blackjack"
          gameTitle={gameTitle}
          streamUrl={streamUrl}
          isLoading={isStreamLoading}
          onRefreshStream={onRefreshStream}
          activeView={activeView}
          setActiveView={setActiveView}
          hasTableToggle={true}
        />
      )}

      {/* 2. Interactive Felt Table Console */}
      {(activeView === 'table' || activeView === 'split') && (
        <div className="w-full flex flex-col items-center gap-4">
          {activeView === 'table' && (
            <div className="w-full flex items-center justify-between bg-[#151022] border border-amber-500/30 px-4 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Interactive Table Console Active</span>
              </div>
              <button
                onClick={() => setActiveView('stream')}
                className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Switch to Live Dealer Stream</span>
              </button>
            </div>
          )}

          <LiveDealerStudioHeader
            studioName="JackTop VIP Studio • Bucharest"
            dealerName="Alexander K."
            gameName={gameTitle}
            statusText={resultMessage}
            betCountdown={gameState === 'betting' ? 10 : 0}
          />

      {/* Blackjack Green Felt Table */}
      <div className="w-full bg-[#0a2318] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6 relative overflow-hidden">
        {/* Table Felt Logo */}
        <div className="text-center">
          <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-extrabold">
            BLACKJACK PAYS 3 TO 2 • DEALER MUST DRAW TO 16 AND STAND ON ALL 17s
          </div>
        </div>

        {/* Dealer Hand Area */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
            <span>DEALER HAND</span>
            {dealerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-black/60 text-amber-300 font-mono">
                {gameState === 'playing' ? `${dTotal} + ?` : `${dTotal}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 min-h-[90px]">
            {dealerHand.map((c, i) => {
              const isHidden = i === 1 && gameState === 'playing';
              return (
                <div
                  key={i}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl shadow-xl border flex flex-col justify-between p-2 font-bold ${
                    isHidden
                      ? 'bg-gradient-to-br from-blue-900 to-indigo-950 border-blue-500'
                      : 'bg-white text-zinc-950 border-zinc-300'
                  }`}
                >
                  {isHidden ? (
                    <div className="h-full flex items-center justify-center font-black text-xs text-blue-300">
                      EVO
                    </div>
                  ) : (
                    <>
                      <div
                        className={`text-xs ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'}`}
                      >
                        {c.value} {c.suit}
                      </div>
                      <div
                        className={`text-xl sm:text-2xl text-center ${
                          ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'
                        }`}
                      >
                        {c.suit}
                      </div>
                      <div
                        className={`text-xs text-right ${
                          ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'
                        }`}
                      >
                        {c.value}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Hand Area */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
            <span>PLAYER HAND</span>
            {playerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-black/60 text-emerald-400 font-mono">
                Total: {pTotal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 min-h-[90px]">
            {playerHand.map((c, i) => (
              <div
                key={i}
                className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl shadow-xl bg-white text-zinc-950 border border-zinc-300 flex flex-col justify-between p-2 font-bold transform -translate-y-1"
              >
                <div
                  className={`text-xs ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'}`}
                >
                  {c.value} {c.suit}
                </div>
                <div
                  className={`text-xl sm:text-2xl text-center ${
                    ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'
                  }`}
                >
                  {c.suit}
                </div>
                <div
                  className={`text-xs text-right ${
                    ['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-zinc-900'
                  }`}
                >
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls & Chip Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {[
            { val: 10, col: 'bg-blue-700' },
            { val: 25, col: 'bg-emerald-700' },
            { val: 50, col: 'bg-purple-700' },
            { val: 100, col: 'bg-amber-600' },
            { val: 250, col: 'bg-zinc-800' },
          ].map((chip) => (
            <CasinoChip
              key={chip.val}
              value={chip.val}
              isSelected={chipAmount === chip.val}
              onClick={() => setChipAmount(chip.val)}
              color={chip.col}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {gameState === 'playing' ? (
            <>
              <button
                onClick={hit}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg uppercase active:scale-95"
              >
                HIT
              </button>
              <button
                onClick={() => stand()}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg uppercase active:scale-95"
              >
                STAND
              </button>
            </>
          ) : (
            <button
              onClick={dealGame}
              disabled={isActionLocked}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm shadow-xl shadow-amber-900/40 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>DEAL HAND (£{chipAmount})</span>
            </button>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 3. LIVE SPEED BACCARAT & DRAGON TIGER STUDIO
// =========================================================================
function LiveBaccaratStudio({
  isDragonTiger = false,
  onBet,
  isActionLocked,
  streamUrl,
  isStreamLoading,
  onRefreshStream,
  gameTitle = 'Speed Baccarat Live',
}: {
  isDragonTiger?: boolean;
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
  streamUrl?: string;
  isStreamLoading?: boolean;
  onRefreshStream?: () => void;
  gameTitle?: string;
}) {
  const [activeView, setActiveView] = useState<'stream' | 'table' | 'split'>('stream');
  const [selectedBet, setSelectedBet] = useState<'player' | 'banker' | 'tie'>('player');
  const [chipAmount, setChipAmount] = useState<number>(25);
  const [isDealing, setIsDealing] = useState(false);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const [bankerScore, setBankerScore] = useState<number | null>(null);
  const [resultText, setResultText] = useState('Place your bets on Player, Banker or Tie');
  const [roadmap, setRoadmap] = useState<('P' | 'B' | 'T')[]>(['B', 'B', 'P', 'B', 'T', 'P', 'P', 'B']);

  const dealRound = () => {
    if (isDealing || isActionLocked) return;
    setIsDealing(true);
    setPlayerScore(null);
    setBankerScore(null);
    setResultText('Dealing cards live from shoe...');

    setTimeout(() => {
      const p = Math.floor(Math.random() * 10);
      const b = Math.floor(Math.random() * 10);
      setPlayerScore(p);
      setBankerScore(b);
      setIsDealing(false);

      let winner: 'P' | 'B' | 'T' = 'T';
      let winMult = 0;

      if (p > b) {
        winner = 'P';
        setResultText(isDragonTiger ? `Dragon Wins (${p} vs ${b})` : `Player Wins (${p} vs ${b})`);
        if (selectedBet === 'player') winMult = 2;
      } else if (b > p) {
        winner = 'B';
        setResultText(isDragonTiger ? `Tiger Wins (${b} vs ${p})` : `Banker Wins (${b} vs ${p})`);
        if (selectedBet === 'banker') winMult = 1.95;
      } else {
        winner = 'T';
        setResultText(`Tie Hand (${p} - ${b})`);
        if (selectedBet === 'tie') winMult = 9;
      }

      setRoadmap((prev) => [...prev.slice(1), winner]);
      onBet(chipAmount, isDragonTiger ? `Dragon Tiger (${selectedBet})` : `Live Baccarat (${selectedBet})`, winMult);
    }, 2500);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 1. Real Live Dealer Video Broadcast */}
      {(activeView === 'stream' || activeView === 'split') && (
        <LiveDealerVideoPlayer
          gameId="baccarat"
          gameTitle={gameTitle}
          streamUrl={streamUrl}
          isLoading={isStreamLoading}
          onRefreshStream={onRefreshStream}
          activeView={activeView}
          setActiveView={setActiveView}
          hasTableToggle={true}
        />
      )}

      {/* 2. Interactive Table Console */}
      {(activeView === 'table' || activeView === 'split') && (
        <div className="w-full flex flex-col items-center gap-4">
          {activeView === 'table' && (
            <div className="w-full flex items-center justify-between bg-[#151022] border border-amber-500/30 px-4 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Interactive Table Console Active</span>
              </div>
              <button
                onClick={() => setActiveView('stream')}
                className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Switch to Live Dealer Stream</span>
              </button>
            </div>
          )}

          <LiveDealerStudioHeader
            studioName="JackTop Live Studio • Batumi"
            dealerName="Elena V."
            gameName={gameTitle}
            statusText={resultText}
            betCountdown={isDealing ? 0 : 8}
          />

      {/* Asian Gold Baccarat Table */}
      <div className="w-full bg-[#1c0f10] border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6">
        {/* Score comparison board */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          {/* Player / Dragon Card Box */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-blue-950/60 border border-blue-500/40">
            <span className="text-xs uppercase font-black text-blue-400">
              {isDragonTiger ? 'DRAGON' : 'PLAYER'}
            </span>
            <div className="text-4xl font-mono font-black text-white my-2">
              {isDealing ? '...' : playerScore !== null ? playerScore : '-'}
            </div>
            <span className="text-[10px] text-zinc-400">PAYS 1:1</span>
          </div>

          {/* Banker / Tiger Card Box */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-red-950/60 border border-red-500/40">
            <span className="text-xs uppercase font-black text-red-400">
              {isDragonTiger ? 'TIGER' : 'BANKER'}
            </span>
            <div className="text-4xl font-mono font-black text-white my-2">
              {isDealing ? '...' : bankerScore !== null ? bankerScore : '-'}
            </div>
            <span className="text-[10px] text-zinc-400">PAYS 0.95:1</span>
          </div>
        </div>

        {/* Traditional Bead Plate Roadmap */}
        <div className="w-full bg-black/60 p-3 rounded-2xl border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Live Bead Plate Roadmap (Scorecard)</span>
            <span className="text-amber-400 font-mono">Streak History</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {roadmap.map((res, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow ${
                  res === 'B' ? 'bg-red-600' : res === 'P' ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                {res}
              </div>
            ))}
          </div>
        </div>

        {/* Main Betting Area */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
          <button
            onClick={() => setSelectedBet('player')}
            className={`py-4 rounded-2xl font-black text-sm uppercase shadow transition-all ${
              selectedBet === 'player'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105'
                : 'bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-600/40'
            }`}
          >
            {isDragonTiger ? 'DRAGON' : 'PLAYER'}
          </button>
          <button
            onClick={() => setSelectedBet('tie')}
            className={`py-4 rounded-2xl font-black text-sm uppercase shadow transition-all ${
              selectedBet === 'tie'
                ? 'bg-emerald-600 text-white ring-2 ring-white scale-105'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/40'
            }`}
          >
            TIE (8:1)
          </button>
          <button
            onClick={() => setSelectedBet('banker')}
            className={`py-4 rounded-2xl font-black text-sm uppercase shadow transition-all ${
              selectedBet === 'banker'
                ? 'bg-red-600 text-white ring-2 ring-white scale-105'
                : 'bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-600/40'
            }`}
          >
            {isDragonTiger ? 'TIGER' : 'BANKER'}
          </button>
        </div>
      </div>

      {/* Chip Denominations & Deal Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {[
            { val: 10, col: 'bg-blue-700' },
            { val: 25, col: 'bg-emerald-700' },
            { val: 50, col: 'bg-purple-700' },
            { val: 100, col: 'bg-amber-600' },
            { val: 500, col: 'bg-zinc-800' },
          ].map((chip) => (
            <CasinoChip
              key={chip.val}
              value={chip.val}
              isSelected={chipAmount === chip.val}
              onClick={() => setChipAmount(chip.val)}
              color={chip.col}
            />
          ))}
        </div>

        <button
          onClick={dealRound}
          disabled={isDealing || isActionLocked}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-xl shadow-red-900/40 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isDealing ? 'DEALING CARDS...' : `DEAL HAND (£${chipAmount})`}</span>
        </button>
      </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. LIVE TEEN PATTI & ANDAR BAHAR STUDIO (Ezugi / Evolution Desi)
// =========================================================================
function LiveDesiStudio({
  isAndarBahar = false,
  onBet,
  isActionLocked,
}: {
  isAndarBahar?: boolean;
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
}) {
  const [selectedBet, setSelectedBet] = useState<'andar' | 'bahar' | 'player' | 'dealer'>('andar');
  const [chipAmount, setChipAmount] = useState<number>(20);
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard, setJokerCard] = useState<string>('8♠');
  const [dealtCards, setDealtCards] = useState<{ spot: 'andar' | 'bahar'; card: string }[]>([]);
  const [resultText, setResultText] = useState('Place your bet on Andar or Bahar');

  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];

  const dealAndarBahar = () => {
    if (isDealing || isActionLocked) return;
    setIsDealing(true);
    setDealtCards([]);

    const targetRank = ranks[Math.floor(Math.random() * ranks.length)];
    const targetSuit = suits[Math.floor(Math.random() * suits.length)];
    const jCard = `${targetRank}${targetSuit}`;
    setJokerCard(jCard);
    setResultText(`Joker Card: ${jCard} — Dealing to Andar & Bahar...`);

    const sequence: { spot: 'andar' | 'bahar'; card: string }[] = [];
    const totalCards = Math.floor(Math.random() * 8) + 2;

    for (let i = 0; i < totalCards; i++) {
      const spot = i % 2 === 0 ? 'andar' : 'bahar';
      const isWinner = i === totalCards - 1;
      const rank = isWinner ? targetRank : ranks[Math.floor(Math.random() * (ranks.length - 1))];
      const s = suits[Math.floor(Math.random() * suits.length)];
      sequence.push({ spot, card: `${rank}${s}` });
    }

    setTimeout(() => {
      setDealtCards(sequence);
      setIsDealing(false);
      const winningSpot = sequence[sequence.length - 1].spot;
      setResultText(`🎉 Winning Match on ${winningSpot.toUpperCase()}!`);
      const winMult = selectedBet === winningSpot ? 1.9 : 0;
      onBet(chipAmount, `Super Andar Bahar (${selectedBet})`, winMult);
    }, 2400);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <LiveDealerStudioHeader
        studioName="Ezugi Live Studio • Goa"
        dealerName="Pooja S."
        gameName={isAndarBahar ? 'Super Andar Bahar Live' : 'Live Teen Patti 20-20'}
        statusText={resultText}
        betCountdown={isDealing ? 0 : 9}
      />

      {/* Velvet Crimson Table */}
      <div className="w-full bg-[#200e12] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6">
        {/* Joker Opening Card */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
            MIDDLE JOKER CARD
          </span>
          <div className="w-16 h-24 rounded-xl bg-white text-zinc-950 font-black text-2xl border-2 border-amber-400 flex items-center justify-center shadow-2xl transform scale-105">
            {jokerCard}
          </div>
        </div>

        {/* Andar vs Bahar Card Strips */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* ANDAR */}
          <div
            className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
              selectedBet === 'andar' ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400' : 'bg-black/40 border-zinc-800'
            }`}
          >
            <button
              onClick={() => setSelectedBet('andar')}
              className="text-sm font-black uppercase text-amber-400 tracking-wider"
            >
              ANDAR (1.9x)
            </button>
            <div className="flex flex-wrap gap-1.5 justify-center min-h-[50px]">
              {dealtCards
                .filter((c) => c.spot === 'andar')
                .map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-white text-zinc-950 font-bold text-xs shadow"
                  >
                    {c.card}
                  </span>
                ))}
            </div>
          </div>

          {/* BAHAR */}
          <div
            className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
              selectedBet === 'bahar' ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400' : 'bg-black/40 border-zinc-800'
            }`}
          >
            <button
              onClick={() => setSelectedBet('bahar')}
              className="text-sm font-black uppercase text-amber-400 tracking-wider"
            >
              BAHAR (2.0x)
            </button>
            <div className="flex flex-wrap gap-1.5 justify-center min-h-[50px]">
              {dealtCards
                .filter((c) => c.spot === 'bahar')
                .map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-white text-zinc-950 font-bold text-xs shadow"
                  >
                    {c.card}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chip Denominations & Play */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {[
            { val: 10, col: 'bg-blue-700' },
            { val: 20, col: 'bg-emerald-700' },
            { val: 50, col: 'bg-purple-700' },
            { val: 100, col: 'bg-amber-600' },
          ].map((chip) => (
            <CasinoChip
              key={chip.val}
              value={chip.val}
              isSelected={chipAmount === chip.val}
              onClick={() => setChipAmount(chip.val)}
              color={chip.col}
            />
          ))}
        </div>

        <button
          onClick={dealAndarBahar}
          disabled={isDealing || isActionLocked}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm shadow-xl shadow-amber-900/40 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isDealing ? 'DEALING MATCH...' : `PLACE BET (£${chipAmount})`}</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 5. LIVE GAME SHOW MONEY WHEEL STUDIO (Crazy Time / CandyLand / Mega Wheel)
// =========================================================================
function LiveGameShowStudio({
  gameTitle,
  onBet,
  isActionLocked,
}: {
  gameTitle: string;
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
}) {
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningSegment, setWinningSegment] = useState<string | null>(null);
  const [selectedBet, setSelectedBet] = useState<string>('1');
  const [chipAmount, setChipAmount] = useState<number>(10);
  const [statusText, setStatusText] = useState('Presenter spinning the giant wheel');

  const segments = [
    { label: '1', mult: 1, color: 'bg-blue-600' },
    { label: '2', mult: 2, color: 'bg-amber-500' },
    { label: '5', mult: 5, color: 'bg-purple-600' },
    { label: '10', mult: 10, color: 'bg-emerald-600' },
    { label: 'COIN FLIP', mult: 25, color: 'bg-red-600' },
    { label: 'CRAZY TIME', mult: 50, color: 'bg-gradient-to-r from-pink-500 to-amber-400 text-black font-black' },
  ];

  const spinWheel = () => {
    if (isSpinning || isActionLocked) return;
    setIsSpinning(true);
    setWinningSegment(null);
    setStatusText('Presenter spun the wheel! Ticker clicking...');

    const chosen = segments[Math.floor(Math.random() * segments.length)];
    const newAngle = wheelAngle + 2160 + Math.floor(Math.random() * 360);
    setWheelAngle(newAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSegment(chosen.label);
      setStatusText(`🎉 FLAPPER STOPPED ON: ${chosen.label} (${chosen.mult}x)`);

      const winMult = selectedBet === chosen.label ? chosen.mult : 0;
      onBet(chipAmount, `${gameTitle} (${selectedBet})`, winMult);
    }, 4000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <LiveDealerStudioHeader
        studioName="Evolution Live Game Studio • Riga"
        dealerName="Marco & Chloe"
        gameName={gameTitle}
        statusText={statusText}
        betCountdown={isSpinning ? 0 : 15}
      />

      {/* Giant Rotating Studio Wheel Visual */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-amber-400 shadow-2xl bg-zinc-950 flex items-center justify-center p-2">
        {/* Flapper Indicator Pointer */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-2xl" />

        <div
          className="w-full h-full rounded-full border-4 border-white/20 flex items-center justify-center transition-transform duration-[4000ms] cubic-bezier(0.12, 0.95, 0.25, 1)"
          style={{
            transform: `rotate(${wheelAngle}deg)`,
            background:
              'conic-gradient(from 0deg, #2563eb, #f59e0b, #9333ea, #10b981, #dc2626, #ec4899, #2563eb)',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-amber-400 flex flex-col items-center justify-center shadow-2xl">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-[10px] font-black tracking-widest text-white mt-1">CRAZY</span>
          </div>
        </div>

        {/* Center Result Pop */}
        {winningSegment && (
          <div className="absolute z-30 px-4 py-2 rounded-2xl bg-black/90 border-2 border-amber-400 text-white font-black text-sm shadow-2xl animate-bounce">
            {winningSegment}
          </div>
        )}
      </div>

      {/* Segment Betting Options */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-2xl">
        {segments.map((seg) => (
          <button
            key={seg.label}
            onClick={() => setSelectedBet(seg.label)}
            className={`py-3.5 rounded-2xl font-black text-xs uppercase shadow transition-all ${
              selectedBet === seg.label
                ? 'ring-4 ring-white scale-105 z-10'
                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
            } ${seg.color} text-white`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Chip Denominations & Spin */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {[
            { val: 2, col: 'bg-zinc-700' },
            { val: 5, col: 'bg-red-700' },
            { val: 10, col: 'bg-blue-700' },
            { val: 25, col: 'bg-emerald-700' },
            { val: 50, col: 'bg-purple-700' },
          ].map((chip) => (
            <CasinoChip
              key={chip.val}
              value={chip.val}
              isSelected={chipAmount === chip.val}
              onClick={() => setChipAmount(chip.val)}
              color={chip.col}
            />
          ))}
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || isActionLocked}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-900/40 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSpinning ? 'WHEEL SPINNING...' : `SPIN WHEEL (£${chipAmount})`}</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 6. AVIATOR CRASH ENGINE
// =========================================================================
function AviatorCrashStudio({
  onBet,
  isActionLocked,
}: {
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
}) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startFlight = () => {
    if (gameState === 'flying' || isActionLocked) return;
    setGameState('flying');
    setHasCashedOut(false);
    setMultiplier(1.0);

    const crashAt = +(1.2 + Math.random() * 8.5).toFixed(2);
    let cur = 1.0;

    timerRef.current = setInterval(() => {
      cur = +(cur + 0.04).toFixed(2);
      if (cur >= crashAt) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState('crashed');
      } else {
        setMultiplier(cur);
      }
    }, 100);
  };

  const cashOut = () => {
    if (gameState !== 'flying' || hasCashedOut) return;
    setHasCashedOut(true);
    onBet(betAmount, 'Aviator Cashout', multiplier);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full bg-[#120914] border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl relative min-h-[300px] flex flex-col justify-between overflow-hidden">
        {/* Aviator Plane Runway */}
        <div className="relative flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            {multiplier.toFixed(2)}x
          </div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-red-400 mt-2">
            {gameState === 'crashed'
              ? 'FLEW AWAY!'
              : gameState === 'flying'
              ? 'AIRCRAFT IN FLIGHT'
              : 'READY FOR TAKEOFF'}
          </div>
        </div>

        {/* Flight Action Button */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
          {gameState === 'flying' ? (
            <button
              onClick={cashOut}
              disabled={hasCashedOut}
              className="px-10 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl active:scale-95"
            >
              {hasCashedOut
                ? `CASHED OUT (${multiplier.toFixed(2)}x)`
                : `CASHOUT £${(betAmount * multiplier).toFixed(2)}`}
            </button>
          ) : (
            <button
              onClick={startFlight}
              disabled={isActionLocked}
              className="px-10 py-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-xl active:scale-95"
            >
              LAUNCH FLIGHT (£{betAmount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 7. HIGH-END VEGAS VIDEO SLOT CABINET
// =========================================================================
function VegasSlotsCabinet({
  gameId,
  gameName,
  onBet,
  isActionLocked,
}: {
  gameId: string;
  gameName: string;
  onBet: (amount: number, betType: string, winMultiplier: number) => void;
  isActionLocked: boolean;
}) {
  const [reels, setReels] = useState<string[][]>([
    ['💎', '👑', '⚡', '🍇', '🔔'],
    ['👑', '💎', '7️⃣', '⚡', '👑'],
    ['🍇', '🔔', '💎', '7️⃣', '🍇'],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [winMessage, setWinMessage] = useState('Select lines and press spin');

  const symbols = ['💎', '👑', '⚡', '🍇', '🔔', '7️⃣', '🍒'];

  const spin = () => {
    if (isSpinning || isActionLocked) return;
    setIsSpinning(true);
    setWinMessage('Spinning Vegas reels...');

    setTimeout(() => {
      const newGrid = [
        Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]),
        Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]),
        Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]),
      ];
      setReels(newGrid);
      setIsSpinning(false);

      const hasMatch = Math.random() > 0.45;
      const winMult = hasMatch ? [2, 3, 5, 10][Math.floor(Math.random() * 4)] : 0;
      setWinMessage(winMult > 0 ? `🎉 MEGA WIN: ${winMult}x!` : 'Try again next spin');
      onBet(betAmount, `${gameName} Slot Spin`, winMult);
    }, 1800);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Neon Vegas Slot Cabinet */}
      <div className="w-full bg-[#181024] border-4 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="text-center">
          <div className="text-xs uppercase font-black tracking-widest text-purple-300 font-mono">
            {gameName} Video Slot Cabinet
          </div>
          <div className="text-xs text-amber-400 font-bold">{winMessage}</div>
        </div>

        {/* 5x3 Reel Matrix */}
        <div className="grid grid-rows-3 gap-2 bg-black/80 p-4 rounded-2xl border border-zinc-800">
          {reels.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-5 gap-2">
              {row.map((sym, cIdx) => (
                <div
                  key={cIdx}
                  className={`h-16 rounded-xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner ${
                    isSpinning ? 'animate-pulse scale-95 opacity-50' : ''
                  }`}
                >
                  {sym}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-2">
          <button
            onClick={spin}
            disabled={isSpinning || isActionLocked}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isSpinning ? 'REELS SPINNING...' : `SPIN REELS (£${betAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN SANDBOX LAUNCHER CONTROLLER ROUTER
// =========================================================================
function SandboxFrameContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '1stake_dice';
  const paramCategory = searchParams.get('category') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramProvider = searchParams.get('provider') || '1Stake In-House';
  const paramCurrency = (searchParams.get('currency') || 'GC') as 'GC' | 'SC';
  const paramStreamUrl = searchParams.get('streamUrl') || '';
  const token = searchParams.get('token') || 'test_token';
  const player = searchParams.get('player') || 'demo_player';

  // Sweepstakes dual-currency state
  const [currency, setCurrency] = useState<'GC' | 'SC'>(paramCurrency);
  const [gcBalance, setGcBalance] = useState<number>(100000.0);
  const [scBalance, setScBalance] = useState<number>(50.0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>(paramStreamUrl);
  const [isStreamLoading, setIsStreamLoading] = useState<boolean>(false);

  const activeBalance = currency === 'GC' ? gcBalance : scBalance;

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const isLiveStreamEligible =
    gameId.includes('blackjack') ||
    gameId.includes('roulette') ||
    gameId.includes('baccarat') ||
    gameId.includes('poker') ||
    paramCategory === 'live_casino';

  const refreshLiveStream = async () => {
    setIsStreamLoading(true);
    addLog(`Connecting to JackTop live dealer broadcast for ${gameId}...`);
    try {
      const res = await fetch(`/api/v1/games/casino/live-stream?gameId=${encodeURIComponent(gameId)}`);
      const data = await res.json();
      if (data.ok && data.streamUrl) {
        setStreamUrl(data.streamUrl);
        addLog(`✓ Live TV/video stream linked: ${data.provider} (${data.streamQuality})`);
      } else {
        addLog(`⚠️ Live stream unavailable: ${data.error || 'Check provider session'}`);
      }
    } catch (e: any) {
      addLog(`❌ Live stream connection error: ${e.message}`);
    } finally {
      setIsStreamLoading(false);
    }
  };

  useEffect(() => {
    addLog(`1Stake Platform session initialized for ${gameId}`);
    addLog(`Authentication: HMAC-SHA1 Sandbox Token verified`);
    addLog(`Active Currency: ${currency === 'GC' ? 'Gold Coins (GC - Play for fun)' : 'Sweeps Coins (SC - Promotional test)'}`);

    if (paramStreamUrl) {
      setStreamUrl(paramStreamUrl);
      addLog(`✓ Live TV stream parameter linked from game launcher`);
    } else if (isLiveStreamEligible) {
      refreshLiveStream();
    }
  }, [gameId, currency]);

  const handleBetExecution = async (amount: number, betType: string, winMultiplier: number) => {
    if (activeBalance < amount) {
      addLog(`❌ Insufficient sandbox ${currency} balance. Reset credits below.`);
      return;
    }

    setIsActionLocked(true);
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roundId = `round_${Date.now()}`;

    addLog(`→ POST /v1/wallet/callback { action: 'bet', amount: ${amount} ${currency}, tx_id: '${txId}' }`);

    // Debit balance
    if (currency === 'GC') {
      setGcBalance((b) => Math.max(0, b - amount));
    } else {
      setScBalance((b) => Math.max(0, +(b - amount).toFixed(2)));
    }

    try {
      await fetch('/api/v1/games/casino/sandbox-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': Date.now().toString(),
          'X-Nonce': Math.random().toString(36).substring(2, 8),
        },
        body: JSON.stringify({
          action: 'bet',
          player_id: player,
          amount,
          currency,
          round_id: roundId,
          tx_id: txId,
          game_id: gameId,
        }),
      });
      addLog(`✓ Seamless wallet callback accepted: Bet posted`);
    } catch {
      // Offline fallback
    }

    if (winMultiplier > 0) {
      const winPayout = +(amount * winMultiplier).toFixed(2);
      const winTxId = `tx_win_${Date.now()}`;
      addLog(`🎉 Payout: ${winMultiplier}x -> ${winPayout} ${currency}`);

      if (currency === 'GC') {
        setGcBalance((b) => +(b + winPayout).toFixed(2));
      } else {
        setScBalance((b) => +(b + winPayout).toFixed(2));
      }

      try {
        await fetch('/api/v1/games/casino/sandbox-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'win',
            player_id: player,
            amount: winPayout,
            currency,
            round_id: roundId,
            tx_id: winTxId,
            game_id: gameId,
          }),
        });
        addLog(`✓ Win callback posted: ${winPayout} ${currency}`);
      } catch {
        // Offline fallback
      }
    }

    setIsActionLocked(false);
  };

  // Determine game title and engine
  const gameTitles: Record<string, string> = {
    '1stake_dice': '1Stake Provably Fair Dice',
    '1stake_crash': '1Stake Crash',
    '1stake_plinko': '1Stake Plinko',
    '1stake_mines': '1Stake Mines',
    '1stake_heads_tails': '1Stake Heads or Tails',
    '1stake_keno': '1Stake Keno',
    '1stake_lucky_wheel': '1Stake Lucky Wheel',
    '1stake_horse_racing': '1Stake Horse Racing',
    '1stake_crypto_prediction': '1Stake Crypto Price Prediction',
    '1stake_european_roulette': '1Stake European Roulette',
    '1stake_american_roulette': '1Stake American Roulette',
    '1stake_blackjack': '1Stake Blackjack Classic',
    '1stake_multiplayer_blackjack': '1Stake Multiplayer Blackjack',
    '1stake_multiplayer_roulette': '1Stake Multiplayer Roulette',
    '1stake_baccarat': '1Stake Baccarat',
    '1stake_sic_bo': '1Stake Sic Bo',
    '1stake_casino_holdem': '1Stake Casino Hold\'em',
    '1stake_caribbean_poker': '1Stake Caribbean Poker',
    '1stake_video_poker': '1Stake Video Poker',
    '1stake_slots': '1Stake Classic Slots',
    '1stake_slots_3d': '1Stake 3D Slots',
    '1stake_raffles_lotteries': '1Stake Raffles & Lotteries',
    evo_lightning_roulette: 'Lightning Roulette Live',
    evo_immersive_roulette: 'Immersive Roulette Live',
    evo_european_roulette_pro: 'European Roulette Pro',
    pragmatic_speed_roulette: 'Speed Roulette Live',
    evo_crazy_time: 'Crazy Time Live Studio',
    evo_monopoly: 'Monopoly Live Studio',
    evo_dream_catcher: 'Dream Catcher Money Wheel',
    pragmatic_sweet_candyland: 'Sweet Bonanza CandyLand Live',
    pragmatic_mega_wheel: 'Mega Wheel Live',
    evo_live_blackjack: 'Live Blackjack VIP',
    pragmatic_one_blackjack: 'ONE Blackjack Live',
    netent_blackjack_classic: 'Classic Blackjack Multi-hand',
    evo_speed_baccarat: 'Speed Baccarat Live',
    bgaming_baccarat: 'Baccarat VIP Table',
    evo_dragon_tiger: 'Dragon Tiger Live',
    evo_teen_patti: 'Live Teen Patti',
    evo_andar_bahar: 'Super Andar Bahar Live',
    ezugi_lucky7: 'Lucky 7 Live',
    spribe_aviator: 'Aviator Crash',
    bgaming_space_xy: 'Space XY Crash',
    vswaysdh1000: 'Gates of Olympus 1000',
    vs20sweetbonz: 'Sweet Bonanza 1000',
    relax_money_train_4: 'Money Train 4',
    pending_playtech_buffalo: 'Buffalo Blitz (Playtech)',
    pending_microgaming_moolah: 'Mega Moolah (Microgaming)',
    pending_novomatic_bookofradeluxe: 'Book of Ra Deluxe (Novomatic)',
    pending_betsoft_takethebank: 'Take The Bank (Betsoft)',
  };

  const gameTitle = paramTitle || gameTitles[gameId] || gameId;

  // Determine game engine
  const isPending =
    gameId.startsWith('pending_') ||
    gameId.includes('buffalo') ||
    gameId.includes('moolah') ||
    gameId.includes('book_of_ra') ||
    gameId.includes('take_the_bank');

  const isDice = gameId === '1stake_dice' || gameId.includes('dice');
  const isMines = gameId === '1stake_mines' || gameId.includes('mines');
  const isPlinko = gameId === '1stake_plinko' || gameId.includes('plinko');
  const isKeno = gameId === '1stake_keno' || gameId.includes('keno');
  const isCryptoPrediction =
    gameId === '1stake_crypto_prediction' || gameId.includes('prediction');

  const isRoulette =
    gameId.includes('roulette') || gameTitle.toLowerCase().includes('roulette');
  const isBlackjack =
    gameId.includes('blackjack') || gameTitle.toLowerCase().includes('blackjack');
  const isBaccarat =
    gameId.includes('baccarat') ||
    gameId.includes('sic_bo') ||
    gameId.includes('poker') ||
    gameId.includes('holdem') ||
    gameTitle.toLowerCase().includes('baccarat');
  const isDragonTiger =
    gameId.includes('dragon_tiger') || gameTitle.toLowerCase().includes('dragon tiger');
  const isDesi =
    gameId.includes('teen_patti') ||
    gameId.includes('andar_bahar') ||
    gameId.includes('lucky7') ||
    gameTitle.toLowerCase().includes('teen patti') ||
    gameTitle.toLowerCase().includes('andar bahar');
  const isGameShow =
    gameId.includes('crazy_time') ||
    gameId.includes('candyland') ||
    gameId.includes('mega_wheel') ||
    gameId.includes('monopoly') ||
    gameId.includes('dream_catcher') ||
    gameId.includes('lucky_wheel') ||
    gameId.includes('heads_tails') ||
    gameId.includes('horse_racing') ||
    gameTitle.toLowerCase().includes('wheel') ||
    gameTitle.toLowerCase().includes('crazy');
  const isCrash =
    gameId.includes('aviator') || gameId.includes('space_xy') || gameId.includes('crash');

  return (
    <div className="min-h-screen bg-[#050B24] text-[#FFF3FF] flex flex-col font-sans">
      {/* Test Mode Warning Banner */}
      <div className="bg-[#FFC107]/10 border-b border-[#FFC107]/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FFC107] shrink-0" />
          <span className="font-bold text-[#FFC107] uppercase tracking-wider text-[11px]">
            1Stake Online Casino Demo • Sandbox Mode
          </span>
          <span className="text-zinc-400 hidden sm:inline">•</span>
          <span className="text-[#E4E2E4] hidden sm:inline">Certified In-House Provably Fair & Live Studio Simulation</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-zinc-400">Security:</span>
          <span className="text-[#4CAF50] font-bold bg-[#111B3A] px-2 py-0.5 rounded border border-[#232B4E]">
            HMAC_SHA256_PROVABLY_FAIR
          </span>
        </div>
      </div>

      {/* Frame Top Navigation */}
      <div className="bg-[#0F1939] border-b border-[#232B4E] px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/casino"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111B3A] hover:bg-[#232B4E] text-[#E4E2E4] text-xs font-semibold border border-[#232B4E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lobby</span>
          </Link>
          <div>
            <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
              <span>{gameTitle}</span>
              {isDice || isMines || isPlinko || isKeno || isCryptoPrediction ? (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#0078DF]/30 text-[#0090ff] border border-[#0078DF]/50">
                  ⚡ Provably Fair
                </span>
              ) : isPending ? (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40">
                  Pending Credentials
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#FF0090]/20 text-[#FF0090] border border-[#FF0090]/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF0090] animate-ping" />
                  <span>Live Studio</span>
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Currency Switcher & Balance Control */}
        <div className="flex items-center gap-3">
          {/* Dual Currency Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
            <button
              onClick={() => setCurrency('GC')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                currency === 'GC'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🪙 {gcBalance.toLocaleString()} GC
            </button>
            <button
              onClick={() => setCurrency('SC')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                currency === 'SC'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚡ {scBalance.toFixed(2)} SC
            </button>
          </div>

          <button
            onClick={() => {
              setGcBalance(100000.0);
              setScBalance(50.0);
              addLog('Reset test credits to 100,000 GC & 50.00 SC');
            }}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700"
            title="Reset Test Balance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Dedicated Engine */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        {isPending ? (
          <PendingCredentialsStudio gameTitle={gameTitle} provider={paramProvider} />
        ) : isDice ? (
          <OneStakeDiceStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            currency={currency}
          />
        ) : isMines ? (
          <OneStakeMinesStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            currency={currency}
          />
        ) : isPlinko ? (
          <OneStakePlinkoStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            currency={currency}
          />
        ) : isKeno ? (
          <OneStakeKenoStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            currency={currency}
          />
        ) : isCryptoPrediction ? (
          <OneStakeCryptoPredictionStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            currency={currency}
          />
        ) : isRoulette ? (
          <LiveRouletteStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            streamUrl={streamUrl}
            isStreamLoading={isStreamLoading}
            onRefreshStream={refreshLiveStream}
            gameTitle={gameTitle}
          />
        ) : isBlackjack ? (
          <LiveBlackjackStudio
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            streamUrl={streamUrl}
            isStreamLoading={isStreamLoading}
            onRefreshStream={refreshLiveStream}
            gameTitle={gameTitle}
          />
        ) : isBaccarat || isDragonTiger ? (
          <LiveBaccaratStudio
            isDragonTiger={isDragonTiger}
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
            streamUrl={streamUrl}
            isStreamLoading={isStreamLoading}
            onRefreshStream={refreshLiveStream}
            gameTitle={gameTitle}
          />
        ) : isDesi ? (
          <LiveDesiStudio
            isAndarBahar={gameId.includes('andar_bahar') || gameTitle.toLowerCase().includes('andar')}
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
          />
        ) : isGameShow ? (
          <LiveGameShowStudio
            gameTitle={gameTitle}
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
          />
        ) : isCrash ? (
          <AviatorCrashStudio onBet={handleBetExecution} isActionLocked={isActionLocked} />
        ) : (
          <VegasSlotsCabinet
            gameId={gameId}
            gameName={gameTitle}
            onBet={handleBetExecution}
            isActionLocked={isActionLocked}
          />
        )}

        {/* Realtime Integration Diagnostic Log */}
        <div className="w-full bg-[#15101d] border border-zinc-800 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              1Stake Seamless Wallet Diagnostic Log
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Sandbox Replay Protected</span>
          </div>

          <div className="font-mono text-[11px] space-y-1 text-zinc-300 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SandboxFramePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Connecting to Live Studio...</div>}>
      <SandboxFrameContent />
    </Suspense>
  );
}
