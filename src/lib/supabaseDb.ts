import { supabase } from "@/integrations/supabase/client";
import type { AppUser, OutboundInspection, OutboundEquipmentItem, InspectionReport, ReportVersion, InAppNotification } from "@/types";
import type { CalibrationGasInventoryItem, CalibrationGasHistory } from "@/types/calibrationGas";

/* ═══════════════════════════════════════════
   Type mapping helpers (DB ↔ App)
   ═══════════════════════════════════════════ */

// CalibrationGasInventoryItem uses volume_L, DB uses volume_l
function dbToCalGasItem(row: any): CalibrationGasInventoryItem {
  return {
    id: row.id,
    contract_end_date: row.contract_end_date,
    site_name: row.site_name,
    tms_status: row.tms_status,
    unit_no: row.unit_no,
    analyzer_range: row.analyzer_range,
    gas_name: row.gas_name,
    concentration: row.concentration,
    volume_L: row.volume_l,
    expiry_date: row.expiry_date,
    remaining_percent: row.remaining_percent,
    purchase_entity: row.purchase_entity,
    so_issue: row.so_issue,
    arrival_status: row.arrival_status,
    branch: row.branch,
    gas_inspection_first: row.gas_inspection_first,
    gas_inspection_last: row.gas_inspection_last,
    gas_inspection_next: row.gas_inspection_next,
    gas_inspection_round: row.gas_inspection_round,
    gas_inspection_so: row.gas_inspection_so,
    gas_inspection_so_arrival: row.gas_inspection_so_arrival,
    velocity_inspection_first: row.velocity_inspection_first,
    velocity_inspection_last: row.velocity_inspection_last,
    velocity_inspection_next: row.velocity_inspection_next,
    velocity_inspection_round: row.velocity_inspection_round,
    velocity_inspection_so: row.velocity_inspection_so,
    inspection_notes: row.inspection_notes,
    inspection_date: row.inspection_date,
    inspection_cycle: row.inspection_cycle,
    md: row.md,
    monthly_amount: row.monthly_amount,
    contract_consumables: row.contract_consumables,
    notes: row.notes,
    gas_inspection_merge_group: row.gas_inspection_merge_group ?? 0,
    velocity_inspection_merge_group: row.velocity_inspection_merge_group ?? 0,
    purchase_entity_merge_group: row.purchase_entity_merge_group ?? 0,
    branch_merge_group: row.branch_merge_group ?? 0,
  };
}

function calGasItemToDb(item: CalibrationGasInventoryItem) {
  const { volume_L, ...rest } = item;
  return { ...rest, volume_l: volume_L };
}

function dbToInspection(row: any, equipmentItems: OutboundEquipmentItem[]): OutboundInspection {
  return {
    ...row,
    equipment_items: equipmentItems.filter(ei => ei.outbound_inspection_id === row.id),
  } as OutboundInspection;
}

function dbToReport(row: any): InspectionReport {
  return {
    ...row,
    serial_numbers: row.serial_numbers as Record<string, string>,
    inspection_data: row.inspection_data as any,
  } as InspectionReport;
}

/* ═══════════════════════════════════════════
   USERS
   ═══════════════════════════════════════════ */

export async function fetchUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase.from("app_users").select("*");
  if (error) { console.error("fetchUsers error:", error); return []; }
  return (data ?? []) as AppUser[];
}

export async function insertUser(user: AppUser) {
  const { error } = await supabase.from("app_users").insert({
    id: user.id,
    emp_no: user.emp_no,
    name: user.name,
    role_category: user.role_category,
    department: user.department,
    is_active: user.is_active,
  });
  if (error) console.error("insertUser error:", error);
}

export async function insertUsers(users: AppUser[]) {
  const rows = users.map(u => ({
    id: u.id,
    emp_no: u.emp_no,
    name: u.name,
    role_category: u.role_category,
    department: u.department,
    is_active: u.is_active,
  }));
  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("app_users").insert(batch);
    if (error) console.error("insertUsers batch error:", error);
  }
}

export async function updateUserDb(id: string, updates: Partial<AppUser>) {
  const { error } = await supabase.from("app_users").update(updates).eq("id", id);
  if (error) console.error("updateUser error:", error);
}

/* ═══════════════════════════════════════════
   OUTBOUND INSPECTIONS
   ═══════════════════════════════════════════ */

