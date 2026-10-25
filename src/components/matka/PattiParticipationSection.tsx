'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dice5,
  Calendar,
  Layers,
  Plus,
  Minus,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { MarketSummary } from '@/domain/games/adapters/types';
import {
  getPattiPossibilities,
  PattiCategory,
  MATKA_DIGIT_ORDER,
  validatePoints
} from '@/domain/games/matka/patti-generator';

export interface SelectedPattiItem {
  id: string; // unique key: `${marketId}_${date}_${gameType}_${pattiNumber}`
  pattiNumber: string;
  category: PattiCategory;
  digit: number;
  gameType: 'OPEN' | 'CLOSE';
  date: string;
  points: number;
  marketId: string;
  marketName: string;
}

interface PattiParticipationSectionProps {
  markets: MarketSummary[];
  preselectedMarketId?: string;
  onMarketChange?: (market: MarketSummary) => void;
}

export default function PattiParticipationSection({
  markets,
  preselectedMarketId,
  onMarketChange
}: PattiParticipationSectionProps) {
  // 1. Core Selection States
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    preselectedMarketId || markets[0]?.id || 'mkt_kalyan_morning'
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [gameType, setGameType] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [selectedDigit, setSelectedDigit] = useState<number>(3); // Default 3 as referenced in prompt
  const [category, setCategory] = useState<PattiCategory>('single');
  const [pointsInput, setPointsInput] = useState<number>(5);

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // 2. Cart / Participation Slip
  const [selectedEntries, setSelectedEntries] = useState<SelectedPattiItem[]>([]);

  // 3. Network & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active Market Reference
  const activeMarket = useMemo(() => {
    return markets.find((m) => m.id === selectedMarketId) || markets[0] || null;
  }, [markets, selectedMarketId]);

  // Sync when prop changes
  useEffect(() => {
    if (preselectedMarketId) {
      setSelectedMarketId(preselectedMarketId);
    }
  }, [preselectedMarketId]);

  // Digits: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 per prompt specification
  const DIGIT_BUTTONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  // Derive authoritative possibilities for (selectedDigit, category)
  const currentPossibilities = useMemo(() => {
    try {
      return getPattiPossibilities(selectedDigit, category);
    } catch (err: any) {
      console.error('Failed to generate Patti possibilities:', err);
      return [];
    }
  }, [selectedDigit, category]);

  // Points validation helper
  const handlePointsChange = (val: number) => {
    const validated = validatePoints(val, 1, 100);
    if (!validated.valid) {
      setValidationError(validated.reason || 'Invalid points');
    } else {
      setValidationError(null);
      setPointsInput(val);
    }
  };

  // Helper to construct item unique ID
  const makeItemId = (patti: string) =>
    `${selectedMarketId}_${selectedDate}_${gameType}_${patti}`;

  // Check if a patti is already selected in the current context
  const isPattiSelected = (patti: string) => {
    const id = makeItemId(patti);
    return selectedEntries.some((item) => item.id === id);
  };

  // Toggle selection for a single patti
  const togglePattiSelection = (patti: string) => {
    const id = makeItemId(patti);
    const existingIndex = selectedEntries.findIndex((item) => item.id === id);

    if (existingIndex >= 0) {
      // Remove
      setSelectedEntries((prev) => prev.filter((item) => item.id !== id));
    } else {
      // Add with entered points
      const newItem: SelectedPattiItem = {
        id,
        pattiNumber: patti,
        category,
        digit: selectedDigit,
        gameType,
        date: selectedDate,
        points: pointsInput,
        marketId: selectedMarketId,
        marketName: activeMarket?.name || 'Selected Market'
      };
      setSelectedEntries((prev) => [...prev, newItem]);
    }
  };

  // Select all possibilities in current view
  const handleSelectAll = () => {
    setSelectedEntries((prev) => {
      const updated = [...prev];
      for (const patti of currentPossibilities) {
        const id = makeItemId(patti);
        if (!updated.some((item) => item.id === id)) {
          updated.push({
            id,
            pattiNumber: patti,
            category,
            digit: selectedDigit,
            gameType,
            date: selectedDate,
            points: pointsInput,
            marketId: selectedMarketId,
            marketName: activeMarket?.name || 'Selected Market'
          });
        }
      }
      return updated;
    });
  };

  // Deselect all possibilities in current view
  const handleDeselectAll = () => {
    setSelectedEntries((prev) => {
      const currentIds = new Set(currentPossibilities.map((p) => makeItemId(p)));
      return prev.filter((item) => !currentIds.has(item.id));
    });
  };

  // Remove a specific entry from slip
  const handleRemoveEntry = (id: string) => {
    setSelectedEntries((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire slip
  const handleClearAll = () => {
    setSelectedEntries([]);
    setSubmissionReceipt(null);
    setErrorMessage(null);
  };

  // Real-time recalculated totals
  const totalEntriesCount = selectedEntries.length;
  const totalPointsAmount = useMemo(() => {
    return selectedEntries.reduce((sum, item) => sum + item.points, 0);
  }, [selectedEntries]);

  // Submit participation to server
  const handleSubmitParticipation = async () => {
    if (selectedEntries.length === 0) {
      setErrorMessage('Please select at least one Patti number to place participation.');
      return;
    }

    if (!activeMarket) {
      setErrorMessage('Please select an active Matka market.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Server payload
      const payload = {
        marketId: selectedMarketId,
        date: selectedDate,
        gameType,
        category: `${category}_patti`,
        entryType: `${category}_pana`,
        entries: selectedEntries.map((item) => ({
          pattiNumber: item.pattiNumber,
          points: item.points,
          gameType: item.gameType
        })),
        totalPoints: totalPointsAmount,
        stakeMinor: Math.round(totalPointsAmount * 100), // 1 point = £1.00
        currency: 'GBP',
        idempotencyKey: `idem_patti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      };

      const res = await fetch('/api/v1/games/matka/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok && json.data) {
        setSubmissionReceipt(json.data.receipt);
        setSelectedEntries([]); // Clear cart on confirmed acceptance
      } else {
        setErrorMessage(json.error?.message || 'Server rejected participation. Check cutoff and balance.');
      }
    } catch (err: any) {
      setErrorMessage(`Network error submitting participation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#b45df0] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Satta Matka Participation Console</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Dice5 className="w-7 h-7 text-[#b45df0]" />
            <span>Patti Selection (Single, Double & Triple)</span>
          </h2>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Select any digit to generate all 220 authoritative Patti combinations with real-time slip calculations.
          </p>
        </div>

        {/* Market Selector & Cutoff Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#c4bfd0] uppercase tracking-wider mb-1">
              Select Market
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => {
                setSelectedMarketId(e.target.value);
                const found = markets.find((m) => m.id === e.target.value);
                if (found && onMarketChange) onMarketChange(found);
              }}
              className="bg-[#242424] border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#b45df0] focus:outline-none"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.opensAt} - {m.closesAt})
                </option>
              ))}
            </select>
          </div>

          {activeMarket && (
            <div className="text-[11px] bg-[#242424] border border-white/10 px-3 py-2 rounded-xl text-[#c4bfd0] mt-auto">
              Status:{' '}
              <span
                className={`font-bold uppercase ${
                  activeMarket.status === 'open' ? 'text-[#10b981]' : 'text-[#ff5a7a]'
                }`}
              >
                {activeMarket.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Date, Game Type, Digit Selection, Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#242424] border border-white/10">
        {/* Date Selector */}
        <div>
          <label className="text-xs font-semibold text-[#c4bfd0] flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Date</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#1f1f1f] border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#b45df0] focus:outline-none"
          />
        </div>

        {/* Game Type Selector: OPEN vs CLOSE */}
        <div>
          <label className="text-xs font-semibold text-[#c4bfd0] flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Game Type</span>
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#1f1f1f] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setGameType('OPEN')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                gameType === 'OPEN'
                  ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              OPEN
            </button>
            <button
              type="button"
              onClick={() => setGameType('CLOSE')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                gameType === 'CLOSE'
                  ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Points Amount Input (Separated from Selected Digit) */}
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-[#c4bfd0] flex items-center justify-between mb-2">
            <span>Points per Patti (Whole Number 1–10+)</span>
            <span className="text-[10px] text-[#b45df0]">1 Point = £1.00</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePointsChange(Math.max(1, pointsInput - 1))}
              className="w-9 h-9 rounded-xl bg-[#1f1f1f] border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={pointsInput}
              onChange={(e) => handlePointsChange(parseInt(e.target.value, 10) || 1)}
              className="flex-1 bg-[#1f1f1f] border border-white/15 rounded-xl px-3 py-2 text-center text-sm font-bold text-white font-mono focus:border-[#b45df0] focus:outline-none"
            />

            <button
              type="button"
              onClick={() => handlePointsChange(pointsInput + 1)}
              className="w-9 h-9 rounded-xl bg-[#1f1f1f] border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Quick Presets: 1, 2, 5, 10 */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[1, 2, 5, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePointsChange(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    pointsInput === preset
                      ? 'bg-[#7e0ac2] text-white'
                      : 'bg-[#1f1f1f] text-[#c4bfd0] hover:text-white border border-white/10'
                  }`}
                >
                  {preset}p
                </button>
              ))}
            </div>
          </div>
          {validationError && (
            <p className="text-[11px] text-[#ff5a7a] mt-1">{validationError}</p>
          )}
        </div>
      </div>

      {/* 10 Selectable Digit Buttons: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <span>Select Single Digit:</span>
            <span className="text-[#b45df0] font-mono text-sm">
              [{selectedDigit}]
            </span>
          </label>
          <span className="text-[11px] text-[#c4bfd0]">
            Click any digit to view all corresponding Patti sums
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {DIGIT_BUTTONS.map((digit) => {
            const isSelected = selectedDigit === digit;
            return (
              <button
                key={digit}
                type="button"
                onClick={() => setSelectedDigit(digit)}
                className={`h-12 rounded-xl font-mono text-base font-black transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#7e0ac2] text-white ring-2 ring-[#b45df0] ring-offset-2 ring-offset-[#1f1f1f] shadow-lg shadow-[#7e0ac2]/50 scale-105'
                    : 'bg-[#242424] text-[#c4bfd0] hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{digit}</span>
                <span className="text-[9px] opacity-75 font-sans font-medium">
                  Sum ={digit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patti Category Tabs: Single Patti, Double Patti, Triple Patti */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 p-1 bg-[#242424] rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setCategory('single')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                category === 'single'
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              <span>Single Patti</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                12
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('double')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                category === 'double'
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              <span>Double Patti</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                9
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('triple')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                category === 'triple'
                  ? 'bg-[#7e0ac2] text-white shadow-md'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              <span>Triple Patti</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                1
              </span>
            </button>
          </div>

          {/* Quick Select / Deselect actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-[#242424] border border-white/15 text-[11px] font-semibold text-white hover:border-[#b45df0] transition-colors"
            >
              Select All ({currentPossibilities.length})
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-1.5 rounded-lg bg-[#242424] border border-white/15 text-[11px] font-semibold text-[#c4bfd0] hover:text-white transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Category Description Banner */}
        <div className="flex items-center gap-2 text-xs text-[#c4bfd0] bg-[#242424]/60 p-3 rounded-xl border border-white/5">
          <Info className="w-4 h-4 text-[#b45df0] flex-shrink-0" />
          <span>
            {category === 'single' &&
              `Single Patti: All 3-digit combinations with three distinct digits whose sum modulo 10 equals ${selectedDigit}. (e.g. 120, 139 for digit 3)`}
            {category === 'double' &&
              `Double Patti: All 3-digit combinations with exactly two identical digits whose sum modulo 10 equals ${selectedDigit}. (e.g. 166, 300 for digit 3)`}
            {category === 'triple' &&
              `Triple Patti: All 3-digit combinations with three identical digits whose sum modulo 10 equals ${selectedDigit}. (e.g. 111 for digit 3)`}
          </span>
        </div>
      </div>

      {/* Main Content Grid: Possibilities Table & Selected Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Participation Possibilities Table (Follows Screenshot Spec) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Matching Possibilities ({currentPossibilities.length})
            </h3>
            <span className="text-[11px] text-[#c4bfd0]">
              Market: <span className="text-white font-semibold">{activeMarket?.name}</span>
            </span>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#242424]">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#1a1a1a] text-[#c4bfd0] border-b border-white/10">
                  <tr>
                    <th className="p-3 font-semibold">Patti Number</th>
                    <th className="p-3 font-semibold text-center">Points</th>
                    <th className="p-3 font-semibold text-center">Game Type</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {currentPossibilities.map((patti) => {
                    const isSelected = isPattiSelected(patti);
                    return (
                      <tr
                        key={patti}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#7e0ac2]/20 hover:bg-[#7e0ac2]/30'
                            : 'hover:bg-white/5'
                        }`}
                        onClick={() => togglePattiSelection(patti)}
                      >
                        {/* Patti Number (Preserves leading zeros and 3-char format) */}
                        <td className="p-3 font-bold text-white text-sm">
                          <span className="px-2.5 py-1 rounded-md bg-[#1f1f1f] border border-white/10">
                            {patti}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="p-3 text-center text-[#b45df0] font-bold">
                          {pointsInput} pts
                        </td>

                        {/* Game Type */}
                        <td className="p-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              gameType === 'OPEN'
                                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                                : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                            }`}
                          >
                            {gameType}
                          </span>
                        </td>

                        {/* Action: Select or Remove */}
                        <td className="p-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePattiSelection(patti);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                              isSelected
                                ? 'bg-[#ff5a7a]/20 text-[#ff5a7a] border border-[#ff5a7a]/40 hover:bg-[#ff5a7a]/30'
                                : 'bg-[#7e0ac2] text-white hover:bg-[#9a13e6] shadow-sm'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3 text-[#ff5a7a]" />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Select</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Participation Slip & Totals */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#242424] border border-white/10 rounded-xl p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Participation Slip</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#7e0ac2] text-white">
                  {totalEntriesCount}
                </span>
              </h3>
              {totalEntriesCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-[#ff5a7a] hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Slip Entries List */}
            {selectedEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#c4bfd0] space-y-2">
                <Dice5 className="w-8 h-8 text-[#c4bfd0]/40 mx-auto" />
                <p>No Patti combinations selected yet.</p>
                <p className="text-[11px] text-[#9c9aa8]">
                  Select numbers from the table on the left to add them to your slip.
                </p>
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {selectedEntries.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#1f1f1f] border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white text-sm px-2 py-0.5 bg-[#242424] rounded border border-white/10">
                        {item.pattiNumber}
                      </span>
                      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-white/10 text-[#c4bfd0]">
                        {item.gameType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#b45df0]">
                        {item.points} pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(item.id)}
                        className="text-[#c4bfd0] hover:text-[#ff5a7a] p-1 transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slip Summary & Checkout */}
          <div className="space-y-3 pt-3 border-t border-white/10 mt-auto">
            <div className="space-y-1.5 text-xs text-[#c4bfd0]">
              <div className="flex justify-between">
                <span>Total Selected Entries:</span>
                <span className="font-mono font-bold text-white">{totalEntriesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Points per Entry:</span>
                <span className="font-mono font-bold text-[#b45df0]">{pointsInput} pts</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-white/5">
                <span>Total Points Amount:</span>
                <span className="font-mono text-[#10b981]">{totalPointsAmount} pts (£{totalPointsAmount}.00)</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#ff5a7a]/20 border border-[#ff5a7a]/40 text-xs text-[#ff5a7a] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Receipt */}
            {submissionReceipt && (
              <div className="p-3 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-xs text-[#10b981] space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Participation Confirmed!</span>
                </div>
                <p className="text-[11px] font-mono">
                  Ref: {submissionReceipt.providerReference}
                </p>
                <p className="text-[10px] opacity-80">
                  {submissionReceipt.entriesCount} entries verified and reserved via Double-Entry Ledger.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={isSubmitting || totalEntriesCount === 0}
              onClick={handleSubmitParticipation}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                totalEntriesCount === 0 || isSubmitting
                  ? 'bg-white/10 text-[#c4bfd0] cursor-not-allowed'
                  : 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-[#7e0ac2]/40 active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying & Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Place Bets ({totalPointsAmount} pts)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
