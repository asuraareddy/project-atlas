'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dice5,
  Target,
  Gamepad2,
  Layers,
  CircleDot,
  ShieldCheck,
  QrCode,
  Lock,
  ArrowRight,
  Sparkles,
  Scale,
  RefreshCw,
  Trophy,
  Server,
  Cpu,
  Globe2,
  Zap,
  CheckCircle2,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';
import { AmbaariHome } from '@/components/ambaari/AmbaariHome';

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

const DEFAULT_ORDERED_CATEGORIES: GameCategory[] = [
  {
    key: 'matka',
    label: 'Matka',
    route: '/matka',
    order: 1,
    enabled: true,
    status: 'available',
    description: 'Classic number draw markets with server-verified draw schedules, cut-offs, and live result charts.',
    badge: 'Category 1',
    artworkIcon: 'Dice5',
  },
  {
    key: 'casino',
    label: 'Casino Games',
    route: '/casino',
    order: 2,
    enabled: true,
    status: 'available',
    description: 'Unified iGaming aggregation featuring slots, live dealer tables, and crash games in test mode.',
    badge: 'Category 2',
    artworkIcon: 'Sparkles',
  },
  {
    key: 'sports',
    label: 'Sports Exchange',
    route: '/sports',
    order: 3,
    enabled: true,
    status: 'available',
    description: 'Betfair API-NG live exchange markets, in-play cricket scoreboards, and bookmaker odds.',
    badge: 'Category 3',
    artworkIcon: 'Trophy',
  },
  {
    key: 'other-games',
    label: 'Other Games',
    route: '/other-games',
    order: 4,
    enabled: true,
    status: 'available',
    description: 'Certified 8-Ball Pool Pro, Carrom Tabletop, Ludo Grand Circuit, and Ace2Three Indian Rummy.',
    badge: 'Category 4',
    artworkIcon: 'Layers',
  },
];

