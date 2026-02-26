import type { RoleCategory, Department } from "@/types";

const ADMIN_NAMES = new Set([
  "김현성", "이현석", "송재석", "하용선", "정두현",
  "신준호", "박소미", "정혜림", "김세빈", "박소현",
]);

/**
 * Determine role_category based on department + name.
 * - 관리자: 환경영업팀 AND name in admin list
 * - 담당자: 제조본부 / CS팀 / 품질본부
 * - 미배정: everyone else
 */
export function classifyRole(name: string, department: Department): RoleCategory {
  if (department === "환경영업팀" && ADMIN_NAMES.has(name)) {
    return "관리자";
  }
  if (department === "제조본부" || department === "CS팀" || department === "품질본부") {
    return "담당자";
  }
  return "미배정";
}
