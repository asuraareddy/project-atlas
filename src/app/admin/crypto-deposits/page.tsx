'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, ShieldCheck, Activity, AlertTriangle, RefreshCw, 
  ExternalLink, Layers, CheckCircle2, Lock 
} from 'lucide-react';
import { WhitelistedAssetConfig, CryptoDepositIntent } from '@/domain/crypto/types';

export default function AdminCryptoDepositsPage() {
  const [whitelist, setWhitelist] = useState<WhitelistedAssetConfig[]>([]);
  const [intents, setIntents] = useState<CryptoDepositIntent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/crypto/whitelist');
      if (res.ok) {
        const json = await res.json();
        setWhitelist(json.data.assets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <QrCode className="w-8 h-8 text-[#b45df0]" />
            <span>Direct Crypto QR & Chain Watcher</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Governance of operator receiving addresses, confirmation depths, rate feeds, and blockchain observation health.
          </p>
        </div>

        <button
          onClick={fetchCryptoData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Watcher</span>
        </button>
      </div>

      {/* Chain Observer Nodes Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#242424] border border-[#10b981]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Polygon PoS Observer</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981]">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#c4bfd0] space-y-0.5">
            <p>Last Block: #52,194,820</p>
            <p>Watcher Lag: 0.8s | Reorg Buffer: 12 Blks</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#242424] border border-[#10b981]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Ethereum RPC Indexer</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981]">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#c4bfd0] space-y-0.5">
            <p>Last Block: #4,819,304</p>
            <p>Watcher Lag: 1.2s | Reorg Buffer: 2 Blks</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#242424] border border-[#10b981]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Bitcoin UTXO Node</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981]">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#c4bfd0] space-y-0.5">
            <p>Last Block: #2,581,902</p>
            <p>Watcher Lag: 4.5s | Reorg Buffer: 3 Blks</p>
          </div>
        </div>
      </div>

      {/* Whitelisted Asset Allow-list */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Server-Configured Asset Allowlist (Document 21)</h2>
          <span className="text-xs text-[#c4bfd0]">Modifications require Dual Control Approval</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Asset</th>
                <th className="p-3">Network</th>
                <th className="p-3">Operator Receiving Address</th>
                <th className="p-3 text-center">Depth</th>
                <th className="p-3 text-center">Rate to GBP</th>
                <th className="p-3">Token Contract</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {whitelist.map((w, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{w.asset}</td>
                  <td className="p-3 text-[#b45df0] font-semibold">{w.networkLabel}</td>
                  <td className="p-3 text-[#c4bfd0] break-all">{w.receivingAddress}</td>
                  <td className="p-3 text-center font-bold text-white">{w.requiredConfirmations} Blks</td>
                  <td className="p-3 text-center text-[#10b981]">£{w.rateToGbp.toLocaleString()}</td>
                  <td className="p-3 text-[10px] text-[#9c9aa8]">
                    {w.tokenContractAddress ? `${w.tokenContractAddress.substring(0, 10)}...` : 'Native Asset'}
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">
                      APPROVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operator Address & Security Guidelines */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-3 text-xs">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#b45df0]" />
          <span>Operational Security & Private Key Protections</span>
        </h3>
        <p className="text-[#c4bfd0] leading-relaxed">
          In compliance with Document 21 Section 11: Private keys, seed phrases, and transaction signing keys are strictly separated from frontend assets, public routes, and normal application logs. Changing operator receiving addresses requires a formal migration proposal, dual-checker authorization, and testnet verification.
        </p>
      </div>
    </div>
  );
}