export async function fetchInspections(): Promise<OutboundInspection[]> {
  const { data: inspData, error: inspErr } = await supabase.from("outbound_inspections").select("*").order("created_at", { ascending: false });
  if (inspErr) { console.error("fetchInspections error:", inspErr); return []; }

  const { data: eqData, error: eqErr } = await supabase.from("outbound_equipment_items").select("*");
  if (eqErr) { console.error("fetchEquipmentItems error:", eqErr); return []; }

  const equipmentItems = (eqData ?? []) as OutboundEquipmentItem[];
  return (inspData ?? []).map(row => dbToInspection(row, equipmentItems));
}

export async function insertInspection(insp: OutboundInspection) {
  const { equipment_items, ...inspData } = insp;
  const { error: inspErr } = await supabase.from("outbound_inspections").insert(inspData);
  if (inspErr) { console.error("insertInspection error:", inspErr); return; }

  if (equipment_items.length > 0) {
    const eqRows = equipment_items.map(ei => ({
      id: ei.id,
      outbound_inspection_id: insp.id,
      equipment_name: ei.equipment_name,
      qty_set: ei.qty_set,
      serial_no: ei.serial_no,
    }));
    const { error: eqErr } = await supabase.from("outbound_equipment_items").insert(eqRows);
    if (eqErr) console.error("insertEquipmentItems error:", eqErr);
  }
}

export async function updateInspectionDb(id: string, updates: Partial<OutboundInspection>) {
  const { equipment_items, ...rest } = updates;
  const { error } = await supabase.from("outbound_inspections").update(rest).eq("id", id);
  if (error) console.error("updateInspection error:", error);

  if (equipment_items) {
    for (const ei of equipment_items) {
      const { error: eqErr } = await supabase.from("outbound_equipment_items")
        .update({ equipment_name: ei.equipment_name, qty_set: ei.qty_set, serial_no: ei.serial_no })
        .eq("id", ei.id);
      if (eqErr) console.error("updateEquipmentItem error:", eqErr);
    }
  }
}

/* ═══════════════════════════════════════════
   INSPECTION REPORTS
   ═══════════════════════════════════════════ */

export async function fetchReports(): Promise<InspectionReport[]> {
  const { data, error } = await supabase.from("inspection_reports").select("*");
  if (error) { console.error("fetchReports error:", error); return []; }
  return (data ?? []).map(dbToReport);
}

export async function insertReport(report: InspectionReport) {
  const { error } = await supabase.from("inspection_reports").insert({
    id: report.id,
    inspection_id: report.inspection_id,
    equipment_item_id: report.equipment_item_id,
    report_type: report.report_type,
    status: report.status,
    serial_numbers: report.serial_numbers as any,
    inspection_data: report.inspection_data as any,
    inspection_result: report.inspection_result,
    special_notes: report.special_notes,
    inspector_name: report.inspector_name,
    created_date: report.created_date,
    qa_review_status: report.qa_review_status,
    qa_reviewer_name: report.qa_reviewer_name,
    qa_reviewed_at: report.qa_reviewed_at,
    qa_signature_applied: report.qa_signature_applied,
    qa_notification_sent_to_sales: report.qa_notification_sent_to_sales,
    manufacturing_review_completed: report.manufacturing_review_completed,
    manufacturing_reviewed_at: report.manufacturing_reviewed_at,
  });
  if (error) console.error("insertReport error:", error);
}

export async function updateReportDb(id: string, updates: Partial<InspectionReport>) {
  const dbUpdates: any = { ...updates };
  if (updates.serial_numbers) dbUpdates.serial_numbers = updates.serial_numbers;
  if (updates.inspection_data) dbUpdates.inspection_data = updates.inspection_data;
  const { error } = await supabase.from("inspection_reports").update(dbUpdates).eq("id", id);
  if (error) console.error("updateReport error:", error);
}

/* ═══════════════════════════════════════════
   REPORT VERSIONS
   ═══════════════════════════════════════════ */

export async function fetchReportVersions(): Promise<ReportVersion[]> {
  const { data, error } = await supabase.from("report_versions").select("*");
  if (error) { console.error("fetchReportVersions error:", error); return []; }
  return (data ?? []) as ReportVersion[];
}

export async function insertReportVersion(rv: ReportVersion) {
  const { error } = await supabase.from("report_versions").insert({
    id: rv.id,
    report_id: rv.report_id,
    version_number: rv.version_number,
    file_name: rv.file_name,
    file_path: rv.file_path,
    file_url: rv.file_url,
    uploaded_by: rv.uploaded_by,
  });
  if (error) {
    console.error("insertReportVersion error:", error);
    throw error;
  }
}

