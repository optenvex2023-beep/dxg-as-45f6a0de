import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { AppUser, OutboundInspection, OutboundEquipmentItem, RoleCategory, Department, StatusType, Notification, MailOutbox, InspectionReport, ReportVersion, ReportType, ReportStatus, InAppNotification } from "@/types";
import { seedUsers } from "@/data/seedUsers";
import { computeStatus } from "@/lib/statusAutomation";
import { createNotificationsForDepts } from "@/lib/notificationHelper";
import { isExcludedFromDue7 } from "@/lib/inspectionFilters";
import {
  fetchUsers, insertUsers, insertUser as insertUserDb, updateUserDb,
  fetchInspections, insertInspection as insertInspectionDb, updateInspectionDb,
  fetchReports, insertReport as insertReportDb, updateReportDb,
  fetchReportVersions, insertReportVersion as insertReportVersionDb,
  fetchInAppNotifications, insertInAppNotifications, updateNotificationRead, markAllNotificationsReadDb,
} from "@/lib/supabaseDb";

interface AppState {
  users: AppUser[];
  inspections: OutboundInspection[];
  notifications: Notification[];
  mailOutbox: MailOutbox[];
  reports: InspectionReport[];
  reportVersions: ReportVersion[];
  inAppNotifications: InAppNotification[];
  currentUser: AppUser | null;
  isLoading: boolean;
  setCurrentUser: (user: AppUser | null) => void;
  addUser: (name: string, emp_no: string, role_category: RoleCategory, department: Department) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  addInspection: (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at" | "noti_confirm_needed_sent_at" | "noti_dispatch_plan_sent_at" | "noti_dispatch_done_sent_at" | "noti_first_check_done_sent_at" | "noti_final_check_done_sent_at" | "noti_install_done_sent_at" | "due_alert_sent_at">) => void;
  updateInspection: (id: string, updates: Partial<OutboundInspection>) => void;
  getReportsForInspection: (inspectionId: string, type: ReportType) => InspectionReport[];
  addReport: (data: Omit<InspectionReport, "id" | "created_at" | "updated_at" | "completed_at" | "approved_at" | "approved_by">) => InspectionReport;
  updateReport: (id: string, updates: Partial<InspectionReport>) => void;
  completeReport: (reportId: string) => void;
  requestApproval: (reportId: string) => void;
  approveReport: (reportId: string, approverName: string) => void;
  addReportVersion: (reportId: string, fileName: string, fileUrl: string, uploadedBy: string) => void;
  getReportVersions: (reportId: string) => ReportVersion[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  logout: () => void;
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

/* ─── Notification / Mail logic (legacy) ─── */

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
  const [users, setUsers] = useState<AppUser[]>([]);
  const [inspections, setInspections] = useState<OutboundInspection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mailOutbox, setMailOutbox] = useState<MailOutbox[]>([]);
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dataLoadedRef = useRef(false);

  /* ─── Load data from Supabase on mount ─── */
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    async function loadData() {
      try {
        // Load users - seed if empty
        let dbUsers = await fetchUsers();
        if (dbUsers.length === 0) {
          console.log("No users in DB, seeding...");
          await insertUsers(seedUsers);
          dbUsers = await fetchUsers();
        }
        setUsers(dbUsers);

        // Load inspections
        const dbInspections = await fetchInspections();
        setInspections(dbInspections);

        // Load reports
        const dbReports = await fetchReports();
        setReports(dbReports);

        // Load report versions
        const dbVersions = await fetchReportVersions();
        setReportVersions(dbVersions);

        // Load in-app notifications
        const dbNotis = await fetchInAppNotifications();
        setInAppNotifications(dbNotis);
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
        // Fallback to seed users if DB fails
        setUsers(seedUsers);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  /* ─── In-app notification helpers ─── */
  const pushInAppNotifications = useCallback((newNotis: InAppNotification[]) => {
    if (newNotis.length > 0) {
      setInAppNotifications(prev => [...prev, ...newNotis]);
      // Persist to DB
      insertInAppNotifications(newNotis);
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setInAppNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    ));
    updateNotificationRead(id);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setInAppNotifications(prev => prev.map(n =>
      n.recipient_user_id === currentUser.id && !n.read_at ? { ...n, read_at: now } : n
    ));
    markAllNotificationsReadDb(currentUser.id);
  }, [currentUser]);

  /* ─── Legacy trigger logic ─── */
  const triggerNotifications = useCallback((rec: OutboundInspection, oldStatus: StatusType | null, oldDueWarning: boolean | null) => {
    const now = new Date().toISOString();
    if (rec.status !== oldStatus && rec.status !== "납기유의") {
      const cfg = statusMailMap[rec.status];
      if (cfg) {
        setNotifications(prev => [...prev, {
          id: crypto.randomUUID(), inspection_id: rec.id, status_trigger: rec.status,
          target_departments: cfg.target_departments, message: cfg.body(rec), created_at: now,
        }]);
        setMailOutbox(prev => [...prev, {
          id: crypto.randomUUID(), inspection_id: rec.id, status_trigger: rec.status,
          to_emails: cfg.to_emails, subject: cfg.subject, body: cfg.body(rec), created_at: now,
        }]);
      }
    }
    if (rec.due_warning && !oldDueWarning) {
      const cfg = buildDueWarningMail(rec);
      setNotifications(prev => [...prev, {
        id: crypto.randomUUID(), inspection_id: rec.id, status_trigger: "납기유의",
        target_departments: cfg.target_departments, message: cfg.body(rec), created_at: now,
      }]);
      setMailOutbox(prev => [...prev, {
        id: crypto.randomUUID(), inspection_id: rec.id, status_trigger: "납기유의",
        to_emails: cfg.to_emails, subject: cfg.subject, body: cfg.body(rec), created_at: now,
      }]);
    }
  }, []);

  /* ─── In-app notification trigger (C-1 ~ C-8) ─── */
  const triggerInAppNotifications = useCallback((rec: OutboundInspection, updated: OutboundInspection): OutboundInspection => {
    const now = new Date().toISOString();
    let mutated = { ...updated };

    // C-1: 확인필요
    if (mutated.status === "확인필요" && !mutated.noti_confirm_needed_sent_at) {
      const body = `FE/FS팀에서는 반출 예정 건을 확인 후 반출 예정일자를 입력해 주세요.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}`;
      pushInAppNotifications(createNotificationsForDepts(
        users, ["품질본부", "CS팀", "제조본부"],
        "반출 예정 건 등록 알림", body,
        `/status-table?status=${encodeURIComponent("확인필요")}`, "status", mutated.id
      ));
      mutated.noti_confirm_needed_sent_at = now;
    }

    // C-2: 반출예정
    if (mutated.planned_outbound_date && !mutated.noti_dispatch_plan_sent_at) {
      const body = `아래 건에 대해 반출 예정일이 등록되었습니다.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}`;
      pushInAppNotifications(createNotificationsForDepts(
        users, ["환경영업팀"],
        "반출 예정일 등록", body,
        `/status-table?status=${encodeURIComponent("반출예정")}`, "status", mutated.id
      ));
      mutated.noti_dispatch_plan_sent_at = now;
    }

    // C-3: 반출완료
    if (mutated.outbound_date) {
      const outDate = new Date(mutated.outbound_date);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (outDate <= today && !mutated.noti_dispatch_done_sent_at) {
        const body = `아래 건에 대해 반출이 완료되었습니다.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}`;
        pushInAppNotifications(createNotificationsForDepts(
          users, ["환경영업팀", "제조본부"],
          "반출 완료 알림", body,
          `/status-table?status=${encodeURIComponent("반출완료")}`, "status", mutated.id
        ));
        mutated.noti_dispatch_done_sent_at = now;
      }
    }

    // C-5: 1차 점검완료
    if (mutated.first_inspection_done_date && !mutated.noti_first_check_done_sent_at) {
      const body = `아래 건에 대한 1차 점검이 완료되었습니다. 1차 점검 보고서를 확인해 주세요.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}`;
      pushInAppNotifications(createNotificationsForDepts(
        users, ["품질본부", "환경영업팀"],
        "1차 점검 완료 알림", body,
        `/first-report`, "first_report", mutated.id
      ));
      mutated.noti_first_check_done_sent_at = now;
    }

    // C-6: 최종 점검완료
    if (mutated.final_inspection_done_date && !mutated.noti_final_check_done_sent_at) {
      const body = `아래 건에 대한 최종 점검이 완료되었습니다. 완료 점검 보고서를 확인해 주세요.\nFE/FS팀에서는 재설치 예정일자를 기입해 주세요.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}`;
      pushInAppNotifications(createNotificationsForDepts(
        users, ["품질본부", "CS팀", "환경영업팀"],
        "최종 점검 완료 알림", body,
        `/final-report`, "final_report", mutated.id
      ));
      mutated.noti_final_check_done_sent_at = now;
    }

    // C-7: 설치완료
    if (mutated.reinstall_date && mutated.reinstall_confirm_status === "확정") {
      const installDate = new Date(mutated.reinstall_date);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (installDate <= today && !mutated.noti_install_done_sent_at) {
        const body = `아래 건의 설치가 완료 처리되었습니다.\n- 관리번호: ${mutated.manage_no}\n- 건명: ${mutated.project_name}\n- 설치일자: ${mutated.reinstall_date}`;
        pushInAppNotifications(createNotificationsForDepts(
          users, ["환경영업팀", "CS팀"],
          "설치 완료 처리", body,
          `/status-table?status=${encodeURIComponent("설치 완료")}`, "status", mutated.id
        ));
        mutated.noti_install_done_sent_at = now;
      }
    }

    // C-8: 계약납기 7일전 (skip if reinstall_date is filled)
    if (mutated.contract_due_date && !mutated.due_alert_sent_at && !mutated.reinstall_date) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const dueDate = new Date(mutated.contract_due_date); dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        let body = `${mutated.manage_no} / ${mutated.project_name} 계약납기 7일 전입니다. 일정 확인 바랍니다.`;
        if (mutated.reinstall_confirm_status === "확정" && mutated.reinstall_date) {
          body += `\n- 재설치 일자: ${mutated.reinstall_date}`;
        }
        pushInAppNotifications(createNotificationsForDepts(
          users, ["제조본부", "품질본부", "CS팀", "환경영업팀"],
          "계약납기 도래 알림", body,
          `/status-table?status=${encodeURIComponent("납기유의")}`, "status", mutated.id
        ));
        mutated.due_alert_sent_at = now;
      }
    }

    return mutated;
  }, [users, pushInAppNotifications]);

