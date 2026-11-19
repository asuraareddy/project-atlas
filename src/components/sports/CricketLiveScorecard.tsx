'use client';

import React from 'react';
import { CricketScore, SportsEvent } from '@/domain/games/sports/types';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface CricketLiveScorecardProps {
  event: SportsEvent;
  score?: CricketScore;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CricketLiveScorecard({
  event,
  score = event.cricketScore,
  onRefresh,
  isRefreshing = false,
}: CricketLiveScorecardProps) {
  if (!score) {
    return (
      <div className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 text-center text-[#6F6F6F] shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6">
        <div className="text-sm font-semibold text-[#191919]">{event.name}</div>
        <div className="text-xs text-[#6F6F6F] mt-1">
          {event.status === 'PRE_MATCH'
            ? `Match scheduled to commence at ${new Date(event.openDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Live scoreboard waiting for match session initiation'}
        </div>
      </div>
    );
  }

  const isHomeBatting = score.currentBattingTeam === 'HOME';
  const batting = isHomeBatting ? score.homeScore : score.awayScore;
  const bowling = isHomeBatting ? score.awayScore : score.homeScore;
  const battingTeamName = isHomeBatting ? event.homeTeam : event.awayTeam;
  const bowlingTeamName = isHomeBatting ? event.awayTeam : event.homeTeam;

  return (
    <div className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative mb-6">
      {/* Top Banner Bar */}
      <div className="bg-[#F8F8F8] px-4 sm:px-6 py-2.5 border-b border-[rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {event.status === 'IN_PLAY' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-ping" />
              <span>LIVE IN-PLAY</span>
            </div>
          ) : event.status === 'COMPLETED' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-[#1FAE5B] font-mono text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#1FAE5B]" />
              <span>MATCH COMPLETED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.12)] text-[#6F6F6F] font-mono text-[10px] font-bold">
              <span>SCHEDULED FIXTURE</span>
            </div>
          )}

          <span className="text-[#191919] font-medium hidden sm:inline">{event.competition}</span>
          <span className="text-[#B8B8B8] hidden sm:inline">•</span>
          <span className="text-[#317CFF] font-mono text-[11px] font-medium">{score.matchType} Match</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-[#6F6F6F] font-mono hidden md:inline">
            Venue: {event.venue || 'International Ground'}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 px-2.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.12)] transition-colors flex items-center gap-1.5 text-[11px] font-medium disabled:opacity-50"
              title="Refresh Live Ball Data"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#317CFF]' : ''}`} />
              <span className="hidden sm:inline">Refresh ball</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Area */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Batting Team Primary */}
        <div className="border-b md:border-b-0 md:border-r border-[rgba(0,0,0,0.08)] pb-4 md:pb-0 md:pr-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-[#317CFF] uppercase tracking-wider">
              Batting Now
            </span>
            <span className="text-xs font-mono text-[#6F6F6F]">
              CRR: {score.currentRunRate ? score.currentRunRate.toFixed(2) : '-'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#191919]">{battingTeamName}</h2>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#191919]">
              {batting?.runs ?? 0}
              <span className="text-[#6F6F6F] text-lg font-normal">/{batting?.wickets ?? 0}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
            <span>Overs: <strong className="text-[#191919]">{batting?.overs ?? '0.0'}</strong></span>
            {score.requiredRunRate ? (
              <span>Req RR: <strong className="text-[#E5484D]">{score.requiredRunRate.toFixed(2)}</strong></span>
            ) : null}
          </div>
        </div>

        {/* Bowling / Opponent Team */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6F6F6F] uppercase tracking-wider">
              Opponent
            </span>
            {score.commentary && (
              <span className="text-xs font-medium text-[#191919]">{score.commentary}</span>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold text-[#6F6F6F]">{bowlingTeamName}</h3>
            <div className="text-xl font-mono font-bold text-[#6F6F6F]">
              {bowling?.runs ?? 0}
              <span className="text-[#B8B8B8] text-base font-normal">/{bowling?.wickets ?? 0}</span>
              <span className="text-xs text-[#6F6F6F] ml-2 font-normal">({bowling?.overs ?? '0.0'} ov)</span>
            </div>
          </div>
          {score.recentBalls && score.recentBalls.length > 0 && (
            <div className="pt-2 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-mono text-[#6F6F6F] uppercase mr-1">Over:</span>
              {score.recentBalls.map((b, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    b === 'W'
                      ? 'bg-[#E5484D] text-white'
                      : b === '4' || b === '6'
                      ? 'bg-[#317CFF] text-white'
                      : 'bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)]'
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
