import { LudoProviderAdapter, GameRoom } from './types';

export class ClientLudoAdapter implements LudoProviderAdapter {
  getCapabilities() {
    return {
      realtimeSockets: true,
      serverAuthoritativeTurns: true,
      independentRng: true,
      historicalCharts: false
    };
  }

  async getActiveRooms(): Promise<GameRoom[]> {
    return [
      {
        roomId: 'ludo_quick_01',
        category: 'ludo',
        name: 'Quick Battle (2 Players)',
        stakeMinor: 200, // £2.00
        currency: 'GBP',
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting',
        mode: 'classic'
      },
      {
        roomId: 'ludo_quad_02',
        category: 'ludo',
        name: 'Grand 4-Player Circuit',
        stakeMinor: 500, // £5.00
        currency: 'GBP',
        maxPlayers: 4,
        currentPlayers: 2,
        status: 'waiting',
        mode: 'tournament'
      },
      {
        roomId: 'ludo_pro_03',
        category: 'ludo',
        name: 'High Roller Arena',
        stakeMinor: 2500, // £25.00
        currency: 'GBP',
        maxPlayers: 2,
        currentPlayers: 2,
        status: 'in_progress',
        mode: 'points'
      }
    ];
  }

  async createRoom(name: string, stakeMinor: number, mode: string): Promise<GameRoom> {
    return {
      roomId: `ludo_${Date.now()}`,
      category: 'ludo',
      name,
      stakeMinor,
      currency: 'GBP',
      maxPlayers: 4,
      currentPlayers: 1,
      status: 'waiting',
      mode: (mode as any) || 'classic'
    };
  }

  async joinRoom(roomId: string, userId: string) {
    return {
      sessionId: `sess_ludo_${roomId}_${userId.substring(0, 6)}`,
      status: 'joined'
    };
  }
}

export const ludoAdapter = new ClientLudoAdapter();
