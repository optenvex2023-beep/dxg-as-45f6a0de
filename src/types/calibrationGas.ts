/* ── Calibration Gas module types ── */

export interface CalibrationGasInventoryItem {
  id: string;
  contract_end_date: string | null;
  site_name: string;           // 사업장명
  tms_status: string;          // 전송/비전송/미전송
  unit_no: string;             // 호기
  analyzer_range: string;      // 분석기 Range
  gas_name: string;            // 교정가스 종류 (e.g. "NO 200ppm", "O2 25%")
  concentration: string;       // 농도 (ppm, %)
  volume_L: string;            // 용량(L)
  expiry_date: string | null;  // 유효기간
  remaining_percent: string;   // 잔량(%)
  purchase_entity: string;     // 구매 주체
  so_issue: string;            // S/O 발행
  arrival_status: string;      // 도착예정
  branch: string;              // 지점
  inspection_date: string;     // 점검일
  inspection_cycle: string;    // 점검주기
  md: string;                  // M/D
  monthly_amount: string;      // 월 금액
  notes: string;               // 비고
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
export type CalGasNotificationType = "expiry_soon" | "low_remaining" | "match_failed" | "review_needed";

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
