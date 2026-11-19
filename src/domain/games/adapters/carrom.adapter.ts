import { CarromProviderAdapter, GameRoom } from './types';

export class ClientCarromAdapter implements CarromProviderAdapter {
  getCapabilities() {
    return {
      realtimeSockets: true,
      serverAuthoritativeTurns: true,
      independentRng: false,
      historicalCharts: false
    };
  }

  async getActiveRooms(): Promise<GameRoom[]> {
    return [
      {
        roomId: 'crm_room_01',
        category: 'carrom',
        name: 'Novice Board (1v1)',
        stakeMinor: 100, // 1.00 pts
        currency: 'pts',
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting',
        mode: 'classic'
      },
      {
        roomId: 'crm_room_02',
        category: 'carrom',
        name: 'Challenger Arena (1v1)',
        stakeMinor: 500, // 5.00 pts
        currency: 'pts',
        maxPlayers: 2,
        currentPlayers: 2,
        status: 'in_progress',
        mode: 'points'
      },
      {
        roomId: 'crm_room_03',
        category: 'carrom',
        name: 'Master Cup (2v2 Doubles)',
        stakeMinor: 1000, // 10.00 pts
        currency: 'pts',
        maxPlayers: 4,
        currentPlayers: 3,
        status: 'waiting',
        mode: 'tournament'
      }
    ];
  }

  async createRoom(name: string, stakeMinor: number, mode: string): Promise<GameRoom> {
    return {
      roomId: `crm_${Date.now()}`,
      category: 'carrom',
      name,
      stakeMinor,
      currency: 'pts',
      maxPlayers: 2,
      currentPlayers: 1,
      status: 'waiting',
      mode: (mode as any) || 'classic'
    };
  }

  async joinRoom(roomId: string, userId: string) {
    return {
      sessionId: `sess_crm_${roomId}_${userId.substring(0, 6)}`,
      status: 'joined'
    };
  }
}

export const carromAdapter = new ClientCarromAdapter();
