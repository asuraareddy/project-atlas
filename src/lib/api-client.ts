/**
 * Project Atlas — Standardized Frontend API Client
 * Connects React UI components directly to C# ASP.NET Core 8.0 Web API (Port 5000).
 */

export const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.INTERNAL_API_URL || 'http://localhost:5000');

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, any>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject auth token if available in client storage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('atlas_auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error?.message || json.error || `HTTP ${response.status} Error`);
  }

  return json;
}

export const AtlasApi = {
  // 1. Categories & Navigation
  getCategories: () => apiClient<{ categories: any[]; tenant: any }>('/api/v1/categories'),

  // 2. Tenancy & Points Valuation
  getTenantPointConfig: (tenantId: string) =>
    apiClient<any>(`/api/v1/admin/tenants/${tenantId}/point-config`),
  updateTenantPointConfig: (tenantId: string, pointConfig: any) =>
    apiClient<any>(`/api/v1/admin/tenants/${tenantId}/point-config`, {
      method: 'PUT',
      body: JSON.stringify(pointConfig),
    }),

  // 3. Matka Live Draws
  getMatkaMarkets: () => apiClient<{ markets: any[]; count: number }>('/api/v1/games/matka/markets'),
  getMatkaPatti: (digit?: number, type?: string) =>
    apiClient<any>(`/api/v1/games/matka/patti${digit !== undefined ? `?digit=${digit}` : ''}`),
  getMatkaChart: (marketId: string) =>
    apiClient<any>(`/api/v1/games/matka/markets/${marketId}/chart`),
  participateMatka: (data: { marketId: string; entryType: string; selectedValues?: string; stakeMinor?: number; totalPoints?: number }) =>
    apiClient<any>('/api/v1/games/matka/participate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 4. Carrom Tabletop
  getCarromRooms: () => apiClient<any>('/api/v1/games/carrom/rooms'),
  createCarromSession: (mode: string = 'vs_ai') =>
    apiClient<any>('/api/v1/games/carrom/session', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
  executeCarromShot: (sessionId: string, angle: number, power: number) =>
    apiClient<any>('/api/v1/games/carrom/shot', {
      method: 'POST',
      body: JSON.stringify({ sessionId, angle, power }),
    }),
  executeCarromBotShot: (sessionId: string) =>
    apiClient<any>('/api/v1/games/carrom/bot-shot', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  // 5. Ludo Grand Circuit
  createLudoSession: (mode: string = 'vs_ai', playerCount: number = 2) =>
    apiClient<any>('/api/v1/games/ludo/session', {
      method: 'POST',
      body: JSON.stringify({ mode, playerCount }),
    }),
  rollLudoDice: (sessionId: string, color: string) =>
    apiClient<any>('/api/v1/games/ludo/roll', {
      method: 'POST',
      body: JSON.stringify({ sessionId, color }),
    }),
  moveLudoToken: (sessionId: string, color: string, tokenId: number) =>
    apiClient<any>('/api/v1/games/ludo/move', {
      method: 'POST',
      body: JSON.stringify({ sessionId, color, tokenId }),
    }),
  executeLudoBotTurn: (sessionId: string) =>
    apiClient<any>('/api/v1/games/ludo/bot-turn', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  // 6. 8-Ball Pool Pro
  createPoolSession: (mode: string = 'vs_bot') =>
    apiClient<any>('/api/v1/games/pool/session', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
  executePoolShot: (sessionId: string, angle: number, power: number) =>
    apiClient<any>('/api/v1/games/pool/shot', {
      method: 'POST',
      body: JSON.stringify({ sessionId, angle, power }),
    }),
  placePoolBallInHand: (sessionId: string, x: number, y: number) =>
    apiClient<any>('/api/v1/games/pool/ball-in-hand', {
      method: 'POST',
      body: JSON.stringify({ sessionId, x, y }),
    }),

  // 7. Ace2Three Indian Rummy
  createAce2ThreeSession: (stake: number = 250) =>
    apiClient<any>('/api/v1/games/ace2three/session', {
      method: 'POST',
      body: JSON.stringify({ stake }),
    }),
  validateAce2ThreeDeclare: (groups: any[], wildJokerRank: number) =>
    apiClient<any>('/api/v1/games/ace2three/session', {
      method: 'PUT',
      body: JSON.stringify({ groups, wildJokerRank }),
    }),

  // 8. Casino Games
  getCasinoCatalogue: (category?: string) =>
    apiClient<any>(`/api/v1/games/casino/catalogue${category ? `?category=${category}` : ''}`),
  launchCasinoGame: (gameId: string) =>
    apiClient<any>('/api/v1/games/casino/launch', {
      method: 'POST',
      body: JSON.stringify({ gameId, playerId: 'usr_player_01' }),
    }),

  // 9. Sports Exchange & Betfair
  getSportsEvents: (category: string = '4') =>
    apiClient<any>(`/api/v1/games/sports/events?category=${category}`),
  getSportsEventById: (id: string) =>
    apiClient<any>(`/api/v1/games/sports/events/${id}`),

  // 10. Financials & Wallets
  getWallets: () => apiClient<any>('/api/v1/me/wallets'),
  getTransactions: () => apiClient<any>('/api/v1/me/transactions'),
  getCryptoWhitelist: () => apiClient<any>('/api/v1/crypto/whitelist'),
  createCryptoDepositIntent: (assetId: string, amount: number) =>
    apiClient<any>('/api/v1/crypto/deposit-intents', {
      method: 'POST',
      body: JSON.stringify({ assetId, amount }),
    }),
  requestWithdrawal: (amountMinor: number, destinationAddress: string) =>
    apiClient<any>('/api/v1/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ amountMinor, destinationAddress }),
    }),

  // 11. Safer Gambling
  enforceSaferGambling: (actionType: string, amountGbp?: number, durationDays?: number, reason?: string) =>
    apiClient<any>('/api/v1/me/safer-gambling', {
      method: 'POST',
      body: JSON.stringify({ actionType, amountGbp, durationDays, reason }),
    }),
};
