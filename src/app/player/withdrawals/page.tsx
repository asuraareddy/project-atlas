'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
        setFeedback('Withdrawal request submitted! Funds held in reserved cash pending maker-checker approval.');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
          <Link href="/" className="hover:text-white">Lobby</Link>
          <span>/</span>
          <Link href="/player/wallet" className="hover:text-white">Wallet</Link>
          <span>/</span>
          <span className="text-[#ff5a7a] font-semibold">Withdrawal Request</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ArrowUpRight className="w-8 h-8 text-[#ff5a7a]" />
          <span>Withdrawal Processing</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Request payout from available cash. Subject to maker-checker dual authorization and source-of-funds screening.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          feedback.startsWith('Error')
            ? 'bg-[#ff5a7a]/20 text-[#ff5a7a] border border-[#ff5a7a]/40'
            : 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
        }`}>
          {feedback.startsWith('Error') ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Available Cash Snapshot */}
      <div className="p-4 rounded-xl bg-[#242424] border border-white/10 flex items-center justify-between text-xs">
        <div>
          <span className="text-[#c4bfd0]">Available Withdrawable Cash:</span>
          <p className="text-xl font-bold font-mono text-[#10b981] mt-0.5">
            £{((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[#c4bfd0]">Reserved Pending Payout:</span>
          <p className="text-xl font-bold font-mono text-[#f59e0b] mt-0.5">
            £{((wallet?.cashReservedMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Create Payout Request</h2>
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">
              Amount to Withdraw (GBP £)
            </label>
            <input
              type="number"
              step="1.00"
              min="10.00"
              max={(wallet?.cashAvailableMinor || 0) / 100}
              required
              value={amountGbp}
              onChange={(e) => setAmountGbp(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-[#ff5a7a] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">
              Destination UK Bank Account
            </label>
            <input
              type="text"
              required
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-[#ff5a7a] focus:outline-none"
            />
            <span className="text-[11px] text-[#9c9aa8] mt-1 block">
              Must match verified account identity under UK anti-money laundering regulations.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || (wallet?.cashAvailableMinor || 0) < 1000}
            className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-bold text-white bg-[#ff5a7a] hover:bg-[#ff5a7a]/90 shadow-md shadow-[#ff5a7a]/30 transition-all"
          >
            {loading ? 'Reserving & Processing...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </div>

      {/* Withdrawal History Queue */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Your Withdrawal Requests</h2>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-[#c4bfd0]">No withdrawal requests in queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5">
                    <td className="p-3 text-white font-bold">{w.id}</td>
                    <td className="p-3 text-[#ff5a7a] font-bold">£{(w.amountMinor / 100).toFixed(2)}</td>
                    <td className="p-3 text-[#c4bfd0]">{w.payoutMethod}</td>
                    <td className="p-3 text-[#9c9aa8]">{w.destinationAccount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'APPROVED' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-[10px] text-[#9c9aa8]">
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
