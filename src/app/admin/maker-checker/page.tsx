'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, ShieldCheck, XCircle, AlertCircle, 
  CheckCircle2, RefreshCw, UserCheck, FileText, ArrowRight 
} from 'lucide-react';
import { ApprovalRequest } from '@/domain/rbac/types';

export default function AdminMakerCheckerPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [checkerId, setCheckerId] = useState('usr_fin_mgr_01');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/approvals');
      if (res.ok) {
        const json = await res.json();
        setApprovals(json.data.approvals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      setFeedback(null);
      const res = await fetch('/api/v1/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          decision,
          checkerId
        })
      });

      const json = await res.json();
      if (res.ok) {
        setFeedback(json.data.message);
        fetchApprovals();
      } else {
        setFeedback(`REJECTED: ${json.error?.message}`);
      }
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-[#10b981]" />
            <span>Maker-Checker Dual Control Queue</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Enforces segregation of duties per Document 06. Self-approval is strictly prohibited on the server.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
          feedback.startsWith('REJECTED')
            ? 'bg-[#ff5a7a]/20 text-[#ff5a7a] border border-[#ff5a7a]/40'
            : 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
        }`}>
          {feedback.startsWith('REJECTED') ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Acting Checker Identity Selector */}
      <div className="p-4 rounded-xl bg-[#242424] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[#c4bfd0] block font-semibold">Active Authorized Checker Identity:</span>
          <p className="text-white font-mono text-sm mt-0.5">Current Checker: <strong className="text-[#b45df0]">{checkerId}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[#c4bfd0]">Switch Checker:</label>
          <select
            value={checkerId}
            onChange={(e) => setCheckerId(e.target.value)}
            className="bg-[#1f1f1f] text-white border border-white/10 rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-[#b45df0]"
          >
            <option value="usr_fin_mgr_01">usr_fin_mgr_01 (Finance Manager)</option>
            <option value="usr_operator_admin_01">usr_operator_admin_01 (Operator Admin)</option>
            <option value="usr_super_admin">usr_super_admin (Super Admin)</option>
            <option value="usr_player_01">usr_player_01 (Test Self-Approval Violation)</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Privileged Approvals</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Action Type</th>
                <th className="p-3">Resource Target</th>
                <th className="p-3">Maker (Requester)</th>
                <th className="p-3">Reason / Context</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {approvals.map((req) => (
                <tr key={req.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-[#b45df0]">{req.actionType}</td>
                  <td className="p-3 text-white font-semibold">{req.resourceId}</td>
                  <td className="p-3 text-[#c4bfd0]">{req.makerId}</td>
                  <td className="p-3 text-[#c4bfd0] max-w-xs">{req.reason}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.status === 'approved'
                        ? 'bg-[#10b981]/20 text-[#10b981]'
                        : req.status === 'rejected'
                        ? 'bg-[#ff5a7a]/20 text-[#ff5a7a]'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold text-[11px] shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-[#ff5a7a] hover:bg-[#ff5a7a]/90 text-white font-bold text-[11px] shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#9c9aa8]">Decided by {req.checkerId}</span>
                    )}
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
