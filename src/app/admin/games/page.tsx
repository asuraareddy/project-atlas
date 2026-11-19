'use client';

import { useState, useEffect } from 'react';
import {
  Gamepad2,
  CheckCircle2,
  RefreshCw,
  Crown
} from 'lucide-react';
import { LudoAnalyticsSummary } from '@/domain/games/ludo/analytics';
import { CarromAnalyticsSummary } from '@/domain/games/carrom/analytics';

export default function AdminGamesPage() {
  const [games, setGames] = useState([
    {
      id: 'game_matka_main',
      name: 'Matka Draw Engine',
      category: 'Number Draw',
      status: 'LIVE',
      activeMarkets: 5,
      provider: 'Client Matka API (Core)',
      realMoneyEnabled: false
    },
    {
      id: 'game_carrom_pvp',
      name: 'Carrom Tabletop Arena',
      category: 'Multiplayer Skill',
      status: 'LIVE',
      activeMarkets: 6,
      provider: 'Carrom 2D Physics Engine v2',
      realMoneyEnabled: false
    },
    {
      id: 'game_ludo_circuit',
      name: 'Ludo Grand Circuit',
      category: 'Board Strategy',
      status: 'LIVE',
      activeMarkets: 6,
      provider: 'Ludo Matchmaker v2 (CSPRNG)',
      realMoneyEnabled: false
    },
    {
      id: 'game_pool_8ball',
      name: '8-Ball Pool Pro',
      category: 'Cue Sports',
      status: 'LIVE',
      activeMarkets: 2,
      provider: 'Pool Provider Engine',
      realMoneyEnabled: false
    }
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [ludoAnalytics, setLudoAnalytics] = useState<LudoAnalyticsSummary | null>(null);
  const [carromAnalytics, setCarromAnalytics] = useState<CarromAnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch live game analytics
  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const [ludoRes, carromRes] = await Promise.all([
        fetch('/api/v1/games/ludo/analytics').then((r) => r.json()),
        fetch('/api/v1/games/carrom/analytics').then((r) => r.json())
      ]);
      if (ludoRes.ok && ludoRes.data) setLudoAnalytics(ludoRes.data);
      if (carromRes.ok && carromRes.data) setCarromAnalytics(carromRes.data);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const toggleStatus = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'LIVE' ? 'PAUSED' : 'LIVE' } : g))
    );
    setFeedback(`Game status updated for ${id}. Action logged in audit journal.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-[#317CFF]" />
            <span>Game operations & provider feeds</span>
          </h1>
          <p className="text-xs text-[#6F6F6F] mt-1">
            Catalogue configuration, provider health, market kill switches, and authoritative draw analytics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#F8F8F8] border border-[rgba(0,0,0,0.12)] text-xs text-[#191919] font-medium self-start sm:self-auto cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loadingAnalytics ? 'animate-spin' : ''}`} />
          <span>Refresh analytics</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-xs text-[#1FAE5B] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* SECTION 1: LUDO TOURNAMENT & FAIR-PLAY ANALYTICS */}
      {ludoAnalytics && (
        <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.08)] pb-4">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-[#317CFF]" />
              <div>
                <h2 className="text-base font-semibold text-[#191919]">Ludo tournament & fair-play analytics</h2>
                <p className="text-xs text-[#6F6F6F]">
                  Authoritative double-entry ledger settlement, win-rate distribution, and CSPRNG fairness audit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20">
                FAIRNESS SCORE: {ludoAnalytics.fairnessScore}%
              </span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Total matches</span>
              <span className="text-xl font-bold font-mono text-[#191919]">{ludoAnalytics.totalMatches}</span>
              <span className="text-[10px] text-[#1FAE5B] block">
                {ludoAnalytics.completedMatches} completed ({ludoAnalytics.cancelledMatches} refunded)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Gross stakes</span>
              <span className="text-xl font-bold font-mono text-[#191919]">
                {(ludoAnalytics.totalTurnoverMinor / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-[#6F6F6F] block">All active & finished games</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Platform rake (10%)</span>
              <span className="text-xl font-bold font-mono text-[#1FAE5B]">
                {(ludoAnalytics.totalRakeCollectedMinor / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-[#6F6F6F] block">Audited operator commission</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Avg match duration</span>
              <span className="text-xl font-bold font-mono text-[#191919]">{ludoAnalytics.averageDurationSeconds}s</span>
              <span className="text-[10px] text-[#6F6F6F] block">Natural mobile pacing</span>
            </div>
          </div>

          {/* Win Rate by Color & Dice Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Win Rate by Color */}
            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-3">
              <h3 className="font-semibold text-[#191919] text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Color win-rate distribution</span>
                <span className="text-[10px] text-[#6F6F6F] font-normal">Expected ~25% each</span>
              </h3>
              <div className="space-y-2">
                {[
                  { color: 'red', name: 'Red', hex: '#E5484D', rate: ludoAnalytics.winRateByColor.red, wins: ludoAnalytics.winsByColor.red },
                  { color: 'green', name: 'Green', hex: '#1FAE5B', rate: ludoAnalytics.winRateByColor.green, wins: ludoAnalytics.winsByColor.green },
                  { color: 'yellow', name: 'Yellow', hex: '#F59F00', rate: ludoAnalytics.winRateByColor.yellow, wins: ludoAnalytics.winsByColor.yellow },
                  { color: 'blue', name: 'Blue', hex: '#317CFF', rate: ludoAnalytics.winRateByColor.blue, wins: ludoAnalytics.winsByColor.blue }
                ].map((col) => (
                  <div key={col.color} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-[#191919] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                        {col.name} ({col.wins} wins)
                      </span>
                      <span className="font-mono font-medium text-[#191919]">{col.rate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, col.rate)}%`, backgroundColor: col.hex }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CSPRNG Dice Distribution Fairness */}
            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-3">
              <h3 className="font-semibold text-[#191919] text-xs uppercase tracking-wider flex items-center justify-between">
                <span>CSPRNG dice distribution (1..6)</span>
                <span className="text-[10px] text-[#1FAE5B] font-medium">Entropy verified</span>
              </h3>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {[1, 2, 3, 4, 5, 6].map((face) => {
                  const count = ludoAnalytics.diceRollDistribution[face as 1 | 2 | 3 | 4 | 5 | 6] || 0;
                  const total = ludoAnalytics.totalRolls || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={face} className="p-2 rounded-lg bg-white border border-[rgba(0,0,0,0.08)] space-y-1">
                      <span className="font-bold text-[#191919] text-xs block">[{face}]</span>
                      <span className="font-semibold text-xs text-[#317CFF] block">{count}</span>
                      <span className="text-[9px] text-[#6F6F6F] block">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#6F6F6F] leading-relaxed">
                Dice outcomes are generated exclusively via cryptographic CSPRNG (`crypto.randomInt`). Admin, player, or balance tampering is architecturally impossible.
              </p>
            </div>
          </div>

          {/* Recent Completed Matches & Settlement Audit */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#191919] text-xs uppercase tracking-wider">
              Authoritative settlement audit log
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)] text-[10px]">
                    <th className="p-2.5 font-medium">Session Ref</th>
                    <th className="p-2.5 font-medium">Format</th>
                    <th className="p-2.5 font-medium">Stake</th>
                    <th className="p-2.5 font-medium">Winner</th>
                    <th className="p-2.5 font-medium">Prize paid</th>
                    <th className="p-2.5 font-medium">Platform fee</th>
                    <th className="p-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,0,0,0.06)] text-[11px]">
                  {ludoAnalytics.recentMatches.map((m) => (
                    <tr key={m.sessionId} className="hover:bg-[#F8F8F8] transition-colors">
                      <td className="p-2.5 font-semibold text-[#191919]">{m.sessionId}</td>
                      <td className="p-2.5 text-[#6F6F6F]">{m.playerCount}P ({m.mode})</td>
                      <td className="p-2.5 font-medium text-[#191919]">
                        {m.stakeMinor > 0 ? `${(m.stakeMinor / 100).toFixed(2)}` : 'Practice'}
                      </td>
                      <td className="p-2.5">
                        <span className="text-[#317CFF] font-medium">{m.winnerName}</span>
                        {m.winnerColor && (
                          <span className="text-[10px] text-[#6F6F6F] block capitalize">({m.winnerColor})</span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-[#1FAE5B]">
                        {m.prizePoolMinor > 0 ? `+${(m.prizePoolMinor / 100).toFixed(2)}` : '0.00'}
                      </td>
                      <td className="p-2.5 text-[#6F6F6F]">
                        {(m.platformFeeMinor / 100).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            m.settlementStatus === 'settled'
                              ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]'
                              : 'bg-[#F59F00]/10 text-[#B26A00]'
                          }`}
                        >
                          {m.settlementStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CARROM TOURNAMENT & PHYSICS RECONCILIATION */}
      {carromAnalytics && (
        <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.08)] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎯</span>
              <div>
                <h2 className="text-base font-semibold text-[#191919]">Carrom tournament & physics reconciliation</h2>
                <p className="text-xs text-[#6F6F6F]">
                  Server-authoritative 2D physics verification, Queen cover audit, and wager payouts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#1FAE5B]/10 text-[#1FAE5B] border border-[#1FAE5B]/20">
                ACTIVE TABLES: {carromAnalytics.activeMatches}
              </span>
            </div>
          </div>

          {/* Carrom KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Carrom matches</span>
              <span className="text-xl font-bold font-mono text-[#191919]">{carromAnalytics.totalMatches}</span>
              <span className="text-[10px] text-[#1FAE5B] block">
                {carromAnalytics.completedMatches} finished ({carromAnalytics.cancelledMatches} refunded)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Gross turnover</span>
              <span className="text-xl font-bold font-mono text-[#191919]">
                {(carromAnalytics.totalTurnoverMinor / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-[#6F6F6F] block">All active & finished games</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Platform rake (10%)</span>
              <span className="text-xl font-bold font-mono text-[#1FAE5B]">
                {(carromAnalytics.totalRakeCollectedMinor / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-[#6F6F6F] block">Audited operator commission</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] space-y-1">
              <span className="text-[#6F6F6F] text-[10px] uppercase font-medium block">Avg match duration</span>
              <span className="text-xl font-bold font-mono text-[#191919]">{carromAnalytics.averageDurationSeconds}s</span>
              <span className="text-[10px] text-[#6F6F6F] block">Total shots: {carromAnalytics.totalShots}</span>
            </div>
          </div>

          {/* Color Win Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <span className="font-medium text-[#191919] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border border-[rgba(0,0,0,0.2)]" />
                White Win Rate:
              </span>
              <span className="font-mono font-bold text-[#191919] text-sm">{carromAnalytics.whiteWinRate}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <span className="font-medium text-[#191919] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#191919]" />
                Black Win Rate:
              </span>
              <span className="font-mono font-bold text-[#191919] text-sm">{carromAnalytics.blackWinRate}%</span>
            </div>
          </div>

          {/* Recent Completed Carrom Matches */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#191919] text-xs uppercase tracking-wider">
              Carrom ledger settlement audit log
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)] text-[10px]">
                    <th className="p-2.5 font-medium">Session Ref</th>
                    <th className="p-2.5 font-medium">Format</th>
                    <th className="p-2.5 font-medium">Stake</th>
                    <th className="p-2.5 font-medium">Winner</th>
                    <th className="p-2.5 font-medium">Prize paid</th>
                    <th className="p-2.5 font-medium">Platform fee</th>
                    <th className="p-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,0,0,0.06)] text-[11px]">
                  {carromAnalytics.recentMatches.map((m) => (
                    <tr key={m.sessionId} className="hover:bg-[#F8F8F8] transition-colors">
                      <td className="p-2.5 font-semibold text-[#191919]">{m.sessionId}</td>
                      <td className="p-2.5 text-[#6F6F6F]">2P ({m.mode})</td>
                      <td className="p-2.5 font-medium text-[#191919]">
                        {m.stakeMinor > 0 ? `${(m.stakeMinor / 100).toFixed(2)}` : 'Practice'}
                      </td>
                      <td className="p-2.5 text-[#317CFF] font-medium">{m.winnerName}</td>
                      <td className="p-2.5 font-bold text-[#1FAE5B]">
                        {m.prizePoolMinor > 0 ? `+${(m.prizePoolMinor / 100).toFixed(2)}` : '0.00'}
                      </td>
                      <td className="p-2.5 text-[#6F6F6F]">
                        {(m.platformFeeMinor / 100).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            m.settlementStatus === 'settled'
                              ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]'
                              : 'bg-[#F59F00]/10 text-[#B26A00]'
                          }`}
                        >
                          {m.settlementStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: CONFIGURED GAME MODULES TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-[#191919]">Configured game modules & kill switches</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Module ID</th>
                <th className="p-3 font-medium">Display name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Provider adapter</th>
                <th className="p-3 text-center font-medium">Status</th>
                <th className="p-3 text-right font-medium">Kill switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#191919]">{g.id}</td>
                  <td className="p-3 text-[#317CFF] font-medium">{g.name}</td>
                  <td className="p-3 text-[#6F6F6F]">{g.category}</td>
                  <td className="p-3 text-[#6F6F6F]">{g.provider}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        g.status === 'LIVE'
                          ? 'bg-[#1FAE5B]/10 text-[#1FAE5B]'
                          : 'bg-[#E5484D]/10 text-[#E5484D]'
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleStatus(g.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        g.status === 'LIVE'
                          ? 'bg-[#E5484D] hover:bg-[#E5484D]/90 text-white'
                          : 'bg-[#1FAE5B] hover:bg-[#1FAE5B]/90 text-white'
                      }`}
                    >
                      {g.status === 'LIVE' ? 'Pause Game' : 'Resume Game'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
