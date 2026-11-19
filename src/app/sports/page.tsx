'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SportsEvent, SportCategory, BetSlipSelection } from '@/domain/games/sports/types';
import { CricketLiveScorecard } from '@/components/sports/CricketLiveScorecard';
import { SportsBetSlipDrawer } from '@/components/sports/SportsBetSlipDrawer';
import { useTenant } from '@/components/tenant/TenantContext';
import { AmbaariSports } from '@/components/ambaari/AmbaariSports';
import {
  Trophy,
  RefreshCw,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

function SportsPageContent() {
  const { branding, tenantSlug } = useTenant();

  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>('4'); // Default Cricket
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PLAY' | 'PRE_MATCH' | 'COMPLETED'>('ALL');
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [metaInfo, setMetaInfo] = useState<any>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [activeBetSelection, setActiveBetSelection] = useState<BetSlipSelection | null>(null);

  const fetchEvents = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch(`/api/v1/games/sports/events?eventTypeId=${selectedSportId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const payload = json.data || json;
      setEvents(payload.events || []);
      setCategories(payload.categories || []);
      setMetaInfo(json.meta || null);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch sports events:', err);
      setError(err.message || 'Unable to retrieve live sports events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSportId]);

  useEffect(() => {
    setLoading(true);
    fetchEvents(false);
  }, [fetchEvents]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchEvents(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchEvents]);

  const loadDiagnostics = async () => {
    setShowDiagnostics(true);
    try {
      const res = await fetch('/api/v1/games/sports/config');
      const data = await res.json();
      setDiagnosticsData(data);
    } catch (e: any) {
      setDiagnosticsData({ error: e.message });
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (statusFilter === 'ALL') return true;
    return ev.status === statusFilter;
  });

  const inPlayMatches = events.filter((e) => e.status === 'IN_PLAY');
  const liveCricketMatch = events.find((e) => e.eventTypeId === '4' && e.status === 'IN_PLAY' && e.cricketScore);

  if (branding.layoutTheme === 'ambaari' || tenantSlug === 'ambaari999') {
    return <AmbaariSports />;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#191919] pb-20">
      {/* Top Header Hero */}
      <div className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded-full bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]">
                  <Trophy className="w-4 h-4" />
                </span>
                <span className="text-xs font-normal tracking-wide text-[#6F6F6F]">
                  Sports Exchange & Markets
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 text-[10px] font-normal">
                  Live Liquidity
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#191919]">
                Live Sports & Exchange Odds
              </h1>
              <p className="text-sm text-[#6F6F6F] max-w-2xl mt-2 font-normal">
                Real-time cricket scoreboards, live match commentary, dual-sided Betfair Exchange Back & Lay liquidity ladders, and bookmaker odds.
              </p>
            </div>

            {/* Quick Status & Control Panel */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchEvents(false)}
                disabled={refreshing}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] text-xs font-normal transition-all flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh data</span>
              </button>

              <button
                type="button"
                onClick={loadDiagnostics}
                className="px-4 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] text-[#191919] border border-[rgba(0,0,0,0.08)] text-xs font-normal transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#6F6F6F]" />
                <span>Diagnostics</span>
              </button>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] text-xs text-[#6F6F6F]">
                <span>Poll:</span>
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

          {/* Meta & Last Updated Bar */}
          <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6F6F6F]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1FAE5B]" />
                Provider: <strong className="text-[#191919] font-medium">{metaInfo?.provider || 'Betfair API-NG'}</strong>
              </span>
              <span className="text-[#B8B8B8] hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Feed: <span className="text-[#191919]">{metaInfo?.connectionType || 'In-Play Stream'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#6F6F6F]" />
              <span>Last updated: {lastUpdated || 'Initialising...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="mb-6 p-4 rounded-[10px] bg-[#E5484D]/10 border border-[#E5484D]/20 flex items-center justify-between text-xs text-[#E5484D]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <strong>Data Alert:</strong> {error}
              </div>
            </div>
            <button
              onClick={() => fetchEvents(false)}
              className="px-3 py-1 bg-[#E5484D] text-white rounded-full font-normal"
            >
              Retry
            </button>
          </div>
        )}

        {/* Featured Live Cricket Scoreboard */}
        {selectedSportId === '4' && liveCricketMatch && liveCricketMatch.cricketScore && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
                <h3 className="text-base font-medium text-[#191919] tracking-tight">
                  Featured Live Cricket Match
                </h3>
              </div>
              <Link
                href={`/sports/${liveCricketMatch.id}`}
                className="text-xs font-normal text-[#317CFF] hover:underline flex items-center gap-1"
              >
                <span>Full match ladder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <CricketLiveScorecard
              event={liveCricketMatch}
              score={liveCricketMatch.cricketScore}
              onRefresh={() => fetchEvents(false)}
              isRefreshing={refreshing}
            />
          </div>
        )}

        {/* Sport Category Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedSportId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSportId(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[#191919] text-white border-[#191919] shadow-sm'
                    : 'bg-white text-[#6F6F6F] border-[rgba(0,0,0,0.08)] hover:bg-[#F8F8F8] hover:text-[#191919]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {cat.inPlayCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white text-[#191919]' : 'bg-[#E5484D]/10 text-[#E5484D]'
                    }`}
                  >
                    {cat.inPlayCount} LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-2 rounded-[10px] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Matches', count: events.length },
              { id: 'IN_PLAY', label: 'Live In-Play', count: inPlayMatches.length },
              {
                id: 'PRE_MATCH',
                label: 'Scheduled',
                count: events.filter((e) => e.status === 'PRE_MATCH').length,
              },
              {
                id: 'COMPLETED',
                label: 'Completed',
                count: events.filter((e) => e.status === 'COMPLETED').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#191919] text-white shadow-sm'
                    : 'text-[#6F6F6F] hover:text-[#191919]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F8F8F8] rounded-full text-[#6F6F6F]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-[#6F6F6F] hidden md:block">
            Showing <strong className="text-[#191919] font-medium">{filteredEvents.length}</strong> events
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#191919] animate-spin mx-auto" />
            <div className="text-xs text-[#6F6F6F]">Loading sports markets & live scores...</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="text-2xl mb-2">🏟️</div>
            <h4 className="text-sm font-medium text-[#191919]">No matches found for this filter</h4>
            <p className="text-xs text-[#6F6F6F] mt-1 max-w-sm mx-auto">
              No active events found in this status category. Select &quot;All Matches&quot; or switch sports above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => {
              const isInPlay = event.status === 'IN_PLAY';
              const isCompleted = event.status === 'COMPLETED';

              return (
                <div
                  key={event.id}
                  className="bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] rounded-[10px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-normal text-[#6F6F6F] truncate max-w-[180px]">
                        {event.competition}
                      </span>
                      {isInPlay ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/20 text-[10px] font-normal">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
                          LIVE
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20 text-[10px] font-normal">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)] text-[10px]">
                          {new Date(event.openDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          {new Date(event.openDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-base text-[#191919]">
                          {event.homeTeam}
                        </span>
                        {event.cricketScore && (
                          <span className="font-mono text-[#191919] text-sm">
                            {event.cricketScore.homeScore.runs}/{event.cricketScore.homeScore.wickets}{' '}
                            <span className="text-[11px] text-[#6F6F6F]">
                              ({event.cricketScore.homeScore.overs} ov)
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-base text-[#191919]">
                          {event.awayTeam}
                        </span>
                        {event.cricketScore && (
                          <span className="font-mono text-[#191919] text-sm">
                            {event.cricketScore.awayScore.runs > 0 ? (
                              <>
                                {event.cricketScore.awayScore.runs}/{event.cricketScore.awayScore.wickets}{' '}
                                <span className="text-[11px] text-[#6F6F6F]">
                                  ({event.cricketScore.awayScore.overs} ov)
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-[#6F6F6F] font-mono">Yet to Bat</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {event.cricketScore && (
                      <div className="bg-[#F8F8F8] rounded-[10px] p-2.5 mb-4 border border-[rgba(0,0,0,0.06)] text-xs font-mono space-y-1">
                        <div className="flex justify-between text-[#6F6F6F]">
                          <span>CRR: <strong className="text-[#191919]">{event.cricketScore.currentRunRate}</strong></span>
                          <span>Format: <strong className="text-[#317CFF]">{event.cricketScore.matchType}</strong></span>
                        </div>
                        <div className="text-[11px] text-[#6F6F6F] italic truncate">
                          {event.cricketScore.commentary}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                    <div className="text-[11px] font-mono text-[#6F6F6F]">
                      {event.marketCount} Markets
                    </div>

                    <Link
                      href={`/sports/${event.id}`}
                      className="px-4 py-1.5 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal transition-all flex items-center gap-1"
                    >
                      <span>Match markets</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Diagnostics Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-medium text-[#191919] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#317CFF]" />
              Betfair API Integration Diagnostics
            </h3>
            <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
              Inspection report of connected Betfair API-NG & In-Play Service configuration.
            </p>

            <div className="mt-4 bg-[#F8F8F8] rounded-[10px] p-4 border border-[rgba(0,0,0,0.06)] font-mono text-xs space-y-2 text-[#191919]">
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">App Key:</span>
                <span className={diagnosticsData?.isConfigured ? 'text-[#1FAE5B]' : 'text-[#317CFF]'}>
                  {diagnosticsData?.appKey || 'Delayed Demo Key (Active)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Mode:</span>
                <span className="text-[#191919] uppercase">{diagnosticsData?.mode || 'DELAYED / SANDBOX'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Authentication:</span>
                <span className="text-[#191919]">{diagnosticsData?.isCertAuth ? 'SSL Client Cert' : 'SSO Key Pass'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Betting API-NG:</span>
                <span className="text-[#6F6F6F] truncate max-w-[220px]">
                  {diagnosticsData?.endpointBetting || 'https://api.betfair.com/exchange/betting/rest/v1.0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">In-Play Service:</span>
                <span className="text-[#6F6F6F] truncate max-w-[220px]">
                  {diagnosticsData?.endpointInPlay || 'https://ips.betfair.com/inplayservice/v1.1'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDiagnostics(false)}
                className="px-5 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white font-normal text-xs transition-all"
              >
                Close diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bet Slip Drawer */}
      <SportsBetSlipDrawer
        selection={activeBetSelection}
        onClose={() => setActiveBetSelection(null)}
        onClear={() => setActiveBetSelection(null)}
      />
    </div>
  );
}

export default function SportsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8F8] text-[#191919] flex flex-col items-center justify-center p-4">
          <RefreshCw className="w-8 h-8 text-[#191919] animate-spin mb-4" />
          <h2 className="text-sm font-normal">Loading Sports Markets...</h2>
        </div>
      }
    >
      <SportsPageContent />
    </React.Suspense>
  );
}
