/* ── Calibration Gas module types ── */

export interface CalibrationGasInventoryItem {
  id: string;
  contract_end_date: string | null;  // A열: 유지보수 계약 종료일
  site_name: string;                 // B열: 사업장명
  tms_status: string;                // C열: TMS 전송 유무
  unit_no: string;                   // D열: 호기
  analyzer_range: string;            // E열: 분석기 Range
  gas_name: string;                  // F열: 교정가스 종류
  concentration: string;             // F열: 농도 (ppm, %)
  volume_L: string;                  // G열: 용량(L)
  expiry_date: string | null;        // H열: 유효기간
  remaining_percent: string;         // I열: 잔량(%)
  purchase_entity: string;           // J열: 구매 주체
  so_issue: string;                  // K열: S/O 발행
  arrival_status: string;            // L열: 도착예정
  branch: string;                    // M열: 지점

  /* ── 가스상 정도검사 (N~S열) ── */
  gas_inspection_first: string;      // N열: 최초
  gas_inspection_last: string;       // O열: 최종
  gas_inspection_next: string;       // P열: 예정
  gas_inspection_round: string;      // Q열: 차수
  gas_inspection_so: string;         // R열: S/O 발행
  gas_inspection_so_arrival: string; // S열: S/O 도착

  /* ── 유속계 정도검사 (T~X열) ── */
  velocity_inspection_first: string;  // T열: 최초
  velocity_inspection_last: string;   // U열: 최종
  velocity_inspection_next: string;   // V열: 예정
  velocity_inspection_round: string;  // W열: 차수
  velocity_inspection_so: string;     // X열: S/O 발행

  /* ── Y~AE열 ── */
  inspection_notes: string;           // Y열: 비고사항
  inspection_date: string;            // Z열: 점검일
  inspection_cycle: string;           // AA열: 점검주기
  md: string;                         // AB열: M/D
  monthly_amount: string;             // AC열: 월 금액
  contract_consumables: string;       // AD열: 계약 내 소모품 포함 항목
  notes: string;                      // AE열: 비고

  /* ── 병합 그룹 (DB 전용) ── */
  gas_inspection_merge_group?: number;
  velocity_inspection_merge_group?: number;
  purchase_entity_merge_group?: number;
  branch_merge_group?: number;
  sort_order?: number;
}

/** Site name alias map for normalization */
export interface SiteAlias {
  canonical: string;
  aliases: string[];
}

/** Uploaded file tracking */
export type UploadStatus = "pending" | "extracted" | "matched" | "review_needed" | "match_failed" | "applied" | "rejected";

export interface CalibrationGasUploadFile {
  id: string;
  file_name: string;
  file_type: string;           // pdf, jpg, png, xlsx
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  status: UploadStatus;
}

/** Extraction result per file (one file = one unit) */
export interface CalibrationGasExtraction {
  id: string;
  upload_file_id: string;
  file_name: string;
  detected_site: string;
  detected_unit: string;
  items: CalibrationGasExtractionItem[];
  match_status: "matched" | "review_needed" | "match_failed";
  matched_inventory_ids: string[];   // matched inventory row IDs
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface CalibrationGasExtractionItem {
  gas_name: string;
  remaining_percent: string;
  expiry_date: string;
}

/** Update history record */
export interface CalibrationGasHistory {
  id: string;
  inventory_item_id: string;
  file_name: string;
  field_name: string;            // "remaining_percent" | "expiry_date"
  before_value: string;
  after_value: string;
  updated_at: string;
  updated_by: string;
}

/** Calibration gas notification */
export type CalGasNotificationType = "expiry_soon" | "low_remaining" | "match_failed" | "review_needed" | "gas_inspection_due" | "velocity_inspection_due";

export interface CalibrationGasNotification {
  id: string;
  type: CalGasNotificationType;
  title: string;
  body: string;
  link_url: string | null;
  created_at: string;
  read_at: string | null;
  related_id: string | null;
}
