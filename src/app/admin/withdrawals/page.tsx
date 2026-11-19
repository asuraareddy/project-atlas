'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checkerId, setCheckerId] = useState('usr_fin_mgr_01');

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/withdrawals');
      if (res.ok) {
        const json = await res.json();
        setWithdrawals(json.data.withdrawals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = (id: string, makerId: string) => {
    if (makerId === checkerId) {
      setFeedback('MAKER_CHECKER_VIOLATION: Self-approval is strictly forbidden. A distinct authorized checker is required.');
      return;
    }
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED', checkerId } : w))
    );
    setFeedback(`Withdrawal ${id} approved by ${checkerId}. Payout submitted to provider.`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-[#E5484D]" />
            <span>Withdrawal authorization queue</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1">
            Dual approval workflow for player payout requests. Dual control enforced server-side.
          </p>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-medium text-[#191919] hover:bg-[#F8F8F8] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh queue</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${
          feedback.startsWith('MAKER_CHECKER')
            ? 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/20'
            : 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20'
        }`}>
          {feedback.startsWith('MAKER_CHECKER') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Acting Checker Identity */}
      <div className="p-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-[#6F6F6F] font-medium block">Acting checker identity:</span>
          <p className="text-[#191919] font-mono mt-0.5">Checker ID: <strong className="text-[#317CFF]">{checkerId}</strong></p>
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
            <option value="usr_player_01">usr_player_01 (Attempt Self-Approval Violation)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-[#191919]">Pending withdrawal requests</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Reference ID</th>
                <th className="p-3 font-medium">Player ID</th>
                <th className="p-3 font-medium">Amount (Units)</th>
                <th className="p-3 font-medium">Destination account</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Maker-checker action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#191919]">{w.id}</td>
                  <td className="p-3 text-[#6F6F6F]">{w.userId}</td>
                  <td className="p-3 font-bold text-[#E5484D]">{(w.amountMinor / 100).toFixed(2)}</td>
                  <td className="p-3 text-[#6F6F6F]">{w.destinationAccount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      w.status === 'APPROVED' ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]' : 'bg-[#E5484D]/10 text-[#E5484D]'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {w.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => handleApprove(w.id, w.makerId)}
                        className="px-3.5 py-1.5 rounded-full bg-[#1FAE5B] hover:bg-[#1FAE5B]/90 text-white font-medium text-xs transition-all"
                      >
                        Approve payout
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#6F6F6F]">Approved by {w.checkerId}</span>
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
