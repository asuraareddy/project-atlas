/**
 * Roles & RBAC System per Document 06_ROLES_RBAC.md
 */

export type PlatformRole =
  | 'SUPER_ADMIN'
  | 'OPERATOR_ADMIN'
  | 'COMPLIANCE'
  | 'FINANCE_MANAGER'
  | 'PAYMENTS_OPERATOR'
  | 'GAME_OPERATIONS'
  | 'BRANCH_MANAGER'
  | 'STAFF_SUPPORT'
  | 'AUDITOR'
  | 'PLAYER'
  | 'SERVICE_ACCOUNT';

export type PermissionKey =
  | 'GLOBAL_CONFIG'
  | 'MANAGE_STAFF_ROLES'
  | 'VIEW_PLAYER_PROFILES'
  | 'VERIFY_IDENTITY_KYC'
  | 'SAFER_GAMBLING_RESTRICTIONS'
  | 'GAME_CATALOGUE_CONFIG'
  | 'GAME_RESULT_PUBLISH'
  | 'VIEW_LEDGER_TRANSACTIONS'
  | 'MANAGE_DEPOSIT_EXCEPTIONS'
  | 'REQUEST_WITHDRAWAL_APPROVAL'
  | 'APPROVE_WITHDRAWAL'
  | 'REQUEST_WALLET_ADJUSTMENT'
  | 'APPROVE_WALLET_ADJUSTMENT'
  | 'CONFIGURE_CRYPTO_QR'
  | 'MANAGE_BRANCHES'
  | 'VIEW_FINANCE_PNL'
  | 'VIEW_AUDIT_LOG'
  | 'HANDLE_SUPPORT_COMPLAINTS';

export interface UserContext {
  id: string;
  email: string;
  role: PlatformRole;
  organizationId: string;
  branchId?: string | null;
  accountStatus: 'active' | 'suspended' | 'under_review' | 'restricted' | 'self_excluded';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface ApprovalRequest {
  id: string;
  actionType: 'WITHDRAWAL_APPROVAL' | 'WALLET_ADJUSTMENT' | 'GAME_RESULT_PUBLISH' | 'CRYPTO_CONFIG_CHANGE' | 'ROLE_ELEVATION';
  resourceType: string;
  resourceId: string;
  makerId: string;
  checkerId?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  requestedPayload: any;
  createdAt: string;
  decidedAt?: string | null;
}
