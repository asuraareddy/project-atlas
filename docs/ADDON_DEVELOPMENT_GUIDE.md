# Project Atlas — Future Addon Development Guide

This guide describes how to author, package, test, and register new plug-and-play addons into the Project Atlas white-label B2B architecture without modifying core platform code.

---

## 1. The Addon Interface Contract

Every addon must implement the `AddonDefinition` interface defined in `src/domain/addons/types.ts`:

```typescript
export interface AddonDefinition {
  id: string;                         // Unique lowercase slug e.g. 'poker'
  name: string;                       // Display name e.g. 'Texas Holdem Poker'
  version: string;                    // Semantic version e.g. '1.0.0'
  category: AddonCategory;            // 'SPORTS' | 'CASINO' | 'SKILL_GAMES' | 'LOTTERY_DRAWS' | 'SERVICES'
  status: AddonStatus;                // 'ACTIVE' | 'INACTIVE' | 'BETA' | 'MAINTENANCE'
  description: string;
  iconName: string;                   // Lucide icon name
  routePrefix: string;                // Base frontend route e.g. '/poker'
  routes: string[];                   // List of routes belonging to this addon
  apiPrefix: string;                  // Base backend API route e.g. '/api/v1/games/poker'
  requiredPermissions: string[];      // RBAC permissions required
  dependentServices: string[];        // Infrastructure dependencies
  configurationSchema: Record<string, AddonConfigField>;
  healthCheckEndpoint: string;
  providerRequirements: string[];     // Registered external providers
  navigation: AddonNavigationItem;
  tenantAvailability: {
    supportedPackages: string[];
    defaultEnabled: boolean;
  };
  lifecycle?: AddonLifecycleHooks;
}
```

---

## 2. Step-by-Step Tutorial: Creating a New Addon (e.g. `poker`)

### Step 1: Create Domain Adapter & Engine
Create the isolated backend domain logic under `src/domain/games/poker/`:
```
src/domain/games/poker/
├── types.ts          # State, hand evaluation, betting rounds
├── engine.ts         # Deterministic card deck & pot calculations
└── adapter.ts        # Provider connection (e.g. EvenBet / in-house)
```

### Step 2: Create API Endpoints
Create routes under `src/app/api/v1/games/poker/`:
- `src/app/api/v1/games/poker/tables/route.ts`
- `src/app/api/v1/games/poker/health/route.ts`

Each endpoint must call `AddonRegistry.assertTenantAddonAccess(tenantId, 'poker')` to enforce tenant entitlements.

### Step 3: Create Frontend Page & Components
Create pages under `src/app/poker/`:
- `src/app/poker/page.tsx`
- `src/components/poker/TableCanvas.tsx`

### Step 4: Register with `AddonRegistry`
In `src/domain/addons/registry.ts`, invoke `AddonRegistry.register()`:
```typescript
AddonRegistry.register({
  id: 'poker',
  name: 'Pro Texas Holdem Lounge',
  version: '1.0.0',
  category: 'SKILL_GAMES',
  status: 'ACTIVE',
  description: 'Multi-table Texas Holdem and Omaha with certified RNG shuffling.',
  iconName: 'Club',
  routePrefix: '/poker',
  routes: ['/poker', '/poker/[tableId]'],
  apiPrefix: '/api/v1/games/poker',
  requiredPermissions: ['POKER_PLAY'],
  dependentServices: ['poker_rng_engine'],
  configurationSchema: {
    rakePercentage: {
      type: 'number',
      label: 'Table Rake (%)',
      description: 'Platform commission taken per settled pot',
      required: true,
      default: 4.0,
    },
  },
  healthCheckEndpoint: '/api/v1/games/poker/health',
  providerRequirements: ['prov_inhouse_poker_engine'],
  navigation: {
    label: 'Poker',
    path: '/poker',
    icon: 'Club',
    order: 30,
    badge: 'Tournaments',
  },
  tenantAvailability: {
    supportedPackages: ['COMPLETE_PRO_SUITE', 'CUSTOM'],
    defaultEnabled: false,
  },
});
```

---

## 3. Dynamic Lifecycle Hooks

Addons can optionally declare lifecycle hooks:
```typescript
lifecycle: {
  onInstall: async (tenantId, config) => {
    // Run tenant-specific provisioning or allocate table rooms
  },
  onActivate: async (tenantId) => {
    // Notify provider webhook or initialize game instance
  },
  onDeactivate: async (tenantId) => {
    // Gracefully finish active player hands
  },
  onUninstall: async (tenantId) => {
    // Archive hand histories and audit records
  },
}
```

---

## 4. Architectural Rules for Addon Isolation

1. **Zero Cross-Addon Pollution**: An addon cannot directly import or modify private state belonging to another addon.
2. **Double-Entry Financial Transactions**: All monetary balance interactions must go through `src/domain/wallet/ledger.ts`.
3. **Server-Side Enforcement**: Route access is verified by Next.js middleware using `AddonRegistry.matchAddonByPath()`.
4. **Independent Versioning**: Updating an addon's semantic version does not require updating unrelated addons.

