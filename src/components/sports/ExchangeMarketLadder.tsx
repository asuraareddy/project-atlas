'use client';

import React from 'react';
import { SportsMarket, MarketRunner, BetSlipSelection, SportsEvent } from '@/domain/games/sports/types';
import { ShieldAlert } from 'lucide-react';

interface ExchangeMarketLadderProps {
  market: SportsMarket;
  event: SportsEvent;
  onSelectOdd?: (selection: BetSlipSelection) => void;
  selectedKey?: string; // e.g. `${marketId}_${selectionId}_${type}`
}

export function ExchangeMarketLadder({
  market,
  event,
  onSelectOdd,
  selectedKey,
}: ExchangeMarketLadderProps) {
  const isSuspended = market.status === 'SUSPENDED';

  const handlePick = (
    runner: MarketRunner,
    type: 'BACK' | 'LAY' | 'BOOKMAKER',
    odds: number
  ) => {
    if (isSuspended || !odds || odds <= 1.0) return;
    if (onSelectOdd) {
      onSelectOdd({
        marketId: market.marketId,
        marketName: market.marketName,
        eventId: event.id,
        eventName: event.name,
        selectionId: runner.selectionId,
        runnerName: runner.runnerName,
        type,
        odds,
        stake: 10,
        potentialProfit: type === 'BACK' || type === 'BOOKMAKER' ? 10 * (odds - 1) : 10,
        liability: type === 'LAY' ? 10 * (odds - 1) : undefined,
      });
    }
  };

  return (
    <div className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
      {/* Market Header */}
      <div className="bg-[#F8F8F8] px-4 py-3 border-b border-[rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#191919] text-sm sm:text-base">{market.marketName}</span>
          {market.inplay && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 uppercase">
              In-Play
            </span>
          )}
          {isSuspended && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/20 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Suspended
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#6F6F6F]">
          <span>
            Matched: <strong className="text-[#191919]">£{market.totalMatched.toLocaleString()}</strong>
          </span>
          <span className="text-[#B8B8B8] hidden sm:inline">•</span>
          <span className="hidden sm:inline">Betfair Exchange & Bookmaker</span>
        </div>
      </div>

      {/* Ladder Column Header */}
      <div className="grid grid-cols-12 bg-white px-3 py-2 text-[11px] font-mono text-[#6F6F6F] border-b border-[rgba(0,0,0,0.06)] uppercase tracking-wider">
        <div className="col-span-12 sm:col-span-5 md:col-span-5 font-sans font-medium text-[#191919]">
          Selections ({market.numberOfActiveRunners})
        </div>
        <div className="hidden sm:grid sm:col-span-7 md:col-span-7 grid-cols-7 text-center">
          {/* 3 Back Columns (Blue) */}
          <div className="col-span-3 grid grid-cols-3 bg-[#EAF2FD] rounded-l border-y border-l border-[#D0E2FF] py-0.5 text-[#1B64DA] font-semibold">
            <span className="hidden md:inline text-[9px] text-[#6F6F6F]">Back #3</span>
            <span className="hidden md:inline text-[9px] text-[#6F6F6F]">Back #2</span>
            <span className="col-span-3 md:col-span-1">BACK</span>
          </div>

          {/* 3 Lay Columns (Pink) */}
          <div className="col-span-3 grid grid-cols-3 bg-[#FDF2F4] rounded-r border-y border-r border-[#FDCFD7] py-0.5 text-[#D6336C] font-semibold">
            <span className="col-span-3 md:col-span-1">LAY</span>
            <span className="hidden md:inline text-[9px] text-[#6F6F6F]">Lay #2</span>
            <span className="hidden md:inline text-[9px] text-[#6F6F6F]">Lay #3</span>
          </div>

          {/* Fixed Bookmaker Column */}
          <div className="col-span-1 py-0.5 text-[#B26A00] font-semibold border-y border-[#FFE8A1] bg-[#FFF9DB]">
            BM
          </div>
        </div>
      </div>

      {/* Runner Rows */}
      <div className="divide-y divide-[rgba(0,0,0,0.06)]">
        {market.runners.map((runner) => {
          const bestBack = runner.backLadder[0] || { price: 0, size: 0 };
          const back2 = runner.backLadder[1] || { price: 0, size: 0 };
          const back3 = runner.backLadder[2] || { price: 0, size: 0 };

          const bestLay = runner.layLadder[0] || { price: 0, size: 0 };
          const lay2 = runner.layLadder[1] || { price: 0, size: 0 };
          const lay3 = runner.layLadder[2] || { price: 0, size: 0 };

          const backKey = `${market.marketId}_${runner.selectionId}_BACK`;
          const layKey = `${market.marketId}_${runner.selectionId}_LAY`;
          const bmKey = `${market.marketId}_${runner.selectionId}_BOOKMAKER`;

          return (
            <div
              key={runner.selectionId}
              className={`grid grid-cols-12 items-center p-2.5 sm:px-3 hover:bg-[#F8F8F8] transition-colors ${
                isSuspended ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {/* Runner Title & Last Traded */}
              <div className="col-span-12 sm:col-span-5 md:col-span-5 mb-2 sm:mb-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#191919] text-sm tracking-normal">
                    {runner.runnerName}
                  </span>
                  {runner.status === 'WINNER' && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 rounded-full font-bold">
                      Winner
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#6F6F6F] flex items-center gap-2 mt-0.5">
                  {runner.lastTradedPrice && (
                    <span>Last Traded: <strong className="text-[#191919]">{runner.lastTradedPrice}</strong></span>
                  )}
                  {runner.totalMatched ? (
                    <span className="text-[#B8B8B8]">
                      • Vol: £{runner.totalMatched.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Price Ladder Container */}
              <div className="col-span-12 sm:col-span-7 md:col-span-7 grid grid-cols-7 gap-1 sm:gap-1.5 text-center font-mono">
                {/* Back 3 (Desktop Only) */}
                <button
                  type="button"
                  disabled={isSuspended || !back3.price}
                  onClick={() => handlePick(runner, 'BACK', back3.price)}
                  className="hidden md:flex flex-col items-center justify-center py-1.5 rounded-lg bg-[#EAF2FD]/50 hover:bg-[#EAF2FD] text-[#1B64DA] border border-[#D0E2FF]/60 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                >
                  <span className="font-bold text-xs">{back3.price ? back3.price.toFixed(2) : '-'}</span>
                  <span className="text-[9px] text-[#6F6F6F]">£{back3.size ? Math.round(back3.size) : 0}</span>
                </button>

                {/* Back 2 (Desktop Only) */}
                <button
                  type="button"
                  disabled={isSuspended || !back2.price}
                  onClick={() => handlePick(runner, 'BACK', back2.price)}
                  className="hidden md:flex flex-col items-center justify-center py-1.5 rounded-lg bg-[#EAF2FD]/70 hover:bg-[#EAF2FD] text-[#1B64DA] border border-[#D0E2FF] transition-colors disabled:opacity-20 disabled:pointer-events-none"
                >
                  <span className="font-bold text-xs">{back2.price ? back2.price.toFixed(2) : '-'}</span>
                  <span className="text-[9px] text-[#6F6F6F]">£{back2.size ? Math.round(back2.size) : 0}</span>
                </button>

                {/* Best Back (Blue Primary) */}
                <button
                  type="button"
                  disabled={isSuspended || !bestBack.price}
                  onClick={() => handlePick(runner, 'BACK', bestBack.price)}
                  className={`col-span-3 sm:col-span-1 flex flex-col items-center justify-center py-2 sm:py-1.5 rounded-lg transition-all ${
                    selectedKey === backKey
                      ? 'ring-2 ring-[#317CFF] bg-[#317CFF] text-white shadow-sm'
                      : 'bg-[#EAF2FD] hover:bg-[#D8E8FC] text-[#1B64DA] border border-[#CCE0FF]'
                  } disabled:opacity-20 disabled:pointer-events-none`}
                  title="Betfair Exchange Back (Bet For)"
                >
                  <span className="font-bold text-sm sm:text-xs">
                    {bestBack.price ? bestBack.price.toFixed(2) : '-'}
                  </span>
                  <span className="text-[10px] sm:text-[9px] opacity-80">
                    £{bestBack.size ? Math.round(bestBack.size) : 0}
                  </span>
                  <span className="sm:hidden text-[8px] uppercase tracking-wider text-[#1B64DA] mt-0.5">
                    Back
                  </span>
                </button>

                {/* Best Lay (Pink Primary) */}
                <button
                  type="button"
                  disabled={isSuspended || !bestLay.price}
                  onClick={() => handlePick(runner, 'LAY', bestLay.price)}
                  className={`col-span-3 sm:col-span-1 flex flex-col items-center justify-center py-2 sm:py-1.5 rounded-lg transition-all ${
                    selectedKey === layKey
                      ? 'ring-2 ring-[#D6336C] bg-[#D6336C] text-white shadow-sm'
                      : 'bg-[#FDF2F4] hover:bg-[#FCE4E8] text-[#D6336C] border border-[#FFCCD7]'
                  } disabled:opacity-20 disabled:pointer-events-none`}
                  title="Betfair Exchange Lay (Bet Against)"
                >
                  <span className="font-bold text-sm sm:text-xs">
                    {bestLay.price ? bestLay.price.toFixed(2) : '-'}
                  </span>
                  <span className="text-[10px] sm:text-[9px] opacity-80">
                    £{bestLay.size ? Math.round(bestLay.size) : 0}
                  </span>
                  <span className="sm:hidden text-[8px] uppercase tracking-wider text-[#D6336C] mt-0.5">
                    Lay
                  </span>
                </button>

                {/* Lay 2 (Desktop Only) */}
                <button
                  type="button"
                  disabled={isSuspended || !lay2.price}
                  onClick={() => handlePick(runner, 'LAY', lay2.price)}
                  className="hidden md:flex flex-col items-center justify-center py-1.5 rounded-lg bg-[#FDF2F4]/70 hover:bg-[#FDF2F4] text-[#D6336C] border border-[#FFCCD7] transition-colors disabled:opacity-20 disabled:pointer-events-none"
                >
                  <span className="font-bold text-xs">{lay2.price ? lay2.price.toFixed(2) : '-'}</span>
                  <span className="text-[9px] text-[#6F6F6F]">£{lay2.size ? Math.round(lay2.size) : 0}</span>
                </button>

                {/* Lay 3 (Desktop Only) */}
                <button
                  type="button"
                  disabled={isSuspended || !lay3.price}
                  onClick={() => handlePick(runner, 'LAY', lay3.price)}
                  className="hidden md:flex flex-col items-center justify-center py-1.5 rounded-lg bg-[#FDF2F4]/50 hover:bg-[#FDF2F4] text-[#D6336C] border border-[#FFCCD7]/60 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                >
                  <span className="font-bold text-xs">{lay3.price ? lay3.price.toFixed(2) : '-'}</span>
                  <span className="text-[9px] text-[#6F6F6F]">£{lay3.size ? Math.round(lay3.size) : 0}</span>
                </button>

                {/* Bookmaker Odds (Fixed Odds) */}
                <button
                  type="button"
                  disabled={isSuspended || !runner.bookmakerOdds}
                  onClick={() => handlePick(runner, 'BOOKMAKER', runner.bookmakerOdds || 0)}
                  className={`col-span-1 flex flex-col items-center justify-center py-1.5 rounded-lg border transition-all ${
                    selectedKey === bmKey
                      ? 'ring-2 ring-[#B26A00] bg-[#B26A00] text-white shadow-sm'
                      : 'bg-[#FFF9DB] hover:bg-[#FFF3BF] text-[#B26A00] border-[#FFE8A1]'
                  } disabled:opacity-20 disabled:pointer-events-none`}
                  title="Atlas Bookmaker Direct Odds"
                >
                  <span className="font-bold text-xs">
                    {runner.bookmakerOdds ? runner.bookmakerOdds.toFixed(2) : '-'}
                  </span>
                  <span className="text-[9px] opacity-75">Fixed</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
