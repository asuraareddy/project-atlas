/**
 * Project Atlas — B2B White-Label SaaS Acceptance Test Suite
 * Validates all 14 Mandatory Acceptance Test Scenarios in Section 13:
 * 
 * 1. Create three independent test tenants.
 * 2. Assign Sports only to Tenant A.
 * 3. Assign Casino only to Tenant B.
 * 4. Assign both Sports and Casino to Tenant C.
 * 5. Confirm that each tenant sees only its enabled addons.
 * 6. Confirm that each tenant has independent branding.
 * 7. Confirm that custom domains resolve to the correct tenant.
 * 8. Confirm disabled addons cannot be accessed directly (hard server-side 403).
 * 9. Confirm Tenant A cannot access Tenant B's data (isolation).
 * 10. Confirm changing addon configuration does not require a code deployment.
 * 11. Confirm Sports and Casino operate independently.
 * 12. Confirm existing functionality is not broken.
 * 13. Confirm future addons can follow the documented addon interface.
 * 14. Run security, integration, and production-build tests.
 */

import assert from 'node:assert/strict';
import { TenantStore } from '../src/domain/tenant/store.ts';
import { AddonRegistry } from '../src/domain/addons/registry.ts';
import { GameRegistry } from '../src/domain/games/registry.ts';

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log(' WHITE-LABEL B2B PLATFORM — MANDATORY ACCEPTANCE TESTS');
console.log('======================================================\n');

// Reset store to deterministic seed
TenantStore.resetToDefaults();

// ------------------------------------------------------------------
// Scenario 1: Three Independent Test Tenants Exist
// ------------------------------------------------------------------
console.log('[Scenario 1: Three Independent Test Tenants]');

test('Tenant A (Apex Sports), Tenant B (Royal Casino), and Tenant C (Titan Gaming) exist in registry', () => {
  const tenantA = TenantStore.getTenantById('ten_sports_only');
  const tenantB = TenantStore.getTenantById('ten_casino_only');
  const tenantC = TenantStore.getTenantById('ten_hybrid_001');

  assert.ok(tenantA, 'Tenant A must exist');
  assert.ok(tenantB, 'Tenant B must exist');
  assert.ok(tenantC, 'Tenant C must exist');

  assert.equal(tenantA.slug, 'apex-sports');
  assert.equal(tenantB.slug, 'royal-casino');
  assert.equal(tenantC.slug, 'titan-gaming');
});

// ------------------------------------------------------------------
// Scenario 2: Tenant A has Sports ONLY
// ------------------------------------------------------------------
console.log('\n[Scenario 2: Tenant A Addon Allocation]');

test('Tenant A has Sports enabled and Casino disabled', () => {
  const enabledGames = TenantStore.getEnabledGamesForTenant('ten_sports_only');
  assert.ok(enabledGames.includes('sports'), 'Tenant A must have sports enabled');
  assert.ok(!enabledGames.includes('casino'), 'Tenant A must NOT have casino enabled');
  assert.equal(enabledGames.length, 1, 'Tenant A must only have 1 addon active');
});

// ------------------------------------------------------------------
// Scenario 3: Tenant B has Casino ONLY
// ------------------------------------------------------------------
console.log('\n[Scenario 3: Tenant B Addon Allocation]');

test('Tenant B has Casino enabled and Sports disabled', () => {
  const enabledGames = TenantStore.getEnabledGamesForTenant('ten_casino_only');
  assert.ok(enabledGames.includes('casino'), 'Tenant B must have casino enabled');
  assert.ok(!enabledGames.includes('sports'), 'Tenant B must NOT have sports enabled');
  assert.equal(enabledGames.length, 1, 'Tenant B must only have 1 addon active');
});

// ------------------------------------------------------------------
// Scenario 4: Tenant C has BOTH Sports and Casino
// ------------------------------------------------------------------
console.log('\n[Scenario 4: Tenant C Addon Allocation]');

test('Tenant C has both Sports and Casino enabled', () => {
  const enabledGames = TenantStore.getEnabledGamesForTenant('ten_hybrid_001');
  assert.ok(enabledGames.includes('sports'), 'Tenant C must have sports enabled');
  assert.ok(enabledGames.includes('casino'), 'Tenant C must have casino enabled');
  assert.ok(!enabledGames.includes('matka'), 'Tenant C does not have legacy matka enabled');
});

// ------------------------------------------------------------------
// Scenario 5: Dynamic Navigation & Category Visibility
// ------------------------------------------------------------------
console.log('\n[Scenario 5: Dynamic Addon Visibility]');

