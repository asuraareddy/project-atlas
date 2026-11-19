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
        id: 'game_carrom',
        name: 'Carrom Tabletop',
        category: 'Tabletop',
        description: 'Realistic 2D rigid-body Carrom physics, striker drag-shooting, queen cover, and multiplayer lobbies.',
        status: 'available'
      },
      {
        id: 'game_ludo',
        name: 'Ludo Grand Circuit',
        category: 'Board & Dice',
        description: 'Competitive 2-4 player Ludo board race with CSPRNG dice rolling, safe-house rules, and AI bot matches.',
        status: 'available'
      },
      {
        id: 'game_pool_8ball',
        name: '8-Ball Pool Pro',
        category: 'Pool',
        description: 'Certified 8-ball physics and cue ball spin mechanics. PvP cash & practice tables.',
        status: 'available'
      },
      {
        id: 'game_ace2three',
        name: 'Ace2Three',
        category: 'Card & Rummy',
        description: 'Authentic 13-card Indian Rummy table. Cut for seat, closed/open deck draws, wild joker, and pure sequence declares.',
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
        stakeMinor: 250, // 2.50 pts
        currency: 'pts',
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting',
        mode: 'classic'
      },
      {
        roomId: 'pool_championship_02',
        category: 'pool',
        name: 'Atlas Masters Tournament Table',
        stakeMinor: 1000, // 10.00 pts
        currency: 'pts',
        maxPlayers: 2,
        currentPlayers: 2,
        status: 'in_progress',
        mode: 'tournament'
      }
    ];
  }
}

export const otherGamesAdapter = new ClientOtherGamesAdapter();