  const addUser = useCallback((name: string, emp_no: string, role_category: RoleCategory, department: Department) => {
    const newUser: AppUser = { id: crypto.randomUUID(), emp_no, name, role_category, department, is_active: true };
    setUsers((prev) => [...prev, newUser]);
    insertUserDb(newUser);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    updateUserDb(id, updates);
  }, []);

  const addInspection = useCallback(
    (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at" | "noti_confirm_needed_sent_at" | "noti_dispatch_plan_sent_at" | "noti_dispatch_done_sent_at" | "noti_first_check_done_sent_at" | "noti_final_check_done_sent_at" | "noti_install_done_sent_at" | "due_alert_sent_at">) => {
      const now = new Date().toISOString();
      const inspectionId = crypto.randomUUID();
      const equipmentItems: OutboundEquipmentItem[] = (data.equipment_items || []).map((item) => ({
        ...item, id: crypto.randomUUID(), outbound_inspection_id: inspectionId,
        serial_no: null, created_at: now, updated_at: now,
      }));
      const base: OutboundInspection = {
        ...data, id: inspectionId, equipment_items: equipmentItems,
        status: "확인필요", due_warning: false, created_at: now, updated_at: now,
        noti_confirm_needed_sent_at: null, noti_dispatch_plan_sent_at: null,
        noti_dispatch_done_sent_at: null, noti_first_check_done_sent_at: null,
        noti_final_check_done_sent_at: null, noti_install_done_sent_at: null,
        due_alert_sent_at: null,
      };
      let final = recalcStatus(base);
      final = triggerInAppNotifications(base, final);
      setInspections((prev) => [...prev, final]);
      triggerNotifications(final, null, null);
      // Persist to DB
      insertInspectionDb(final);
    },
    [triggerNotifications, triggerInAppNotifications]
  );

