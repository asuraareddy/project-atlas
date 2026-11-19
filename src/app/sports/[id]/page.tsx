'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MatchDetailResponse, SportsMarket, BetSlipSelection } from '@/domain/games/sports/types';
import { CricketLiveScorecard } from '@/components/sports/CricketLiveScorecard';
import { ExchangeMarketLadder } from '@/components/sports/ExchangeMarketLadder';
import { SportsBetSlipDrawer } from '@/components/sports/SportsBetSlipDrawer';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

function MatchDetailContent() {
  const params = useParams();
  const eventId = params?.id as string;

  const [matchData, setMatchData] = useState<MatchDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeMarketTypeFilter, setActiveMarketTypeFilter] = useState<string>('ALL');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10);
  const [activeBetSelection, setActiveBetSelection] = useState<BetSlipSelection | null>(null);

  // Fetch Match Details & Market Ladders
  const fetchMatchDetails = useCallback(async (isSilent = false) => {
    if (!eventId) return;
    if (!isSilent) setRefreshing(true);

    try {
      const res = await fetch(`/api/v1/games/sports/events/${eventId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const payload: MatchDetailResponse = json.data || json;
      setMatchData(payload);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching match details:', err);
      setError(err.message || 'Unable to retrieve match details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    fetchMatchDetails(false);
  }, [fetchMatchDetails]);

  // Polling Interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchMatchDetails(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchMatchDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] text-[#191919] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-[#317CFF] animate-spin mb-4" />
        <h2 className="text-base font-semibold text-[#191919]">Connecting to Betfair In-Play live feed...</h2>
        <p className="text-xs text-[#6F6F6F] mt-1">Retrieving match scoreboards and exchange depth</p>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] text-[#191919] p-6 max-w-4xl mx-auto">
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#317CFF] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Sports</span>
        </Link>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-8 text-center space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <AlertTriangle className="w-10 h-10 text-[#E5484D] mx-auto" />
          <h2 className="text-xl font-semibold text-[#191919]">Match connection error</h2>
          <p className="text-sm text-[#6F6F6F] max-w-md mx-auto">
            {error || 'The requested sports match could not be found or data feed is currently unreachable.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => fetchMatchDetails(false)}
              className="px-5 py-2.5 rounded-full bg-[#191919] text-white font-medium text-xs hover:bg-[#333333] transition-all"
            >
              Retry connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { event, markets } = matchData;
  const isCricket = event.eventTypeId === '4';

  // Extract unique market types for filter tabs
  const marketTypes = ['ALL', ...Array.from(new Set(markets.map((m) => m.marketType)))];

  const filteredMarkets = markets.filter((m) => {
    if (activeMarketTypeFilter === 'ALL') return true;
    return m.marketType === activeMarketTypeFilter;
  });

  const selectedKey = activeBetSelection
    ? `${activeBetSelection.marketId}_${activeBetSelection.selectionId}_${activeBetSelection.type}`
    : undefined;

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#191919] pb-24">
      {/* Top Breadcrumb & Live Header */}
      <div className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/sports"
            className="flex items-center gap-2 text-xs font-medium text-[#191919] hover:text-[#317CFF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sports Markets</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#191919] truncate max-w-[200px] sm:max-w-md">
              {event.name}
            </span>
            {event.status === 'IN_PLAY' && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-ping" />
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMatchDetails(false)}
              disabled={refreshing}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.12)] font-mono text-xs flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh Live Odds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#317CFF]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[rgba(0,0,0,0.12)] text-[11px] font-mono text-[#6F6F6F]">
              <span className="hidden sm:inline">Poll:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-[#191919] font-medium focus:outline-none cursor-pointer"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={0}>Off</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Match Header Information Card */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 sm:p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#6F6F6F] border-b border-[rgba(0,0,0,0.06)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[#317CFF] font-medium">{event.sportName}</span>
              <span className="text-[#B8B8B8]">•</span>
              <span className="text-[#191919]">{event.competition}</span>
              {event.venue && (
                <>
                  <span className="text-[#B8B8B8] hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{event.venue}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Matched Vol: <strong className="text-[#191919]">£{event.totalMatched.toLocaleString()}</strong></span>
              <span className="text-[#B8B8B8]">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#6F6F6F]" />
                Updated: {lastUpdated || 'Now'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#191919]">{event.name}</h1>
              <div className="text-xs text-[#6F6F6F] mt-1 flex items-center gap-2">
                <span>Event ID: <strong className="font-mono text-[#191919]">{event.id}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-[#317CFF]">{event.status}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#317CFF]/10 border border-[#317CFF]/20 text-[#317CFF] text-xs font-mono font-medium">
                Betfair Back / Lay Active
              </span>
            </div>
          </div>
        </div>

        {/* Cricket Live Scoreboard Banner */}
        {isCricket && (
          <CricketLiveScorecard
            event={event}
            score={event.cricketScore}
            onRefresh={() => fetchMatchDetails(false)}
            isRefreshing={refreshing}
          />
        )}

        {/* Markets Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {marketTypes.map((mType) => {
              const label =
                mType === 'ALL'
                  ? 'All Markets'
                  : mType === 'MATCH_ODDS'
                  ? 'Match Odds'
                  : mType === 'TIED_MATCH'
                  ? 'Tied Match'
                  : mType === 'COMPLETED_MATCH'
                  ? 'Completed Match'
                  : mType === 'OVER_UNDER'
                  ? 'Over / Under'
                  : mType;

              const count =
                mType === 'ALL'
                  ? markets.length
                  : markets.filter((m) => m.marketType === mType).length;

              const isActive = activeMarketTypeFilter === mType;

              return (
                <button
                  key={mType}
                  type="button"
                  onClick={() => setActiveMarketTypeFilter(mType)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#191919] text-white border-[#191919]'
                      : 'bg-white text-[#6F6F6F] hover:text-[#191919] border-[rgba(0,0,0,0.08)]'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white font-medium' : 'bg-[#F8F8F8] text-[#6F6F6F]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-[#6F6F6F] hidden lg:block">
            {filteredMarkets.length} market{filteredMarkets.length === 1 ? '' : 's'} displayed
          </div>
        </div>

        {/* Market Ladders List */}
        <div className="space-y-4">
          {filteredMarkets.map((market) => (
            <ExchangeMarketLadder
              key={market.marketId}
              market={market}
              event={event}
              onSelectOdd={(sel) => setActiveBetSelection(sel)}
              selectedKey={selectedKey}
            />
          ))}
        </div>

        {/* Technical Provider Disclaimer Footer */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] text-xs text-[#6F6F6F] space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#191919] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#1FAE5B]" />
            <span>Betfair API-NG & In-Play Data Service Integration</span>
          </div>
          <p className="leading-relaxed">
            Project Atlas connects directly to Betfair API-NG endpoints for catalogue browsing, market definitions, exchange liquidity prices, and In-Play scores. Real-money betting is disabled by tenant compliance safeguards. Simulated orders are executed against real market liquidity depths in safe sandbox mode.
          </p>
        </div>
      </div>

      {/* Bet Slip Drawer */}
      <SportsBetSlipDrawer
        selection={activeBetSelection}
        onClose={() => setActiveBetSelection(null)}
        onClear={() => setActiveBetSelection(null)}
      />
    </div>
  );
}

export default function SportsMatchDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8F8] text-[#191919] flex flex-col items-center justify-center p-4">
          <RefreshCw className="w-8 h-8 text-[#317CFF] animate-spin mb-4" />
          <h2 className="text-base font-semibold text-[#191919]">Connecting to Betfair In-Play live feed...</h2>
          <p className="text-xs text-[#6F6F6F] mt-1">Retrieving match scoreboards and exchange depth</p>
        </div>
      }
    >
      <MatchDetailContent />
    </React.Suspense>
  );
}
