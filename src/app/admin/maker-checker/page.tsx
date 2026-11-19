'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, AlertCircle, 
  CheckCircle2, RefreshCw
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#1FAE5B]" />
            <span>Maker-checker dual control queue</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1">
            Enforces segregation of duties per Document 06. Self-approval is strictly prohibited on the server.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-medium text-[#191919] hover:bg-[#F8F8F8] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh queue</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${
          feedback.startsWith('REJECTED')
            ? 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/20'
            : 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20'
        }`}>
          {feedback.startsWith('REJECTED') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Acting Checker Identity Selector */}
      <div className="p-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-[#6F6F6F] block font-medium">Active authorized checker identity:</span>
          <p className="text-[#191919] font-mono text-sm mt-0.5">Current checker: <strong className="text-[#317CFF]">{checkerId}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[#6F6F6F]">Switch checker:</label>
          <select
            value={checkerId}
            onChange={(e) => setCheckerId(e.target.value)}
            className="bg-white text-[#191919] border border-[rgba(0,0,0,0.12)] rounded-full px-3.5 py-1.5 font-mono text-xs focus:outline-none focus:border-[#317CFF]"
          >
            <option value="usr_fin_mgr_01">usr_fin_mgr_01 (Finance Manager)</option>
            <option value="usr_operator_admin_01">usr_operator_admin_01 (Operator Admin)</option>
            <option value="usr_super_admin">usr_super_admin (Super Admin)</option>
            <option value="usr_player_01">usr_player_01 (Test Self-Approval Violation)</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-[#191919]">Pending privileged approvals</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Action type</th>
                <th className="p-3 font-medium">Resource target</th>
                <th className="p-3 font-medium">Maker (Requester)</th>
                <th className="p-3 font-medium">Reason / Context</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {approvals.map((req) => (
                <tr key={req.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#317CFF]">{req.actionType}</td>
                  <td className="p-3 text-[#191919] font-medium">{req.resourceId}</td>
                  <td className="p-3 text-[#6F6F6F]">{req.makerId}</td>
                  <td className="p-3 text-[#6F6F6F] max-w-xs">{req.reason}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                      req.status === 'approved'
                        ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]'
                        : req.status === 'rejected'
                        ? 'bg-[#E5484D]/10 text-[#E5484D]'
                        : 'bg-[#F59F00]/10 text-[#B26A00]'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          className="px-3 py-1 rounded-full bg-[#1FAE5B] hover:bg-[#1FAE5B]/90 text-white font-medium text-[11px] transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          className="px-3 py-1 rounded-full bg-[#E5484D] hover:bg-[#E5484D]/90 text-white font-medium text-[11px] transition-all"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#6F6F6F]">Decided by {req.checkerId}</span>
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
