'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, UserX, CheckCircle2, Lock, Search } from 'lucide-react';

export default function AdminCompliancePage() {
  const [alerts, setAlerts] = useState([
    {
      id: 'sg_alt_01',
      userId: 'usr_player_09',
      signalType: 'DEPOSIT_VELOCITY_SPIKE',
      severity: 'HIGH',
      detectedAt: '2026-10-25 10:14:00',
      status: 'UNDER_REVIEW',
      detail: '5 deposits within 20 minutes exceeding historical 30-day baseline by 340%.'
    },
    {
      id: 'sg_alt_02',
      userId: 'usr_player_14',
      signalType: 'SESSION_DURATION_EXCEEDED',
      severity: 'MEDIUM',
      detectedAt: '2026-10-25 09:30:00',
      status: 'INTERVENTION_SENT',
      detail: 'Continuous gameplay session exceeding 180 minutes without break.'
    },
    {
      id: 'sg_alt_03',
      userId: 'usr_player_42',
      signalType: 'SELF_EXCLUSION_MATCH',
      severity: 'CRITICAL',
      detectedAt: '2026-10-25 08:45:00',
      status: 'BLOCKED',
      detail: 'Registration identity matched national self-exclusion registry (GAMSTOP policy).'
    }
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-[#ff5a7a]" />
          <span>Compliance, AML & Safer Gambling Governance</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Surveillance of player harm indicators, self-exclusion enforcement, and regulatory reporting per Document 10.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#242424] border border-[#ff5a7a]/40 space-y-1">
          <span className="text-[11px] text-[#ff5a7a] font-semibold uppercase">Active Risk Alerts</span>
          <p className="text-2xl font-bold font-mono text-white">3 Cases</p>
          <span className="text-[10px] text-[#c4bfd0]">SLA: 2-hour review target</span>
        </div>

        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#b45df0] font-semibold uppercase">Self-Excluded Accounts</span>
          <p className="text-2xl font-bold font-mono text-white">41 Accounts</p>
          <span className="text-[10px] text-[#10b981]">100% Server Block Enforced</span>
        </div>

        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#10b981] font-semibold uppercase">AML Threshold Checks</span>
          <p className="text-2xl font-bold font-mono text-white">Nominal</p>
          <span className="text-[10px] text-[#c4bfd0]">No sanctioned address exposure</span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Live Safer Gambling Interaction Queue</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Case ID</th>
                <th className="p-3">Player ID</th>
                <th className="p-3">Trigger Signal</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Context Details</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{a.id}</td>
                  <td className="p-3 text-[#b45df0] font-semibold">{a.userId}</td>
                  <td className="p-3 text-white">{a.signalType}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-[#ff5a7a]/20 text-[#ff5a7a]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3 text-[#c4bfd0] max-w-sm">{a.detail}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white font-bold">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