test('Tenant A navigation sees only Sports addon', () => {
  const addonsA = AddonRegistry.getAddonsForTenant('ten_sports_only');
  const addonIdsA = addonsA.map((a) => a.id);
  assert.deepEqual(addonIdsA, ['sports']);
});

test('Tenant B navigation sees only Casino addon', () => {
  const addonsB = AddonRegistry.getAddonsForTenant('ten_casino_only');
  const addonIdsB = addonsB.map((a) => a.id);
  assert.deepEqual(addonIdsB, ['casino']);
});

test('Tenant C navigation sees both Sports and Casino addons', () => {
  const addonsC = AddonRegistry.getAddonsForTenant('ten_hybrid_001');
  const addonIdsC = addonsC.map((a) => a.id);
  assert.ok(addonIdsC.includes('sports'));
  assert.ok(addonIdsC.includes('casino'));
});

// ------------------------------------------------------------------
// Scenario 6: Independent Branding & Design Tokens
// ------------------------------------------------------------------
console.log('\n[Scenario 6: Independent Branding & Theme Tokens]');

test('Each tenant possesses distinct, independent brand styling', () => {
  const tenantA = TenantStore.getTenantById('ten_sports_only');
  const tenantB = TenantStore.getTenantById('ten_casino_only');
  const tenantC = TenantStore.getTenantById('ten_hybrid_001');

  // Verify Brand Names
  assert.equal(tenantA.branding.brandName, 'APEX SPORTS');
  assert.equal(tenantB.branding.brandName, 'ROYAL CASINO');
  assert.equal(tenantC.branding.brandName, 'TITAN GAMING');

  // Verify Distinct Color Palettes
  assert.notEqual(tenantA.branding.primaryColor, tenantB.branding.primaryColor);
  assert.notEqual(tenantB.branding.primaryColor, tenantC.branding.primaryColor);
  assert.equal(tenantA.branding.primaryColor, '#2563eb'); // Blue
  assert.equal(tenantB.branding.primaryColor, '#dc2626'); // Red
  assert.equal(tenantC.branding.primaryColor, '#7c3aed'); // Purple

  // Verify Distinct Hero Headings
  assert.ok(tenantA.branding.heroHeading.includes('Cricket'));
  assert.ok(tenantB.branding.heroHeading.includes('Casino'));
  assert.ok(tenantC.branding.heroHeading.includes('Hybrid'));
});

// ------------------------------------------------------------------
// Scenario 7: Custom Domain Resolution
// ------------------------------------------------------------------
console.log('\n[Scenario 7: Custom Domain Resolution]');

test('apexsports.bet resolves directly to Tenant A (Apex Sports)', () => {
  const resolved = TenantStore.resolveTenantByHost('apexsports.bet');
  assert.equal(resolved.id, 'ten_sports_only');
  assert.equal(resolved.slug, 'apex-sports');
});

test('royalcasino.live resolves directly to Tenant B (Royal Casino)', () => {
  const resolved = TenantStore.resolveTenantByHost('royalcasino.live');
  assert.equal(resolved.id, 'ten_casino_only');
  assert.equal(resolved.slug, 'royal-casino');
});

test('titangaming.vip resolves directly to Tenant C (Titan Gaming)', () => {
  const resolved = TenantStore.resolveTenantByHost('titangaming.vip');
  assert.equal(resolved.id, 'ten_hybrid_001');
  assert.equal(resolved.slug, 'titan-gaming');
});

test('www.ambaari999.com and ambaari999.com resolve to Ambaari Client Tenant (ten_ambaari_001)', () => {
  const resolvedWww = TenantStore.resolveTenantByHost('www.ambaari999.com');
  const resolvedApex = TenantStore.resolveTenantByHost('ambaari999.com');
  assert.equal(resolvedWww.id, 'ten_ambaari_001');
  assert.equal(resolvedApex.id, 'ten_ambaari_001');
  assert.equal(resolvedWww.slug, 'ambaari999');
  assert.equal(resolvedWww.branding.brandName, 'AMBAARI999');
  assert.equal(resolvedWww.branding.primaryColor, '#0088CC');
  assert.equal(resolvedWww.branding.secondaryColor, '#2C3E50');
  assert.equal(resolvedWww.branding.layoutTheme, 'ambaari');
});

test('Ambaari999 client domain has ONLY Sports and Casino enabled', () => {
  const games = TenantStore.getEnabledGamesForTenant('ten_ambaari_001');
  assert.ok(games.includes('sports'));
  assert.ok(games.includes('casino'));
  assert.ok(!games.includes('matka'));
  assert.ok(!games.includes('carrom'));
  assert.ok(!games.includes('ludo'));
  assert.ok(!games.includes('pool'));
  assert.equal(games.length, 2);
});

