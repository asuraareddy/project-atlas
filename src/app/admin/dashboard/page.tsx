'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, QrCode, ArrowUpRight, CheckSquare, 
  DollarSign, ShieldAlert, AlertOctagon, CheckCircle2, 
  RefreshCw, Activity, Lock, Users 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [realMoneyKillSwitch, setRealMoneyKillSwitch] = useState(false);
  const [cryptoDepositKillSwitch, setCryptoDepositKillSwitch] = useState(true);
  const [matkaKillSwitch, setMatkaKillSwitch] = useState(true);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#b45df0]" />
            <span>Operational Command Centre</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Real-time multi-game telemetry, blockchain watcher health, and central risk governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-xs font-semibold text-[#10b981]">
            <Activity className="w-3.5 h-3.5" /> All Services Nominal
          </span>
        </div>
      </div>

      {/* Emergency Kill Switches Panel */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-[#ff5a7a]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ff5a7a] font-bold text-sm">
            <AlertOctagon className="w-5 h-5" />
            <span>Master System Kill Switches (Document 03 FR-SYS-001)</span>
          </div>
          <span className="text-[10px] text-[#9c9aa8]">Changes Require Super Admin Authority</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Real-Money Wagering</p>
              <p className="text-[11px] text-[#c4bfd0]">OFF by default until UKGC sign-off</p>
            </div>
            <button
              onClick={() => setRealMoneyKillSwitch(!realMoneyKillSwitch)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                realMoneyKillSwitch ? 'bg-[#10b981] text-white' : 'bg-[#ff5a7a] text-white'
              }`}
            >
              {realMoneyKillSwitch ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Direct Crypto QR Intake</p>
              <p className="text-[11px] text-[#c4bfd0]">Mock watcher on devnet</p>
            </div>
            <button
              onClick={() => setCryptoDepositKillSwitch(!cryptoDepositKillSwitch)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                cryptoDepositKillSwitch ? 'bg-[#10b981] text-white' : 'bg-[#ff5a7a] text-white'
              }`}
            >
              {cryptoDepositKillSwitch ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Matka Market Draws</p>
              <p className="text-[11px] text-[#c4bfd0]">Cutoff engine running</p>
            </div>
            <button
              onClick={() => setMatkaKillSwitch(!matkaKillSwitch)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                matkaKillSwitch ? 'bg-[#10b981] text-white' : 'bg-[#ff5a7a] text-white'
              }`}
            >
              {matkaKillSwitch ? 'OPEN' : 'SUSPENDED'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] font-semibold uppercase">Gross Gaming Revenue (GGR)</span>
          <p className="text-2xl font-bold font-mono text-white">£2,330.00</p>
          <span className="text-[10px] text-[#10b981] font-semibold">+14.2% Today</span>
        </div>

        <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] font-semibold uppercase">Customer Cash Liability</span>
          <p className="text-2xl font-bold font-mono text-white">£30,000.00</p>
          <span className="text-[10px] text-[#c4bfd0]">100% Segregated Ledger</span>
        </div>

        <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] font-semibold uppercase">Pending Dual Approvals</span>
          <p className="text-2xl font-bold font-mono text-[#f59e0b]">3 Cases</p>
          <Link href="/admin/maker-checker" className="text-[10px] text-[#b45df0] hover:underline font-semibold block">
            Review Queue →
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] font-semibold uppercase">Active Game Sessions</span>
          <p className="text-2xl font-bold font-mono text-white">739</p>
          <span className="text-[10px] text-[#c4bfd0]">Across 4 Categories</span>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/crypto-deposits"
          className="p-5 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Deposit & Crypto QR</h3>
            <QrCode className="w-5 h-5 text-[#b45df0] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#c4bfd0]">
            Inspect operator receiving wallets, confirmation requirements, watcher lag, and deposit exceptions.
          </p>
        </Link>

        <Link
          href="/admin/maker-checker"
          className="p-5 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Maker-Checker dual control</h3>
            <CheckSquare className="w-5 h-5 text-[#10b981] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#c4bfd0]">
            Review high-value withdrawals, wallet adjustments, and draw result publications. Self-approval blocked.
          </p>
        </Link>

        <Link
          href="/admin/finance"
          className="p-5 rounded-xl bg-[#242424] border border-white/10 hover:border-[#b45df0] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Finance & Ledger Analytics</h3>
            <DollarSign className="w-5 h-5 text-[#f59e0b] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#c4bfd0]">
            Explore Gross and Net Gaming Revenue, branch revenue attribution, and daily reconciliation reports.
          </p>
        </Link>
      </div>
    </div>
  );
}