export default function HomePage() {
  const { branding, tenantSlug } = useTenant();

  const [categories, setCategories] = useState<GameCategory[]>(DEFAULT_ORDERED_CATEGORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/v1/categories');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.categories && Array.isArray(json.data.categories) && json.data.categories.length > 0) {
            const sorted = [...json.data.categories].sort((a, b) => a.order - b.order);
            setCategories(sorted);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [tenantSlug]);

  // Client-Specific Layout Isolation: Ambaari 999
  if (branding.layoutTheme === 'ambaari' || tenantSlug === 'ambaari999') {
    return <AmbaariHome />;
  }

  const renderIcon = (name: string) => {
    const iconClass = "w-6 h-6 text-[#191919]";
    switch (name) {
      case 'Dice5':
        return <Dice5 className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'Gamepad2':
        return <Gamepad2 className={iconClass} />;
      case 'CircleDot':
        return <CircleDot className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Layers':
      default:
        return <Layers className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8] text-[#191919]">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[rgba(0,0,0,0.06)] bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-xs text-[#6F6F6F]">
            <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
            <span>{branding.brandName} • Modular white-label gaming platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#191919] leading-[1.1] max-w-3xl mx-auto">
            {branding.heroHeading || 'Modern technology for high-trust gaming operators.'}
          </h1>

          <p className="text-base sm:text-lg text-[#6F6F6F] max-w-2xl mx-auto leading-relaxed font-normal">
            {branding.heroSubheading ||
              'A unified platform delivering Sports Exchange, Casino aggregation, certified skill games, and server-authoritative Matka with multi-tenant isolation.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#categories"
              className="px-6 py-3 rounded-full text-sm font-normal text-white bg-[#191919] hover:bg-[#333333] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-2"
            >
              <span>Explore game catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 rounded-full text-sm font-normal text-[#191919] bg-white border border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] transition-all"
            >
              Enterprise console
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6F6F6F]">
            <span className="flex items-center gap-1.5 bg-[#F8F8F8] px-3 py-1 rounded-full border border-[rgba(0,0,0,0.06)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1FAE5B]" /> Server-authoritative engine
            </span>
            <span className="flex items-center gap-1.5 bg-[#F8F8F8] px-3 py-1 rounded-full border border-[rgba(0,0,0,0.06)]">
              <QrCode className="w-3.5 h-3.5 text-[#317CFF]" /> Direct crypto QR & gateways
            </span>
            <span className="flex items-center gap-1.5 bg-[#F8F8F8] px-3 py-1 rounded-full border border-[rgba(0,0,0,0.06)]">
              <Scale className="w-3.5 h-3.5 text-[#6F6F6F]" /> UKGC RTS aligned
            </span>
          </div>
        </div>
      </section>

      {/* Subscribed Game Catalogue */}
      <section id="categories" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-normal text-[#191919] tracking-tight">
              Subscribed Game Catalogue
            </h2>
            <p className="text-sm text-[#6F6F6F] mt-1 font-normal">
              Active titles licensed under the <strong className="text-[#191919] font-medium">{branding.brandName}</strong> commercial package.
            </p>
          </div>
          <div className="text-xs text-[#6F6F6F] bg-white px-3.5 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <RefreshCw className="w-3.5 h-3.5 text-[#317CFF]" />
            <span>{categories.length} module{categories.length === 1 ? '' : 's'} active</span>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-[#6F6F6F] text-sm">Loading subscribed games...</div>
        ) : (
          <div
            className={`grid grid-cols-1 ${
              categories.length === 1
                ? 'max-w-md mx-auto'
                : categories.length === 2
                ? 'md:grid-cols-2 max-w-3xl mx-auto'
                : categories.length === 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2 lg:grid-cols-4'
            } gap-6`}
          >
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="card-dark group p-6 flex flex-col justify-between relative overflow-hidden bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.14)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {renderIcon(cat.artworkIcon)}
                    </div>
                    {cat.badge && (
                      <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.06)]">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-medium text-[#191919] tracking-tight mb-2">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[#6F6F6F] leading-relaxed mb-6 font-normal">
                    {cat.description}
                  </p>
                </div>

                <div>
                  <Link
                    id={`cat-btn-${cat.key}`}
                    href={cat.route}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-full font-normal text-xs text-white bg-[#191919] hover:bg-[#333333] transition-all"
                  >
                    <span>Play {cat.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Solutions & Modular Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[rgba(0,0,0,0.06)]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-normal text-[#317CFF] bg-[#317CFF]/10 px-3 py-1 rounded-full">Platform Architecture</span>
          <h2 className="text-3xl font-normal text-[#191919] tracking-tight mt-3">Built for scale, verified for integrity</h2>
          <p className="text-sm text-[#6F6F6F] mt-2">
            Every module operates as an autonomous microservice with isolated state and double-entry reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Trophy className="w-5 h-5 text-[#317CFF]" />
            </div>
            <h3 className="text-base font-medium text-[#191919]">Sportsbook & Exchange</h3>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Betfair API-NG integrated live liquidity, back/lay ladders, tick offset matching, and live in-play scoreboards for tier-1 cricket and football.
            </p>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Sparkles className="w-5 h-5 text-[#1FAE5B]" />
            </div>
            <h3 className="text-base font-medium text-[#191919]">Casino Aggregation</h3>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Certified slot and live-dealer gateway with unified wallet API, automated seamless balance sync, and instant session credential validation.
            </p>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Layers className="w-5 h-5 text-[#191919]" />
            </div>
            <h3 className="text-base font-medium text-[#191919]">Certified Skill & Other Games</h3>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Native real-time multiplayer hubs (Pool, Carrom, Ludo) and Ace2Three Indian Rummy integration powered by low-latency SignalR sockets.
            </p>
          </div>
        </div>
      </section>

      {/* White Label Packages Tier Presentation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[rgba(0,0,0,0.06)]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-normal text-[#6F6F6F] bg-white px-3 py-1 rounded-full border border-[rgba(0,0,0,0.08)]">Commercial Packages</span>
          <h2 className="text-3xl font-normal text-[#191919] tracking-tight mt-3">White-label licensing plans</h2>
          <p className="text-sm text-[#6F6F6F] mt-2">
            Independent client domains, isolated player ledgers, and bespoke branded styling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">Starter Tier</span>
              <h3 className="text-xl font-medium text-[#191919]">Matka & Classic Draws</h3>
              <p className="text-xs text-[#6F6F6F]">Optimized for regional draw operators requiring automated markets and instant payouts.</p>
              <ul className="space-y-2 text-xs text-[#6F6F6F] pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Single custom domain</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Full Matka market engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Direct crypto QR deposits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Client admin portal</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/admin/tenants" className="w-full h-10 flex items-center justify-center rounded-full text-xs font-normal text-[#191919] bg-[#F8F8F8] hover:bg-[#EEEEEE] transition-all border border-[rgba(0,0,0,0.08)]">
                Configure tenant
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-[10px] bg-white border-2 border-[#191919] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 text-[10px] font-normal uppercase tracking-wider bg-[#191919] text-white px-3 py-0.5 rounded-full">Popular</span>
            <div className="space-y-4">
              <span className="text-xs font-normal text-[#317CFF] uppercase tracking-wider">Pro Tier</span>
              <h3 className="text-xl font-medium text-[#191919]">Casino & Sports Exchange</h3>
              <p className="text-xs text-[#6F6F6F]">Comprehensive sportsbook exchange with integrated casino aggregator and multi-currency support.</p>
              <ul className="space-y-2 text-xs text-[#6F6F6F] pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Up to 3 brand domains</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Sportsbook & Betfair liquidity</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Casino games aggregation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Independent payment gateway keys</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/admin/tenants" className="w-full h-10 flex items-center justify-center rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] transition-all">
                Select Pro Tier
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">Enterprise Full Suite</span>
              <h3 className="text-xl font-medium text-[#191919]">Complete 4-in-1 Platform</h3>
              <p className="text-xs text-[#6F6F6F]">All 4 categories enabled: Matka, Casino, Sports Exchange, and certified Other Games (Carrom, Pool, Ludo, Ace2Three).</p>
              <ul className="space-y-2 text-xs text-[#6F6F6F] pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Unlimited domains & subdomains</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> All 4 gaming verticals enabled</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Dedicated SignalR cluster</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1FAE5B]" /> Bespoke client branding theme</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/admin/tenants" className="w-full h-10 flex items-center justify-center rounded-full text-xs font-normal text-[#191919] bg-[#F8F8F8] hover:bg-[#EEEEEE] transition-all border border-[rgba(0,0,0,0.08)]">
                Enterprise onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <QrCode className="w-4 h-4 text-[#317CFF]" />
            </div>
            <h4 className="text-sm font-medium text-[#191919]">Direct Crypto QR Deposits</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Fast, direct on-chain wallet transfers without middleman gateways. Independently confirmed by our blockchain observation engine.
            </p>
            <Link
              href="/player/deposit"
              className="inline-block text-xs font-normal text-[#317CFF] hover:underline pt-1"
            >
              View deposit flow →
            </Link>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#1FAE5B]">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[#191919]">Immutable Double-Entry Ledger</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Every stake, prize, and transaction is journaled with integer minor units and strict idempotency. Zero balance fabrication.
            </p>
            <Link
              href="/player/wallet"
              className="inline-block text-xs text-[#1FAE5B] font-normal hover:underline pt-1"
            >
              Account balances →
            </Link>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#E5484D]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[#191919]">UK Safer Gambling Controls</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Proactive player limits, reality checks, session timers, and instant self-exclusion enforced centrally on the server.
            </p>
            <Link
              href="/player/safer-gambling"
              className="inline-block text-xs text-[#E5484D] font-normal hover:underline pt-1"
            >
              Responsible play →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
