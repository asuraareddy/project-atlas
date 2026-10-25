import { PlatformRole, PermissionKey, UserContext, ApprovalRequest } from './types';

/**
 * Baseline Permission Matrix per Document 06_ROLES_RBAC.md
 */
const ROLE_PERMISSIONS: Record<PlatformRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'GLOBAL_CONFIG',
    'MANAGE_STAFF_ROLES',
    'VIEW_PLAYER_PROFILES',
    'VERIFY_IDENTITY_KYC',
    'SAFER_GAMBLING_RESTRICTIONS',
    'GAME_CATALOGUE_CONFIG',
    'GAME_RESULT_PUBLISH',
    'VIEW_LEDGER_TRANSACTIONS',
    'MANAGE_DEPOSIT_EXCEPTIONS',
    'REQUEST_WITHDRAWAL_APPROVAL',
    'APPROVE_WITHDRAWAL',
    'REQUEST_WALLET_ADJUSTMENT',
    'APPROVE_WALLET_ADJUSTMENT',
    'CONFIGURE_CRYPTO_QR',
    'MANAGE_BRANCHES',
    'VIEW_FINANCE_PNL',
    'VIEW_AUDIT_LOG',
    'HANDLE_SUPPORT_COMPLAINTS'
  ],
  OPERATOR_ADMIN: [
    'GLOBAL_CONFIG',
    'MANAGE_STAFF_ROLES',
    'VIEW_PLAYER_PROFILES',
    'VERIFY_IDENTITY_KYC',
    'SAFER_GAMBLING_RESTRICTIONS',
    'GAME_CATALOGUE_CONFIG',
    'GAME_RESULT_PUBLISH',
    'VIEW_LEDGER_TRANSACTIONS',
    'MANAGE_DEPOSIT_EXCEPTIONS',
    'APPROVE_WITHDRAWAL',
    'APPROVE_WALLET_ADJUSTMENT',
    'CONFIGURE_CRYPTO_QR',
    'MANAGE_BRANCHES',
    'VIEW_FINANCE_PNL',
    'VIEW_AUDIT_LOG',
    'HANDLE_SUPPORT_COMPLAINTS'
  ],
  COMPLIANCE: [
    'VIEW_PLAYER_PROFILES',
    'VERIFY_IDENTITY_KYC',
    'SAFER_GAMBLING_RESTRICTIONS',
    'VIEW_AUDIT_LOG',
    'HANDLE_SUPPORT_COMPLAINTS'
  ],
  FINANCE_MANAGER: [
    'VIEW_LEDGER_TRANSACTIONS',
    'MANAGE_DEPOSIT_EXCEPTIONS',
    'APPROVE_WITHDRAWAL',
    'APPROVE_WALLET_ADJUSTMENT',
    'VIEW_FINANCE_PNL',
    'VIEW_AUDIT_LOG'
  ],
  PAYMENTS_OPERATOR: [
    'VIEW_LEDGER_TRANSACTIONS',
    'MANAGE_DEPOSIT_EXCEPTIONS',
    'REQUEST_WITHDRAWAL_APPROVAL',
    'REQUEST_WALLET_ADJUSTMENT'
  ],
  GAME_OPERATIONS: [
    'GAME_CATALOGUE_CONFIG',
    'GAME_RESULT_PUBLISH',
    'VIEW_AUDIT_LOG'
  ],
  BRANCH_MANAGER: [
    'VIEW_PLAYER_PROFILES',
    'MANAGE_BRANCHES',
    'VIEW_FINANCE_PNL',
    'HANDLE_SUPPORT_COMPLAINTS'
  ],
  STAFF_SUPPORT: [
    'VIEW_PLAYER_PROFILES',
    'HANDLE_SUPPORT_COMPLAINTS'
  ],
  AUDITOR: [
    'VIEW_LEDGER_TRANSACTIONS',
    'VIEW_FINANCE_PNL',
    'VIEW_AUDIT_LOG'
  ],
  PLAYER: [],
  SERVICE_ACCOUNT: [
    'VIEW_LEDGER_TRANSACTIONS',
    'MANAGE_DEPOSIT_EXCEPTIONS'
  ]
};

export class RbacService {
  /**
   * Evaluates if a role possesses the requested capability
   */
  static hasPermission(role: PlatformRole, permission: PermissionKey): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Asserts server-side role permission and throws 403 on failure
   */
  static assertPermission(user: UserContext, permission: PermissionKey): void {
    if (!this.hasPermission(user.role, permission)) {
      throw new Error(`ACCESS_DENIED: Role '${user.role}' lacks permission '${permission}'`);
    }
  }

  /**
   * Asserts branch scoping: branch managers and staff can only access records in their branch
   */
  static assertScope(user: UserContext, targetBranchId?: string | null): void {
    // Super admins and operator admins possess platform-wide scope
    if (user.role === 'SUPER_ADMIN' || user.role === 'OPERATOR_ADMIN') {
      return;
    }

    // Branch managers and branch staff must match assigned branch ID
    if (user.role === 'BRANCH_MANAGER' || user.role === 'STAFF_SUPPORT') {
      if (!user.branchId || user.branchId !== targetBranchId) {
        throw new Error(`CROSS_BRANCH_VIOLATION: User in branch '${user.branchId}' cannot access resource in branch '${targetBranchId}'`);
      }
    }
  }

  /**
   * Evaluates player eligibility before deposits, wagers, or game sessions
   * Per Documents 03_FRD.md and 10_SECURITY_COMPLIANCE.md
   */
  static assertPlayerEligibility(user: UserContext): void {
    if (user.accountStatus === 'self_excluded') {
      throw new Error('ACCOUNT_RESTRICTED: Account is currently self-excluded under safer gambling policy.');
    }
    if (user.accountStatus === 'suspended' || user.accountStatus === 'restricted') {
      throw new Error(`ACCOUNT_RESTRICTED: Account status is '${user.accountStatus}'. Gambling actions are blocked.`);
    }
    if (process.env.ENABLE_REAL_MONEY_GAMBLING === 'true' && user.kycStatus !== 'verified') {
      throw new Error('KYC_REQUIRED: Age and identity verification must be completed before real-money play.');
    }
  }

  /**
   * Enforces Maker-Checker dual control:
   * Prevents self-approval of restricted financial or operational actions
   */
  static verifyMakerChecker(makerId: string, checkerId: string): void {
    if (!checkerId || makerId === checkerId) {
      throw new Error('MAKER_CHECKER_VIOLATION: Self-approval is strictly forbidden. A distinct authorized checker is required.');
    }
  }
}
