'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, QrCode, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Clock, Sparkles, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';
import { WalletBalance, LedgerTransactionGroup } from '@/domain/wallet/ledger';

export default function PlayerWalletPage() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransactionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const [walRes, txRes] = await Promise.all([
        fetch('/api/v1/me/wallets'),
        fetch('/api/v1/me/transactions')
      ]);

      if (walRes.ok) {
        const json = await walRes.json();
        setWallet(json.data.wallet);
      }
      if (txRes.ok) {
        const json = await txRes.json();
        setTransactions(json.data.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
            <Link href="/" className="hover:text-white">Lobby</Link>
            <span>/</span>
            <span className="text-[#b45df0] font-semibold">Account Wallet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#10b981]" />
            <span>Player Wallet & Ledger</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Authoritative double-entry balance breakdown. Cash, restricted bonuses, and non-cash points are strictly segregated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWallet}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Balances</span>
          </button>
        </div>
      </div>

      {/* Segregated Balance Cards per Document 08 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Available */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#242424] to-[#1f1f1f] border border-[#10b981]/30 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#10b981] uppercase tracking-wider">Cash Available</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            £{((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)}
          </p>
          <p className="text-[11px] text-[#c4bfd0]">
            Withdrawable & playable customer funds.
          </p>
        </div>

        {/* Cash Reserved */}
        <div className="p-5 rounded-2xl bg-[#242424] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">Cash Reserved</span>
            <Clock className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            £{((wallet?.cashReservedMinor || 0) / 100).toFixed(2)}
          </p>
          <p className="text-[11px] text-[#c4bfd0]">
            Committed to active wagers or pending withdrawals.
          </p>
        </div>

        {/* Restricted Bonus Funds */}
        <div className="p-5 rounded-2xl bg-[#242424] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b45df0] uppercase tracking-wider">Bonus Funds</span>
            <Sparkles className="w-4 h-4 text-[#b45df0]" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            £{((wallet?.bonusMinor || 0) / 100).toFixed(2)}
          </p>
          <p className="text-[11px] text-[#c4bfd0]">
            Governed by wagering terms; non-withdrawable.
          </p>
        </div>

        {/* Non-Cash Loyalty Points */}
        <div className="p-5 rounded-2xl bg-[#242424] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#c4bfd0] uppercase tracking-wider">Loyalty Points</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">NON-CASH</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {wallet?.pointsBalance || 0} <span className="text-sm font-normal text-[#c4bfd0]">Pts</span>
          </p>
          <p className="text-[11px] text-[#c4bfd0]">
            Used for social/practice rooms and tournament perks.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/player/deposit"
          className="px-6 py-3 rounded-full bg-[#7e0ac2] hover:bg-[#9a13e6] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#7e0ac2]/40 transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>Direct Crypto QR Deposit</span>
        </Link>
        <Link
          href="/player/withdrawals"
          className="px-6 py-3 rounded-full bg-[#242424] hover:bg-[#2a2a2a] border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowUpRight className="w-4 h-4 text-[#ff5a7a]" />
          <span>Request Withdrawal</span>
        </Link>
        <Link
          href="/player/safer-gambling"
          className="px-6 py-3 rounded-full bg-[#ff5a7a]/15 hover:bg-[#ff5a7a]/25 border border-[#ff5a7a]/40 text-[#ff5a7a] text-xs font-semibold flex items-center gap-2 transition-all ml-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deposit & Loss Limits</span>
        </Link>
      </div>

      {/* Immutable Ledger Journal Records */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#b45df0]" />
            <span>Immutable Financial Journal</span>
          </h2>
          <span className="text-xs text-[#c4bfd0]">
            Source of Truth: Double-Entry Postings
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#c4bfd0] bg-[#1f1f1f] rounded-xl border border-white/5">
            No financial postings recorded yet. Complete a Crypto QR Deposit to view initial ledger journal entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                  <th className="p-3">Posting ID</th>
                  <th className="p-3">Source Type</th>
                  <th className="p-3">Reason Code</th>
                  <th className="p-3">Actor / Origin</th>
                  <th className="p-3">Debit Account</th>
                  <th className="p-3">Credit Account</th>
                  <th className="p-3 text-right">Amount (GBP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const debitEntry = tx.entries.find((e) => e.direction === 'DEBIT');
                  const creditEntry = tx.entries.find((e) => e.direction === 'CREDIT');
                  const amount = debitEntry ? debitEntry.amountMinor : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-white/5">
                      <td className="p-3 text-white font-semibold">{tx.id.substring(0, 16)}...</td>
                      <td className="p-3 text-[#b45df0] font-bold">{tx.sourceType}</td>
                      <td className="p-3 text-[#c4bfd0]">{tx.reasonCode}</td>
                      <td className="p-3 text-[#9c9aa8]">{tx.actorId}</td>
                      <td className="p-3 text-[#ff5a7a]">{debitEntry?.accountCode || '-'}</td>
                      <td className="p-3 text-[#10b981]">{creditEntry?.accountCode || '-'}</td>
                      <td className="p-3 text-right text-white font-bold">
                        £{(amount / 100).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
