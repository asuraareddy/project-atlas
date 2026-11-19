'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, QrCode, ArrowUpRight, CheckSquare, 
  DollarSign, ShieldAlert, AlertOctagon, CheckCircle2, 
  RefreshCw, Activity, Lock, Users, ArrowRight
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
          <h1 className="text-2xl sm:text-3xl font-normal text-[#191919] tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-[#191919]" />
            <span>Operational Command Centre</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
            Real-time multi-game telemetry, blockchain watcher health, and central risk governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-xs text-[#1FAE5B] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
            <span>All services nominal</span>
          </span>
        </div>
      </div>

      {/* Emergency Kill Switches Panel */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#E5484D] font-medium text-sm">
            <AlertOctagon className="w-4 h-4" />
            <span>Master System Kill Switches</span>
          </div>
          <span className="text-[11px] text-[#6F6F6F]">Requires Super Admin Authority</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[#191919]">Real-Money Wagering</p>
              <p className="text-[11px] text-[#6F6F6F]">OFF by default</p>
            </div>
            <button
              onClick={() => setRealMoneyKillSwitch(!realMoneyKillSwitch)}
              className={`px-3 py-1 rounded-full text-xs font-normal transition-all ${
                realMoneyKillSwitch 
                  ? 'bg-[#1FAE5B] text-white' 
                  : 'bg-[#E5484D] text-white'
              }`}
            >
              {realMoneyKillSwitch ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[#191919]">Direct Crypto QR Intake</p>
              <p className="text-[11px] text-[#6F6F6F]">Observation engine</p>
            </div>
            <button
              onClick={() => setCryptoDepositKillSwitch(!cryptoDepositKillSwitch)}
              className={`px-3 py-1 rounded-full text-xs font-normal transition-all ${
                cryptoDepositKillSwitch 
                  ? 'bg-[#1FAE5B] text-white' 
                  : 'bg-[#E5484D] text-white'
              }`}
            >
              {cryptoDepositKillSwitch ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>

          <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[#191919]">Matka Market Draws</p>
              <p className="text-[11px] text-[#6F6F6F]">Cutoff scheduler</p>
            </div>
            <button
              onClick={() => setMatkaKillSwitch(!matkaKillSwitch)}
              className={`px-3 py-1 rounded-full text-xs font-normal transition-all ${
                matkaKillSwitch 
                  ? 'bg-[#1FAE5B] text-white' 
                  : 'bg-[#E5484D] text-white'
              }`}
            >
              {matkaKillSwitch ? 'OPEN' : 'SUSPENDED'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Gross Gaming Revenue (GGR)</span>
          <p className="text-2xl font-normal font-mono text-[#191919]">2,330.00 PTS</p>
          <span className="text-[11px] text-[#1FAE5B] font-normal">+14.2% today</span>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Customer Cash Liability</span>
          <p className="text-2xl font-normal font-mono text-[#191919]">30,000.00 PTS</p>
          <span className="text-[11px] text-[#6F6F6F]">100% Segregated Ledger</span>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Pending Dual Approvals</span>
          <p className="text-2xl font-normal font-mono text-[#317CFF]">3 Cases</p>
          <Link href="/admin/maker-checker" className="text-[11px] text-[#317CFF] hover:underline font-normal block">
            Review queue →
          </Link>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#6F6F6F] font-normal uppercase tracking-wider">Active Game Sessions</span>
          <p className="text-2xl font-normal font-mono text-[#191919]">739</p>
          <span className="text-[11px] text-[#6F6F6F]">Across 4 categories</span>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/crypto-deposits"
          className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.14)] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#191919] text-sm">Deposit & Crypto QR</h3>
            <QrCode className="w-4 h-4 text-[#317CFF] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#6F6F6F] leading-relaxed">
            Inspect operator receiving wallets, confirmation requirements, watcher lag, and deposit exceptions.
          </p>
        </Link>

        <Link
          href="/admin/maker-checker"
          className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.14)] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#191919] text-sm">Maker-Checker dual control</h3>
            <CheckSquare className="w-4 h-4 text-[#1FAE5B] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#6F6F6F] leading-relaxed">
            Review high-value withdrawals, wallet adjustments, and draw result publications. Self-approval blocked.
          </p>
        </Link>

        <Link
          href="/admin/finance"
          className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.14)] space-y-2 group transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#191919] text-sm">Finance & Ledger Analytics</h3>
            <DollarSign className="w-4 h-4 text-[#191919] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[#6F6F6F] leading-relaxed">
            Explore Gross and Net Gaming Revenue, branch revenue attribution, and daily reconciliation reports.
          </p>
        </Link>
      </div>
    </div>
  );
}
