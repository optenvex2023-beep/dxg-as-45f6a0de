export type StatusType =
  | "확인필요"
  | "반출예정"
  | "반출완료"
  | "입고완료"
  | "1차 점검완료"
  | "최종 점검완료"
  | "설치 완료"
  | "납기유의";

export type DateMode = "단일" | "기간";
export type ReinstallConfirmStatus = "예정" | "확정";
export type RequestType = "세일즈오더" | "고객지원요청서";

export type RoleCategory = "관리자" | "담당자" | "미배정";
export type Department = "환경영업팀" | "품질본부" | "CS팀" | "제조본부" | "없음";

export interface AppUser {
  id: string;
  name: string;
  role_category: RoleCategory;
  department: Department;
  is_active: boolean;
}

export interface OutboundEquipmentItem {
  id: string;
  outbound_inspection_id: string;
  equipment_name: string;
  qty_set: number;
  serial_no: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutboundInspection {
  id: string;
  status: StatusType;
  manage_no: string;
  project_name: string;

  equipment_items: OutboundEquipmentItem[];

  outbound_request_date_mode: DateMode;
  outbound_request_date_single: string | null;
  outbound_request_date_start: string | null;
  outbound_request_date_end: string | null;

  planned_outbound_date: string | null;
  outbound_date: string | null;
  inbound_date: string | null;
  first_inspection_done_date: string | null;
  final_inspection_done_date: string | null;

  reinstall_request_date_mode: DateMode;
  reinstall_request_date_single: string | null;
  reinstall_request_date_start: string | null;
  reinstall_request_date_end: string | null;

  reinstall_date: string | null;
  reinstall_confirm_status: ReinstallConfirmStatus;
  contract_due_date: string | null;
  special_note: string;

  client_pic_name: string;
  client_pic_phone: string;

  request_type: RequestType;
  support_request_file: string | null;

  due_warning: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  inspection_id: string;
  status_trigger: StatusType | "납기유의";
  target_departments: Department[];
  message: string;
  created_at: string;
}

export interface MailOutbox {
  id: string;
  inspection_id: string;
  status_trigger: StatusType | "납기유의";
  to_emails: string[];
  subject: string;
  body: string;
  created_at: string;
}

export type ReportType = "first" | "final";
export type ReportStatus = "draft" | "completed" | "approval_requested" | "approved";

export interface InspectionCheckItem {
  category: string;
  item: string;
  result: "양호" | "추가점검 필요" | "";
  action: string;
  action_result: string;
}

export interface ReplacementPart {
  name: string;
  qty: string;
  status: string;
  note: string;
}

export interface InspectionReportData {
  // Page 1: Cover info
  client_name: string;
  serial_no: string;
  inbound_date: string;
  related_doc: string;
  model_checks: string[]; // e.g. ["DGA-X", "DSM-XG"]
  inbound_items: string[]; // e.g. ["Main Unit", "ACU"]

  // Page 2: Context
  inbound_type: string[]; // 정기 반출 점검, 긴급 점검, 입고 점검
  site_situation: string;
  client_request: string;

  // Basic check
  voltage_main: string[]; // 110V, 220V
  voltage_purge: string[]; // 220V, 380-480V
  measure_gas: string[];
  install_type: string[];

  // Inspection checklist
  check_items: InspectionCheckItem[];

  // Replacement parts
  replacement_parts: ReplacementPart[];

  // Detailed notes (Ⅳ)
  detail_notes: string;

  // Page 4: Detail sections
  beam_splitter_contamination: string;
  beam_splitter_result: string;
  spectrometer_status: string;
  spectrometer_result: string;
  uv_lamp_note: string;
  cooling_fan_status: string;
  smps_note: string;
  wiring_status: string;

  // Probe
  probe_exterior: string;
  probe_temp_sensor: string;
  probe_corner_mirror: string;
  probe_length: string;
  probe_measure_section: string;
  probe_gas_direction: string;

  // Summary
  summary_items: string[];
}

export interface InspectionReport {
  id: string;
  inspection_id: string;
  equipment_item_id: string; // links to one OutboundEquipmentItem
  report_type: ReportType;
  status: ReportStatus;

  serial_numbers: Record<string, string>; // kept for backward compat
  inspection_data: InspectionReportData;

  inspection_result: string;
  special_notes: string;
  inspector_name: string;
  created_date: string;

  created_at: string;
  updated_at: string;
  completed_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

export interface ReportVersion {
  id: string;
  report_id: string;
  version_number: number;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}
