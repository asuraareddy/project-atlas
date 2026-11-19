'use client';

import { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-[#317CFF]" />
          <span>Central immutable audit log</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1">
          Append-only operational audit trail per Document 03 FR-AUD-001. All privileged events capture reason and correlation.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#191919]">Privileged event history</h2>
          <span className="text-xs text-[#1FAE5B] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Append-only WORM storage policy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Event ID</th>
                <th className="p-3 font-medium">Timestamp (UTC)</th>
                <th className="p-3 font-medium">Actor</th>
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Target resource</th>
                <th className="p-3 font-medium">Reason / Audit context</th>
                <th className="p-3 text-right font-medium">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#191919]">{log.id}</td>
                  <td className="p-3 text-[#6F6F6F]">{log.createdAt}</td>
                  <td className="p-3 text-[#1FAE5B] font-medium">{log.actorId}</td>
                  <td className="p-3 text-[#317CFF] font-medium">{log.action}</td>
                  <td className="p-3 text-[#191919]">{log.resourceId}</td>
                  <td className="p-3 text-[#6F6F6F] max-w-xs">{log.reason}</td>
                  <td className="p-3 text-right text-[10px] text-[#B8B8B8]">{log.correlationId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
