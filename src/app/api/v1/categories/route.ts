import { NextResponse } from 'next/server';

export interface GameCategoryDto {
  key: string;
  label: string;
  route: string;
  order: number;
  enabled: boolean;
  status: 'available' | 'maintenance' | 'coming_soon' | 'disabled';
  description: string;
  badge?: string;
  artworkIcon: string;
}

export async function GET() {
  // Authoritative server-side game category catalogue
  // Exactly 4 primary categories in documented order
  const categories: GameCategoryDto[] = [
    {
      key: 'matka',
      label: 'Matka',
      route: '/matka',
      order: 1,
      enabled: true,
      status: 'available',
      description: 'Classic number draw markets with server-verified draw schedules, cut-offs, and live result charts.',
      badge: 'Main Draw',
      artworkIcon: 'Dice5'
    },
    {
      key: 'carrom',
      label: 'Carrom',
      route: '/carrom',
      order: 2,
      enabled: true,
      status: 'available',
      description: 'Precision tabletop multiplayer board challenge. Real-time turn state and shot validation.',
      badge: 'Multiplayer',
      artworkIcon: 'Target'
    },
    {
      key: 'ludo',
      label: 'Ludo',
      order: 3,
      route: '/ludo',
      enabled: true,
      status: 'available',
      description: 'Competitive 2-4 player board action with cryptographic randomness and anti-collusion monitoring.',
      badge: 'Skill Match',
      artworkIcon: 'Gamepad2'
    },
    {
      key: 'other-games',
      label: 'Other Games',
      order: 4,
      route: '/other-games',
      enabled: true,
      status: 'available',
      description: 'Explore certified 8-Ball Pool, custom skill tournaments, and operator-approved titles.',
      badge: 'Pool & More',
      artworkIcon: 'Layers'
    }
  ];

  return NextResponse.json({
    data: {
      categories
    },
    meta: {
      correlationId: `corr_${Date.now()}`,
      count: categories.length
    }
  });
}