test('Ambaari999 is blocked from Matka, Carrom, Ludo with 403 Forbidden', () => {
  assert.throws(
    () => AddonRegistry.assertTenantAddonAccess('ten_ambaari_001', 'matka'),
    (err) => err.statusCode === 403
  );
  assert.throws(
    () => AddonRegistry.assertTenantAddonAccess('ten_ambaari_001', 'ludo'),
    (err) => err.statusCode === 403
  );
});

test('Subdomain fallback (e.g. apex-sports.platform.com) resolves correctly', () => {
  const resolved = TenantStore.resolveTenantByHost('apex-sports.projectatlas.com');
  assert.equal(resolved.id, 'ten_sports_only');
});

// ------------------------------------------------------------------
// Scenario 8: Server-Side Gating Blocks Disabled Addons (Hard 403)
// ------------------------------------------------------------------
console.log('\n[Scenario 8: Server-Side Route Gating & 403 Protection]');

test('Tenant A is strictly blocked from accessing Casino addon routes', () => {
  assert.throws(
    () => {
      AddonRegistry.assertTenantAddonAccess('ten_sports_only', 'casino');
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.ok(err.message.includes('casino'));
      return true;
    }
  );
});

test('Tenant B is strictly blocked from accessing Sports addon routes', () => {
  assert.throws(
    () => {
      AddonRegistry.assertTenantAddonAccess('ten_casino_only', 'sports');
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.ok(err.message.includes('sports'));
      return true;
    }
  );
});

test('Tenant C is allowed access to both Sports and Casino without error', () => {
  assert.doesNotThrow(() => {
    AddonRegistry.assertTenantAddonAccess('ten_hybrid_001', 'sports');
    AddonRegistry.assertTenantAddonAccess('ten_hybrid_001', 'casino');
  });
});

test('Path matching accurately maps URL to target addon', () => {
  const matchSports = AddonRegistry.matchAddonByPath('/sports/cricket_ind_aus_2026');
  const matchCasino = AddonRegistry.matchAddonByPath('/casino/sandbox-frame');
  const matchSportsApi = AddonRegistry.matchAddonByPath('/api/v1/games/sports/events');
  const matchCasinoApi = AddonRegistry.matchAddonByPath('/api/v1/games/casino/catalogue');

  assert.equal(matchSports?.id, 'sports');
  assert.equal(matchCasino?.id, 'casino');
  assert.equal(matchSportsApi?.id, 'sports');
  assert.equal(matchCasinoApi?.id, 'casino');
});

// ------------------------------------------------------------------
// Scenario 9: Tenant Isolation (Tenant A cannot access Tenant B data)
// ------------------------------------------------------------------
console.log('\n[Scenario 9: Strict Cross-Tenant Data Isolation]');

test('Tenant A access to Tenant B resource throws security violation', () => {
  assert.throws(
    () => {
      TenantStore.assertTenantIsolation('ten_sports_only', 'ten_casino_only');
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.ok(err.message.includes('SECURITY_VIOLATION_TENANT_ISOLATION'));
      return true;
    }
  );
});

test('Same-tenant access succeeds without violation', () => {
  assert.doesNotThrow(() => {
    TenantStore.assertTenantIsolation('ten_sports_only', 'ten_sports_only');
  });
});

// ------------------------------------------------------------------
// Scenario 10: Dynamic Configuration Mutation Without Code Deployment
// ------------------------------------------------------------------
console.log('\n[Scenario 10: Zero-Deployment Addon Reconfiguration]');

test('Admin can dynamically enable Casino on Tenant A without restarting or deploying', () => {
  const tenantA = TenantStore.getTenantById('ten_sports_only');
  assert.ok(tenantA);

  // Enable Casino dynamically
  tenantA.gameConfigs = tenantA.gameConfigs.map((cfg) =>
    cfg.gameKey === 'casino' ? { ...cfg, isEnabled: true } : cfg
  );
  TenantStore.saveTenant(tenantA);

  // Check immediately
  const isCasinoNowAllowed = TenantStore.isGameEnabledForTenant('ten_sports_only', 'casino');
  assert.equal(isCasinoNowAllowed, true, 'Casino should be immediately accessible');

  // Revert back for consistency
  tenantA.gameConfigs = tenantA.gameConfigs.map((cfg) =>
    cfg.gameKey === 'casino' ? { ...cfg, isEnabled: false } : cfg
  );
  TenantStore.saveTenant(tenantA);
  assert.equal(TenantStore.isGameEnabledForTenant('ten_sports_only', 'casino'), false);
});

