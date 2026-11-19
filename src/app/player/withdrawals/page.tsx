'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { WalletBalance } from '@/domain/wallet/ledger';

export default function PlayerWithdrawalsPage() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [amountGbp, setAmountGbp] = useState('20.00');
  const [destinationAccount, setDestinationAccount] = useState('Barclays UK ****4910');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const [wRes, qRes] = await Promise.all([
        fetch('/api/v1/me/wallets'),
        fetch('/api/v1/withdrawals')
      ]);
      if (wRes.ok) {
        const j = await wRes.json();
        setWallet(j.data.wallet);
      }
      if (qRes.ok) {
        const j = await qRes.json();
        setWithdrawals(j.data.withdrawals);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const amountGbpMinor = Math.round(parseFloat(amountGbp) * 100);
      const res = await fetch('/api/v1/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountGbpMinor,
          payoutMethod: 'UK_FASTER_PAYMENTS',
          destinationAccount
        })
      });

      const json = await res.json();
      if (res.ok) {
        setFeedback('Withdrawal request submitted! Funds held in reserved balance pending maker-checker approval.');
        fetchStatus();
      } else {
        setFeedback(`Error: ${json.error?.message}`);
      }
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F6F6F] mb-1">
          <Link href="/" className="hover:text-[#191919]">Lobby</Link>
          <span>/</span>
          <Link href="/player/wallet" className="hover:text-[#191919]">Wallet</Link>
          <span>/</span>
          <span className="text-[#317CFF] font-medium">Withdrawal Request</span>
        </div>
        <h1 className="text-3xl font-normal text-[#191919] tracking-tight flex items-center gap-3">
          <ArrowUpRight className="w-7 h-7 text-[#191919]" />
          <span>Withdrawal Processing</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
          Request payout from available balance. Subject to maker-checker dual authorization and compliance screening.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-[10px] text-xs font-normal flex items-center gap-2 ${
          feedback.startsWith('Error')
            ? 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/20'
            : 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20'
        }`}>
          {feedback.startsWith('Error') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Available Balance Snapshot */}
      <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between text-xs">
        <div>
          <span className="text-[#6F6F6F]">Available Withdrawable Balance:</span>
          <p className="text-xl font-medium font-mono text-[#1FAE5B] mt-0.5">
            {((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)} PTS
          </p>
        </div>
        <div className="text-right">
          <span className="text-[#6F6F6F]">Reserved Pending Payout:</span>
          <p className="text-xl font-medium font-mono text-[#317CFF] mt-0.5">
            {((wallet?.cashReservedMinor || 0) / 100).toFixed(2)} PTS
          </p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h2 className="text-base font-medium text-[#191919]">Create Payout Request</h2>
        <form onSubmit={handleRequest} className="space-y-4 text-xs">
          <div>
            <label className="text-[#6F6F6F] font-normal block mb-1">
              Amount to Withdraw (PTS)
            </label>
            <input
              type="number"
              step="1.00"
              min="10.00"
              max={(wallet?.cashAvailableMinor || 0) / 100}
              required
              value={amountGbp}
              onChange={(e) => setAmountGbp(e.target.value)}
              className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-sm text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#6F6F6F] font-normal block mb-1">
              Destination UK Bank Account / IBAN
            </label>
            <input
              type="text"
              required
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
              className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-sm text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
            />
            <span className="text-[11px] text-[#6F6F6F] mt-1 block">
              Must match verified account identity under anti-money laundering regulations.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || (wallet?.cashAvailableMinor || 0) < 1000}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] shadow-sm transition-all"
          >
            {loading ? 'Reserving & Processing...' : 'Submit withdrawal request'}
          </button>
        </form>
      </div>

      {/* Withdrawal History Queue */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h2 className="text-base font-medium text-[#191919]">Your Withdrawal Requests</h2>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-[#6F6F6F]">No withdrawal requests in queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)] text-[11px] font-normal">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Amount (PTS)</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                    <td className="p-3 text-[#191919] font-medium">{w.id}</td>
                    <td className="p-3 text-[#191919] font-medium">{(w.amountMinor / 100).toFixed(2)} PTS</td>
                    <td className="p-3 text-[#6F6F6F]">{w.payoutMethod}</td>
                    <td className="p-3 text-[#6F6F6F]">{w.destinationAccount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase ${
                        w.status === 'APPROVED' ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]' : 'bg-[#317CFF]/10 text-[#317CFF]'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-[10px] text-[#6F6F6F]">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
