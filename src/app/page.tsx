import Link from 'next/link';
import { Dice5, Target, Gamepad2, Layers, ShieldCheck, QrCode, Lock, ArrowRight, Sparkles, Scale, RefreshCw } from 'lucide-react';

interface GameCategory {
  key: string;
  label: string;
  route: string;
  order: number;
  enabled: boolean;
  status: string;
  description: string;
  badge?: string;
  artworkIcon: string;
}

// Fallback/Server data matching /api/v1/categories
const CATEGORIES: GameCategory[] = [
  {
    key: 'matka',
    label: 'Matka',
    route: '/matka',
    order: 1,
    enabled: true,
    status: 'available',
    description: 'Number draw markets featuring server-verified schedules, precise cut-offs, and live result charts.',
    badge: 'Category 1',
    artworkIcon: 'Dice5'
  },
  {
    key: 'carrom',
    label: 'Carrom',
    route: '/carrom',
    order: 2,
    enabled: true,
    status: 'available',
    description: 'Precision tabletop multiplayer board battles with server-authoritative turn and physics validation.',
    badge: 'Category 2',
    artworkIcon: 'Target'
  },
  {
    key: 'ludo',
    label: 'Ludo',
    route: '/ludo',
    order: 3,
    enabled: true,
    status: 'available',
    description: 'Strategic multiplayer token race with cryptographic randomness and anti-collusion monitoring.',
    badge: 'Category 3',
    artworkIcon: 'Gamepad2'
  },
  {
    key: 'other-games',
    label: 'Other Games',
    route: '/other-games',
    order: 4,
    enabled: true,
    status: 'available',
    description: 'Explore certified 8-Ball Pool, custom tournaments, and newly approved gaming titles.',
    badge: 'Category 4',
    artworkIcon: 'Layers'
  }
];

export default function HomePage() {
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Dice5':
        return <Dice5 className="w-8 h-8 text-[#b45df0]" />;
      case 'Target':
        return <Target className="w-8 h-8 text-[#b45df0]" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-8 h-8 text-[#b45df0]" />;
      case 'Layers':
      default:
        return <Layers className="w-8 h-8 text-[#b45df0]" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 glow-aura overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#b45df0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UK-First Multi-Gaming Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fair Play. Instant Action. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b45df0] via-[#9a13e6] to-[#7e0ac2]">
              Four Master Categories.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#c4bfd0] max-w-2xl mx-auto leading-relaxed">
            Welcome to Project Atlas — an installable, mobile-first gaming arena. Select a category below to access dedicated market feeds, certified rooms, and verified results.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#b8b8c2]">
            <span className="flex items-center gap-1.5 bg-[#242424] px-3 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" /> Server-Authoritative
            </span>
            <span className="flex items-center gap-1.5 bg-[#242424] px-3 py-1 rounded-full border border-white/10">
              <QrCode className="w-4 h-4 text-[#b45df0]" /> Direct Crypto QR
            </span>
            <span className="flex items-center gap-1.5 bg-[#242424] px-3 py-1 rounded-full border border-white/10">
              <Scale className="w-4 h-4 text-[#ff5a7a]" /> 18+ UKGC Aligned
            </span>
          </div>
        </div>
      </section>

      {/* Primary 4 Category Buttons Section (Exact Requirement) */}
      <section id="categories" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Select Game Category</h2>
            <p className="text-sm text-[#c4bfd0] mt-1">
              Choose from the four primary gaming modules below. Each category opens its dedicated portal.
            </p>
          </div>
          <div className="text-xs text-[#c4bfd0] bg-[#242424] px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Authoritative State Active</span>
          </div>
        </div>

        {/* The 4 Category Cards in Exact Order: 1. Matka, 2. Carrom, 3. Ludo, 4. Other Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="card-dark group p-6 flex flex-col justify-between relative overflow-hidden bg-[#242424] hover:bg-[#2a2a2a] transition-all duration-300"
            >
              {/* Category Header & Icon */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1f1f1f] border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-[#b45df0]/40 transition-all shadow-inner">
                    {renderIcon(cat.artworkIcon)}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#7e0ac2]/20 border border-[#7e0ac2]/40 text-[#b45df0]">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-wide mb-2 group-hover:text-[#b45df0] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-[#c4bfd0] leading-relaxed mb-6">
                  {cat.description}
                </p>
              </div>

              {/* Action Button Navigating to its Own Route */}
              <div>
                <Link
                  id={`cat-btn-${cat.key}`}
                  href={cat.route}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-all bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-lg shadow-[#7e0ac2]/30 group-hover:shadow-[#7e0ac2]/50"
                >
                  <span>Explore {cat.label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Support Information Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#7e0ac2]/20 flex items-center justify-center text-[#b45df0]">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Direct Crypto QR Deposits</h4>
            <p className="text-xs text-[#c4bfd0] leading-relaxed">
              Fast, direct on-chain wallet transfers without middleman gateways. Independently confirmed by our blockchain observation engine.
            </p>
            <Link href="/player/deposit" className="inline-block text-xs text-[#b45df0] font-medium hover:underline pt-1">
              View Deposit Flow →
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Immutable Double-Entry Ledger</h4>
            <p className="text-xs text-[#c4bfd0] leading-relaxed">
              Every stake, prize, and transaction is journaled with integer GBP minor units and strict idempotency. Zero balance fabrication.
            </p>
            <Link href="/player/wallet" className="inline-block text-xs text-[#10b981] font-medium hover:underline pt-1">
              Account Balances →
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff5a7a]/20 flex items-center justify-center text-[#ff5a7a]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">UK Safer Gambling Controls</h4>
            <p className="text-xs text-[#c4bfd0] leading-relaxed">
              Proactive player limits, reality checks, session timers, and instant self-exclusion enforced centrally on the server.
            </p>
            <Link href="/player/safer-gambling" className="inline-block text-xs text-[#ff5a7a] font-medium hover:underline pt-1">
              Responsible Play →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