// ------------------------------------------------------------------
// Scenario 11: Sports and Casino Operate Independently
// ------------------------------------------------------------------
console.log('\n[Scenario 11: Independent Addon Operation]');

test('Sports and Casino addons have independent categories, versions, and providers', () => {
  const sports = AddonRegistry.getAddon('sports');
  const casino = AddonRegistry.getAddon('casino');

  assert.ok(sports);
  assert.ok(casino);

  assert.equal(sports.category, 'SPORTS');
  assert.equal(casino.category, 'CASINO');

  assert.notEqual(sports.version, casino.version);
  assert.notDeepEqual(sports.providerRequirements, casino.providerRequirements);
  assert.equal(sports.providerRequirements[0], 'prov_betfair_api_ng');
  assert.equal(casino.providerRequirements[0], 'prov_flexrix_casino_api');
});

// ------------------------------------------------------------------
// Scenario 12: Existing Functionality Preserved
// ------------------------------------------------------------------
console.log('\n[Scenario 12: Existing Functionality Preservation]');

test('Platform default tenant retains access to full catalog including Matka, Carrom, Ludo, Pool', () => {
  const atlasGames = TenantStore.getEnabledGamesForTenant('org_atlas_uk_001');
  assert.ok(atlasGames.includes('matka'));
  assert.ok(atlasGames.includes('carrom'));
  assert.ok(atlasGames.includes('ludo'));
  assert.ok(atlasGames.includes('pool'));
  assert.ok(atlasGames.includes('casino'));
  assert.ok(atlasGames.includes('sports'));
});

// ------------------------------------------------------------------
// Scenario 13: Future Addons Follow Documented Interface
// ------------------------------------------------------------------
console.log('\n[Scenario 13: Future Addon Plug-and-Play Registration]');

test('Can register a new modular addon (e.g. Poker) dynamically following the interface', () => {
  AddonRegistry.register({
    id: 'poker',
    name: 'Pro Texas Holdem Lounge',
    version: '1.0.0',
    category: 'SKILL_GAMES',
    status: 'ACTIVE',
    description: 'Multi-table Texas Holdem and Omaha with certified RNG shuffling.',
    iconName: 'Club',
    routePrefix: '/poker',
    routes: ['/poker', '/poker/[id]'],
    apiPrefix: '/api/v1/games/poker',
    requiredPermissions: ['POKER_PLAY'],
    dependentServices: ['poker_rng_engine'],
    configurationSchema: {},
    healthCheckEndpoint: '/api/v1/games/poker/health',
    providerRequirements: ['prov_inhouse_poker_engine'],
    navigation: {
      label: 'Poker',
      path: '/poker',
      icon: 'Club',
      order: 30,
    },
    tenantAvailability: {
      supportedPackages: ['COMPLETE_PRO_SUITE'],
      defaultEnabled: false,
    },
  });

  const registered = AddonRegistry.getAddon('poker');
  assert.ok(registered, 'Poker must be successfully registered');
  assert.equal(registered.name, 'Pro Texas Holdem Lounge');
  assert.equal(registered.category, 'SKILL_GAMES');
});

// ------------------------------------------------------------------
// Scenario 14: Health Checks & Diagnostics
// ------------------------------------------------------------------
console.log('\n[Scenario 14: Health Check Diagnostics]');

asyncTest('Addon health check returns healthy status and metrics', async () => {
  const sportsHealth = await AddonRegistry.checkHealth('sports');
  const casinoHealth = await AddonRegistry.checkHealth('casino');

  assert.equal(sportsHealth.status, 'HEALTHY');
  assert.equal(casinoHealth.status, 'HEALTHY');
  assert.ok(typeof sportsHealth.latencyMs === 'number');
});

// ------------------------------------------------------------------
// Scenario 15: Ambaari999 Master Security, Domain Shielding & Isolation
// ------------------------------------------------------------------
console.log('\n[Scenario 15: Ambaari999 Master Security, Domain Shielding & Isolation]');

test('Ambaari domain ignores unverified ?tenant= override query parameter (anti-hijacking)', () => {
  const ctx = TenantStore.getTenantContext('www.ambaari999.com', 'kalyan-club');
  assert.equal(ctx.tenantId, 'ten_ambaari_001', 'Must strictly stay ten_ambaari_001 even if query param requested kalyan-club');
  assert.equal(ctx.tenantSlug, 'ambaari999');
});