export async function deleteReportVersion(id: string, filePath: string) {
  if (filePath) {
    const { error: storageError } = await supabase.storage.from("report-files").remove([filePath]);
    if (storageError) {
      console.error("deleteReportVersion storage error:", storageError);
      // Continue to attempt DB delete even if storage fails
    }
  }
  const { error } = await supabase.from("report_versions").delete().eq("id", id);
  if (error) {
    console.error("deleteReportVersion db error:", error);
    throw error;
  }
}

/* ═══════════════════════════════════════════
   IN-APP NOTIFICATIONS
   ═══════════════════════════════════════════ */

export async function fetchInAppNotifications(): Promise<InAppNotification[]> {
  const { data, error } = await supabase.from("in_app_notifications").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchInAppNotifications error:", error); return []; }
  return (data ?? []) as InAppNotification[];
}

export async function insertInAppNotifications(notis: InAppNotification[]) {
  if (notis.length === 0) return;
  const rows = notis.map(n => ({
    id: n.id,
    recipient_user_id: n.recipient_user_id,
    title: n.title,
    body: n.body,
    link_url: n.link_url,
    entity_type: n.entity_type,
    entity_id: n.entity_id,
  }));
  const { error } = await supabase.from("in_app_notifications").insert(rows);
  if (error) console.error("insertInAppNotifications error:", error);
}

export async function updateNotificationRead(id: string) {
  const { error } = await supabase.from("in_app_notifications")
    .update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) console.error("updateNotificationRead error:", error);
}

export async function markAllNotificationsReadDb(userId: string) {
  const { error } = await supabase.from("in_app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", userId)
    .is("read_at", null);
  if (error) console.error("markAllNotificationsReadDb error:", error);
}

/* ═══════════════════════════════════════════
   CALIBRATION GAS INVENTORY
   ═══════════════════════════════════════════ */

export async function fetchCalGasInventory(): Promise<CalibrationGasInventoryItem[]> {
  const { data, error } = await supabase.from("calibration_gas_inventory").select("*").order("sort_order", { ascending: true });
  if (error) { console.error("fetchCalGasInventory error:", error); return []; }
  const rows = data ?? [];

  // Stable sort: group by site_name (first-appearance order), then sort_order within each site
  const siteOrder = new Map<string, number>();
  for (const row of rows) {
    if (!siteOrder.has(row.site_name)) {
      siteOrder.set(row.site_name, siteOrder.size);
    }
  }
  rows.sort((a, b) => {
    const siteA = siteOrder.get(a.site_name) ?? 0;
    const siteB = siteOrder.get(b.site_name) ?? 0;
    if (siteA !== siteB) return siteA - siteB;
    return a.sort_order - b.sort_order;
  });

  return rows.map(dbToCalGasItem);
}

export async function insertCalGasInventoryItems(items: CalibrationGasInventoryItem[]) {
  const rows = items.map(calGasItemToDb);
  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("calibration_gas_inventory").insert(batch);
    if (error) console.error("insertCalGasInventory batch error:", error);
  }
}

export async function insertCalGasInventoryItem(item: CalibrationGasInventoryItem) {
  const row = calGasItemToDb(item);
  const { error } = await supabase.from("calibration_gas_inventory").insert(row);
  if (error) console.error("insertCalGasInventoryItem error:", error);
}

export async function updateCalGasInventoryItem(id: string, updates: Partial<CalibrationGasInventoryItem>) {
  const dbUpdates: any = { ...updates };
  if ('volume_L' in updates) {
    dbUpdates.volume_l = updates.volume_L;
    delete dbUpdates.volume_L;
  }
  const { error } = await supabase.from("calibration_gas_inventory").update(dbUpdates).eq("id", id);
  if (error) console.error("updateCalGasInventoryItem error:", error);
}

export async function deleteCalGasInventoryItem(id: string) {
  const { error } = await supabase.from("calibration_gas_inventory").delete().eq("id", id);
  if (error) console.error("deleteCalGasInventoryItem error:", error);
}

/* ═══════════════════════════════════════════
   CALIBRATION GAS HISTORY
   ═══════════════════════════════════════════ */

export async function fetchCalGasHistory(): Promise<CalibrationGasHistory[]> {
  const { data, error } = await supabase.from("calibration_gas_history").select("*").order("updated_at", { ascending: false });
  if (error) { console.error("fetchCalGasHistory error:", error); return []; }
  return (data ?? []) as CalibrationGasHistory[];
}

export async function insertCalGasHistoryItems(items: CalibrationGasHistory[]) {
  if (items.length === 0) return;
  const { error } = await supabase.from("calibration_gas_history").insert(items);
  if (error) console.error("insertCalGasHistory error:", error);
}
