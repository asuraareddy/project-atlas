'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Wallet, User, LogIn, LayoutDashboard, ShieldAlert, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeProvider';

export function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check local session state or cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/v1/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setCurrentUser(data.data);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1f1f1f]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7e0ac2] to-[#b45df0] flex items-center justify-center shadow-lg shadow-[#7e0ac2]/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wider text-white">PROJECT ATLAS</span>
              <span className="text-[10px] uppercase tracking-widest text-[#b45df0] font-semibold -mt-1">Multi-Gaming</span>
            </div>
          </Link>
        </div>

        {/* Global Navigation & Safer Gambling Priority */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-white' : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            Lobby
          </Link>
          <Link
            href="/matka"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/matka') ? 'text-[#b45df0] font-semibold' : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            Matka
          </Link>
          <Link
            href="/carrom"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/carrom') ? 'text-[#b45df0] font-semibold' : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            Carrom
          </Link>
          <Link
            href="/ludo"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/ludo') ? 'text-[#b45df0] font-semibold' : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            Ludo
          </Link>
          <Link
            href="/other-games"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/other-games') ? 'text-[#b45df0] font-semibold' : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            Other Games
          </Link>

          {/* Persistent Safer Gambling Link */}
          <Link
            href="/player/safer-gambling"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5a7a]/10 border border-[#ff5a7a]/30 text-xs font-semibold text-[#ff5a7a] hover:bg-[#ff5a7a]/20 transition-all"
            title="Responsible Gambling Controls"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safer Gambling</span>
          </Link>
        </nav>

        {/* Actions & User State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Admin Portal Quick Switch */}
          <Link
            href="/admin/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a2a] border border-white/10 text-xs font-medium text-[#c4bfd0] hover:text-white hover:border-[#b45df0]/50 transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Admin Portal</span>
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Wallet Pill */}
              <Link
                href="/player/wallet"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242424] border border-white/15 text-xs text-white hover:border-[#b45df0] transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="font-semibold">
                  £{((currentUser?.wallet?.cashAvailableMinor || 0) / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-[#c4bfd0] hidden lg:inline">
                  (Pts: {currentUser?.wallet?.pointsBalance || 0})
                </span>
              </Link>

              {/* Player Profile */}
              <Link
                href="/player/dashboard"
                className="w-8 h-8 rounded-full bg-[#7e0ac2] flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
                title="Player Dashboard"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#7e0ac2] hover:bg-[#9a13e6] shadow-md shadow-[#7e0ac2]/40 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
