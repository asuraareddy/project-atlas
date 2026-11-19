'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, QrCode, ArrowUpRight, ShieldCheck, 
  Clock, Sparkles, RefreshCw, FileText 
} from 'lucide-react';
import { WalletBalance, LedgerTransactionGroup } from '@/domain/wallet/ledger';
import { useTenant } from '@/components/tenant/TenantContext';

export default function PlayerWalletPage() {
  const { pointConfig } = useTenant();
  const unitName = pointConfig?.pointUnitName || 'PTS';
  const rate = pointConfig?.pointToCurrencyRate ?? 1.0;
  const currencyCode = pointConfig?.currencyCode || 'UNDEFINED';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6F6F6F] mb-1">
            <Link href="/" className="hover:text-[#191919]">Lobby</Link>
            <span>/</span>
            <span className="text-[#317CFF] font-medium">Account Wallet</span>
          </div>
          <h1 className="text-3xl font-normal text-[#191919] tracking-tight flex items-center gap-3">
            <Wallet className="w-7 h-7 text-[#191919]" />
            <span>Player Wallet & Ledger</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
            Authoritative double-entry balance breakdown. Cash, restricted bonuses, and non-cash points are strictly segregated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWallet}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-xs font-normal text-[#191919] hover:bg-[#F8F8F8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh balances</span>
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">Available Balance</span>
            <span className="w-2 h-2 rounded-full bg-[#1FAE5B]"></span>
          </div>
          <p className="text-3xl font-normal font-mono text-[#191919]">
            {((wallet?.cashAvailableMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <p className="text-[11px] text-[#6F6F6F]">
            Withdrawable & playable customer funds.
          </p>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">In-Play Reserved</span>
            <Clock className="w-4 h-4 text-[#317CFF]" />
          </div>
          <p className="text-3xl font-normal font-mono text-[#191919]">
            {((wallet?.cashReservedMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <p className="text-[11px] text-[#6F6F6F]">
            Committed to active wagers or pending withdrawals.
          </p>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">Bonus Funds</span>
            <Sparkles className="w-4 h-4 text-[#1FAE5B]" />
          </div>
          <p className="text-3xl font-normal font-mono text-[#191919]">
            {((wallet?.bonusMinor || 0) / 100).toFixed(2)} {unitName}
          </p>
          <p className="text-[11px] text-[#6F6F6F]">
            Governed by wagering terms; non-withdrawable.
          </p>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#6F6F6F] uppercase tracking-wider">Loyalty Points</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] font-mono">{unitName}</span>
          </div>
          <p className="text-3xl font-normal font-mono text-[#191919]">
            {wallet?.pointsBalance || 0} {unitName}
          </p>
          <p className="text-[11px] text-[#6F6F6F]">
            1 {unitName} = {rate} {currencyCode} valuation.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/player/deposit"
          className="px-6 py-2.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal flex items-center gap-2 shadow-sm transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>Direct Crypto QR Deposit</span>
        </Link>
        <Link
          href="/player/withdrawals"
          className="px-6 py-2.5 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-[#191919] text-xs font-normal flex items-center gap-2 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <ArrowUpRight className="w-4 h-4 text-[#317CFF]" />
          <span>Request Withdrawal</span>
        </Link>
        <Link
          href="/player/safer-gambling"
          className="px-6 py-2.5 rounded-full bg-[#E5484D]/10 hover:bg-[#E5484D]/15 border border-[#E5484D]/20 text-[#E5484D] text-xs font-normal flex items-center gap-2 transition-all ml-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deposit & Loss Limits</span>
        </Link>
      </div>

      {/* Immutable Ledger Journal Records */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-[#191919] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#317CFF]" />
            <span>Immutable Financial Journal</span>
          </h2>
          <span className="text-xs text-[#6F6F6F]">
            Source of Truth: Double-Entry Postings
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6F6F6F] bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)]">
            No financial postings recorded yet. Complete a Crypto QR Deposit to view initial ledger journal entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)] text-[11px] font-normal">
                  <th className="p-3">Posting ID</th>
                  <th className="p-3">Source Type</th>
                  <th className="p-3">Reason Code</th>
                  <th className="p-3">Actor / Origin</th>
                  <th className="p-3">Debit Account</th>
                  <th className="p-3">Credit Account</th>
                  <th className="p-3 text-right">Amount (PTS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {transactions.map((tx) => {
                  const debitEntry = tx.entries.find((e) => e.direction === 'DEBIT');
                  const creditEntry = tx.entries.find((e) => e.direction === 'CREDIT');
                  const amount = debitEntry ? debitEntry.amountMinor : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                      <td className="p-3 text-[#191919] font-medium">{tx.id.substring(0, 16)}...</td>
                      <td className="p-3 text-[#317CFF]">{tx.sourceType}</td>
                      <td className="p-3 text-[#6F6F6F]">{tx.reasonCode}</td>
                      <td className="p-3 text-[#6F6F6F]">{tx.actorId}</td>
                      <td className="p-3 text-[#E5484D]">{debitEntry?.accountCode || '-'}</td>
                      <td className="p-3 text-[#1FAE5B]">{creditEntry?.accountCode || '-'}</td>
                      <td className="p-3 text-right text-[#191919] font-medium">
                        {(amount / 100).toFixed(2)}
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
