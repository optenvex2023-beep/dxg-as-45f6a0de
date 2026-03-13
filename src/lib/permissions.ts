import type { AppUser } from "@/types";

/**
 * Super-admin employee numbers — these users from 환경영업팀
 * get full access to ALL features across all departments.
 * Extensible: just add emp_no to this set.
 */
const SUPER_ADMIN_EMP_NOS = new Set([
  "9014094", // 이현석
  "9017091", // 김현성
  "9022113", // 박소미
]);

/**
 * Check if the current user is a super admin (full access to everything).
 */
export function isSuperAdmin(user: AppUser | null): boolean {
  if (!user) return false;
  return user.department === "환경영업팀" && SUPER_ADMIN_EMP_NOS.has(user.emp_no);
}

/**
 * Permission helpers — each returns true if the user can perform the action.
 * Super admins always return true.
 */

/** Can register new inspections */
export function canRegister(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.role_category === "관리자" && user.department === "환경영업팀";
}

/** Can edit admin-level fields (반출요청일, 재설치요청일, 납기, 특이사항, 담당자 등) */
export function canEditAdminFields(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.role_category === "관리자" && user?.department === "환경영업팀";
}

/** Can edit CS fields (반출예정일, 반출일, 설치일, 예정/확정) */
export function canEditCSFields(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.department === "CS팀";
}

/** Can edit manufacturing fields (입고일, 1차/최종 점검일) */
export function canEditMfgFields(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.department === "제조본부";
}

/** Can create/edit inspection reports */
export function canEditReports(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.department === "제조본부";
}

/** Can approve / QA-review reports */
export function canQAReview(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return user?.department === "품질본부";
}
