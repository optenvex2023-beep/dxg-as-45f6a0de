import type { AppUser, Department, InAppNotification } from "@/types";

/**
 * Create in-app notification rows for all active users in a given department.
 */
export function createNotificationsForDept(
  users: AppUser[],
  deptName: Department,
  title: string,
  body: string,
  link_url: string | null,
  entity_type: string,
  entity_id: string | null,
): InAppNotification[] {
  const now = new Date().toISOString();
  return users
    .filter((u) => u.is_active && u.department === deptName)
    .map((u) => ({
      id: crypto.randomUUID(),
      recipient_user_id: u.id,
      title,
      body,
      link_url,
      entity_type,
      entity_id,
      created_at: now,
      read_at: null,
    }));
}

/**
 * Create notifications for multiple departments at once.
 */
export function createNotificationsForDepts(
  users: AppUser[],
  departments: Department[],
  title: string,
  body: string,
  link_url: string | null,
  entity_type: string,
  entity_id: string | null,
): InAppNotification[] {
  return departments.flatMap((dept) =>
    createNotificationsForDept(users, dept, title, body, link_url, entity_type, entity_id)
  );
}
