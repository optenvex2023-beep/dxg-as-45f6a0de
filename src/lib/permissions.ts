import type { AppUser } from "@/types";

/**
 * Super-admin employee numbers — full access to ALL features.
 * (관리자모드 표시 + 전체 권한)
 */
const SUPER_ADMIN_EMP_NOS = new Set([
  "9017091", // 김현성
  "9014094", // 이현석
  "9022113", // 박소미
]);

/**
 * 환경영업팀 권한 동등 부여 화이트리스트.
 * 부서명은 그대로 두고, 권한 체크 시 환경영업팀과 동일하게 처리한다.
 * (테스트용 — 마스터 권한 아님)
 */
const SALES_EQUIVALENT_EMP_NOS = new Set([
  "9024125", // 김세빈
  "9025082", // 박소현
  "9019042", // 송재석
  "9024105", // 신준호
  "9019081", // 정두현
  "9023031", // 정혜림
]);

/**
 * Check if the current user is a super admin (full access to everything).
 */
export function isSuperAdmin(user: AppUser | null): boolean {
  if (!user) return false;
  return SUPER_ADMIN_EMP_NOS.has(user.emp_no);
}

/**
 * 환경영업팀 권한 보유 여부.
 * - 실제 환경영업팀 소속이거나
 * - 화이트리스트(SALES_EQUIVALENT_EMP_NOS)에 포함된 경우
 */
function hasSalesPermissions(user: AppUser | null): boolean {
  if (!user) return false;
  if (user.department === "환경영업팀") return true;
  return SALES_EQUIVALENT_EMP_NOS.has(user.emp_no);
}

/**
 * 환경영업팀 "관리자" 권한 보유 여부.
 * - 실제 환경영업팀 관리자이거나
 * - 화이트리스트(SALES_EQUIVALENT_EMP_NOS)에 포함된 경우(관리자 권한과 동일하게 부여)
 */
function hasSalesAdminPermissions(user: AppUser | null): boolean {
  if (!user) return false;
  if (user.role_category === "관리자" && user.department === "환경영업팀") return true;
  return SALES_EQUIVALENT_EMP_NOS.has(user.emp_no);
}

/**
 * Permission helpers — each returns true if the user can perform the action.
 * Super admins always return true.
 */

/** Emp numbers additionally allowed to register inspections */
const REGISTER_ALLOWED_EMP_NOS = new Set([
  "7023121", // 류상헌
  "7023013", // 노주형
  "7026034", // 고재윤
  "9020121", // 김가영
]);

/** Can register new inspections */
export function canRegister(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  if (user && REGISTER_ALLOWED_EMP_NOS.has(user.emp_no)) return true;
  return hasSalesAdminPermissions(user);
}

/** Can edit admin-level fields (반출요청일, 재설치요청일, 납기, 특이사항, 담당자 등) */
export function canEditAdminFields(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return hasSalesAdminPermissions(user);
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

/**
 * 환경영업팀 권한(또는 동등 권한) 보유 여부 — 페이지/UI에서 "isSales" 판단용 export.
 * 기존 코드는 `currentUser?.department === "환경영업팀"`을 직접 비교하므로,
 * 새 화면에서 본 helper를 사용할 때만 화이트리스트도 함께 적용된다.
 */
export function isSalesUser(user: AppUser | null): boolean {
  if (isSuperAdmin(user)) return true;
  return hasSalesPermissions(user);
}
