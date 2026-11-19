'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import { CurrencyCalculator } from '@/components/layout/CurrencyCalculator';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, QrCode, ArrowUpRight, CheckSquare, 
  DollarSign, ShieldAlert, Gamepad2, GitFork, FileText, 
  ChevronRight, Building2, KeyRound, CreditCard,
  Menu, X, ArrowLeft, LogOut, ShieldCheck, Sparkles, Coins
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState('SUPER_ADMIN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Platform Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'B2B Tenants & SaaS', href: '/admin/tenants', icon: Building2 },
    { label: 'Point Valuation & Currency', href: '/admin/point-valuation', icon: Coins },
  { label: 'API & Providers', href: '/admin/providers', icon: KeyRound },
    { label: 'Payment Gateways', href: '/admin/gateways', icon: CreditCard },
    { label: 'Deposit & Crypto QR', href: '/admin/crypto-deposits', icon: QrCode },
    { label: 'Withdrawal Approvals', href: '/admin/withdrawals', icon: ArrowUpRight },
    { label: 'Maker-Checker Queue', href: '/admin/maker-checker', icon: CheckSquare },
    { label: 'Finance & P&L', href: '/admin/finance', icon: DollarSign },
    { label: 'Compliance & AML', href: '/admin/compliance', icon: ShieldAlert },
    { label: 'Game Ops & Feeds', href: '/admin/games', icon: Gamepad2 },
    { label: 'Branches & Scopes', href: '/admin/branches', icon: GitFork },
    { label: 'Immutable Audit Log', href: '/admin/audit', icon: FileText }
  ];

  const currentItem = navItems.find((item) => item.href === pathname) || {
    label: 'Back Office Administration',
    href: pathname,
    icon: LayoutDashboard,
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#F8F8F8] text-[#191919]">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-[rgba(0,0,0,0.08)] flex flex-col justify-between p-4 shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-none">
          {/* Header & Role */}
          <div className="border-b border-[rgba(0,0,0,0.08)] pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#6F6F6F] block">
                Operator Back Office
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1.5 rounded-full text-[#6F6F6F] hover:text-[#191919] hover:bg-[#F8F8F8]"
                title="Close Sidebar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-full bg-[#191919] flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-medium text-[#191919]">Project Atlas</h2>
            </div>
            <div className="mt-2.5 p-2 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] text-xs flex items-center justify-between">
              <span className="text-[#6F6F6F] text-[11px]">Role:</span>
              <span className="text-[#191919] font-mono font-medium text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
                {activeRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-normal transition-all ${
                    isActive
                      ? 'bg-[#191919] text-white shadow-sm'
                      : 'text-[#6F6F6F] hover:bg-[#F8F8F8] hover:text-[#191919]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#6F6F6F]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Status & Sticky Exit Link */}
        <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] space-y-2 mt-auto">
          <div className="p-2.5 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6F6F6F]">Real-Money Wagering</span>
              <span className="text-[#E5484D] font-medium">OFF (Default)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6F6F6F]">Direct Crypto QR</span>
              <span className="text-[#1FAE5B] font-medium">ACTIVE</span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] text-xs font-normal transition-all border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            title="Exit Admin Panel and Return to Player Lobby"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6F6F6F]" />
            <span>Exit to Player Lobby</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas with Persistent Top Navigation Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Admin Top Bar */}
        <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919] hover:bg-[#EEEEEE] transition-colors"
              title="Open Navigation Menu"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs text-[#6F6F6F] truncate font-normal">
              <Link 
                href="/admin/dashboard" 
                className="hover:text-[#191919] transition-colors flex items-center gap-1 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#317CFF]" />
                <span className="hidden sm:inline">Platform Super Admin</span>
                <span className="sm:hidden">Admin</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#B8B8B8] shrink-0" />
              <span className="text-[#191919] font-medium truncate flex items-center gap-1">
                <currentItem.icon className="w-3.5 h-3.5 text-[#191919] shrink-0" />
                <span>{currentItem.label}</span>
              </span>
            </nav>
          </div>

          {/* Right: Back Button & Visible Close / Exit Button */}
          <div className="flex items-center gap-2 shrink-0">
            {pathname !== '/admin/dashboard' && (
              <button
                onClick={() => router.back()}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#191919] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-colors"
                title="Navigate Back to Previous Screen"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {/* Currency / Point Calculator */}
            <CurrencyCalculator showAdminLink />

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Role Context Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-[11px] font-normal text-[#1FAE5B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1FAE5B]"></span>
              SUPER_ADMIN
            </span>

            {/* Close / Exit Admin Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#E5484D] hover:text-[#E5484D] text-xs font-normal border border-[rgba(0,0,0,0.08)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              title="Close Admin Panel & Return to Player Lobby"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
