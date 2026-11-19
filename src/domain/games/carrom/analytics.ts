import { CarromGameState } from './types';

export interface CarromMatchRecord {
  sessionId: string;
  mode: string;
  stakeMinor: number;
  prizePoolMinor: number;
  platformFeeMinor: number;
  winnerId: string | null;
  winnerName: string;
  winnerIsBot: boolean;
  totalShots: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  settlementStatus: 'settled' | 'refunded' | 'voided';
}

export interface CarromAnalyticsSummary {
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  activeMatches: number;
  totalTurnoverMinor: number;
  totalRakeCollectedMinor: number;
  totalPrizesPaidMinor: number;
  averageDurationSeconds: number;
  totalShots: number;
  whiteWinRate: number;
  blackWinRate: number;
  recentMatches: CarromMatchRecord[];
}

declare global {
  var __projectAtlasCarromAnalytics: {
    matches: CarromMatchRecord[];
    matchStartTimes: Map<string, number>;
  } | undefined;
}

export class CarromAnalyticsService {
  private static get store() {
    if (!globalThis.__projectAtlasCarromAnalytics) {
      globalThis.__projectAtlasCarromAnalytics = {
        matches: [
          {
            sessionId: 'carrom_seed_01',
            mode: 'vs_ai',
            stakeMinor: 200,
            prizePoolMinor: 360,
            platformFeeMinor: 40,
            winnerId: 'usr_player_01',
            winnerName: 'Player 1 (You)',
            winnerIsBot: false,
            totalShots: 24,
            durationSeconds: 165,
            startedAt: new Date(Date.now() - 3600000).toISOString(),
            completedAt: new Date(Date.now() - 3435000).toISOString(),
            settlementStatus: 'settled'
          },
          {
            sessionId: 'carrom_seed_02',
            mode: 'vs_ai',
            stakeMinor: 500,
            prizePoolMinor: 900,
            platformFeeMinor: 100,
            winnerId: 'bot_ace_striker',
            winnerName: 'AceStriker (AI)',
            winnerIsBot: true,
            totalShots: 31,
            durationSeconds: 198,
            startedAt: new Date(Date.now() - 7200000).toISOString(),
            completedAt: new Date(Date.now() - 7002000).toISOString(),
            settlementStatus: 'settled'
          }
        ],
        matchStartTimes: new Map()
      };
    }
    return globalThis.__projectAtlasCarromAnalytics;
  }

  static recordMatchStart(sessionId: string): void {
    this.store.matchStartTimes.set(sessionId, Date.now());
  }

  static recordMatchCompletion(session: CarromGameState): void {
    const startTime = this.store.matchStartTimes.get(session.sessionId) || (Date.now() - 150000);
    const durationSeconds = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    const winner = session.players.find((p) => p.id === session.winnerId);

    const stakeMinor = session.betting?.stakeMinor ?? 0;
    const prizePoolMinor = session.betting?.prizePoolMinor ?? 0;
    const platformFeeMinor = session.betting?.platformFeeMinor ?? 0;

    const record: CarromMatchRecord = {
      sessionId: session.sessionId,
      mode: session.mode,
      stakeMinor,
      prizePoolMinor,
      platformFeeMinor,
      winnerId: session.winnerId,
      winnerName: winner?.name || 'Tournament Winner',
      winnerIsBot: winner?.isBot ?? false,
      totalShots: session.turnNumber,
      durationSeconds,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      settlementStatus: 'settled'
    };

    this.store.matches.unshift(record);
    if (this.store.matches.length > 200) {
      this.store.matches.pop();
    }
    this.store.matchStartTimes.delete(session.sessionId);
  }

  static recordMatchCancellation(session: CarromGameState): void {
    const startTime = this.store.matchStartTimes.get(session.sessionId) || Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const record: CarromMatchRecord = {
      sessionId: session.sessionId,
      mode: session.mode,
      stakeMinor: session.betting?.stakeMinor ?? 0,
      prizePoolMinor: 0,
      platformFeeMinor: 0,
      winnerId: null,
      winnerName: 'Cancelled / Refunded',
      winnerIsBot: false,
      totalShots: session.turnNumber,
      durationSeconds,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      settlementStatus: 'refunded'
    };

    this.store.matches.unshift(record);
    this.store.matchStartTimes.delete(session.sessionId);
  }

  static getSummary(): CarromAnalyticsSummary {
    const matches = this.store.matches;
    const completed = matches.filter((m) => m.settlementStatus === 'settled');
    const cancelled = matches.filter((m) => m.settlementStatus === 'refunded');

    let totalDuration = 0;
    let totalTurnoverMinor = 0;
    let totalRakeCollectedMinor = 0;
    let totalPrizesPaidMinor = 0;
    let totalShots = 0;
    let whiteWins = 0;
    let blackWins = 0;

    for (const m of completed) {
      totalDuration += m.durationSeconds;
      totalTurnoverMinor += m.stakeMinor * 2;
      totalRakeCollectedMinor += m.platformFeeMinor;
      totalPrizesPaidMinor += m.prizePoolMinor;
      totalShots += m.totalShots;
      if (!m.winnerIsBot) whiteWins++;
      else blackWins++;
    }

    const completedCount = completed.length || 1;

    return {
      totalMatches: matches.length,
      completedMatches: completed.length,
      cancelledMatches: cancelled.length,
      activeMatches: this.store.matchStartTimes.size,
      totalTurnoverMinor,
      totalRakeCollectedMinor,
      totalPrizesPaidMinor,
      averageDurationSeconds: Math.round(totalDuration / completedCount),
      totalShots,
      whiteWinRate: Math.round((whiteWins / completedCount) * 100),
      blackWinRate: Math.round((blackWins / completedCount) * 100),
      recentMatches: matches.slice(0, 15)
    };
  }
}
