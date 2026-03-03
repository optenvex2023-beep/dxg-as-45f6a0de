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
  emp_no: string;
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

  // Notification dedup flags
  noti_confirm_needed_sent_at: string | null;
  noti_dispatch_plan_sent_at: string | null;
  noti_dispatch_done_sent_at: string | null;
  noti_first_check_done_sent_at: string | null;
  noti_final_check_done_sent_at: string | null;
  noti_install_done_sent_at: string | null;
  due_alert_sent_at: string | null;
}

// In-app notification
export interface InAppNotification {
  id: string;
  recipient_user_id: string;
  title: string;
  body: string;
  link_url: string | null;
  entity_type: string; // "status" | "first_report" | "final_report"
  entity_id: string | null;
  created_at: string;
  read_at: string | null;
}

// Legacy notification/mail types (kept for backward compat)
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

export type InspectionResultOption = "사용 가능" | "교체 필요" | "추후 교체 권장" | "직접 기입" | "";

export interface InspectionCheckItem {
  category: string;
  item: string;
  result: "양호" | "추가점검 필요" | "";
  action: string;
  action_result: string;
  inspection_result_option: InspectionResultOption;
  inspection_result_detail: string;
}

export interface ReplacementPart {
  name: string;
  qty: string;
  status: string;
  note: string;
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  file_url: string;
  caption: string;
  page_slot: string;
  order_index: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface InspectionReportData {
  client_name: string;
  serial_no: string;
  inbound_date: string;
  related_doc: string;
  model_checks: string[];
  inbound_items: string[];

  inbound_type: string[];
  site_situation: string;
  client_request: string;

  voltage_main: string[];
  voltage_purge: string[];
  measure_gas: string[];
  install_type: string[];

  check_items: InspectionCheckItem[];
  replacement_parts: ReplacementPart[];

  detail_notes: string;
  main_control_cpu: string;
  optics_window_lens: string;

  beam_splitter_contamination: string;
  beam_splitter_result: string;
  spectrometer_status: string;
  spectrometer_result: string;
  uv_lamp_note: string;
  cooling_fan_status: string;
  smps_note: string;
  wiring_status: string;

  probe_exterior: string;
  probe_temp_sensor: string;
  probe_corner_mirror: string;
  probe_length: string;
  probe_measure_section: string;
  probe_gas_direction: string;

  summary_items: string[];
  department_head: string;
  photos: ReportPhoto[];
}

export type QAReviewStatus = "미검토" | "검토완료";

export interface InspectionReport {
  id: string;
  inspection_id: string;
  equipment_item_id: string;
  report_type: ReportType;
  status: ReportStatus;

  serial_numbers: Record<string, string>;
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

  qa_review_status: QAReviewStatus;
  qa_reviewer_name: string | null;
  qa_reviewed_at: string | null;
  qa_signature_applied: boolean;
  qa_notification_sent_to_sales: boolean;
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
