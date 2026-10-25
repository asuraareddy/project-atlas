'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, QrCode, ArrowUpRight, CheckSquare, 
  DollarSign, ShieldAlert, Gamepad2, GitFork, FileText, 
  AlertOctagon, UserCheck, ChevronRight 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState('SUPER_ADMIN');

  const navItems = [
    { label: 'Platform Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Deposit & Crypto QR', href: '/admin/crypto-deposits', icon: QrCode },
    { label: 'Withdrawal Approvals', href: '/admin/withdrawals', icon: ArrowUpRight },
    { label: 'Maker-Checker Queue', href: '/admin/maker-checker', icon: CheckSquare },
    { label: 'Finance & P&L', href: '/admin/finance', icon: DollarSign },
    { label: 'Compliance & AML', href: '/admin/compliance', icon: ShieldAlert },
    { label: 'Game Ops & Feeds', href: '/admin/games', icon: Gamepad2 },
    { label: 'Branches & Scopes', href: '/admin/branches', icon: GitFork },
    { label: 'Immutable Audit Log', href: '/admin/audit', icon: FileText }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#1f1f1f]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#171717] border-r border-white/10 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#b45df0] block">Operator Back Office</span>
            <h2 className="text-lg font-extrabold text-white">Project Atlas Admin</h2>
            <div className="mt-2 p-2 bg-[#242424] rounded-lg border border-white/5 text-xs">
              <span className="text-[#9c9aa8] block text-[10px]">Active Role Context:</span>
              <span className="text-[#10b981] font-mono font-bold">{activeRole}</span>
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                      : 'text-[#c4bfd0] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Kill Switch Status */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-lg bg-[#242424] border border-white/5 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#c4bfd0]">Real-Money Wagering</span>
              <span className="text-[#ff5a7a] font-bold">OFF (Default)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#c4bfd0]">Direct Crypto QR</span>
              <span className="text-[#10b981] font-bold">ACTIVE (Mock)</span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
          >
            <span>Exit to Player Lobby</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
