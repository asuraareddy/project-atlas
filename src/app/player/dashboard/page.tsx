'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Wallet, QrCode, ArrowUpRight, ShieldCheck, Dice5, 
  Target, Gamepad2, Layers, Trophy, Sparkles, ChevronRight 
} from 'lucide-react';
import { WalletBalance } from '@/domain/wallet/ledger';
import { useTenant } from '@/components/tenant/TenantContext';

export default function PlayerDashboard() {
  const { pointConfig } = useTenant();
  const unitName = pointConfig?.pointUnitName || 'PTS';
  const rate = pointConfig?.pointToCurrencyRate ?? 1.0;
  const currencyCode = pointConfig?.currencyCode || 'UNDEFINED';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Welcome Banner */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#191919] flex items-center justify-center text-white text-base font-medium">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium text-[#191919]">Welcome back, Alex</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 text-[10px] font-normal">
                KYC Verified
              </span>
            </div>
            <p className="text-xs text-[#6F6F6F] mt-0.5 font-normal">Account ID: usr_player_01 • Points Balance Enabled</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/player/deposit"
            className="px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal flex items-center gap-2 transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Deposit via Crypto QR</span>
          </Link>
          <Link
            href="/player/withdrawals"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-[#191919] text-xs font-normal flex items-center gap-2 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <ArrowUpRight className="w-4 h-4 text-[#317CFF]" />
            <span>Withdrawals</span>
          </Link>
        </div>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider block">Available Balance</span>
          <p className="text-2xl font-normal font-mono text-[#191919] mt-1">
            {((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <span className="text-[10px] text-[#1FAE5B]">1 {unitName} = {rate} {currencyCode}</span>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider block">In-Play Reserved</span>
          <p className="text-2xl font-normal font-mono text-[#191919] mt-1">
            {((wallet?.cashReservedMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <span className="text-[10px] text-[#6F6F6F]">Active bets</span>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider block">Bonus Credits</span>
          <p className="text-2xl font-normal font-mono text-[#191919] mt-1">
            {((wallet?.bonusMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <span className="text-[10px] text-[#6F6F6F]">Wagering requirement</span>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider block">Loyalty Points</span>
          <p className="text-2xl font-normal font-mono text-[#317CFF] mt-1">
            {wallet?.pointsBalance || 0} {unitName}
          </p>
          <span className="text-[10px] text-[#6F6F6F]">Reward tier</span>
        </div>
      </div>

      {/* Jump to Game Categories */}
      <div className="space-y-4">
        <h2 className="text-base font-medium text-[#191919]">Jump to Game Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/matka"
            className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] flex items-center gap-3 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Dice5 className="w-5 h-5 text-[#317CFF]" />
            </div>
            <div>
              <p className="font-medium text-sm text-[#191919]">1. Matka</p>
              <p className="text-[11px] text-[#6F6F6F]">Draw Markets & Charts</p>
            </div>
          </Link>

          <Link
            href="/casino"
            className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] flex items-center gap-3 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Sparkles className="w-5 h-5 text-[#1FAE5B]" />
            </div>
            <div>
              <p className="font-medium text-sm text-[#191919]">2. Casino Games</p>
              <p className="text-[11px] text-[#6F6F6F]">Slots & Live Studios</p>
            </div>
          </Link>

          <Link
            href="/sports"
            className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] flex items-center gap-3 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Trophy className="w-5 h-5 text-[#317CFF]" />
            </div>
            <div>
              <p className="font-medium text-sm text-[#191919]">3. Sports Exchange</p>
              <p className="text-[11px] text-[#6F6F6F]">Betfair Live Liquidity</p>
            </div>
          </Link>

          <Link
            href="/other-games"
            className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] flex items-center gap-3 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center text-[#191919]">
              <Layers className="w-5 h-5 text-[#191919]" />
            </div>
            <div>
              <p className="font-medium text-sm text-[#191919]">4. Other Games</p>
              <p className="text-[11px] text-[#6F6F6F]">Carrom, Pool, Ludo, Rummy</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