test('Apex Sports domain ignores unverified ?tenant= override query parameter', () => {
  const ctx = TenantStore.getTenantContext('apexsports.bet', 'royal-casino');
  assert.equal(ctx.tenantId, 'ten_sports_only', 'Custom domain apexsports.bet must never switch to royal-casino');
});

test('Ambaari customer experience has zero TenantSwitcher in AmbaariHeader', async () => {
  const fs = await import('node:fs');
  const headerContent = fs.readFileSync('D:/project-atlas/src/components/ambaari/AmbaariHeader.tsx', 'utf-8');
  assert.ok(!headerContent.includes('<TenantSwitcher'), 'AmbaariHeader must NOT contain TenantSwitcher');
  assert.ok(!headerContent.includes("from '@/components/tenant/TenantSwitcher'"), 'AmbaariHeader must not import TenantSwitcher');
});

test('Shared Header strictly conceals TenantSwitcher and B2B Tenants on client domains', async () => {
  const fs = await import('node:fs');
  const layoutHeaderContent = fs.readFileSync('D:/project-atlas/src/components/layout/Header.tsx', 'utf-8');
  assert.ok(layoutHeaderContent.includes("tenantSlug === 'atlas'"), 'TenantSwitcher must only be rendered for default atlas platform tenant');
});

test('Ambaari tenant branding has exact colors (#0088CC, #2C3E50) and layoutTheme ambaari', () => {
  const tenant = TenantStore.getTenantById('ten_ambaari_001');
  assert.equal(tenant.branding.primaryColor, '#0088CC');
  assert.equal(tenant.branding.secondaryColor, '#2C3E50');
  assert.equal(tenant.branding.layoutTheme, 'ambaari');
});

// ------------------------------------------------------------------
// Scenario 16: 20+ Independent Client Tenant Onboarding Scale Verification
// ------------------------------------------------------------------
console.log('\n[Scenario 16: 20+ Independent Client Tenant Onboarding Scale Verification]');

test('Platform seamlessly scales to 20+ independently branded client tenants', () => {
  for (let i = 1; i <= 20; i++) {
    const slug = `client${String(i).padStart(2, '0')}`;
    const tenantId = `ten_${slug}`;
    const domain = `${slug}.com`;
    const brandName = `BRAND ${String(i).padStart(2, '0')}`;
    const color = `#${((i * 1234567) % 0xFFFFFF).toString(16).padStart(6, '0')}`;

    const newTenant = {
      id: tenantId,
      slug,
      name: `${brandName} Corp`,
      status: 'ACTIVE',
      packageCode: i % 2 === 0 ? 'MATKA_LUDO' : 'CASINO_SUITE',
      contactEmail: `admin@${domain}`,
      branding: {
        brandName,
        tagline: `Premium Lounge ${i}`,
        logoUrl: `/icons/${slug}-logo.png`,
        faviconUrl: '/favicon.ico',
        primaryColor: color,
        primaryColorHover: color,
        secondaryColor: '#1f2937',
        backgroundColor: '#121212',
        textColor: '#ffffff',
        accentGlowColor: `${color}66`,
        heroHeading: `Welcome to ${brandName}`,
        heroSubheading: 'Verified fair gaming lounge',
        footerText: `© 2026 ${brandName}. All rights reserved.`,
        supportEmail: `support@${domain}`,
      },
      domains: [
        {
          id: `dom_${slug}`,
          tenantId,
          hostname: domain,
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: `v_${slug}`,
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'sports', isEnabled: i % 3 === 0, displayOrder: 1 },
        { gameKey: 'casino', isEnabled: i % 2 === 0, displayOrder: 2 },
        { gameKey: 'matka', isEnabled: true, displayOrder: 3 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TenantStore.saveTenant(newTenant);

    // Verify resolution by domain
    const resolved = TenantStore.resolveTenantByHost(domain);
    assert.equal(resolved.id, tenantId, `Domain ${domain} must resolve to ${tenantId}`);
    assert.equal(resolved.branding.brandName, brandName, `Domain ${domain} must have brandName ${brandName}`);
    assert.equal(resolved.branding.primaryColor, color, `Domain ${domain} must have primary color ${color}`);
  }

  // Confirm total registered tenants is now at least 28 (8 baseline + 20 onboarded)
  const allTenants = TenantStore.getAllTenants();
  assert.ok(allTenants.length >= 28, `Total tenants should be >= 28, got ${allTenants.length}`);
});

// ------------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------------
console.log('\n======================================================');
console.log(` ACCEPTANCE TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
}

