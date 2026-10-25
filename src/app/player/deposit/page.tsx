'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  QrCode, ShieldAlert, ArrowRight, Copy, Check, Clock, RefreshCw, 
  AlertTriangle, CheckCircle2, ChevronRight, Wallet, Layers, ShieldCheck 
} from 'lucide-react';
import { WhitelistedAssetConfig, CryptoDepositIntent } from '@/domain/crypto/types';

export default function CryptoDepositPage() {
  const [whitelist, setWhitelist] = useState<WhitelistedAssetConfig[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [amountGbp, setAmountGbp] = useState<string>('25.00');
  const [activeIntent, setActiveIntent] = useState<CryptoDepositIntent | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [watcherSimulationLog, setWatcherSimulationLog] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/crypto/whitelist')
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.assets) {
          setWhitelist(json.data.assets);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const amountGbpMinor = Math.round(parseFloat(amountGbp) * 100);
      const res = await fetch('/api/v1/crypto/deposit-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          asset: selectedAsset,
          amountGbpMinor
        })
      });

      const json = await res.json();
      if (res.ok) {
        setActiveIntent(json.data.intent);
      } else {
        setErrorMessage(json.error?.message || 'Could not generate deposit intent.');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Development simulation of on-chain watcher
  const simulateChainConfirmation = async (confirmations: number) => {
    if (!activeIntent) return;
    try {
      setWatcherSimulationLog('Mock Chain Watcher observing transaction on-chain...');
      const res = await fetch('/api/v1/crypto/simulate-watcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: activeIntent.id,
          confirmations
        })
      });

      const json = await res.json();
      if (res.ok) {
        setActiveIntent(json.data.intent);
        if (json.data.status === 'credited') {
          setWatcherSimulationLog(`Block finality reached (${confirmations}/${activeIntent.requiredConfirmations}). Double-entry ledger credited £${(activeIntent.amountGbpMinor / 100).toFixed(2)} GBP!`);
        } else {
          setWatcherSimulationLog(`Transaction detected in block! Confirmations: ${confirmations}/${activeIntent.requiredConfirmations}`);
        }
      } else {
        setWatcherSimulationLog(`Watcher Error: ${json.error?.message}`);
      }
    } catch (e: any) {
      setWatcherSimulationLog(`Watcher Error: ${e.message}`);
    }
  };

  const selectedConfig = whitelist.find(
    (w) => w.network === selectedNetwork && w.asset === selectedAsset
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
          <Link href="/" className="hover:text-white">Lobby</Link>
          <span>/</span>
          <Link href="/player/wallet" className="hover:text-white">Wallet</Link>
          <span>/</span>
          <span className="text-[#b45df0] font-semibold">Direct Crypto QR Deposit</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <QrCode className="w-8 h-8 text-[#b45df0]" />
          <span>Direct Crypto QR Deposit</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Direct on-chain crypto transfer without intermediary payment gateways. Verified independently by our blockchain observer.
        </p>
      </div>

      {/* Security & Regulatory Notice */}
      <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#b45df0] font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Direct Blockchain Acceptance Notice (UKGC Aligned)</span>
        </div>
        <p className="text-[#c4bfd0] leading-relaxed">
          Transfer only the exact approved asset on the specified network. Screenshots or uploaded hashes never credit a wallet; credit occurs solely upon authoritative block confirmation depth. Value is pegged in integer GBP pence using the locked rate.
        </p>
      </div>

      {!activeIntent ? (
        /* Step 1: Configuration & Intent Initiation */
        <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white">1. Select Asset & Network</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {whitelist.map((item) => (
              <button
                key={`${item.network}_${item.asset}`}
                type="button"
                onClick={() => {
                  setSelectedNetwork(item.network);
                  setSelectedAsset(item.asset);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedNetwork === item.network && selectedAsset === item.asset
                    ? 'bg-[#7e0ac2]/20 border-[#b45df0] shadow-lg shadow-[#7e0ac2]/20'
                    : 'bg-[#1f1f1f] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-base">{item.asset}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-[#c4bfd0]">
                    {item.network}
                  </span>
                </div>
                <p className="text-xs text-[#c4bfd0]">{item.networkLabel}</p>
                <div className="text-[11px] text-[#9c9aa8] mt-2">
                  Min: £{(item.minDepositGbpMinor / 100).toFixed(0)} | Depth: {item.requiredConfirmations} blks
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateIntent} className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">
                Deposit Amount in Account Currency (GBP £)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-white">£</span>
                <input
                  type="number"
                  step="1.00"
                  min={(selectedConfig?.minDepositGbpMinor || 1000) / 100}
                  max={(selectedConfig?.maxDepositGbpMinor || 500000) / 100}
                  required
                  value={amountGbp}
                  onChange={(e) => setAmountGbp(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#1f1f1f] text-white font-mono font-bold rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
                />
              </div>
              {selectedConfig && (
                <p className="text-[11px] text-[#c4bfd0] mt-1">
                  Estimated Crypto Value: ~{(parseFloat(amountGbp || '0') / selectedConfig.rateToGbp).toFixed(4)} {selectedConfig.asset} (Rate: 1 {selectedConfig.asset} = £{selectedConfig.rateToGbp} GBP)
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#ff5a7a]/20 border border-[#ff5a7a]/40 text-[#ff5a7a] text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-semibold text-white bg-[#7e0ac2] hover:bg-[#9a13e6] shadow-lg shadow-[#7e0ac2]/40 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Allocating Address...' : 'Generate Deposit QR & Address'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Dynamic QR Display & Status Observer */
        <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45df0]">Deposit Intent Active</span>
              <h2 className="text-xl font-bold text-white">Transfer Crypto to Operator Address</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activeIntent.status === 'credited'
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                  : activeIntent.status === 'confirming'
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                  : 'bg-[#7e0ac2]/20 text-[#b45df0] border border-[#7e0ac2]/40'
              }`}>
                Status: {activeIntent.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#1f1f1f] rounded-2xl border border-white/10 space-y-4 text-center">
              <div className="text-xs font-semibold text-[#b45df0] uppercase tracking-wider">
                Send strictly on {activeIntent.network.toUpperCase()}
              </div>

              {activeIntent.qrDataUrl ? (
                <div className="p-3 bg-white rounded-xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeIntent.qrDataUrl}
                    alt="Crypto Deposit QR"
                    width={200}
                    height={200}
                    className="block"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center text-xs">
                  {activeIntent.qrPayload}
                </div>
              )}

              <div className="text-xs text-[#c4bfd0]">
                Scan using an approved mobile Web3 or self-custody wallet
              </div>
            </div>

            {/* Transaction Parameters */}
            <div className="space-y-4">
              <div className="p-3.5 bg-[#1f1f1f] rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-[#9c9aa8] uppercase font-semibold">Exact Amount to Send</span>
                <p className="text-2xl font-mono font-bold text-white">
                  {activeIntent.quotedCryptoAmount} <span className="text-[#b45df0]">{activeIntent.asset}</span>
                </p>
                <p className="text-xs text-[#c4bfd0]">
                  Credited Value: £{(activeIntent.amountGbpMinor / 100).toFixed(2)} GBP (Locked Rate: 1 {activeIntent.asset} = £{activeIntent.exchangeRateGbp} GBP)
                </p>
              </div>

              <div className="p-3.5 bg-[#1f1f1f] rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-[#9c9aa8] uppercase font-semibold">Operator Receiving Address</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white break-all">{activeIntent.receivingAddress}</span>
                  <button
                    onClick={() => copyToClipboard(activeIntent.receivingAddress)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#1f1f1f] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#9c9aa8] block">Required Confirmations</span>
                  <span className="font-bold text-white">{activeIntent.requiredConfirmations} Blocks</span>
                </div>
                <div className="p-3 bg-[#1f1f1f] rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#9c9aa8] block">Observed on Chain</span>
                  <span className="font-bold text-[#b45df0]">{activeIntent.confirmationsObserved} Blocks</span>
                </div>
              </div>

              {activeIntent.status === 'credited' && (
                <div className="p-4 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Deposit confirmed & posted to Cash Available! Reconciliation Ref: {activeIntent.reconciliationId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Development Blockchain Observer Controls */}
          <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#b45df0]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b45df0] flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Development Mock Chain Observer</span>
              </span>
              <span className="text-[10px] text-[#9c9aa8]">Simulate Node Confirmation Flow</span>
            </div>
            
            <p className="text-xs text-[#c4bfd0]">
              In development, use these actions to simulate the background blockchain watcher detecting the transfer and progressing through confirmation depths:
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => simulateChainConfirmation(1)}
                className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-white/10 text-xs font-medium text-white"
              >
                1. Detect 1 Confirmation
              </button>
              <button
                type="button"
                onClick={() => simulateChainConfirmation(activeIntent.requiredConfirmations)}
                className="px-3 py-1.5 rounded-lg bg-[#7e0ac2] hover:bg-[#9a13e6] text-xs font-semibold text-white shadow-md"
              >
                2. Confirm Full Depth ({activeIntent.requiredConfirmations} Blks) & Credit
              </button>
              <button
                type="button"
                onClick={() => setActiveIntent(null)}
                className="px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-white/10 text-xs font-medium text-[#c4bfd0] hover:text-white"
              >
                New Intent
              </button>
            </div>

            {watcherSimulationLog && (
              <div className="p-2.5 rounded bg-black/40 font-mono text-[11px] text-[#e2d9f3] border border-white/5">
                {watcherSimulationLog}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
