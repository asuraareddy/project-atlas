'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminCompliancePage() {
  const [alerts] = useState([
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
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-[#E5484D]" />
          <span>Compliance, AML & safer gambling governance</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1">
          Surveillance of player harm indicators, self-exclusion enforcement, and regulatory reporting per Document 10.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#E5484D] font-medium uppercase tracking-wider">Active Risk Alerts</span>
          <p className="text-2xl font-bold font-mono text-[#191919]">3 Cases</p>
          <span className="text-[10px] text-[#6F6F6F]">SLA: 2-hour review target</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#317CFF] font-medium uppercase tracking-wider">Self-Excluded Accounts</span>
          <p className="text-2xl font-bold font-mono text-[#191919]">41 Accounts</p>
          <span className="text-[10px] text-[#1FAE5B]">100% Server block enforced</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#1FAE5B] font-medium uppercase tracking-wider">AML Threshold Checks</span>
          <p className="text-2xl font-bold font-mono text-[#191919]">Nominal</p>
          <span className="text-[10px] text-[#6F6F6F]">No sanctioned address exposure</span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-[#191919]">Live safer gambling interaction queue</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Case ID</th>
                <th className="p-3 font-medium">Player ID</th>
                <th className="p-3 font-medium">Trigger signal</th>
                <th className="p-3 font-medium">Severity</th>
                <th className="p-3 font-medium">Context details</th>
                <th className="p-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#191919]">{a.id}</td>
                  <td className="p-3 text-[#317CFF] font-medium">{a.userId}</td>
                  <td className="p-3 text-[#191919]">{a.signalType}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      a.severity === 'CRITICAL' ? 'bg-[#E5484D]/10 text-[#E5484D]' : 'bg-[#F59F00]/10 text-[#B26A00]'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3 text-[#6F6F6F] max-w-sm">{a.detail}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] font-medium">
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
