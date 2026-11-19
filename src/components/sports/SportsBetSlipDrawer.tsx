'use client';

import React, { useState } from 'react';
import { BetSlipSelection } from '@/domain/games/sports/types';
import { X, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SportsBetSlipDrawerProps {
  selection: BetSlipSelection | null;
  onClose: () => void;
  onClear: () => void;
}

export function SportsBetSlipDrawer({
  selection,
  onClose,
  onClear,
}: SportsBetSlipDrawerProps) {
  const [stake, setStake] = useState<number>(selection?.stake || 10);
  const [placedTicket, setPlacedTicket] = useState<{
    ticketId: string;
    timestamp: string;
  } | null>(null);

  if (!selection) return null;

  const odds = selection.odds;
  const isLay = selection.type === 'LAY';
  const isBack = selection.type === 'BACK';
  const isBookmaker = selection.type === 'BOOKMAKER';

  // Calculations
  const potentialProfit = isLay ? stake : stake * (odds - 1);
  const liability = isLay ? stake * (odds - 1) : 0;
  const potentialReturn = isLay ? stake : stake * odds;

  const handlePlaceSimulatedBet = () => {
    const randomTicket = `SIM-BF-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedTicket({
      ticketId: randomTicket,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleReset = () => {
    setPlacedTicket(null);
    onClear();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-[#160f29] border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
      {/* Top Banner with Test Mode Warning */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-4 py-2 text-black font-extrabold text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Shield className="w-3.5 h-3.5" />
          <span>TEST MODE • BETFAIR SIMULATOR</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/20 text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {placedTicket ? (
        /* Bet Placement Confirmation */
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-black text-white">Simulated Bet Accepted</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Ticket ID: <strong className="font-mono text-amber-400">{placedTicket.ticketId}</strong>
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Placed at {placedTicket.timestamp} in safe test mode.
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-3 text-xs font-mono text-zinc-300 space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Runner:</span>
              <strong className="text-white">{selection.runnerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Market / Type:</span>
              <span>
                {selection.marketName} ({selection.type})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Matched Odds:</span>
              <strong className="text-amber-300">{odds.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Stake:</span>
              <span>£{stake.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1">
              <span className="text-zinc-500">{isLay ? 'Exchange Liability:' : 'Potential Profit:'}</span>
              <strong className={isLay ? 'text-rose-400' : 'text-emerald-400'}>
                £{(isLay ? liability : potentialProfit).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg"
            >
              Place Another Bet
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* Active Bet Slip Form */
        <div className="p-4 sm:p-5 space-y-4">
          {/* Match & Runner Info */}
          <div>
            <div className="text-[11px] text-zinc-400 font-medium truncate">
              {selection.eventName}
            </div>
            <div className="flex items-center justify-between mt-1">
              <h4 className="text-base font-black text-white">{selection.runnerName}</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isBack
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : isLay
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selection.type} @ {odds.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">{selection.marketName}</div>
          </div>

          {/* Quick Stake Chips */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span>Stake (GBP)</span>
              <span className="text-[11px] text-zinc-500">Preset Amounts:</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {[5, 10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStake(amt)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    stake === amt
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  £{amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-sm">£</span>
              <input
                type="number"
                min="1"
                step="1"
                value={stake}
                onChange={(e) => setStake(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl py-2 pl-7 pr-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 text-xs font-mono space-y-1.5">
            {isLay ? (
              <>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Backer Stake:</span>
                  <span className="text-white">£{stake.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-300 font-bold border-t border-white/5 pt-1">
                  <span>Your Liability:</span>
                  <span>£{liability.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-zinc-500 pt-0.5">
                  * If this runner wins, you pay backer £{liability.toFixed(2)}. If it loses, you keep £{stake.toFixed(2)}.
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Potential Profit:</span>
                  <span className="text-emerald-400 font-bold">£{potentialProfit.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300 border-t border-white/5 pt-1">
                  <span>Total Return:</span>
                  <span className="font-bold text-white">£{potentialReturn.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Compliance Safe Sandbox Notice */}
          <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="leading-tight">
              <strong>Safe Sandbox Mode:</strong> Real-money deposits, withdrawals, and live betting are disabled in accordance with licensing regulations.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handlePlaceSimulatedBet}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-lg transition-all"
            >
              Place Simulated Bet (£{stake})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
