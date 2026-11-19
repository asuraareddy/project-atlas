namespace ProjectAtlas.Domain.Security;

public static class PlatformRoles
{
    public const string SuperAdmin = "SUPER_ADMIN";
    public const string OperatorAdmin = "OPERATOR_ADMIN";
    public const string Compliance = "COMPLIANCE";
    public const string FinanceManager = "FINANCE_MANAGER";
    public const string PaymentsOperator = "PAYMENTS_OPERATOR";
    public const string GameOperations = "GAME_OPERATIONS";
    public const string BranchManager = "BRANCH_MANAGER";
    public const string StaffSupport = "STAFF_SUPPORT";
    public const string Auditor = "AUDITOR";
    public const string Player = "PLAYER";
    public const string ServiceAccount = "SERVICE_ACCOUNT";
}

public static class Permissions
{
    public const string GlobalConfig = "GLOBAL_CONFIG";
    public const string ManageStaffRoles = "MANAGE_STAFF_ROLES";
    public const string ViewPlayerProfiles = "VIEW_PLAYER_PROFILES";
    public const string VerifyIdentityKyc = "VERIFY_IDENTITY_KYC";
    public const string SaferGamblingRestrictions = "SAFER_GAMBLING_RESTRICTIONS";
    public const string GameCatalogueConfig = "GAME_CATALOGUE_CONFIG";
    public const string GameResultPublish = "GAME_RESULT_PUBLISH";
    public const string ViewLedgerTransactions = "VIEW_LEDGER_TRANSACTIONS";
    public const string ManageDepositExceptions = "MANAGE_DEPOSIT_EXCEPTIONS";
    public const string RequestWithdrawalApproval = "REQUEST_WITHDRAWAL_APPROVAL";
    public const string ApproveWithdrawal = "APPROVE_WITHDRAWAL";
    public const string RequestWalletAdjustment = "REQUEST_WALLET_ADJUSTMENT";
    public const string ApproveWalletAdjustment = "APPROVE_WALLET_ADJUSTMENT";
    public const string ConfigureCryptoQr = "CONFIGURE_CRYPTO_QR";
    public const string ManageBranches = "MANAGE_BRANCHES";
    public const string ViewFinancePnl = "VIEW_FINANCE_PNL";
    public const string ViewAuditLog = "VIEW_AUDIT_LOG";
    public const string HandleSupportComplaints = "HANDLE_SUPPORT_COMPLAINTS";
}
