import React, { createContext, useContext, useState, useCallback } from "react";
import type { AppUser, OutboundInspection, OutboundEquipmentItem, RoleCategory, Department, StatusType, Notification, MailOutbox } from "@/types";
import { seedUsers } from "@/data/seedUsers";
import { computeStatus } from "@/lib/statusAutomation";

interface AppState {
  users: AppUser[];
  inspections: OutboundInspection[];
  notifications: Notification[];
  mailOutbox: MailOutbox[];
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  addUser: (name: string, role_category: RoleCategory, department: Department) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  addInspection: (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at">) => void;
  updateInspection: (id: string, updates: Partial<OutboundInspection>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

function recalcStatus(rec: OutboundInspection): OutboundInspection {
  const { status, due_warning } = computeStatus(rec);
  return { ...rec, status, due_warning, updated_at: new Date().toISOString() };
}

/* ─── Notification / Mail logic ─── */

interface StatusMailConfig {
  target_departments: Department[];
  to_emails: string[];
  subject: string;
  body: (rec: OutboundInspection) => string;
}

const statusMailMap: Record<string, StatusMailConfig> = {
  "확인필요": {
    target_departments: ["품질본부", "CS팀", "제조본부"],
    to_emails: ["qc@dxg.kr", "cs@dxg.kr", "hello@dxg.kr", "eng@dxg.kr"],
    subject: "반출 예정 건 등록 알림",
    body: (r) => `FE/FS팀에서는 반출 예정 건을 확인 후 반출 예정일자를 입력하여 주시기 바랍니다.\n- 관리번호: ${r.manage_no}\n- 건명: ${r.project_name}`,
  },
  "반출예정": {
    target_departments: ["환경영업팀"],
    to_emails: ["opt@dxg.kr"],
    subject: "반출 예정일 등록",
    body: (r) => `아래 건에 대해 반출 예정일이 등록되었습니다.\n- 관리번호: ${r.manage_no}\n- 건명: ${r.project_name}`,
  },
  "반출완료": {
    target_departments: ["환경영업팀", "제조본부"],
    to_emails: ["opt@dxg.kr", "hello@dxg.kr", "eng@dxg.kr"],
    subject: "반출 완료 알림",
    body: (r) => `아래 건에 대해 반출이 완료되었습니다.\n- 관리번호: ${r.manage_no}\n- 건명: ${r.project_name}`,
  },
  "1차 점검완료": {
    target_departments: ["품질본부", "환경영업팀"],
    to_emails: ["qc@dxg.kr", "opt@dxg.kr"],
    subject: "1차 점검 완료 알림",
    body: (r) => `아래 건에 대한 1차 점검이 완료되었습니다. 1차 점검 보고서를 확인하여 주시기 바랍니다.\n- 관리번호: ${r.manage_no}\n- 건명: ${r.project_name}`,
  },
  "최종 점검완료": {
    target_departments: ["품질본부", "CS팀", "환경영업팀"],
    to_emails: ["qc@dxg.kr", "cs@dxg.kr", "opt@dxg.kr"],
    subject: "최종 점검 완료 알림",
    body: (r) => `아래 건에 대한 최종 점검이 완료되었습니다. 완료 점검 보고서를 확인하여 주시기 바랍니다.\nFE/FS팀에서는 재설치 예정일자를 기입하여 주시기 바랍니다.\n- 관리번호: ${r.manage_no}\n- 건명: ${r.project_name}`,
  },
};

function buildDueWarningMail(rec: OutboundInspection): StatusMailConfig {
  let reinstallLine = "";
  if (rec.reinstall_confirm_status === "확정" && rec.reinstall_date) {
    reinstallLine = `\n- 재설치 일자: ${rec.reinstall_date}`;
  }
  return {
    target_departments: ["제조본부", "품질본부", "CS팀", "환경영업팀"],
    to_emails: ["opt@dxg.kr", "cs@dxg.kr"],
    subject: "계약납기 도래 알림",
    body: () => `아래 건에 대한 계약 납기가 도래하였으니, 일정을 확인하여 주시기 바랍니다.\n- 관리번호: ${rec.manage_no}\n- 건명: ${rec.project_name}${reinstallLine}`,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [inspections, setInspections] = useState<OutboundInspection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mailOutbox, setMailOutbox] = useState<MailOutbox[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(seedUsers[0]);

  const triggerNotifications = useCallback((rec: OutboundInspection, oldStatus: StatusType | null, oldDueWarning: boolean | null) => {
    const now = new Date().toISOString();
    // Status-based notifications
    if (rec.status !== oldStatus && rec.status !== "납기유의") {
      const cfg = statusMailMap[rec.status];
      if (cfg) {
        setNotifications(prev => [...prev, {
          id: crypto.randomUUID(),
          inspection_id: rec.id,
          status_trigger: rec.status,
          target_departments: cfg.target_departments,
          message: cfg.body(rec),
          created_at: now,
        }]);
        setMailOutbox(prev => [...prev, {
          id: crypto.randomUUID(),
          inspection_id: rec.id,
          status_trigger: rec.status,
          to_emails: cfg.to_emails,
          subject: cfg.subject,
          body: cfg.body(rec),
          created_at: now,
        }]);
      }
    }
    // Due warning notification
    if (rec.due_warning && !oldDueWarning) {
      const cfg = buildDueWarningMail(rec);
      setNotifications(prev => [...prev, {
        id: crypto.randomUUID(),
        inspection_id: rec.id,
        status_trigger: "납기유의",
        target_departments: cfg.target_departments,
        message: cfg.body(rec),
        created_at: now,
      }]);
      setMailOutbox(prev => [...prev, {
        id: crypto.randomUUID(),
        inspection_id: rec.id,
        status_trigger: "납기유의",
        to_emails: cfg.to_emails,
        subject: cfg.subject,
        body: cfg.body(rec),
        created_at: now,
      }]);
    }
  }, []);

  const addUser = useCallback((name: string, role_category: RoleCategory, department: Department) => {
    setUsers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, role_category, department, is_active: true },
    ]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }, []);

  const addInspection = useCallback(
    (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at">) => {
      const now = new Date().toISOString();
      const inspectionId = crypto.randomUUID();
      const equipmentItems: OutboundEquipmentItem[] = (data.equipment_items || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        outbound_inspection_id: inspectionId,
        serial_no: null,
        created_at: now,
        updated_at: now,
      }));
      const base: OutboundInspection = {
        ...data,
        id: inspectionId,
        equipment_items: equipmentItems,
        status: "확인필요",
        due_warning: false,
        created_at: now,
        updated_at: now,
      };
      const final = recalcStatus(base);
      setInspections((prev) => [...prev, final]);
      triggerNotifications(final, null, null);
    },
    [triggerNotifications]
  );

  const updateInspection = useCallback((id: string, updates: Partial<OutboundInspection>) => {
    setInspections((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const oldStatus = rec.status;
        const oldDueWarning = rec.due_warning;
        const updated = recalcStatus({ ...rec, ...updates });
        // Fire notifications asynchronously after state update
        setTimeout(() => triggerNotifications(updated, oldStatus, oldDueWarning), 0);
        return updated;
      })
    );
  }, [triggerNotifications]);

  return (
    <AppContext.Provider
      value={{ users, inspections, notifications, mailOutbox, currentUser, setCurrentUser, addUser, updateUser, addInspection, updateInspection }}
    >
      {children}
    </AppContext.Provider>
  );
}
