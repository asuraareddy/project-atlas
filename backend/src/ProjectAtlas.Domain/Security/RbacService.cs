namespace ProjectAtlas.Domain.Security;

public class UserSecurityContext
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = PlatformRoles.Player;
    public string TenantId { get; set; } = string.Empty;
    public string? BranchId { get; set; }
    public string AccountStatus { get; set; } = "ACTIVE"; // ACTIVE, SUSPENDED, RESTRICTED, SELF_EXCLUDED
    public string KycStatus { get; set; } = "UNVERIFIED"; // UNVERIFIED, PENDING, VERIFIED
}

public static class RbacService
{
    private static readonly Dictionary<string, HashSet<string>> RolePermissions = new(StringComparer.OrdinalIgnoreCase)
    {
        [PlatformRoles.SuperAdmin] = new()
        {
            Permissions.GlobalConfig, Permissions.ManageStaffRoles, Permissions.ViewPlayerProfiles,
            Permissions.VerifyIdentityKyc, Permissions.SaferGamblingRestrictions, Permissions.GameCatalogueConfig,
            Permissions.GameResultPublish, Permissions.ViewLedgerTransactions, Permissions.ManageDepositExceptions,
            Permissions.RequestWithdrawalApproval, Permissions.ApproveWithdrawal, Permissions.RequestWalletAdjustment,
            Permissions.ApproveWalletAdjustment, Permissions.ConfigureCryptoQr, Permissions.ManageBranches,
            Permissions.ViewFinancePnl, Permissions.ViewAuditLog, Permissions.HandleSupportComplaints
        },
        [PlatformRoles.OperatorAdmin] = new()
        {
            Permissions.GlobalConfig, Permissions.ManageStaffRoles, Permissions.ViewPlayerProfiles,
            Permissions.VerifyIdentityKyc, Permissions.SaferGamblingRestrictions, Permissions.GameCatalogueConfig,
            Permissions.GameResultPublish, Permissions.ViewLedgerTransactions, Permissions.ManageDepositExceptions,
            Permissions.ApproveWithdrawal, Permissions.ApproveWalletAdjustment, Permissions.ConfigureCryptoQr,
            Permissions.ManageBranches, Permissions.ViewFinancePnl, Permissions.ViewAuditLog, Permissions.HandleSupportComplaints
        },
        [PlatformRoles.Compliance] = new()
        {
            Permissions.ViewPlayerProfiles, Permissions.VerifyIdentityKyc, Permissions.SaferGamblingRestrictions,
            Permissions.ViewAuditLog, Permissions.HandleSupportComplaints
        },
        [PlatformRoles.FinanceManager] = new()
        {
            Permissions.ViewLedgerTransactions, Permissions.ManageDepositExceptions, Permissions.ApproveWithdrawal,
            Permissions.ApproveWalletAdjustment, Permissions.ViewFinancePnl, Permissions.ViewAuditLog
        },
        [PlatformRoles.PaymentsOperator] = new()
        {
            Permissions.ViewLedgerTransactions, Permissions.ManageDepositExceptions,
            Permissions.RequestWithdrawalApproval, Permissions.RequestWalletAdjustment
        },
        [PlatformRoles.GameOperations] = new()
        {
            Permissions.GameCatalogueConfig, Permissions.GameResultPublish, Permissions.ViewAuditLog
        },
        [PlatformRoles.BranchManager] = new()
        {
            Permissions.ViewPlayerProfiles, Permissions.ManageBranches, Permissions.ViewFinancePnl,
            Permissions.HandleSupportComplaints
        },
        [PlatformRoles.StaffSupport] = new()
        {
            Permissions.ViewPlayerProfiles, Permissions.HandleSupportComplaints
        },
        [PlatformRoles.Auditor] = new()
        {
            Permissions.ViewLedgerTransactions, Permissions.ViewFinancePnl, Permissions.ViewAuditLog
        },
        [PlatformRoles.Player] = new(),
        [PlatformRoles.ServiceAccount] = new()
        {
            Permissions.ViewLedgerTransactions, Permissions.ManageDepositExceptions
        }
    };

    public static bool HasPermission(string role, string permission)
    {
        if (RolePermissions.TryGetValue(role, out var perms))
        {
            return perms.Contains(permission);
        }
        return false;
    }

    public static void AssertPermission(UserSecurityContext user, string permission)
    {
        if (!HasPermission(user.Role, permission))
        {
            throw new UnauthorizedAccessException($"ACCESS_DENIED: Role '{user.Role}' lacks permission '{permission}'.");
        }
    }

    public static void AssertScope(UserSecurityContext user, string? targetBranchId)
    {
        if (user.Role == PlatformRoles.SuperAdmin || user.Role == PlatformRoles.OperatorAdmin)
        {
            return;
        }

        if (user.Role == PlatformRoles.BranchManager || user.Role == PlatformRoles.StaffSupport)
        {
            if (string.IsNullOrEmpty(user.BranchId) || user.BranchId != targetBranchId)
            {
                throw new UnauthorizedAccessException($"CROSS_BRANCH_VIOLATION: User in branch '{user.BranchId}' cannot access resource in branch '{targetBranchId}'.");
            }
        }
    }

    public static void AssertPlayerEligibility(UserSecurityContext user)
    {
        if (user.AccountStatus.Equals("SELF_EXCLUDED", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("ACCOUNT_RESTRICTED: Account is currently self-excluded under safer gambling policy.");
        }
        if (user.AccountStatus.Equals("SUSPENDED", StringComparison.OrdinalIgnoreCase) ||
            user.AccountStatus.Equals("RESTRICTED", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"ACCOUNT_RESTRICTED: Account status is '{user.AccountStatus}'. Gambling actions are blocked.");
        }
    }

    /// <summary>
    /// Enforces Maker-Checker dual control:
    /// Prevents self-approval of restricted financial or operational actions (makerId !== checkerId).
    /// </summary>
    public static void VerifyMakerChecker(string makerId, string checkerId)
    {
        if (string.IsNullOrWhiteSpace(checkerId) || makerId.Trim().Equals(checkerId.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("MAKER_CHECKER_VIOLATION: Self-approval is strictly forbidden. A distinct authorized checker is required.");
        }
    }
}
