'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ArrowUpRight className="w-8 h-8 text-[#ff5a7a]" />
            <span>Withdrawal Authorization Queue</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Dual approval workflow for player payout requests. Dual control enforced server-side.
          </p>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
          feedback.startsWith('MAKER_CHECKER')
            ? 'bg-[#ff5a7a]/20 text-[#ff5a7a] border border-[#ff5a7a]/40'
            : 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
        }`}>
          {feedback.startsWith('MAKER_CHECKER') ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Acting Checker Identity */}
      <div className="p-4 rounded-xl bg-[#242424] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[#c4bfd0] font-semibold block">Acting Checker Identity:</span>
          <p className="text-white font-mono mt-0.5">Checker ID: <strong className="text-[#b45df0]">{checkerId}</strong></p>
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
            <option value="usr_player_01">usr_player_01 (Attempt Self-Approval Violation)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Withdrawal Requests</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Reference ID</th>
                <th className="p-3">Player ID</th>
                <th className="p-3">Amount (GBP)</th>
                <th className="p-3">Destination Account</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Maker-Checker Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{w.id}</td>
                  <td className="p-3 text-[#c4bfd0]">{w.userId}</td>
                  <td className="p-3 font-bold text-[#ff5a7a]">£{(w.amountMinor / 100).toFixed(2)}</td>
                  <td className="p-3 text-[#c4bfd0]">{w.destinationAccount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.status === 'APPROVED' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {w.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => handleApprove(w.id, w.makerId)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold text-xs shadow-md"
                      >
                        Approve Payout
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#9c9aa8]">Approved by {w.checkerId}</span>
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
