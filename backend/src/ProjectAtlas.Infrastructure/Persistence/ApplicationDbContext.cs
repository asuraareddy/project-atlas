using Microsoft.EntityFrameworkCore;
using ProjectAtlas.Domain.Entities.Tenancy;
using ProjectAtlas.Domain.Entities.Identity;
using ProjectAtlas.Domain.Entities.Ledger;
using ProjectAtlas.Domain.Entities.Payments;
using ProjectAtlas.Domain.Entities.Providers;
using ProjectAtlas.Domain.Entities.AuditAndCompliance;
using ProjectAtlas.Domain.Entities.Games;

namespace ProjectAtlas.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Tenancy
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantDomain> TenantDomains => Set<TenantDomain>();
    public DbSet<TenantGameEntitlement> TenantGameEntitlements => Set<TenantGameEntitlement>();

    // Identity & RBAC
    public DbSet<User> Users => Set<User>();
    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRoleAssignment> UserRoleAssignments => Set<UserRoleAssignment>();

    // Double-Entry Ledger & Wallets
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<LedgerAccount> LedgerAccounts => Set<LedgerAccount>();
    public DbSet<LedgerTransaction> LedgerTransactions => Set<LedgerTransaction>();
    public DbSet<LedgerEntry> LedgerEntries => Set<LedgerEntry>();

    // Payments & Crypto
    public DbSet<CryptoDepositIntent> CryptoDepositIntents => Set<CryptoDepositIntent>();
    public DbSet<WithdrawalRequest> WithdrawalRequests => Set<WithdrawalRequest>();
    public DbSet<PaymentGatewayConfig> PaymentGatewayConfigs => Set<PaymentGatewayConfig>();
    public DbSet<ApiProviderConfig> ApiProviderConfigs => Set<ApiProviderConfig>();

    // Games & Sessions
    public DbSet<GameProvider> GameProviders => Set<GameProvider>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<GameSession> GameSessions => Set<GameSession>();
    public DbSet<GameParticipation> GameParticipations => Set<GameParticipation>();

    // Compliance & Auditing
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<AccountRestriction> AccountRestrictions => Set<AccountRestriction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Tenant>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasIndex(t => t.Slug).IsUnique();
            b.OwnsOne(t => t.Branding);
            b.OwnsOne(t => t.PointConfig);
        });

        modelBuilder.Entity<TenantDomain>(b =>
        {
            b.HasKey(d => d.Id);
            b.HasIndex(d => d.Hostname).IsUnique();
        });

        modelBuilder.Entity<TenantGameEntitlement>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasIndex(e => new { e.TenantId, e.GameKey }).IsUnique();
        });

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.EmailNormalized).IsUnique();
        });

        modelBuilder.Entity<PlayerProfile>(b =>
        {
            b.HasKey(p => p.UserId);
        });

        modelBuilder.Entity<Wallet>(b =>
        {
            b.HasKey(w => w.Id);
            b.HasIndex(w => new { w.UserId, w.Currency }).IsUnique();
        });

        modelBuilder.Entity<LedgerAccount>(b =>
        {
            b.HasKey(a => a.Id);
            b.HasIndex(a => new { a.TenantId, a.AccountCode }).IsUnique();
        });

        modelBuilder.Entity<LedgerTransaction>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasIndex(t => t.IdempotencyKey).IsUnique();
        });

        modelBuilder.Entity<CryptoDepositIntent>(b =>
        {
            b.HasKey(i => i.Id);
            b.HasIndex(i => i.IdempotencyKey).IsUnique();
        });

        modelBuilder.Entity<ApprovalRequest>(b =>
        {
            b.HasKey(a => a.Id);
        });

        modelBuilder.Entity<AuditEvent>(b =>
        {
            b.HasKey(a => a.Id);
        });
    }

    public static void SeedDatabase(ApplicationDbContext context)
    {
        if (context.Tenants.Any()) return;

        // 1. Project Atlas Global (Full Suite)
        var atlas = new Tenant
        {
            Id = "org_atlas_uk_001",
            Slug = "atlas",
            Name = "Project Atlas Global Ltd",
            PackageCode = "COMPLETE_PRO_SUITE",
            ContactEmail = "admin@atlasgaming.uk",
            Branding = new TenantBranding
            {
                BrandName = "PROJECT ATLAS",
                Tagline = "Multi-Gaming B2B Enterprise Platform",
                PrimaryColor = "#7e0ac2",
                PrimaryColorHover = "#9a13e6",
                SecondaryColor = "#b45df0",
                BackgroundColor = "#1f1f1f",
                TextColor = "#ffffff",
                HeroHeading = "Next-Gen Multi-Gaming & Skill Lounge",
                HeroSubheading = "Certified transparent gameplay, instant crypto QR deposits, and double-entry settlements."
            }
        };

        // 2. Ambaari999 (Client-Specific Domain: Sports & Casino Exclusively)
        var ambaari = new Tenant
        {
            Id = "ten_ambaari_001",
            Slug = "ambaari999",
            Name = "Ambaari 999 Entertainment Ltd",
            PackageCode = "CUSTOM",
            ContactEmail = "support@ambaari999.com",
            Branding = new TenantBranding
            {
                BrandName = "AMBAARI999",
                Tagline = "Premium Sports Exchange & Live Casino",
                PrimaryColor = "#0088CC",
                PrimaryColorHover = "#006699",
                SecondaryColor = "#33AAFF",
                BackgroundColor = "#0a0a0c",
                TextColor = "#ffffff",
                LayoutTheme = "ambaari",
                HeroHeading = "India's Premier Sports & Casino Experience",
                HeroSubheading = "Live Betfair Cricket Exchange and Luxury Vegas Casino Tables."
            }
        };

        // 3. Kalyan Club (Matka ONLY)
        var kalyan = new Tenant
        {
            Id = "ten_kalyan_001",
            Slug = "kalyan-club",
            Name = "Kalyan Club International Ltd",
            PackageCode = "MATKA_ONLY",
            ContactEmail = "contact@kalyanclub.com",
            Branding = new TenantBranding
            {
                BrandName = "KALYAN CLUB",
                Tagline = "Premier Number Draw & Satta Results Lounge",
                PrimaryColor = "#f59e0b",
                SecondaryColor = "#fbbf24"
            }
        };

        // 4. Board Masters (Matka + Ludo)
        var board = new Tenant
        {
            Id = "ten_board_002",
            Slug = "board-masters",
            Name = "Board Masters Gaming Group",
            PackageCode = "MATKA_LUDO",
            ContactEmail = "hello@boardmasters.uk",
            Branding = new TenantBranding
            {
                BrandName = "BOARD MASTERS",
                PrimaryColor = "#10b981",
                SecondaryColor = "#34d399"
            }
        };

        // 5. Pro Cue Lounge (Carrom + Pool)
        var procue = new Tenant
        {
            Id = "ten_cue_003",
            Slug = "pro-cue",
            Name = "Pro Cue & Tabletop Lounge Ltd",
            PackageCode = "CUSTOM",
            ContactEmail = "club@procue.com",
            Branding = new TenantBranding
            {
                BrandName = "PRO CUE LOUNGE",
                PrimaryColor = "#0284c7",
                SecondaryColor = "#38bdf8"
            }
        };

        // 6. Apex Sports (Sports ONLY)
        var apex = new Tenant
        {
            Id = "ten_sports_only",
            Slug = "apex-sports",
            Name = "Apex Sports Exchange Ltd",
            PackageCode = "CUSTOM",
            ContactEmail = "desk@apexsports.bet",
            Branding = new TenantBranding
            {
                BrandName = "APEX SPORTS",
                PrimaryColor = "#2563eb",
                SecondaryColor = "#60a5fa"
            }
        };

        // 7. Royal Casino (Casino ONLY)
        var royal = new Tenant
        {
            Id = "ten_casino_only",
            Slug = "royal-casino",
            Name = "Royal Casino Lounge Ltd",
            PackageCode = "CASINO_SUITE",
            ContactEmail = "vip@royalcasino.live",
            Branding = new TenantBranding
            {
                BrandName = "ROYAL CASINO",
                PrimaryColor = "#dc2626",
                SecondaryColor = "#f87171"
            }
        };

        // 8. Titan Gaming (Sports & Casino)
        var titan = new Tenant
        {
            Id = "ten_hybrid_001",
            Slug = "titan-gaming",
            Name = "Titan Gaming Group Ltd",
            PackageCode = "COMPLETE_PRO_SUITE",
            ContactEmail = "contact@titangaming.vip",
            Branding = new TenantBranding
            {
                BrandName = "TITAN GAMING",
                PrimaryColor = "#7c3aed",
                SecondaryColor = "#a78bfa"
            }
        };

        context.Tenants.AddRange(atlas, ambaari, kalyan, board, procue, apex, royal, titan);

        // Seed Domains
        context.TenantDomains.AddRange(
            new TenantDomain { TenantId = atlas.Id, Hostname = "localhost", IsPrimary = true },
            new TenantDomain { TenantId = atlas.Id, Hostname = "127.0.0.1", IsPrimary = false },
            new TenantDomain { TenantId = atlas.Id, Hostname = "platform.atlasgaming.uk", IsPrimary = false },
            new TenantDomain { TenantId = ambaari.Id, Hostname = "ambaari999.com", IsPrimary = true },
            new TenantDomain { TenantId = apex.Id, Hostname = "apexsports.bet", IsPrimary = true },
            new TenantDomain { TenantId = royal.Id, Hostname = "royalcasino.live", IsPrimary = true },
            new TenantDomain { TenantId = kalyan.Id, Hostname = "kalyanclub.com", IsPrimary = true },
            new TenantDomain { TenantId = titan.Id, Hostname = "titangaming.vip", IsPrimary = true }
        );

        // Seed Entitlements for Atlas (Full Suite: 4 ordered categories)
        context.TenantGameEntitlements.AddRange(
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "matka", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "sports", IsEnabled = true, DisplayOrder = 3, CustomBadge = "Category 3" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "other-games", IsEnabled = true, DisplayOrder = 4, CustomBadge = "Category 4" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "carrom", IsEnabled = true, DisplayOrder = 5, CustomBadge = "Category 4" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "ludo", IsEnabled = true, DisplayOrder = 6, CustomBadge = "Category 4" },
            new TenantGameEntitlement { TenantId = atlas.Id, GameKey = "pool", IsEnabled = true, DisplayOrder = 7, CustomBadge = "Category 4" }
        );

        // Seed Entitlements for Ambaari (Sports & Casino Exclusively)
        context.TenantGameEntitlements.AddRange(
            new TenantGameEntitlement { TenantId = ambaari.Id, GameKey = "sports", IsEnabled = true, DisplayOrder = 1, CustomBadge = "Category 1" },
            new TenantGameEntitlement { TenantId = ambaari.Id, GameKey = "casino", IsEnabled = true, DisplayOrder = 2, CustomBadge = "Category 2" },
            new TenantGameEntitlement { TenantId = ambaari.Id, GameKey = "matka", IsEnabled = false, DisplayOrder = 3 },
            new TenantGameEntitlement { TenantId = ambaari.Id, GameKey = "other-games", IsEnabled = false, DisplayOrder = 4 }
        );

        context.SaveChanges();
    }
}
