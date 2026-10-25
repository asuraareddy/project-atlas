import { LudoColor } from '@/domain/games/ludo/types';

export interface GridCoord {
  r: number;
  c: number;
}

/**
 * 52 Track positions mapped to 15x15 grid coordinates [row, col] (0..14)
 */
export const TRACK_COORDS: GridCoord[] = [
  { r: 6, c: 1 },  // 0  Red Start [Safe]
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8  Star [Safe]
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11
  { r: 0, c: 8 },  // 12
  { r: 1, c: 8 },  // 13 Green Start [Safe]
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21 Star [Safe]
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26 Yellow Start [Safe]
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34 Star [Safe]
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39 Blue Start [Safe]
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47 Star [Safe]
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50
  { r: 6, c: 0 }   // 51
];

/**
 * 5 Home Column Steps for each Color
 */
export const HOME_PATH_COORDS: Record<LudoColor, GridCoord[]> = {
  red: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 }
  ],
  green: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 }
  ],
  yellow: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 }
  ],
  blue: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9, c: 7 }
  ]
};

/**
 * Center Goal Triangle Coordinate
 */
export const CENTER_GOAL_COORDS: Record<LudoColor, GridCoord> = {
  red: { r: 7, c: 6 },
  green: { r: 6, c: 7 },
  yellow: { r: 7, c: 8 },
  blue: { r: 8, c: 7 }
};

/**
 * Base Yard 4 Token Slot Coordinates
 */
export const BASE_SLOT_COORDS: Record<LudoColor, GridCoord[]> = {
  red: [
    { r: 2, c: 2 },
    { r: 2, c: 3 },
    { r: 3, c: 2 },
    { r: 3, c: 3 }
  ],
  green: [
    { r: 2, c: 11 },
    { r: 2, c: 12 },
    { r: 3, c: 11 },
    { r: 3, c: 12 }
  ],
  yellow: [
    { r: 11, c: 11 },
    { r: 11, c: 12 },
    { r: 12, c: 11 },
    { r: 12, c: 12 }
  ],
  blue: [
    { r: 11, c: 2 },
    { r: 11, c: 3 },
    { r: 12, c: 2 },
    { r: 12, c: 3 }
  ]
};

export const COLOR_STYLES: Record<
  LudoColor,
  {
    bg: string;
    border: string;
    text: string;
    accent: string;
    darkBg: string;
    gradient: string;
  }
> = {
  red: {
    bg: '#E52424',
    border: '#C01C1C',
    text: '#ffffff',
    accent: '#FF4D4D',
    darkBg: '#7F1D1D',
    gradient: 'from-[#E52424] to-[#B91C1C]'
  },
  green: {
    bg: '#12A04A',
    border: '#0E823B',
    text: '#ffffff',
    accent: '#0DBA78',
    darkBg: '#064E3B',
    gradient: 'from-[#12A04A] to-[#0DBA78]'
  },
  yellow: {
    bg: '#FBD706',
    border: '#E0C000',
    text: '#04093A',
    accent: '#FFE84A',
    darkBg: '#854D0E',
    gradient: 'from-[#FBD706] to-[#EAB308]'
  },
  blue: {
    bg: '#0D6EFD',
    border: '#0B5ED7',
    text: '#ffffff',
    accent: '#60A5FA',
    darkBg: '#1E3A8A',
    gradient: 'from-[#0D6EFD] to-[#0B5ED7]'
  }
};