  const updateInspection = useCallback((id: string, updates: Partial<OutboundInspection>) => {
    setInspections((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const oldStatus = rec.status;
        const oldDueWarning = rec.due_warning;
        let updated = recalcStatus({ ...rec, ...updates });
        updated = triggerInAppNotifications(rec, updated);
        setTimeout(() => triggerNotifications(updated, oldStatus, oldDueWarning), 0);
        // Persist to DB
        const { equipment_items, ...dbUpdates } = updated;
        updateInspectionDb(id, updated);
        return updated;
      })
    );
  }, [triggerNotifications, triggerInAppNotifications]);

  // C-8: Check due alerts on page load
  useEffect(() => {
    if (inspections.length === 0) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let hasChanges = false;
    const updatedInspections = inspections.map((rec) => {
      if (!rec.contract_due_date || rec.due_alert_sent_at || rec.reinstall_date) return rec;
      const dueDate = new Date(rec.contract_due_date); dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        hasChanges = true;
        const now = new Date().toISOString();
        let body = `${rec.manage_no} / ${rec.project_name} 계약납기 7일 전입니다. 일정 확인 바랍니다.`;
        if (rec.reinstall_confirm_status === "확정" && rec.reinstall_date) {
          body += `\n- 재설치 일자: ${rec.reinstall_date}`;
        }
        pushInAppNotifications(createNotificationsForDepts(
          users, ["제조본부", "품질본부", "CS팀", "환경영업팀"],
          "계약납기 도래 알림", body,
          `/status-table?status=${encodeURIComponent("납기유의")}`, "status", rec.id
        ));
        const updated = { ...rec, due_alert_sent_at: now };
        updateInspectionDb(rec.id, { due_alert_sent_at: now } as any);
        return updated;
      }
      return rec;
    });
    if (hasChanges) {
      setInspections(updatedInspections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspections.length]);

  /* ─── Report functions ─── */

  const getReportsForInspection = useCallback((inspectionId: string, type: ReportType) => {
    return reports.filter(r => r.inspection_id === inspectionId && r.report_type === type);
  }, [reports]);

  const addReport = useCallback((data: Omit<InspectionReport, "id" | "created_at" | "updated_at" | "completed_at" | "approved_at" | "approved_by">): InspectionReport => {
    const now = new Date().toISOString();
    const report: InspectionReport = {
      ...data, id: crypto.randomUUID(),
      created_at: now, updated_at: now,
      completed_at: null, approved_at: null, approved_by: null,
      qa_review_status: data.qa_review_status ?? "미검토",
      qa_reviewer_name: data.qa_reviewer_name ?? null,
      qa_reviewed_at: data.qa_reviewed_at ?? null,
      qa_signature_applied: data.qa_signature_applied ?? false,
      qa_notification_sent_to_sales: data.qa_notification_sent_to_sales ?? false,
    };
    setReports(prev => [...prev, report]);
    insertReportDb(report);
    return report;
  }, []);

  const updateReport = useCallback((id: string, updates: Partial<InspectionReport>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r));
    updateReportDb(id, updates);
  }, []);

  const completeReport = useCallback((reportId: string) => {
    const now = new Date().toISOString();
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return { ...r, status: "completed" as ReportStatus, completed_at: now, updated_at: now };
    }));
    updateReportDb(reportId, { status: "completed", completed_at: now } as any);

    const report = reports.find(r => r.id === reportId);
    if (report) {
      const serialNumbers = report.serial_numbers;
      setInspections(prev => prev.map(insp => {
        if (insp.id !== report.inspection_id) return insp;
        const oldStatus = insp.status;
        const oldDueWarning = insp.due_warning;

        const updatedItems = insp.equipment_items.map(item => {
          const newSerial = serialNumbers[item.id];
          if (newSerial) return { ...item, serial_no: newSerial, updated_at: now };
          return item;
        });

        let dateUpdate: Partial<OutboundInspection> = {};
        if (report.report_type === "first") {
          dateUpdate = { first_inspection_done_date: insp.first_inspection_done_date || now.split("T")[0] };
        } else {
          dateUpdate = { final_inspection_done_date: now.split("T")[0] };
        }

        let updated = recalcStatus({ ...insp, ...dateUpdate, equipment_items: updatedItems });
        updated = triggerInAppNotifications(insp, updated);
        setTimeout(() => triggerNotifications(updated, oldStatus, oldDueWarning), 0);
        updateInspectionDb(insp.id, updated);
        return updated;
      }));
    }
  }, [reports, triggerNotifications, triggerInAppNotifications]);

  const requestApproval = useCallback((reportId: string) => {
    const now = new Date().toISOString();
    setReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, status: "approval_requested" as ReportStatus, updated_at: now } : r
    ));
    updateReportDb(reportId, { status: "approval_requested" } as any);
  }, []);

  const approveReport = useCallback((reportId: string, approverName: string) => {
    const now = new Date().toISOString();
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        status: "approved" as ReportStatus,
        approved_at: now,
        approved_by: approverName,
        updated_at: now,
        qa_review_status: "검토완료" as const,
        qa_reviewer_name: approverName,
        qa_reviewed_at: now,
        qa_signature_applied: true,
      };
    }));
    updateReportDb(reportId, {
      status: "approved", approved_at: now, approved_by: approverName,
      qa_review_status: "검토완료", qa_reviewer_name: approverName,
      qa_reviewed_at: now, qa_signature_applied: true,
    } as any);

    const report = reports.find(r => r.id === reportId);
    if (report && !report.qa_notification_sent_to_sales) {
      const insp = inspections.find(i => i.id === report.inspection_id);
      if (insp) {
        const reportLabel = report.report_type === "first" ? "1차 점검보고서" : "완료 점검보고서";
        const targetDepts: Department[] = ["환경영업팀", "CS팀"];
        setNotifications(prev => [...prev, {
          id: crypto.randomUUID(), inspection_id: insp.id, status_trigger: "1차 점검완료",
          target_departments: targetDepts,
          message: `품질본부 검토가 완료되었습니다. (검토자: ${approverName})\n[${insp.manage_no}] ${insp.project_name} ${reportLabel} 품질 검토가 완료되었습니다.`,
          created_at: now,
        }]);
        // Send in-app notifications to target departments
        const body = `품질본부 검토가 완료되었습니다. (검토자: ${approverName})\n[${insp.manage_no}] ${insp.project_name} ${reportLabel} 품질 검토가 완료되었습니다.`;
        const linkUrl = report.report_type === "first" ? "/first-report" : "/final-report";
        pushInAppNotifications(createNotificationsForDepts(
          users, targetDepts,
          `${reportLabel} 품질 검토 완료`, body,
          linkUrl, report.report_type === "first" ? "first_report" : "final_report", insp.id
        ));
      }
      setReports(prev2 => prev2.map(r =>
        r.id === reportId ? { ...r, qa_notification_sent_to_sales: true } : r
      ));
      updateReportDb(reportId, { qa_notification_sent_to_sales: true } as any);
    }
  }, [reports, inspections]);

  const addReportVersion = useCallback((reportId: string, fileName: string, fileUrl: string, uploadedBy: string) => {
    setReportVersions(prev => {
      const existingVersions = prev.filter(v => v.report_id === reportId);
      const nextVersion = existingVersions.length + 1;
      const rv: ReportVersion = {
        id: crypto.randomUUID(), report_id: reportId,
        version_number: nextVersion, file_name: fileName, file_url: fileUrl,
        uploaded_by: uploadedBy, uploaded_at: new Date().toISOString(),
      };
      insertReportVersionDb(rv);
      return [...prev, rv];
    });
  }, []);

  const getReportVersions = useCallback((reportId: string) => {
    return reportVersions.filter(v => v.report_id === reportId);
  }, [reportVersions]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        users, inspections, notifications, mailOutbox, reports, reportVersions, inAppNotifications,
        currentUser, isLoading, setCurrentUser, addUser, updateUser, addInspection, updateInspection,
        getReportsForInspection, addReport, updateReport, completeReport,
        requestApproval, approveReport, addReportVersion, getReportVersions,
        markNotificationRead, markAllNotificationsRead, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
