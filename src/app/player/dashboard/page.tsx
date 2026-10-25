'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Wallet, QrCode, ArrowUpRight, ShieldCheck, Dice5, 
  Target, Gamepad2, Layers, Clock, Sparkles, ChevronRight 
} from 'lucide-react';
import { WalletBalance } from '@/domain/wallet/ledger';

export default function PlayerDashboard() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);

  useEffect(() => {
    fetch('/api/v1/me/wallets')
      .then((r) => r.json())
      .then((j) => {
        if (j.data?.wallet) setWallet(j.data.wallet);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#242424] via-[#2a2a2a] to-[#242424] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#7e0ac2] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#7e0ac2]/40">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Welcome, Alex</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-[10px] font-bold">
                KYC Verified
              </span>
            </div>
            <p className="text-xs text-[#c4bfd0] mt-0.5">Player ID: usr_player_01 | Organization: Atlas UK Core</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/player/deposit"
            className="px-5 py-2.5 rounded-full bg-[#7e0ac2] hover:bg-[#9a13e6] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#7e0ac2]/40 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Deposit via Crypto QR</span>
          </Link>
          <Link
            href="/player/withdrawals"
            className="px-5 py-2.5 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-[#ff5a7a]" />
            <span>Withdraw</span>
          </Link>
        </div>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#242424] border border-[#10b981]/30">
          <span className="text-[11px] text-[#10b981] font-semibold uppercase tracking-wider block">Available Cash</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            £{((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10">
          <span className="text-[11px] text-[#f59e0b] font-semibold uppercase tracking-wider block">Reserved Cash</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            £{((wallet?.cashReservedMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10">
          <span className="text-[11px] text-[#b45df0] font-semibold uppercase tracking-wider block">Bonus Balance</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            £{((wallet?.bonusMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10">
          <span className="text-[11px] text-[#c4bfd0] font-semibold uppercase tracking-wider block">Loyalty Points</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {wallet?.pointsBalance || 0} <span className="text-xs font-normal text-[#9c9aa8]">Pts</span>
          </p>
        </div>
      </div>

      {/* Quick Access to the 4 Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Jump to Game Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/matka"
            className="p-4 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7e0ac2]/20 flex items-center justify-center text-[#b45df0] group-hover:scale-105 transition-transform">
              <Dice5 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Matka</p>
              <p className="text-[11px] text-[#c4bfd0]">Draw Markets & Charts</p>
            </div>
          </Link>

          <Link
            href="/carrom"
            className="p-4 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7e0ac2]/20 flex items-center justify-center text-[#b45df0] group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Carrom</p>
              <p className="text-[11px] text-[#c4bfd0]">Tabletop Challenge</p>
            </div>
          </Link>

          <Link
            href="/ludo"
            className="p-4 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7e0ac2]/20 flex items-center justify-center text-[#b45df0] group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Ludo</p>
              <p className="text-[11px] text-[#c4bfd0]">Board Circuit Matches</p>
            </div>
          </Link>

          <Link
            href="/other-games"
            className="p-4 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7e0ac2]/20 flex items-center justify-center text-[#b45df0] group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Other Games</p>
              <p className="text-[11px] text-[#c4bfd0]">Pool & Skill Titles</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
