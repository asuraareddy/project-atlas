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
  Info,
  ChevronDown
} from 'lucide-react';
import { MarketSummary } from '@/domain/games/adapters/types';
import {
  getPattiPossibilities,
  PattiCategory,
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
  const [selectedDigit, setSelectedDigit] = useState<number>(3); // Default 3
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
    <section id="patti-console" className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-3.5 sm:p-5 lg:p-6 space-y-4 shadow-2xl">
      {/* Header Banner - Mobile Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#b45df0] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patti Selection (Single, Double & Triple)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
            <Dice5 className="w-6 h-6 text-[#b45df0]" />
            <span>Patti Play Console</span>
          </h2>
        </div>

        {/* Market Selector Dropdown - Mobile Optimized */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <select
              value={selectedMarketId}
              onChange={(e) => {
                setSelectedMarketId(e.target.value);
                const found = markets.find((m) => m.id === e.target.value);
                if (found && onMarketChange) onMarketChange(found);
              }}
              className="w-full bg-[#242424] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:border-[#b45df0] focus:outline-none appearance-none pr-8 truncate"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.opensAt} - {m.closesAt})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#c4bfd0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {activeMarket && (
            <span
              className={`text-[10px] font-black px-2.5 py-2 rounded-xl uppercase tracking-wider flex-shrink-0 ${
                activeMarket.status === 'open'
                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40'
                  : 'bg-[#ff5a7a]/15 text-[#ff5a7a] border border-[#ff5a7a]/40'
              }`}
            >
              {activeMarket.status}
            </span>
          )}
        </div>
      </div>

      {/* Mobile-First Controls: Date, Game Type, Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-4 rounded-xl bg-[#242424] border border-white/10">
        {/* Date Selector */}
        <div>
          <label className="text-[11px] font-bold text-[#c4bfd0] flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Date</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-11 bg-[#1a1a1a] border border-white/15 rounded-xl px-3 text-xs font-semibold text-white focus:border-[#b45df0] focus:outline-none"
          />
        </div>

        {/* Game Type Selector: OPEN vs CLOSE */}
        <div>
          <label className="text-[11px] font-bold text-[#c4bfd0] flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#b45df0]" />
            <span>Game Type</span>
          </label>
          <div className="grid grid-cols-2 gap-2 h-11 bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setGameType('OPEN')}
              className={`h-full rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                gameType === 'OPEN'
                  ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/50 ring-1 ring-[#b45df0]'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              OPEN
            </button>
            <button
              type="button"
              onClick={() => setGameType('CLOSE')}
              className={`h-full rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                gameType === 'CLOSE'
                  ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/50 ring-1 ring-[#b45df0]'
                  : 'text-[#c4bfd0] hover:text-white'
              }`}
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Points Amount Stepper & Presets */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-[11px] font-bold text-[#c4bfd0] flex items-center justify-between mb-1.5 uppercase tracking-wider">
            <span>Points per Patti</span>
            <span className="text-[10px] text-[#b45df0] font-mono lowercase">1 pt = £1.00</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1a1a1a] border border-white/15 rounded-xl overflow-hidden h-11 flex-1">
              <button
                type="button"
                onClick={() => handlePointsChange(Math.max(1, pointsInput - 1))}
                className="w-11 h-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                aria-label="Decrease points"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={pointsInput}
                onChange={(e) => handlePointsChange(parseInt(e.target.value, 10) || 1)}
                className="flex-1 text-center bg-transparent text-sm font-black text-white font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handlePointsChange(pointsInput + 1)}
                className="w-11 h-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                aria-label="Increase points"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {[1, 2, 5, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePointsChange(preset)}
                  className={`h-11 px-2.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                    pointsInput === preset
                      ? 'bg-[#7e0ac2] text-white shadow-md'
                      : 'bg-[#1a1a1a] text-[#c4bfd0] hover:text-white border border-white/10'
                  }`}
                >
                  {preset}p
                </button>
              ))}
            </div>
          </div>
          {validationError && (
            <p className="text-[10px] text-[#ff5a7a] mt-1 font-medium">{validationError}</p>
          )}
        </div>
      </div>

      {/* 10 Selectable Digit Keypad: Clean Numeric Buttons (No "Sum =X" clutter) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-2">
            <span>Select Single Digit:</span>
            <span className="px-2 py-0.5 rounded-md bg-[#7e0ac2] text-white font-mono text-sm font-bold shadow-sm">
              {selectedDigit}
            </span>
          </label>
          <span className="text-[11px] text-[#c4bfd0]/80">Tap digit to update possibilities</span>
        </div>

        {/* Mobile Keypad: 5 columns on mobile (2 clean rows), 10 columns on tablet/desktop */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {DIGIT_BUTTONS.map((digit) => {
            const isSelected = selectedDigit === digit;
            return (
              <button
                key={digit}
                type="button"
                onClick={() => setSelectedDigit(digit)}
                className={`h-12 sm:h-14 rounded-xl font-mono text-lg sm:text-xl font-black transition-all flex items-center justify-center active:scale-95 select-none ${
                  isSelected
                    ? 'bg-[#7e0ac2] text-white ring-2 ring-[#b45df0] shadow-lg shadow-[#7e0ac2]/50 scale-102 ring-offset-1 ring-offset-[#1a1a1a]'
                    : 'bg-[#242424] text-white/90 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {digit}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patti Category Tabs: Mobile Segmented Bar */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#242424] rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setCategory('single')}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center ${
              category === 'single'
                ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            <span>Single Patti</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              12
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('double')}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center ${
              category === 'double'
                ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            <span>Double Patti</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              9
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('triple')}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center ${
              category === 'triple'
                ? 'bg-[#7e0ac2] text-white shadow-md shadow-[#7e0ac2]/40'
                : 'text-[#c4bfd0] hover:text-white'
            }`}
          >
            <span>Triple Patti</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              1
            </span>
          </button>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#c4bfd0]">
            Digit <span className="font-bold text-white">[{selectedDigit}]</span> • {category === 'single' ? 'Single' : category === 'double' ? 'Double' : 'Triple'} Patti ({currentPossibilities.length} matching)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-[#242424] border border-white/15 text-[11px] font-bold text-white hover:border-[#b45df0] transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-2.5 py-1 rounded-lg bg-[#242424] border border-white/15 text-[11px] font-bold text-[#c4bfd0] hover:text-white transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Mobile-First Compact Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left Column: Possibilities Compact Cards (Replaced wide table) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white tracking-wide uppercase">
              Patti Possibilities ({currentPossibilities.length})
            </h3>
            <span className="text-[11px] text-[#c4bfd0]">
              Market: <span className="text-white font-semibold">{activeMarket?.name}</span>
            </span>
          </div>

          {/* Compact Card Grid - Thumb-Friendly and Mobile-First */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {currentPossibilities.map((patti) => {
              const isSelected = isPattiSelected(patti);
              return (
                <div
                  key={patti}
                  onClick={() => togglePattiSelection(patti)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between active:scale-95 select-none ${
                    isSelected
                      ? 'bg-[#7e0ac2]/25 border-[#b45df0] shadow-md shadow-[#7e0ac2]/30 ring-1 ring-[#b45df0]'
                      : 'bg-[#242424] hover:bg-white/5 border-white/10'
                  }`}
                >
                  {/* Top: Prominent Patti Number + Game Type Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xl font-black text-white tracking-wider">
                      {patti}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        gameType === 'OPEN'
                          ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                          : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                      }`}
                    >
                      {gameType}
                    </span>
                  </div>

                  {/* Middle: Points Amount */}
                  <div className="flex items-center justify-between text-[11px] text-[#c4bfd0] mb-2.5">
                    <span className="text-[10px] text-[#9c9aa8]">Stake</span>
                    <span className="font-mono font-bold text-[#b45df0]">{pointsInput} pts</span>
                  </div>

                  {/* Bottom: Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePattiSelection(patti);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      isSelected
                        ? 'bg-[#ff5a7a] hover:bg-[#ff3b61] text-white'
                        : 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-[#7e0ac2]/30'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Participation Slip (Mobile Vertical Cards) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-[#242424] border border-white/10 rounded-xl p-3.5 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Participation Slip</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#7e0ac2] text-white">
                  {totalEntriesCount}
                </span>
              </h3>
              {totalEntriesCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-[#ff5a7a] hover:underline flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Slip Entries List: Vertical Compact Cards */}
            {selectedEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#c4bfd0] space-y-1.5">
                <Dice5 className="w-7 h-7 text-[#c4bfd0]/40 mx-auto" />
                <p className="font-semibold text-white">No Patti numbers selected</p>
                <p className="text-[11px] text-[#9c9aa8]">
                  Tap any card on the left to add it to your slip.
                </p>
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {selectedEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-black text-white px-2 py-0.5 bg-[#242424] rounded-lg border border-white/10">
                        {item.pattiNumber}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-[#10b981]">
                          {item.gameType} DRAW
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#b45df0]">
                          {item.points} pts (£{item.points}.00)
                        </span>
                      </div>
                    </div>

                    {/* Delete Action within Each Card for Easy Thumb Access */}
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(item.id)}
                      className="w-8 h-8 rounded-lg bg-[#ff5a7a]/15 hover:bg-[#ff5a7a]/25 text-[#ff5a7a] border border-[#ff5a7a]/30 flex items-center justify-center transition-colors active:scale-95 flex-shrink-0"
                      title="Remove entry"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slip Summary & Mobile-First Confirm Button */}
          <div className="space-y-2.5 pt-2.5 border-t border-white/10 mt-auto">
            <div className="space-y-1 text-xs text-[#c4bfd0]">
              <div className="flex justify-between">
                <span>Selected Entries:</span>
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
              <div className="p-2.5 rounded-lg bg-[#ff5a7a]/20 border border-[#ff5a7a]/40 text-xs text-[#ff5a7a] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Receipt */}
            {submissionReceipt && (
              <div className="p-2.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-xs text-[#10b981] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Participation Confirmed!</span>
                </div>
                <p className="text-[11px] font-mono">
                  Ref: {submissionReceipt.providerReference}
                </p>
              </div>
            )}

            {/* Big Thumb Submit Button */}
            <button
              type="button"
              disabled={isSubmitting || totalEntriesCount === 0}
              onClick={handleSubmitParticipation}
              className={`w-full h-12 rounded-xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                totalEntriesCount === 0 || isSubmitting
                  ? 'bg-white/10 text-[#c4bfd0] cursor-not-allowed'
                  : 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-[#7e0ac2]/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
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
    </section>
  );
}
