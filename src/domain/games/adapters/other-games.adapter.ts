import { OtherGamesProviderAdapter, GameRoom } from './types';

export class ClientOtherGamesAdapter implements OtherGamesProviderAdapter {
  getCapabilities() {
    return {
      realtimeSockets: true,
      serverAuthoritativeTurns: true,
      independentRng: false,
      historicalCharts: false
    };
  }

  async getGames() {
    return [
      {
        id: 'game_pool_8ball',
        name: '8-Ball Pool Pro',
        category: 'Pool',
        description: 'Certified 8-ball physics and cue ball spin mechanics. PvP cash & practice tables.',
        status: 'available'
      },
      {
        id: 'game_snooker_blitz',
        name: 'Snooker Blitz',
        category: 'Cue Sports',
        description: 'Speed snooker frames with server-verified potting and ball collision calculation.',
        status: 'available'
      },
      {
        id: 'game_chess_speed',
        name: 'Blitz Chess',
        category: 'Strategy',
        description: '3-minute blitz chess with FIDE rule engine and anti-engine bot detection.',
        status: 'maintenance'
      }
    ];
  }

  async getPoolRooms(): Promise<GameRoom[]> {
    return [
      {
        roomId: 'pool_pub_01',
        category: 'pool',
        name: 'London Club (8-Ball)',
        stakeMinor: 250, // £2.50
        currency: 'GBP',
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting',
        mode: 'classic'
      },
      {
        roomId: 'pool_championship_02',
        category: 'pool',
        name: 'Atlas Masters Tournament Table',
        stakeMinor: 1000, // £10.00
        currency: 'GBP',
        maxPlayers: 2,
        currentPlayers: 2,
        status: 'in_progress',
        mode: 'tournament'
      }
    ];
  }
}

export const otherGamesAdapter = new ClientOtherGamesAdapter();
