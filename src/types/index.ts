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
