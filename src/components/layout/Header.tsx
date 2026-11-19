'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Wallet, User, LogIn, LogOut, LayoutDashboard, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import { CurrencyCalculator } from '@/components/layout/CurrencyCalculator';
import { useTenant } from '@/components/tenant/TenantContext';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';
import { AmbaariHeader } from '@/components/ambaari/AmbaariHeader';

export function Header() {
  const pathname = usePathname();
  const { branding, isGameEnabled, tenantSlug, pointConfig } = useTenant();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check local session state or cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/v1/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const u = data?.data?.user;
          if (u && u.id !== 'usr_guest_01') {
            setIsLoggedIn(true);
            setCurrentUser(u);
            return;
          }
        }
        setIsLoggedIn(false);
        setCurrentUser(null);
      } catch (e) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
    window.addEventListener('atlas-auth-updated', checkAuth);
    return () => window.removeEventListener('atlas-auth-updated', checkAuth);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.dispatchEvent(new Event('atlas-auth-updated'));
    window.location.href = tenantSlug !== 'atlas' ? `/?tenant=${tenantSlug}` : '/';
  };

  // Client-Specific Layout Isolation: Ambaari 999 (never override Super Admin /admin routes)
  if (!pathname.startsWith('/admin') && (branding.layoutTheme === 'ambaari' || tenantSlug === 'ambaari999')) {
    return <AmbaariHeader />;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white backdrop-blur-md border-b border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                backgroundColor: branding.primaryColor || '#191919',
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#191919]">
                {branding.brandName || 'Project Atlas'}
              </span>
              <span
                className="text-[11px] font-normal tracking-normal -mt-0.5 truncate max-w-[150px] sm:max-w-[200px] text-[#6F6F6F]"
              >
                {branding.tagline || 'Gaming Platform'}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Navigation - Only Render Enabled Games for Active Tenant */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-normal transition-colors ${
              pathname === '/' ? 'text-[#191919] font-medium' : 'text-[#6F6F6F] hover:text-[#191919]'
            }`}
          >
            Lobby
          </Link>

          {isGameEnabled('matka') && (
            <Link
              href="/matka"
              className={`text-sm font-normal transition-colors ${
                pathname.startsWith('/matka') ? 'text-[#317CFF] font-medium' : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              Matka
            </Link>
          )}

          {isGameEnabled('casino') && (
            <Link
              href="/casino"
              className={`text-sm font-normal transition-colors ${
                pathname.startsWith('/casino') ? 'text-[#317CFF] font-medium' : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              Casino Games
            </Link>
          )}

          {isGameEnabled('sports') && (
            <Link
              href="/sports"
              className={`text-sm font-normal transition-colors ${
                pathname.startsWith('/sports') ? 'text-[#317CFF] font-medium' : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              Sports
            </Link>
          )}

          {isGameEnabled('other-games') && (
            <Link
              href="/other-games"
              className={`text-sm font-normal transition-colors ${
                pathname.startsWith('/other-games') || pathname.startsWith('/carrom') || pathname.startsWith('/ludo') || pathname.startsWith('/pool') || pathname.startsWith('/ace2three')
                  ? 'text-[#317CFF] font-medium'
                  : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              Other Games
            </Link>
          )}

          {/* Persistent Safer Gambling Link */}
          <Link
            href="/player/safer-gambling"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 text-xs font-medium text-[#E5484D] hover:bg-[#E5484D]/15 transition-all ml-1"
            title="Responsible Gambling Controls"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safer Gambling</span>
          </Link>
        </nav>

        {/* Actions & User State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tenant Switcher & B2B Manager (Only visible in platform operator / default root context) */}
          {tenantSlug === 'atlas' && (
            <>
              <TenantSwitcher />
              <Link
                href="/admin/tenants"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-xs font-normal text-[#191919] hover:bg-[#EEEEEE] transition-all"
                title="B2B White-Label SaaS Manager"
              >
                <Building2 className="w-3.5 h-3.5 text-[#317CFF]" />
                <span>B2B Tenants</span>
              </Link>
            </>
          )}

          {/* Currency / Point Calculator */}
          <CurrencyCalculator showAdminLink={tenantSlug === 'atlas'} />

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {currentUser?.role === 'OPERATOR_ADMIN' && (
                <Link
                  href="/client-admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#317CFF] text-white text-xs font-medium hover:bg-[#2563EB] transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Client Admin</span>
                </Link>
              )}
              {currentUser?.role === 'SUPER_ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191919] text-white text-xs font-medium hover:bg-[#333333] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </Link>
              )}
              {/* Wallet Pill */}
              <Link
                href="/player/wallet"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-xs text-[#191919] hover:border-[#191919] transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-[#1FAE5B]" />
                <span className="font-medium text-[#191919]">
                  {currentUser?.wallet?.pointsBalance ?? Math.round((currentUser?.wallet?.cashAvailableMinor || 0) / 100)} {pointConfig?.pointUnitName || 'PTS'}
                </span>
              </Link>

              {/* Player Profile */}
              <Link
                href="/player/dashboard"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: branding.primaryColor || '#191919' }}
                title={currentUser?.email || 'Player Dashboard'}
              >
                <User className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-[#E5484D] transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-1.5 rounded-full text-xs font-normal text-[#191919] border border-[rgba(0,0,0,0.08)] bg-white hover:bg-[#F8F8F8] transition-all"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] transition-all"
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
