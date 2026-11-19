namespace ProjectAtlas.Domain.Entities.Identity;

public enum AccountType
{
    PLAYER,
    STAFF
}

public enum UserStatus
{
    ACTIVE,
    SUSPENDED,
    EXCLUDED,
    LOCKED
}

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrganizationId { get; set; } = string.Empty;
    public string? BranchId { get; set; }
    public string EmailNormalized { get; set; } = string.Empty;
    public string? PhoneNormalized { get; set; }
    public string PasswordHashOrIdpRef { get; set; } = string.Empty;
    public AccountType AccountType { get; set; } = AccountType.PLAYER;
    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public PlayerProfile? PlayerProfile { get; set; }
}

public class PlayerProfile
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? DateOfBirthRef { get; set; }
    public string KycStatus { get; set; } = "UNVERIFIED";
    public string Country { get; set; } = "GB";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Role
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? OrganizationId { get; set; }
    public string RoleKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; } = true;
}

public class UserRoleAssignment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
    public string ScopeType { get; set; } = "GLOBAL"; // GLOBAL, ORGANIZATION, BRANCH
    public string? ScopeId { get; set; }
    public string GrantedBy { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndsAt { get; set; }
}
