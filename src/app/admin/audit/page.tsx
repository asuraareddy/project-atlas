'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Search, Filter } from 'lucide-react';

export default function AdminAuditPage() {
  const [auditLogs] = useState([
    {
      id: 'aud_evt_101',
      actorType: 'USER',
      actorId: 'usr_fin_mgr_01',
      action: 'APPROVE_WITHDRAWAL',
      resourceType: 'WITHDRAWAL_REQUEST',
      resourceId: 'wd_req_01',
      reason: 'Maker-checker second authorization verified.',
      correlationId: 'corr_appr_98231',
      createdAt: '2026-10-25 11:42:15 UTC'
    },
    {
      id: 'aud_evt_102',
      actorType: 'SYSTEM',
      actorId: 'SYSTEM_BLOCKCHAIN_OBSERVER',
      action: 'CREDIT_DEPOSIT',
      resourceType: 'CRYPTO_DEPOSIT_INTENT',
      resourceId: 'dep_intent_01',
      reason: '12 block confirmations observed on Polygon PoS.',
      correlationId: 'corr_dep_54192',
      createdAt: '2026-10-25 11:15:30 UTC'
    },
    {
      id: 'aud_evt_103',
      actorType: 'USER',
      actorId: 'usr_game_ops_01',
      action: 'PUBLISH_DRAW_RESULT',
      resourceType: 'GAME_ROUND',
      resourceId: 'round_mkt_kalyan_morning_1025',
      reason: 'Official result published and verified: 246-28-134.',
      correlationId: 'corr_mkt_38192',
      createdAt: '2026-10-25 10:02:11 UTC'
    },
    {
      id: 'aud_evt_104',
      actorType: 'USER',
      actorId: 'usr_super_admin',
      action: 'UPDATE_KILL_SWITCH',
      resourceType: 'SYSTEM_CONFIG',
      resourceId: 'cfg_real_money_wagering',
      reason: 'Safety drill confirmation. Real-money kept OFF by default.',
      correlationId: 'corr_sys_10928',
      createdAt: '2026-10-25 09:12:00 UTC'
    }
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#b45df0]" />
          <span>Central Immutable Audit Log</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Append-only operational audit trail per Document 03 FR-AUD-001. All privileged events capture reason and correlation.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Privileged Event History</h2>
          <span className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Append-Only WORM Storage Policy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Event ID</th>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Reason / Audit Context</th>
                <th className="p-3 text-right">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{log.id}</td>
                  <td className="p-3 text-[#c4bfd0]">{log.createdAt}</td>
                  <td className="p-3 text-[#10b981] font-bold">{log.actorId}</td>
                  <td className="p-3 text-[#b45df0] font-bold">{log.action}</td>
                  <td className="p-3 text-white">{log.resourceId}</td>
                  <td className="p-3 text-[#c4bfd0] max-w-xs">{log.reason}</td>
                  <td className="p-3 text-right text-[10px] text-[#9c9aa8]">{log.correlationId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
