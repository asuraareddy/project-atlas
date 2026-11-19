'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  LogIn,
  UserPlus,
  Clock,
  Volume2,
  Trophy,
  Sparkles,
  Radio,
  Gamepad2,
  ShieldAlert,
  ChevronDown,
  MessageCircle,
  HelpCircle,
  User,
  LogOut,
  Building2,
} from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

export function AmbaariHeader() {
  const pathname = usePathname();
  const { tenantSlug } = useTenant();
  const [timeString, setTimeString] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/v1/me', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const u = json?.data?.user;
          if (u && u.id !== 'usr_guest_01') {
            setCurrentUser(u);
            return;
          }
        }
        setCurrentUser(null);
      } catch {
        setCurrentUser(null);
      }
    };
    checkAuth();
    window.addEventListener('atlas-auth-updated', checkAuth);
    return () => window.removeEventListener('atlas-auth-updated', checkAuth);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    window.dispatchEvent(new Event('atlas-auth-updated'));
    window.location.href = `/?tenant=${tenantSlug}`;
  };

  // Clock in IST / Local
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' (IST)'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full font-['Roboto_Condensed',sans-serif] select-none text-white shadow-md z-50">
      {/* 1. Top Navbar (Dark Slate: #2C3E50) */}
      <div className="bg-[#2C3E50] border-b border-[#3d5166] px-3 sm:px-6 py-2">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href={`/?tenant=${tenantSlug}`} className="flex items-center gap-2 group">
              {/* Ambaari Golden Elephant Emblem */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#1b2836] rounded-md flex items-center justify-center font-black text-amber-400 text-lg tracking-tighter">
                  🐘
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-white">AMBAARI</span>
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-[#f59e0b] drop-shadow-sm">999</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#0088CC] font-bold">
                  Sports Exchange & Casino
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Cricket matches, leagues, live casino..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c2836] border border-[#3d5166] rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0088CC] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c2836] border border-[#3d5166] text-[11px] font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeString}</span>
            </div>

            {/* Demo Balance Badge */}
            <div className="hidden sm:flex flex-col items-end px-2.5 py-0.5 rounded bg-[#1a2530] border border-emerald-500/30">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Demo Balance</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">10,000 PTS</span>
            </div>

            {/* Login & Sign Up CTA or Authenticated User Controls */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {(currentUser.role === 'OPERATOR_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/client-admin"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-wide transition-all shadow-sm"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CLIENT ADMIN</span>
                  </Link>
                )}
                <Link
                  href="/player/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1c2836] hover:bg-[#243447] border border-[#3d5166] text-white text-xs font-semibold transition-all"
                  title={currentUser.email}
                >
                  <User className="w-3.5 h-3.5 text-[#0088CC]" />
                  <span className="hidden md:inline max-w-[120px] truncate">{currentUser.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-200 text-xs font-bold transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/auth/login?tenant=${tenantSlug}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0088CC] hover:bg-[#0077B5] text-white text-xs font-bold tracking-wide transition-all shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </Link>
                <Link
                  href={`/auth/register?tenant=${tenantSlug}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold tracking-wide transition-all shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>SIGN UP</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Ambaari Ocean Cyan: #0088CC) */}
      <div className="bg-[#0088CC] px-2 sm:px-6 shadow-inner">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex items-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <Link
              href={`/?tenant=${tenantSlug}`}
              className={`px-3 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-[#0072aa] border-white text-white'
                  : 'border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white'
              }`}
            >
              <span>HOME</span>
            </Link>

            <Link
              href={`/sports?tenant=${tenantSlug}&filter=IN_PLAY`}
              className={`px-3 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                pathname.startsWith('/sports')
                  ? 'bg-[#0072aa] border-white text-white'
                  : 'border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
              <span>IN-PLAY</span>
            </Link>

            <Link
              href={`/sports?tenant=${tenantSlug}&sport=4`}
              className="px-3 py-2.5 transition-colors border-b-2 border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>CRICKET</span>
            </Link>

            <Link
              href={`/sports?tenant=${tenantSlug}&sport=1`}
              className="px-3 py-2.5 transition-colors border-b-2 border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white"
            >
              <span>FOOTBALL</span>
            </Link>

            <Link
              href={`/sports?tenant=${tenantSlug}&sport=2`}
              className="px-3 py-2.5 transition-colors border-b-2 border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white"
            >
              <span>TENNIS</span>
            </Link>

            <Link
              href={`/casino?tenant=${tenantSlug}&cat=live`}
              className={`px-3 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                pathname.startsWith('/casino')
                  ? 'bg-[#0072aa] border-white text-white'
                  : 'border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>LIVE CASINO</span>
            </Link>

            <Link
              href={`/casino?tenant=${tenantSlug}&cat=slots`}
              className="px-3 py-2.5 transition-colors border-b-2 border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white"
            >
              <span>SLOTS</span>
            </Link>

            <Link
              href={`/casino?tenant=${tenantSlug}&cat=table`}
              className="px-3 py-2.5 transition-colors border-b-2 border-transparent text-white/90 hover:bg-[#0077b5] hover:text-white"
            >
              <span>TABLE GAMES</span>
            </Link>
          </nav>

          {/* WhatsApp / 24x7 Helpdesk Quick Icon */}
          <div className="hidden md:flex items-center gap-2 pl-3">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>24/7 SUPPORT</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. News Marquee Banner (Darker Navy Strip: #1a2634) */}
      <div className="bg-[#1a2634] border-b border-[#2d3f52] px-3 py-1 flex items-center text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f59e0b] text-black font-black text-[10px] tracking-wider uppercase shrink-0">
          <Volume2 className="w-3 h-3" />
          <span>NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap ml-3 w-full">
          <div className="inline-block animate-marquee text-[11px] text-slate-300">
            🏏 <span className="text-amber-400 font-bold">IPL 2026 LIVE:</span> Ball-by-ball Betfair exchange liquidity active now • 🎰 <span className="text-cyan-400 font-bold">LIVE CASINO:</span> Evolution & Ezugi tables with real dealers • ⚡ <span className="text-emerald-400 font-bold">INSTANT WITHDRAWAL:</span> 24/7 UPI & Direct Crypto settlements guaranteed on AMBAARI999.
          </div>
        </div>
      </div>
    </header>
  );
}

