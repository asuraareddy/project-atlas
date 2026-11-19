'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  HelpCircle,
  Flame,
  ShieldCheck,
  Award,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useTheme, ThemeToggle } from '@/components/theme/ThemeProvider';
import { Ace2ThreeTable } from '@/components/ace2three/Ace2ThreeTable';

export default function Ace2ThreeGamePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [showRules, setShowRules] = useState<boolean>(false);

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-[#18181b]'
      }`}
    >
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className={`flex items-center gap-2 text-xs mb-1 ${isDark ? 'text-[#c4bfd0]' : 'text-zinc-500'}`}>
            <Link href="/" className={isDark ? 'hover:text-white' : 'hover:text-zinc-900'}>
              Lobby
            </Link>
            <span>/</span>
            <Link href="/other-games" className={isDark ? 'hover:text-white' : 'hover:text-zinc-900'}>
              Other Games
            </Link>
            <span>/</span>
            <span className="text-amber-500 font-semibold">Ace2Three Indian Rummy</span>
          </div>

          <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#18181b]'}`}>
            <Flame className="w-8 h-8 text-amber-500" />
            <span>Ace2Three — 13-Card Indian Rummy</span>
          </h1>

          <p className={`text-xs mt-1 ${isDark ? 'text-[#c4bfd0]' : 'text-zinc-600'}`}>
            Official 13-card points rummy table. Cut for seat, closed/open deck draws, wild joker, and pure sequence declares.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRules(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-[#242424] border-white/10 text-white hover:border-amber-500'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-amber-500 shadow-sm'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Rummy Rules</span>
          </button>

          <Link
            href="/other-games"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-[#242424] border-white/10 text-white hover:border-white/30'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Other Games</span>
          </Link>

          <ThemeToggle />
        </div>
      </div>

      {/* Game Table Arena */}
      <Ace2ThreeTable onBackToCatalogue={() => router.push('/other-games')} />

      {/* Rules & Guide Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold">Ace2Three 13-Card Rummy Rules</h3>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Cut for Seat</span>
                </h4>
                <p>
                  At the beginning of each hand, each player is dealt one cut card from the shuffled deck.
                  The player with the higher card starts the game (draws first).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>2. Wild Joker</span>
                </h4>
                <p>
                  A card is drawn face up as the Wild Joker for the round. All cards matching this rank
                  across all four suits become Wild Jokers and can substitute for any missing card in sets and impure sequences.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>3. Mandatory Declaring Requirements</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li><strong className="text-white">Pure Sequence (Mandatory):</strong> At least one consecutive sequence of 3+ cards of the same suit with NO Joker substitution (e.g. 4♥ 5♥ 6♥).</li>
                  <li><strong className="text-white">Second Sequence:</strong> At least one other sequence of 3+ cards (can be pure or impure with Jokers).</li>
                  <li><strong className="text-white">Sets & Remaining Cards:</strong> All remaining cards must be arranged in valid sets (3 or 4 cards of same rank across different suits) or sequences.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>4. Turns and Scoring</span>
                </h4>
                <p>
                  Each turn, you must draw 1 card (from either Closed Deck or Open Discard Pile) and discard 1 card to the Discard Pile.
                  A valid declaration wins the full stake. Wrong show receives 80 penalty points. First drop carries 20 points, and middle drop carries 40 points.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs transition-colors"
            >
              Got it, let&apos;s play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

