'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, ShieldCheck, Activity, AlertTriangle, RefreshCw, 
  ExternalLink, Layers, CheckCircle2, Lock, Edit3, PlusCircle,
  X, Copy, Check, Eye, ArrowUpRight
} from 'lucide-react';
import { WhitelistedAssetConfig } from '@/domain/crypto/types';

export default function AdminCryptoDepositsPage() {
  const [whitelist, setWhitelist] = useState<WhitelistedAssetConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal states
  const [editingAsset, setEditingAsset] = useState<WhitelistedAssetConfig | null>(null);
  const [isNewAssetModal, setIsNewAssetModal] = useState(false);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string | null>(null);
  const [previewQrPayload, setPreviewQrPayload] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [viewingQrAsset, setViewingQrAsset] = useState<WhitelistedAssetConfig | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Form fields for editing
  const [formAddress, setFormAddress] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formConfirmations, setFormConfirmations] = useState('');
  const [formMinGbp, setFormMinGbp] = useState('');
  const [formMaxGbp, setFormMaxGbp] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formNetworkLabel, setFormNetworkLabel] = useState('');

  // Form fields for new asset
  const [newNetwork, setNewNetwork] = useState('polygon');
  const [newAsset, setNewAsset] = useState('USDC');
  const [newLabel, setNewLabel] = useState('Polygon (POS)');
  const [newDecimals, setNewDecimals] = useState('6');
  const [newContract, setNewContract] = useState('');

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/v1/crypto/whitelist');
      if (res.ok) {
        const json = await res.json();
        setWhitelist(json.data.assets);
      } else {
        setErrorMsg('Failed to load cryptocurrency deposit configurations.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error fetching whitelist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Update dynamic QR preview when editing address changes
  const updateQrPreview = async (network: string, address: string) => {
    if (!address || address.trim().length < 15) {
      setPreviewQrDataUrl(null);
      setPreviewQrPayload(null);
      return;
    }
    try {
      setQrLoading(true);
      const res = await fetch('/api/v1/crypto/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview_qr',
          network,
          receivingAddress: address.trim()
        })
      });
      if (res.ok) {
        const json = await res.json();
        setPreviewQrDataUrl(json.data.qrDataUrl);
        setPreviewQrPayload(json.data.qrPayload);
      }
    } catch (e) {
      console.warn('Could not generate preview QR', e);
    } finally {
      setQrLoading(false);
    }
  };

  const openEditModal = (asset: WhitelistedAssetConfig) => {
    setEditingAsset(asset);
    setFormAddress(asset.receivingAddress);
    setFormRate(asset.rateToGbp.toString());
    setFormConfirmations(asset.requiredConfirmations.toString());
    setFormMinGbp((asset.minDepositGbpMinor / 100).toString());
    setFormMaxGbp((asset.maxDepositGbpMinor / 100).toString());
    setFormEnabled(asset.enabled);
    setFormNetworkLabel(asset.networkLabel);
    setErrorMsg(null);
    setSuccessMsg(null);
    updateQrPreview(asset.network, asset.receivingAddress);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await fetch('/api/v1/crypto/whitelist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: editingAsset.network,
          asset: editingAsset.asset,
          receivingAddress: formAddress.trim(),
          rateToGbp: parseFloat(formRate),
          requiredConfirmations: parseInt(formConfirmations, 10),
          minDepositGbpMinor: Math.round(parseFloat(formMinGbp) * 100),
          maxDepositGbpMinor: Math.round(parseFloat(formMaxGbp) * 100),
          enabled: formEnabled,
          networkLabel: formNetworkLabel
        })
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(`Deposit QR & configuration for ${editingAsset.asset} (${editingAsset.networkLabel}) updated successfully!`);
        setEditingAsset(null);
        await fetchCryptoData();
      } else {
        setErrorMsg(json.error?.message || 'Failed to save changes.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);

      const newConfig: WhitelistedAssetConfig = {
        network: newNetwork as any,
        networkLabel: newLabel,
        asset: newAsset.toUpperCase() as any,
        decimals: parseInt(newDecimals, 10),
        tokenContractAddress: newContract ? newContract.trim() : undefined,
        receivingAddress: formAddress.trim(),
        rateToGbp: parseFloat(formRate),
        requiredConfirmations: parseInt(formConfirmations, 10),
        minDepositGbpMinor: Math.round(parseFloat(formMinGbp) * 100),
        maxDepositGbpMinor: Math.round(parseFloat(formMaxGbp) * 100),
        enabled: formEnabled
      };

      const res = await fetch('/api/v1/crypto/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          assetConfig: newConfig
        })
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(`Added new deposit asset ${newAsset} with generated QR code!`);
        setIsNewAssetModal(false);
        await fetchCryptoData();
      } else {
        setErrorMsg(json.error?.message || 'Could not add new asset.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Creation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const openQrViewer = async (asset: WhitelistedAssetConfig) => {
    setViewingQrAsset(asset);
    await updateQrPreview(asset.network, asset.receivingAddress);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header with Title Renamed for Deposit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#b45df0]/20 text-[#b45df0] border border-[#b45df0]/30">
              Admin Deposit Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
            <QrCode className="w-8 h-8 text-[#b45df0]" />
            <span>Deposit Management & Crypto QR Watcher</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Manage deposit operator receiving addresses, regenerate dynamic QR codes in real-time, modify GBP rates, and monitor on-chain confirmation depths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsNewAssetModal(true);
              setFormAddress('');
              setFormRate('1.00');
              setFormConfirmations('12');
              setFormMinGbp('10.00');
              setFormMaxGbp('5000.00');
              setFormEnabled(true);
              setPreviewQrDataUrl(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7e0ac2] to-[#b45df0] text-xs font-bold text-white shadow-lg shadow-[#7e0ac2]/30 hover:brightness-110 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Deposit Asset</span>
          </button>

          <button
            onClick={fetchCryptoData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-between text-xs text-[#10b981]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#ff5a7a]/15 border border-[#ff5a7a]/40 flex items-center justify-between text-xs text-[#ff5a7a]">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Whitelisted Asset Allow-list with Edit QR Action */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Deposit Receiving Wallets & Dynamic QR Codes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#7e0ac2]/20 text-[#b45df0] font-mono">
                {whitelist.length} Assets
              </span>
            </h2>
            <p className="text-xs text-[#c4bfd0]">
              Editing receiving addresses updates the live QR code instantly for all player deposit intents.
            </p>
          </div>
          <span className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct Blockchain Verification Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Asset</th>
                <th className="p-3">Network</th>
                <th className="p-3">Operator Receiving Address & QR</th>
                <th className="p-3 text-center">Confirmations</th>
                <th className="p-3 text-center">Rate to GBP</th>
                <th className="p-3 text-center">Deposit Limits</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {whitelist.map((w, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <span className="w-7 h-7 rounded-full bg-[#1f1f1f] border border-white/10 flex items-center justify-center text-xs text-[#b45df0]">
                        {w.asset.slice(0, 3)}
                      </span>
                      <span>{w.asset}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[#b45df0] font-semibold block">{w.networkLabel}</span>
                    <span className="text-[10px] text-[#9c9aa8] uppercase">{w.network}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#c4bfd0] break-all max-w-[200px] truncate block font-sans text-xs">
                        {w.receivingAddress}
                      </span>
                      <button
                        onClick={() => handleCopy(w.receivingAddress)}
                        title="Copy Address"
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                      >
                        {copiedAddress === w.receivingAddress ? (
                          <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openQrViewer(w)}
                        title="View Live QR Code"
                        className="px-1.5 py-0.5 rounded bg-[#b45df0]/20 text-[#b45df0] hover:bg-[#b45df0]/30 text-[10px] flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR</span>
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-white">
                    <span className="px-2 py-1 rounded bg-[#1f1f1f] border border-white/5">
                      {w.requiredConfirmations} Blks
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-[#10b981]">
                    £{w.rateToGbp.toLocaleString()}
                  </td>
                  <td className="p-3 text-center text-[11px] text-[#c4bfd0]">
                    £{(w.minDepositGbpMinor / 100).toFixed(0)} - £{(w.maxDepositGbpMinor / 100).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.enabled
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#ff5a7a]/20 text-[#ff5a7a]'
                      }`}
                    >
                      {w.enabled ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditModal(w)}
                      className="px-3 py-1.5 rounded-lg bg-[#7e0ac2]/30 hover:bg-[#7e0ac2] text-[#b45df0] hover:text-white border border-[#7e0ac2]/50 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change QR & Address</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL: Change Operator Address & Regenerate QR */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#242424] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#b45df0]">
                  Deposit Address & QR Editor
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Update {editingAsset.asset} on {editingAsset.networkLabel}
                </h3>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-5">
              {/* Operator Receiving Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Operator Receiving Wallet Address (Target for QR Generation)</span>
                  <span className="text-[10px] text-[#b45df0]">Changing this updates player QR immediately</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => {
                    setFormAddress(e.target.value);
                    updateQrPreview(editingAsset.network, e.target.value);
                  }}
                  placeholder="e.g. 0x... or tb1q..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono text-xs focus:border-[#b45df0] focus:outline-none"
                />
              </div>

              {/* Dynamic QR Preview Box */}
              <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-36 h-36 rounded-xl bg-white p-2.5 flex items-center justify-center shrink-0 shadow-md">
                  {qrLoading ? (
                    <RefreshCw className="w-8 h-8 text-[#7e0ac2] animate-spin" />
                  ) : previewQrDataUrl ? (
                    <img
                      src={previewQrDataUrl}
                      alt="Deposit QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-500 text-center font-sans">
                      Enter valid address to preview QR
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <QrCode className="w-4 h-4 text-[#b45df0]" />
                    <span>Real-Time Dynamic QR Preview</span>
                  </div>
                  <p className="text-[#c4bfd0] text-[11px] leading-relaxed">
                    This scannable QR code is generated authoritatively by the backend and served to players initiating deposits on this network.
                  </p>
                  {previewQrPayload && (
                    <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[10px] text-[#10b981] break-all">
                      Payload: {previewQrPayload}
                    </div>
                  )}
                </div>
              </div>

              {/* Numerical Inputs: Rate, Confirmations, Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Rate to GBP (£)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#9c9aa8]">1 {editingAsset.asset} = £{formRate} GBP</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white">Required Block Confirmations</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formConfirmations}
                    onChange={(e) => setFormConfirmations(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#9c9aa8]">Depth before double-entry ledger credit</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white">Min Deposit (£ GBP)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formMinGbp}
                    onChange={(e) => setFormMinGbp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white">Max Deposit (£ GBP)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formMaxGbp}
                    onChange={(e) => setFormMaxGbp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1f1f1f] border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Asset Active for Deposits</span>
                  <span className="text-[11px] text-[#c4bfd0]">If disabled, players cannot select this asset on deposit screen</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormEnabled(!formEnabled)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    formEnabled ? 'bg-[#10b981] text-white' : 'bg-[#ff5a7a] text-white'
                  }`}
                >
                  {formEnabled ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded-xl bg-[#1f1f1f] text-white/70 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7e0ac2] to-[#b45df0] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#7e0ac2]/40 transition-all flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Update QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW ASSET MODAL */}
      {isNewAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#242424] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#b45df0]">
                  New Crypto Deposit Config
                </span>
                <h3 className="text-xl font-extrabold text-white">Add Whitelisted Asset & QR</h3>
              </div>
              <button
                onClick={() => setIsNewAssetModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Blockchain Network</label>
                  <select
                    value={newNetwork}
                    onChange={(e) => {
                      setNewNetwork(e.target.value);
                      if (e.target.value === 'polygon') setNewLabel('Polygon (POS)');
                      if (e.target.value === 'ethereum') setNewLabel('Ethereum (ERC-20)');
                      if (e.target.value === 'bitcoin') setNewLabel('Bitcoin Network');
                      updateQrPreview(e.target.value, formAddress);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  >
                    <option value="polygon">Polygon</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="bitcoin">Bitcoin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white">Asset Symbol (e.g. USDC, DAI)</label>
                  <input
                    type="text"
                    required
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono focus:border-[#b45df0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-white">Network Display Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white focus:border-[#b45df0] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-white">Operator Receiving Address</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => {
                    setFormAddress(e.target.value);
                    updateQrPreview(newNetwork, e.target.value);
                  }}
                  placeholder="e.g. 0x..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono text-xs focus:border-[#b45df0] focus:outline-none"
                />
              </div>

              {/* Dynamic QR Preview Box */}
              <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex items-center gap-4">
                <div className="w-28 h-28 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                  {previewQrDataUrl ? (
                    <img src={previewQrDataUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-500 text-center">QR Preview</span>
                  )}
                </div>
                <div className="text-xs space-y-1 text-[#c4bfd0]">
                  <p className="font-bold text-white">Dynamic Deposit QR Generation</p>
                  <p className="text-[11px]">QR will automatically activate for players as soon as you save.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Rate to GBP (£)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Confirmations</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formConfirmations}
                    onChange={(e) => setFormConfirmations(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-white/15 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewAssetModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1f1f1f] text-white/70 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7e0ac2] to-[#b45df0] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#7e0ac2]/40 transition-all flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Asset & Activate QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW QR MODAL */}
      {viewingQrAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#242424] border border-white/15 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b45df0] uppercase tracking-wider">
                Active Deposit QR
              </span>
              <button
                onClick={() => setViewingQrAsset(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">
              {viewingQrAsset.asset} ({viewingQrAsset.networkLabel})
            </h3>

            <div className="w-56 h-56 mx-auto bg-white rounded-xl p-3 flex items-center justify-center shadow-lg">
              {previewQrDataUrl ? (
                <img src={previewQrDataUrl} alt="Active QR" className="w-full h-full object-contain" />
              ) : (
                <RefreshCw className="w-8 h-8 text-[#7e0ac2] animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono text-[#c4bfd0] break-all bg-[#1f1f1f] p-2.5 rounded-lg border border-white/5">
                {viewingQrAsset.receivingAddress}
              </p>
              <button
                onClick={() => handleCopy(viewingQrAsset.receivingAddress)}
                className="w-full py-2 rounded-xl bg-[#1f1f1f] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2"
              >
                {copiedAddress === viewingQrAsset.receivingAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[#10b981]">Address Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/70" />
                    <span>Copy Receiving Address</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-[11px] text-[#9c9aa8]">
              Confirmed block depth: <strong className="text-white">{viewingQrAsset.requiredConfirmations} Blocks</strong>
            </div>
          </div>
        </div>
      )}

      {/* Operational Security & Private Key Protections */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-3 text-xs">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#b45df0]" />
          <span>Operational Security & Private Key Protections (Document 21)</span>
        </h3>
        <p className="text-[#c4bfd0] leading-relaxed">
          In compliance with Document 21 Section 11: Private keys, seed phrases, and transaction signing keys are strictly air-gapped from web frontend code, public routes, and normal application logs. Changing operator receiving addresses requires authorized operator credentials, immediately propagates to customer QR deposit screens, and records an audit log entry.
        </p>
      </div>
    </div>
  );
}
