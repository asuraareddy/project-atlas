'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Flame,
  Award,
} from 'lucide-react';
import {
  Ace2ThreeGameState,
  PlayingCard,
  CardGroup,
  DeclareValidationResult,
} from '@/domain/games/ace2three/types';
import {
  startNewGameSession,
  drawCardAction,
  discardCardAction,
  declareHandAction,
  dropHandAction,
  executeBotTurn,
  getRankLabel,
  getSuitSymbol,
} from '@/domain/games/ace2three/engine';
import { autoGroupHand, sortCardsBySuits, validateHandDeclaration } from '@/domain/games/ace2three/validator';

interface Ace2ThreeTableProps {
  onBackToCatalogue?: () => void;
}

export function Ace2ThreeTable({ onBackToCatalogue }: Ace2ThreeTableProps) {
  const [gameState, setGameState] = useState<Ace2ThreeGameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCutModal, setShowCutModal] = useState<boolean>(true);
  const [declarationResult, setDeclarationResult] = useState<DeclareValidationResult | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  useEffect(() => {
    setGameState(startNewGameSession('Player 1 (You)', 'Ace2Three Bot (AI)', 250));
  }, []);

  // Audio references
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const spellAudioRef = useRef<HTMLAudioElement | null>(null);
  const isBotThinkingRef = useRef<boolean>(false);
  const [invalidDeclareWarning, setInvalidDeclareWarning] = useState<string | null>(null);

  useEffect(() => {
    clickAudioRef.current = new Audio('/games/ace2three/sounds/click.mp3');
    spellAudioRef.current = new Audio('/games/ace2three/sounds/Magic-Spell.mp3');
  }, []);

  const playSound = useCallback(
    (type: 'click' | 'spell') => {
      if (!soundEnabled) return;
      try {
        if (type === 'click' && clickAudioRef.current) {
          clickAudioRef.current.currentTime = 0;
          clickAudioRef.current.play().catch(() => {});
        } else if (type === 'spell' && spellAudioRef.current) {
          spellAudioRef.current.currentTime = 0;
          spellAudioRef.current.play().catch(() => {});
        }
      } catch (err) {
        // Fallback silently if audio blocked by autoplay policies
      }
    },
    [soundEnabled]
  );

  // Play spell sound on Cut for Seat initially
  useEffect(() => {
    if (showCutModal) {
      playSound('spell');
    }
  }, [showCutModal, playSound]);

  // Handle Bot Turn lifecycle reliably without self-cancelling or indefinite hang
  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') {
      setIsBotThinking(false);
      return;
    }

    if (gameState.turnPlayerId === 'player_2') {
      setIsBotThinking(true);

      const timer = setTimeout(() => {
        setGameState((prev) => {
          if (!prev || prev.phase !== 'playing' || prev.turnPlayerId !== 'player_2') {
            return prev;
          }
          try {
            const next = executeBotTurn(prev);
            playSound('click');
            if (next.phase === 'game_over') {
              playSound('spell');
            }
            return next;
          } catch (err) {
            console.error('Error executing bot turn:', err);
            return prev;
          }
        });
        setIsBotThinking(false);
      }, 700);

      // Failsafe auto-trigger if bot takes more than 2 seconds
      const watchdog = setTimeout(() => {
        setGameState((prev) => {
          if (prev && prev.phase === 'playing' && prev.turnPlayerId === 'player_2') {
            try {
              const next = executeBotTurn(prev);
              playSound('click');
              return next;
            } catch (e) {
              return prev;
            }
          }
          return prev;
        });
        setIsBotThinking(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(watchdog);
      };
    } else {
      setIsBotThinking(false);
    }
  }, [gameState?.turnPlayerId, gameState?.phase, gameState?.turnState, playSound]);

  // Immediate manual override in case player wants instant bot response
  const handleForceBotMove = () => {
    if (!gameState || gameState.turnPlayerId !== 'player_2') return;
    playSound('click');
    setGameState((prev) => {
      if (!prev || prev.turnPlayerId !== 'player_2') return prev;
      return executeBotTurn(prev);
    });
    setIsBotThinking(false);
    isBotThinkingRef.current = false;
  };

  // Restart new match
  const handleRestart = () => {
    playSound('click');
    const newState = startNewGameSession('Player 1 (You)', 'Ace2Three Bot (AI)', 250);
    setGameState(newState);
    setSelectedCardId(null);
    setShowCutModal(true);
    setDeclarationResult(null);
    setIsBotThinking(false);
    setInvalidDeclareWarning(null);
    isBotThinkingRef.current = false;
  };

  // Dismiss Cut for Seat
  const handleDismissCut = () => {
    playSound('click');
    setShowCutModal(false);
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'playing',
        lastActionMessage:
          prev.turnPlayerId === 'player_1'
            ? 'Your Turn: Draw a card from Closed Deck or Open Discard Pile.'
            : 'Opponent turn to draw...',
      };
    });
  };

  // Draw Card
  const handleDraw = (source: 'closed' | 'open') => {
    if (!gameState || gameState.phase !== 'playing') return;
    if (gameState.turnPlayerId !== 'player_1') return;
    if (gameState.turnState !== 'draw') return;

    playSound('click');
    setGameState((prev) => (prev ? drawCardAction(prev, 'player_1', source) : prev));
  };

  // Discard Card
  const handleDiscard = () => {
    if (!selectedCardId || !gameState) return;
    if (gameState.phase !== 'playing') return;
    if (gameState.turnPlayerId !== 'player_1') return;
    if (gameState.turnState !== 'discard') return;

    playSound('click');
    setGameState((prev) => (prev ? discardCardAction(prev, 'player_1', selectedCardId) : prev));
    setSelectedCardId(null);
  };

  // Declare / Show Hand
  const handleDeclare = () => {
    if (!gameState || gameState.phase !== 'playing') return;
    if (gameState.turnPlayerId !== 'player_1') return;

    // Check declaration before ending the game
    const p1 = gameState.players[0];
    if (p1.hand.length === 14 && selectedCardId) {
      const test13 = p1.hand.filter((c) => c.id !== selectedCardId);
      const testGroups = autoGroupHand(test13, gameState.wildJoker!.rank);
      const testVal = validateHandDeclaration(testGroups, gameState.wildJoker!.rank);
      if (!testVal.isValid) {
        playSound('click');
        setInvalidDeclareWarning(testVal.reason);
        return;
      }
    } else if (p1.hand.length === 14) {
      let foundValid = false;
      for (let i = 0; i < p1.hand.length; i++) {
        const test13 = p1.hand.filter((_, idx) => idx !== i);
        const testGroups = autoGroupHand(test13, gameState.wildJoker!.rank);
        const testVal = validateHandDeclaration(testGroups, gameState.wildJoker!.rank);
        if (testVal.isValid) {
          foundValid = true;
          break;
        }
      }
      if (!foundValid) {
        playSound('click');
        setInvalidDeclareWarning(
          'Show Incomplete: You must have at least 1 Pure Sequence (3+ consecutive cards of same suit without Jokers) and at least 2 sequences in total.'
        );
        return;
      }
    } else if (p1.hand.length === 13) {
      const testVal = validateHandDeclaration(p1.groups, gameState.wildJoker!.rank);
      if (!testVal.isValid) {
        playSound('click');
        setInvalidDeclareWarning(testVal.reason);
        return;
      }
    }

    playSound('spell');
    const { nextState, result } = declareHandAction(gameState, 'player_1', selectedCardId || undefined);
    setGameState(nextState);
    setDeclarationResult(result);
  };

  // Drop Hand
  const handleDrop = () => {
    if (!gameState || gameState.phase !== 'playing') return;
    if (gameState.turnPlayerId !== 'player_1') return;

    playSound('click');
    setGameState((prev) => (prev ? dropHandAction(prev, 'player_1') : prev));
  };

  // Sort Hand by Suits
  const handleSortSuits = () => {
    if (!gameState || !gameState.wildJoker) return;
    playSound('click');
    setGameState((prev) => {
      if (!prev || !prev.wildJoker) return prev;
      const p1 = prev.players[0];
      const sortedGroups = sortCardsBySuits(p1.hand, prev.wildJoker.rank);
      const updatedP1 = { ...p1, groups: sortedGroups };
      const updatedPlayers: [typeof p1, typeof prev.players[1]] = [
        updatedP1,
        prev.players[1],
      ];
      return { ...prev, players: updatedPlayers };
    });
  };

  // Auto-Group Melds into Sequences & Sets
  const handleAutoMeld = () => {
    if (!gameState || !gameState.wildJoker) return;
    playSound('click');
    setGameState((prev) => {
      if (!prev || !prev.wildJoker) return prev;
      const p1 = prev.players[0];
      const sortedGroups = autoGroupHand(p1.hand, prev.wildJoker.rank);
      const updatedP1 = { ...p1, groups: sortedGroups };
      const updatedPlayers: [typeof p1, typeof prev.players[1]] = [
        updatedP1,
        prev.players[1],
      ];
      return { ...prev, players: updatedPlayers };
    });
  };

  if (!gameState) {
    return (
      <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/60 bg-[#0d2a1b] text-white flex flex-col items-center justify-center min-h-[750px] p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-amber-300">Shuffling and preparing Ace2Three table...</p>
      </div>
    );
  }

  const p1 = gameState.players[0];
  const p2 = gameState.players[1];
  const isMyTurn = gameState.turnPlayerId === 'player_1' && gameState.phase === 'playing';

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/60 bg-[#0d2a1b] text-white flex flex-col min-h-[750px] select-none">
      {/* Table Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-amber-800/40 z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-32 h-8">
            <Image
              src="/games/ace2three/ui/a23_logo2.png"
              alt="Ace2Three Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            13 Cards Points Rummy
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/10">
            <span className="text-zinc-400">Stake:</span>
            <span className="font-bold text-amber-400">{(gameState.stake / 100).toFixed(2)} pts</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Hand</span>
          </button>
        </div>
      </div>

      {/* Main Table Felt Arena */}
      <div className="relative flex-1 flex flex-col justify-between p-4 sm:p-6 bg-radial from-[#1e5233] via-[#113a22] to-[#0a2315]">
        {/* Felt Decorative Pattern & Brand Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <div className="relative w-96 h-96">
            <Image
              src="/games/ace2three/ui/a23_logo.png"
              alt="Watermark"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* TOP: Opponent Player Row */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
              gameState.turnPlayerId === 'player_2'
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105'
                : 'border-zinc-600 opacity-85'
            }`}>
              <Image
                src={p2.avatar}
                alt={p2.name}
                fill
                className="object-cover bg-zinc-800"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{p2.name}</span>
                {gameState.turnPlayerId === 'player_2' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black animate-pulse">
                      {isBotThinking ? 'Thinking...' : 'Active Turn'}
                    </span>
                    <button
                      type="button"
                      onClick={handleForceBotMove}
                      className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/60 text-amber-300 hover:text-white text-[10px] font-bold border border-amber-500/40 transition-colors"
                      title="Force bot move immediately"
                    >
                      Move ⚡
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-amber-200/80">Chips: {p2.chips} | Score: {p2.score}</p>
            </div>
          </div>

          {/* Opponent 13 Cards Face Down (Neat Fan Display) */}
          <div className="flex -space-x-4 sm:-space-x-5 overflow-hidden py-2">
            {p2.hand.map((_, i) => (
              <div
                key={i}
                className="relative w-8 sm:w-11 h-12 sm:h-16 rounded shadow-md border border-white/20 transform hover:-translate-y-1 transition-transform"
              >
                <Image
                  src="/games/ace2three/cards/CardBack.png"
                  alt="Card Back"
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE FELT: Decks, Wild Joker, and Discard Pile */}
        <div className="my-auto py-6 flex flex-col items-center justify-center gap-4 z-10">
          {/* Action Announcement Pill */}
          <div className="px-4 py-1.5 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md text-xs font-semibold text-amber-300 text-center shadow-lg animate-fade-in max-w-lg">
            {gameState.lastActionMessage}
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
            {/* 1. Closed Deck */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Closed Deck</span>
              <button
                disabled={!isMyTurn || gameState.turnState !== 'draw'}
                onClick={() => handleDraw('closed')}
                className={`relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl border-2 transition-all group ${
                  isMyTurn && gameState.turnState === 'draw'
                    ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:scale-105 cursor-pointer ring-4 ring-amber-400/30'
                    : 'border-zinc-700/60 opacity-80 cursor-not-allowed'
                }`}
              >
                <Image
                  src="/games/ace2three/cards/CardBack.png"
                  alt="Closed Deck"
                  fill
                  className="object-cover rounded-xl"
                />
                <div className="absolute inset-x-0 bottom-1 flex justify-center">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300">
                    {gameState.closedDeck.length} cards
                  </span>
                </div>
              </button>
              {isMyTurn && gameState.turnState === 'draw' && (
                <span className="text-[10px] font-bold text-amber-400 animate-bounce">Click to Draw</span>
              )}
            </div>

            {/* 2. Wild Joker Cut Card */}
            {gameState.wildJoker && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Wild Joker</span>
                </span>
                <div className="relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transform rotate-6 hover:rotate-0 transition-transform">
                  <Image
                    src={gameState.wildJoker.assetUrl}
                    alt="Wild Joker"
                    fill
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-red-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                    JOKER
                  </div>
                </div>
                <span className="text-[10px] text-amber-300/80 font-medium">
                  All {getRankLabel(gameState.wildJoker.rank)}s are Jokers
                </span>
              </div>
            )}

            {/* 3. Open Discard Pile */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Open Deck</span>
              {gameState.openDeck.length > 0 ? (
                <button
                  disabled={!isMyTurn || gameState.turnState !== 'draw'}
                  onClick={() => handleDraw('open')}
                  className={`relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl border-2 transition-all ${
                    isMyTurn && gameState.turnState === 'draw'
                      ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:scale-105 cursor-pointer ring-4 ring-emerald-400/30'
                      : 'border-zinc-700/60'
                  }`}
                >
                  <Image
                    src={gameState.openDeck[gameState.openDeck.length - 1].assetUrl}
                    alt="Open Discard Card"
                    fill
                    className="object-cover rounded-xl"
                  />
                  {gameState.openDeck[gameState.openDeck.length - 1].isWildJoker && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded">
                      JOKER
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl border-2 border-dashed border-zinc-600 flex items-center justify-center text-zinc-500 text-xs">
                  Empty
                </div>
              )}
              {isMyTurn && gameState.turnState === 'draw' && (
                <span className="text-[10px] font-bold text-emerald-400 animate-bounce">Click to Pick</span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: Player 1 Control Area & 13-Card Hand */}
        <div className="space-y-3 z-10">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                isMyTurn
                  ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                  : 'border-zinc-600'
              }`}>
                <Image
                  src={p1.avatar}
                  alt={p1.name}
                  fill
                  className="object-cover bg-zinc-800"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{p1.name}</span>
                  {isMyTurn && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black animate-pulse">
                      Your Turn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-200/80">Chips: {p1.chips} | Cards: {p1.hand.length}</p>
              </div>
            </div>

            {/* Hand Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSortSuits}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Sort hand strictly into suits"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Sort Suits</span>
              </button>

              <button
                type="button"
                onClick={handleAutoMeld}
                className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-semibold border border-purple-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                title="Automatically arrange cards into pure sequences, sets and melds"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Group Melds</span>
              </button>

              <button
                disabled={!isMyTurn || gameState.turnState !== 'discard' || !selectedCardId}
                onClick={handleDiscard}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                  isMyTurn && gameState.turnState === 'discard' && selectedCardId
                    ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-amber-600/40 ring-2 ring-amber-400'
                    : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 cursor-not-allowed'
                }`}
              >
                <span>
                  {p1.hand.find((c) => c.id === selectedCardId)
                    ? `Discard ${getSuitSymbol(p1.hand.find((c) => c.id === selectedCardId)!.suit)}${getRankLabel(p1.hand.find((c) => c.id === selectedCardId)!.rank)}`
                    : !isMyTurn
                    ? 'Opponent Turn'
                    : gameState.turnState === 'draw'
                    ? 'Draw Card First'
                    : 'Select Card to Discard'}
                </span>
              </button>

              <button
                disabled={!isMyTurn || gameState.turnState !== 'discard'}
                onClick={handleDeclare}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 ${
                  isMyTurn && gameState.turnState === 'discard'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 ring-2 ring-emerald-400 cursor-pointer animate-pulse'
                    : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 cursor-not-allowed'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Declare Show</span>
              </button>

              <button
                disabled={!isMyTurn}
                onClick={handleDrop}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors"
                title="Concede round with penalty points"
              >
                <span>Drop</span>
              </button>
            </div>
          </div>

          {/* Player Cards Arranged in Groups */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 overflow-x-auto pb-2 pt-4 px-2">
            {p1.groups.map((group, grpIdx) => (
              <div
                key={grpIdx}
                className={`p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                  group.type === 'pure_sequence'
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-900/40'
                    : group.type === 'impure_sequence'
                    ? 'bg-teal-950/40 border-teal-500/50 shadow-teal-900/40'
                    : group.type === 'set'
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-900/40'
                    : 'bg-black/40 border-zinc-700/50'
                }`}
              >
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60">
                  {group.type === 'pure_sequence' && (
                    <span className="text-emerald-400">Pure Seq</span>
                  )}
                  {group.type === 'impure_sequence' && (
                    <span className="text-teal-400">Seq (Joker)</span>
                  )}
                  {group.type === 'set' && (
                    <span className="text-amber-400">Set</span>
                  )}
                  {group.type === 'invalid' && (
                    <span className="text-zinc-400">Cards</span>
                  )}
                </div>

                {/* Overlapping Card Columns */}
                <div className="flex -space-x-8 sm:-space-x-10">
                  {group.cards.map((card) => {
                    const isSelected = selectedCardId === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSelectedCardId(isSelected ? null : card.id);
                        }}
                        className={`relative w-16 sm:w-20 h-24 sm:h-30 rounded-xl transition-all duration-150 transform hover:-translate-y-2 cursor-pointer shadow-lg ${
                          isSelected
                            ? '-translate-y-4 ring-4 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.8)] z-30'
                            : 'hover:z-20'
                        }`}
                      >
                        <Image
                          src={card.assetUrl}
                          alt={`${card.suit}-${card.rank}`}
                          fill
                          className="object-cover rounded-xl"
                        />
                        {card.isWildJoker && (
                          <div className="absolute top-1 right-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded shadow">
                            JOKER
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Cut For Seat Modal */}
      {showCutModal && gameState.cutForSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Official Ace2Three Procedure
              </span>
              <h3 className="text-2xl font-black text-white">Cut for Seat</h3>
              <p className="text-xs text-zinc-400">
                Each player is dealt one cut card. The highest card starts the hand.
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">Your Cut</span>
                <div className="relative w-24 h-36 rounded-xl border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <Image
                    src={gameState.cutForSeat.playerCard.assetUrl}
                    alt="Player Cut"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>

              <span className="text-xl font-black text-amber-400">VS</span>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">Opponent Cut</span>
                <div className="relative w-24 h-36 rounded-xl border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Image
                    src={gameState.cutForSeat.opponentCard.assetUrl}
                    alt="Opponent Cut"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs leading-relaxed">
              {gameState.cutForSeat.message}
            </div>

            <button
              onClick={handleDismissCut}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Begin Hand</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Game Over / Show Result Modal */}
      {gameState.phase === 'game_over' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {gameState.winnerId === 'player_1' ? '🎉 You Won the Hand!' : 'Hand Concluded'}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {gameState.lastActionMessage}
              </p>
            </div>

            {declarationResult && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pure Sequences:</span>
                  <span className={`font-bold ${declarationResult.pureSequencesCount >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {declarationResult.pureSequencesCount} (Min 1 required)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Sequences:</span>
                  <span className={`font-bold ${declarationResult.totalSequencesCount >= 2 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {declarationResult.totalSequencesCount} (Min 2 required)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span className={`font-bold ${declarationResult.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {declarationResult.reason}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              {onBackToCatalogue && (
                <button
                  onClick={onBackToCatalogue}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Other Games
                </button>
              )}
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Next Hand</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Incomplete Declaration Guide (Non-Fatal) */}
      {invalidDeclareWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Declaration Incomplete</h4>
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              {invalidDeclareWarning}
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              Ace2Three Rule: You must have at least 1 Pure Sequence (3+ consecutive cards of same suit without Jokers) and at least 2 sequences in total.
            </div>
            <button
              onClick={() => setInvalidDeclareWarning(null)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow-md transition-colors"
            >
              Continue Playing Hand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
