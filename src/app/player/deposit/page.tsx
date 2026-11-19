'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, ShieldAlert, ArrowRight, Copy, Check, Clock, RefreshCw, 
  CheckCircle2, ArrowLeft 
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
          setWatcherSimulationLog(`Block finality reached (${confirmations}/${activeIntent.requiredConfirmations}). Double-entry ledger credited ${(activeIntent.amountGbpMinor / 100).toFixed(2)} PTS!`);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F6F6F] mb-1">
          <Link href="/" className="hover:text-[#191919]">Lobby</Link>
          <span>/</span>
          <Link href="/player/wallet" className="hover:text-[#191919]">Wallet</Link>
          <span>/</span>
          <span className="text-[#317CFF] font-medium">Direct Crypto QR Deposit</span>
        </div>
        <h1 className="text-3xl font-normal text-[#191919] tracking-tight flex items-center gap-3">
          <QrCode className="w-7 h-7 text-[#191919]" />
          <span>Direct Crypto QR Deposit</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
          Direct on-chain crypto transfer without intermediary payment gateways. Verified independently by our blockchain observer.
        </p>
      </div>

      {/* Security & Regulatory Notice */}
      <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-2 text-xs shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-[#317CFF] font-medium">
          <ShieldAlert className="w-4 h-4" />
          <span>Direct Blockchain Acceptance Notice</span>
        </div>
        <p className="text-[#6F6F6F] leading-relaxed">
          Transfer only the exact approved asset on the specified network. Credit occurs solely upon authoritative block confirmation depth. Value is credited as PTS (1 PTS = 1.0) using the locked rate.
        </p>
      </div>

      {!activeIntent ? (
        /* Step 1: Configuration & Intent Initiation */
        <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-medium text-[#191919]">1. Select Asset & Network</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {whitelist.map((item) => (
              <button
                key={`${item.network}_${item.asset}`}
                type="button"
                onClick={() => {
                  setSelectedNetwork(item.network);
                  setSelectedAsset(item.asset);
                }}
                className={`p-4 rounded-[10px] border text-left transition-all ${
                  selectedNetwork === item.network && selectedAsset === item.asset
                    ? 'bg-[#F8F8F8] border-[#191919] shadow-sm'
                    : 'bg-white border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#191919] text-base">{item.asset}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
                    {item.network}
                  </span>
                </div>
                <p className="text-xs text-[#6F6F6F]">{item.networkLabel}</p>
                <div className="text-[11px] text-[#6F6F6F] mt-2 font-mono">
                  Min: {(item.minDepositGbpMinor / 100).toFixed(0)} PTS | Depth: {item.requiredConfirmations} blks
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateIntent} className="space-y-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
            <div>
              <label className="text-xs font-normal text-[#6F6F6F] block mb-1">
                Deposit Points (1 PTS = 1.0)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1.00"
                  min={(selectedConfig?.minDepositGbpMinor || 1000) / 100}
                  max={(selectedConfig?.maxDepositGbpMinor || 500000) / 100}
                  required
                  value={amountGbp}
                  onChange={(e) => setAmountGbp(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F8F8F8] text-[#191919] font-mono font-medium rounded-[10px] border border-[rgba(0,0,0,0.08)] focus:border-[#191919] focus:outline-none"
                />
              </div>
              {selectedConfig && (
                <p className="text-[11px] text-[#6F6F6F] mt-1 font-normal">
                  Estimated Crypto Value: ~{(parseFloat(amountGbp || '0') / selectedConfig.rateToGbp).toFixed(4)} {selectedConfig.asset} (Rate: 1 {selectedConfig.asset} = {selectedConfig.rateToGbp} PTS)
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-[10px] bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] text-xs font-normal">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Allocating address...' : 'Generate deposit QR & address'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Dynamic QR Display & Status Observer */
        <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.08)] pb-4">
            <div>
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#317CFF]">Deposit Intent Active</span>
              <h2 className="text-xl font-medium text-[#191919]">Transfer Crypto to Operator Address</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-normal uppercase tracking-wider ${
                activeIntent.status === 'credited'
                  ? 'bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20'
                  : activeIntent.status === 'confirming'
                  ? 'bg-[#317CFF]/10 text-[#317CFF] border border-[#317CFF]/20'
                  : 'bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]'
              }`}>
                Status: {activeIntent.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] space-y-4 text-center">
              <div className="text-xs font-normal text-[#191919] uppercase tracking-wider">
                Send strictly on {activeIntent.network.toUpperCase()}
              </div>

              {activeIntent.qrDataUrl ? (
                <div className="p-3 bg-white rounded-[10px] shadow-sm border border-[rgba(0,0,0,0.08)]">
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
                <div className="w-48 h-48 bg-white rounded-[10px] flex items-center justify-center text-xs">
                  {activeIntent.qrPayload}
                </div>
              )}

              <div className="text-xs text-[#6F6F6F]">
                Scan using an approved mobile Web3 or self-custody wallet
              </div>
            </div>

            {/* Transaction Parameters */}
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] text-[#6F6F6F] uppercase font-normal">Exact Amount to Send</span>
                <p className="text-2xl font-mono font-medium text-[#191919]">
                  {activeIntent.quotedCryptoAmount} <span className="text-[#317CFF]">{activeIntent.asset}</span>
                </p>
                <p className="text-xs text-[#6F6F6F]">
                  Credited Value: {(activeIntent.amountGbpMinor / 100).toFixed(2)} PTS (Locked Rate: 1 {activeIntent.asset} = {activeIntent.exchangeRateGbp} PTS)
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] text-[#6F6F6F] uppercase font-normal">Operator Receiving Address</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#191919] break-all">{activeIntent.receivingAddress}</span>
                  <button
                    onClick={() => copyToClipboard(activeIntent.receivingAddress)}
                    className="p-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] shrink-0"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#1FAE5B]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[10px] text-[#6F6F6F] block">Required Confirmations</span>
                  <span className="font-medium text-[#191919]">{activeIntent.requiredConfirmations} Blocks</span>
                </div>
                <div className="p-3 bg-[#F8F8F8] rounded-[10px] border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[10px] text-[#6F6F6F] block">Observed on Chain</span>
                  <span className="font-medium text-[#317CFF]">{activeIntent.confirmationsObserved} Blocks</span>
                </div>
              </div>

              {activeIntent.status === 'credited' && (
                <div className="p-4 rounded-[10px] bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-[#1FAE5B] text-xs font-normal flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Deposit confirmed & posted to Available Balance! Ref: {activeIntent.reconciliationId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Development Blockchain Observer Controls */}
          <div className="p-4 rounded-[10px] bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#191919] flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#317CFF]" />
                <span>Development Mock Chain Observer</span>
              </span>
              <span className="text-[10px] text-[#6F6F6F]">Simulate Node Confirmation Flow</span>
            </div>
            
            <p className="text-xs text-[#6F6F6F]">
              In development, use these actions to simulate the background blockchain watcher detecting the transfer:
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => simulateChainConfirmation(1)}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] text-xs font-normal text-[#191919]"
              >
                1. Detect 1 Confirmation
              </button>
              <button
                type="button"
                onClick={() => simulateChainConfirmation(activeIntent.requiredConfirmations)}
                className="px-3.5 py-1.5 rounded-full bg-[#191919] hover:bg-[#333333] text-xs font-normal text-white shadow-sm"
              >
                2. Confirm Full Depth ({activeIntent.requiredConfirmations} Blks) & Credit
              </button>
              <button
                type="button"
                onClick={() => setActiveIntent(null)}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-xs font-normal text-[#6F6F6F] hover:text-[#191919]"
              >
                New Intent
              </button>
            </div>

            {watcherSimulationLog && (
              <div className="p-2.5 rounded-[10px] bg-white font-mono text-[11px] text-[#191919] border border-[rgba(0,0,0,0.08)]">
                {watcherSimulationLog}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
