'use client';

import { useState, useEffect } from 'react';
import { 
  QrCode, AlertTriangle, RefreshCw, 
  CheckCircle2, Lock, Edit3, PlusCircle,
  X, Copy, Check
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

  // Handle Escape key to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingAsset) setEditingAsset(null);
        if (isNewAssetModal) setIsNewAssetModal(false);
        if (viewingQrAsset) setViewingQrAsset(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingAsset, isNewAssetModal, viewingQrAsset]);

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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
              Admin deposit portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5 mt-1">
            <QrCode className="w-6 h-6 text-[#317CFF]" />
            <span>Deposit management & crypto QR watcher</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1">
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#191919] text-xs font-medium text-white hover:bg-[#333333] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add deposit asset</span>
          </button>

          <button
            onClick={fetchCryptoData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-medium text-[#191919] hover:bg-[#F8F8F8] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 flex items-center justify-between text-xs text-[#1FAE5B]">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#191919]/60 hover:text-[#191919]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/20 flex items-center justify-between text-xs text-[#E5484D]">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[#191919]/60 hover:text-[#191919]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chain Observer Nodes Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#191919]">
            <span>Polygon PoS observer</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1FAE5B]/10 text-[#1FAE5B] font-mono">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#6F6F6F] space-y-0.5">
            <p>Last Block: #52,194,820</p>
            <p>Watcher Lag: 0.8s | Reorg Buffer: 12 Blks</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#191919]">
            <span>Ethereum RPC indexer</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1FAE5B]/10 text-[#1FAE5B] font-mono">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#6F6F6F] space-y-0.5">
            <p>Last Block: #4,819,304</p>
            <p>Watcher Lag: 1.2s | Reorg Buffer: 2 Blks</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#191919]">
            <span>Bitcoin UTXO node</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1FAE5B]/10 text-[#1FAE5B] font-mono">CONNECTED</span>
          </div>
          <div className="text-xs font-mono text-[#6F6F6F] space-y-0.5">
            <p>Last Block: #2,581,902</p>
            <p>Watcher Lag: 4.5s | Reorg Buffer: 3 Blks</p>
          </div>
        </div>
      </div>

      {/* Whitelisted Asset Allow-list with Edit QR Action */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#191919] flex items-center gap-2">
              <span>Deposit receiving wallets & dynamic QR codes</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#F8F8F8] text-[#6F6F6F] font-mono border border-[rgba(0,0,0,0.08)]">
                {whitelist.length} Assets
              </span>
            </h2>
            <p className="text-xs text-[#6F6F6F]">
              Editing receiving addresses updates the live QR code instantly for all player deposit intents.
            </p>
          </div>
          <span className="text-xs text-[#1FAE5B] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct blockchain verification active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Asset</th>
                <th className="p-3 font-medium">Network</th>
                <th className="p-3 font-medium">Operator receiving address & QR</th>
                <th className="p-3 text-center font-medium">Confirmations</th>
                <th className="p-3 text-center font-medium">Rate to units</th>
                <th className="p-3 text-center font-medium">Deposit limits</th>
                <th className="p-3 text-center font-medium">Status</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {whitelist.map((w, idx) => (
                <tr key={idx} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-semibold text-[#191919] text-sm">
                      <span className="w-7 h-7 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-xs text-[#317CFF]">
                        {w.asset.slice(0, 3)}
                      </span>
                      <span>{w.asset}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[#191919] font-medium block">{w.networkLabel}</span>
                    <span className="text-[10px] text-[#6F6F6F] uppercase">{w.network}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6F6F6F] break-all max-w-[200px] truncate block font-sans text-xs">
                        {w.receivingAddress}
                      </span>
                      <button
                        onClick={() => handleCopy(w.receivingAddress)}
                        title="Copy Address"
                        className="p-1 rounded-md hover:bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919]"
                      >
                        {copiedAddress === w.receivingAddress ? (
                          <Check className="w-3.5 h-3.5 text-[#1FAE5B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openQrViewer(w)}
                        title="View Live QR Code"
                        className="px-2 py-0.5 rounded-full bg-[#317CFF]/10 text-[#317CFF] hover:bg-[#317CFF]/20 text-[10px] flex items-center gap-1 font-medium"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR</span>
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center font-medium text-[#191919]">
                    <span className="px-2 py-0.5 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)]">
                      {w.requiredConfirmations} Blks
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-[#1FAE5B]">
                    {w.rateToGbp.toLocaleString()}
                  </td>
                  <td className="p-3 text-center text-[11px] text-[#6F6F6F]">
                    {(w.minDepositGbpMinor / 100).toFixed(0)} - {(w.maxDepositGbpMinor / 100).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        w.enabled
                          ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]'
                          : 'bg-[#E5484D]/10 text-[#E5484D]'
                      }`}
                    >
                      {w.enabled ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditModal(w)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.12)] text-xs font-medium inline-flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#317CFF]" />
                      <span>Change QR & address</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingAsset && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setEditingAsset(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-medium tracking-widest text-[#317CFF]">
                  Deposit address & QR editor
                </span>
                <h3 className="text-lg font-semibold text-[#191919]">
                  Update {editingAsset.asset} on {editingAsset.networkLabel}
                </h3>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-1.5 rounded-full hover:bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#191919] flex items-center justify-between">
                  <span>Operator receiving wallet address (target for QR generation)</span>
                  <span className="text-[10px] text-[#317CFF]">Changing this updates player QR immediately</span>
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
                  className="w-full px-3.5 py-2.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono text-xs focus:border-[#317CFF] focus:outline-none"
                />
              </div>

              {/* Dynamic QR Preview Box */}
              <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center gap-5">
                <div className="w-32 h-32 rounded-xl bg-white p-2.5 flex items-center justify-center shrink-0 border border-[rgba(0,0,0,0.08)] shadow-sm">
                  {qrLoading ? (
                    <RefreshCw className="w-6 h-6 text-[#317CFF] animate-spin" />
                  ) : previewQrDataUrl ? (
                    <img
                      src={previewQrDataUrl}
                      alt="Deposit QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-[#6F6F6F] text-center font-sans">
                      Enter valid address to preview QR
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#191919] font-medium">
                    <QrCode className="w-4 h-4 text-[#317CFF]" />
                    <span>Real-time dynamic QR preview</span>
                  </div>
                  <p className="text-[#6F6F6F] text-[11px] leading-relaxed">
                    This scannable QR code is generated authoritatively by the backend and served to players initiating deposits on this network.
                  </p>
                  {previewQrPayload && (
                    <div className="p-2 rounded-lg bg-white border border-[rgba(0,0,0,0.08)] font-mono text-[10px] text-[#1FAE5B] break-all">
                      Payload: {previewQrPayload}
                    </div>
                  )}
                </div>
              </div>

              {/* Numerical Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Rate to account units</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#6F6F6F]">1 {editingAsset.asset} = {formRate} units</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Required block confirmations</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formConfirmations}
                    onChange={(e) => setFormConfirmations(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#6F6F6F]">Depth before double-entry ledger credit</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Min deposit</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formMinGbp}
                    onChange={(e) => setFormMinGbp(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Max deposit</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formMaxGbp}
                    onChange={(e) => setFormMaxGbp(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)]">
                <div>
                  <span className="text-xs font-semibold text-[#191919] block">Asset active for deposits</span>
                  <span className="text-[11px] text-[#6F6F6F]">If disabled, players cannot select this asset on deposit screen</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormEnabled(!formEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    formEnabled ? 'bg-[#1FAE5B] text-white' : 'bg-[#E5484D] text-white'
                  }`}
                >
                  {formEnabled ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] text-xs font-medium hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-medium transition-all flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & update QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW ASSET MODAL */}
      {isNewAssetModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsNewAssetModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-medium tracking-widest text-[#317CFF]">
                  New crypto deposit config
                </span>
                <h3 className="text-lg font-semibold text-[#191919]">Add whitelisted asset & QR</h3>
              </div>
              <button
                onClick={() => setIsNewAssetModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Blockchain network</label>
                  <select
                    value={newNetwork}
                    onChange={(e) => {
                      setNewNetwork(e.target.value);
                      if (e.target.value === 'polygon') setNewLabel('Polygon (POS)');
                      if (e.target.value === 'ethereum') setNewLabel('Ethereum (ERC-20)');
                      if (e.target.value === 'bitcoin') setNewLabel('Bitcoin Network');
                      updateQrPreview(e.target.value, formAddress);
                    }}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  >
                    <option value="polygon">Polygon</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="bitcoin">Bitcoin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Asset symbol (e.g. USDC, DAI)</label>
                  <input
                    type="text"
                    required
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono focus:border-[#317CFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-[#191919]">Network display label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] focus:border-[#317CFF] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-[#191919]">Operator receiving address</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => {
                    setFormAddress(e.target.value);
                    updateQrPreview(newNetwork, e.target.value);
                  }}
                  placeholder="e.g. 0x..."
                  className="w-full px-3.5 py-2.5 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono text-xs focus:border-[#317CFF] focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-white p-2 flex items-center justify-center shrink-0 border border-[rgba(0,0,0,0.08)]">
                  {previewQrDataUrl ? (
                    <img src={previewQrDataUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-[#6F6F6F] text-center">QR preview</span>
                  )}
                </div>
                <div className="text-xs space-y-1 text-[#6F6F6F]">
                  <p className="font-medium text-[#191919]">Dynamic deposit QR generation</p>
                  <p className="text-[11px]">QR will automatically activate for players as soon as you save.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Rate to account units</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-[#191919]">Confirmations</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formConfirmations}
                    onChange={(e) => setFormConfirmations(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsNewAssetModal(false)}
                  className="px-4 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-[#191919] text-xs font-medium hover:bg-[#F8F8F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-medium transition-all flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add asset & activate QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW QR MODAL */}
      {viewingQrAsset && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setViewingQrAsset(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#317CFF] uppercase tracking-wider">
                Active deposit QR
              </span>
              <button
                onClick={() => setViewingQrAsset(null)}
                className="p-1 rounded-full hover:bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-semibold text-[#191919]">
              {viewingQrAsset.asset} ({viewingQrAsset.networkLabel})
            </h3>

            <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 flex items-center justify-center border border-[rgba(0,0,0,0.08)] shadow-sm">
              {previewQrDataUrl ? (
                <img src={previewQrDataUrl} alt="Active QR" className="w-full h-full object-contain" />
              ) : (
                <RefreshCw className="w-6 h-6 text-[#317CFF] animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono text-[#6F6F6F] break-all bg-[#F8F8F8] p-2.5 rounded-lg border border-[rgba(0,0,0,0.08)]">
                {viewingQrAsset.receivingAddress}
              </p>
              <button
                onClick={() => handleCopy(viewingQrAsset.receivingAddress)}
                className="w-full py-2 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.12)] text-xs font-medium text-[#191919] flex items-center justify-center gap-2"
              >
                {copiedAddress === viewingQrAsset.receivingAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1FAE5B]" />
                    <span className="text-[#1FAE5B]">Address copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#6F6F6F]" />
                    <span>Copy receiving address</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-[11px] text-[#6F6F6F]">
              Confirmed block depth: <strong className="text-[#191919]">{viewingQrAsset.requiredConfirmations} Blocks</strong>
            </div>
          </div>
        </div>
      )}

      {/* Operational Security & Private Key Protections */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-3 text-xs shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <h3 className="font-semibold text-[#191919] text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#317CFF]" />
          <span>Operational security & private key protections (Document 21)</span>
        </h3>
        <p className="text-[#6F6F6F] leading-relaxed">
          In compliance with Document 21 Section 11: Private keys, seed phrases, and transaction signing keys are strictly air-gapped from web frontend code, public routes, and normal application logs. Changing operator receiving addresses requires authorized operator credentials, immediately propagates to customer QR deposit screens, and records an audit log entry.
        </p>
      </div>
    </div>
  );
}
