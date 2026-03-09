import type { CalibrationGasInventoryItem, SiteAlias } from "@/types/calibrationGas";

/** Site name aliases for normalization */
export const siteAliases: SiteAlias[] = [
  { canonical: "AMMK", aliases: ["(유)에이엠케이", "에이엠케이", "한국타코닉", "구.한국타코닉"] },
  { canonical: "KEP", aliases: ["한국엔지니어링플라스틱"] },
  { canonical: "어프로티움 울산제3공장", aliases: ["덕양케미칼(1공장)", "덕양케미칼"] },
  { canonical: "오라이온코리아", aliases: ["오리온엔지니어드카본즈"] },
  { canonical: "배터리솔루션즈", aliases: ["세기리텍", "구.세기리텍"] },
  { canonical: "롯데패키징솔루션즈 평택", aliases: ["롯데알미늄 평택", "구. 롯데알미늄 평택"] },
  { canonical: "롯데패키징솔루션즈 진천", aliases: ["롯데알미늄 진천", "구. 롯데알미늄 진천"] },
  { canonical: "대륜발전", aliases: ["별내에너지"] },
  { canonical: "성합", aliases: ["삼보산업 서산"] },
  { canonical: "WTC", aliases: ["WTC 서울", "WTC서울"] },
  { canonical: "LS전선", aliases: ["LS전선 구미공장", "LS 전선 구미공장", "LS전선 구미"] },
  { canonical: "LG화학 나주공장 KFC", aliases: ["LG화학 나주", "LG화학 KFC"] },
  { canonical: "무림에스피 대구공장", aliases: ["무림에스피 대구", "무림에스피"] },
  { canonical: "현대성우캐스팅", aliases: ["현대성우"] },
  { canonical: "디에스우일바이오", aliases: [] },
  { canonical: "한솔제지 대전", aliases: ["한솔제지"] },
  { canonical: "한솔제지 천안", aliases: [] },
];

let _id = 0;
function gid(): string { return `cgas-${++_id}`; }

/** Helper to create item with defaults for new fields */
function mkItem(base: Omit<CalibrationGasInventoryItem, 'gas_inspection_first' | 'gas_inspection_last' | 'gas_inspection_next' | 'gas_inspection_round' | 'gas_inspection_so' | 'gas_inspection_so_arrival' | 'velocity_inspection_first' | 'velocity_inspection_last' | 'velocity_inspection_next' | 'velocity_inspection_round' | 'velocity_inspection_so' | 'inspection_notes' | 'contract_consumables'> & Partial<Pick<CalibrationGasInventoryItem, 'gas_inspection_first' | 'gas_inspection_last' | 'gas_inspection_next' | 'gas_inspection_round' | 'gas_inspection_so' | 'gas_inspection_so_arrival' | 'velocity_inspection_first' | 'velocity_inspection_last' | 'velocity_inspection_next' | 'velocity_inspection_round' | 'velocity_inspection_so' | 'inspection_notes' | 'contract_consumables'>>): CalibrationGasInventoryItem {
  return {
    gas_inspection_first: "",
    gas_inspection_last: "",
    gas_inspection_next: "",
    gas_inspection_round: "",
    gas_inspection_so: "",
    gas_inspection_so_arrival: "",
    velocity_inspection_first: "",
    velocity_inspection_last: "",
    velocity_inspection_next: "",
    velocity_inspection_round: "",
    velocity_inspection_so: "",
    inspection_notes: "",
    contract_consumables: "",
    ...base,
  };
}

/** Seed inventory from Excel (representative subset) */
export const seedCalibrationGasInventory: CalibrationGasInventoryItem[] = [
  // ──── WTC 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", analyzer_range: "NO 200ppm", gas_name: "NO 200ppm", concentration: "170", volume_L: "47", expiry_date: "2026-05-21", remaining_percent: "70%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/23", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,850,000", notes: "", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", gas_inspection_so: "26-0168", gas_inspection_so_arrival: "26-0168(도착완료)", velocity_inspection_first: "2017-07-26", velocity_inspection_last: "2025-08-06", velocity_inspection_next: "2026-08-05", velocity_inspection_round: "6차", velocity_inspection_so: "26-0168", inspection_notes: "가스분석기 유속계 정도검사 3,4월 종료되는걸로 희망", contract_consumables: "월1회" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.02%", volume_L: "30", expiry_date: "2027-01-28", remaining_percent: "94%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "47", expiry_date: "2026-05-21", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "", gas_inspection_first: "2024-05-16", gas_inspection_next: "2026-03-01", gas_inspection_round: "1차" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "30", expiry_date: "2027-01-28", remaining_percent: "95%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── WTC 2호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", analyzer_range: "NO 200ppm", gas_name: "NO 200ppm", concentration: "170", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "70%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "#1,2,3호기 공동 사용", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", velocity_inspection_first: "2017-07-27", velocity_inspection_last: "2025-07-29", velocity_inspection_next: "2026-07-28" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.02%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "94%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "95%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── WTC 3호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", analyzer_range: "NO 200ppm", gas_name: "NO 200ppm", concentration: "170", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "70%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", velocity_inspection_first: "2017-07-27", velocity_inspection_last: "2025-08-06", velocity_inspection_next: "2026-08-05", velocity_inspection_round: "6차" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.02%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "94%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "95%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── LS전선 1호기 ────
  mkItem({ id: gid(), contract_end_date: null, site_name: "LS전선", tms_status: "전송", unit_no: "1", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-22", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "2/27", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,100,000", notes: "", gas_inspection_first: "2021-12-02", gas_inspection_last: "2025-12-01", gas_inspection_next: "2026-12-01", gas_inspection_round: "3차", velocity_inspection_first: "2021-09-09", velocity_inspection_last: "2026-01-27", velocity_inspection_next: "2027-01-27", velocity_inspection_round: "2차", contract_consumables: "월1회" }),
  mkItem({ id: gid(), contract_end_date: null, site_name: "LS전선", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2 200/500ppm", gas_name: "NO/SO2 200/500ppm", concentration: "171.9/427ppm", volume_L: "10", expiry_date: "2026-12-22", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── OCI포항 Tar(#2) ────
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", analyzer_range: "NO/SO2/CO Zero", gas_name: "NO/SO2/CO Zero", concentration: "N2", volume_L: "10", expiry_date: null, remaining_percent: "90%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "월 4회(주 1회)", md: "2 M/D", monthly_amount: "5,000,000", notes: "", gas_inspection_first: "2025-11-10", gas_inspection_next: "2027-11-09", gas_inspection_round: "1차", gas_inspection_so: "사업장 진행(별도관리X)", velocity_inspection_first: "2024-03-11", velocity_inspection_next: "2026-03-10", velocity_inspection_so: "사업장 진행(별도관리X)", contract_consumables: "월2회 이상" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", analyzer_range: "NO/SO2 200/200", gas_name: "NO/SO2 200/200ppm", concentration: "170/170ppm", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "80%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", analyzer_range: "CO 500ppm", gas_name: "CO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", analyzer_range: "O2 Span", gas_name: "O2 Span", concentration: "21.01%", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "98%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── KEP 41(30톤) ────
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", analyzer_range: "NO/O2 Zero", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "25-3346", arrival_status: "25-3346", branch: "영남", inspection_date: "2/2", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "3,120,000", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", analyzer_range: "NO 200ppm", gas_name: "NO 200ppm", concentration: "171.5ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "영남", inspection_date: "2/19", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── 동서식품 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-20", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/9", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,000,000", notes: "", contract_consumables: "월1회" }),
  mkItem({ id: gid(), contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", analyzer_range: "NO 200ppm", gas_name: "NO 200ppm", concentration: "170.4ppm", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "2.01%", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── AMMK A6 ────
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "AMMK", tms_status: "전송", unit_no: "A6", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/27", inspection_cycle: "월 1회", md: "2M/D", monthly_amount: "1,500,000", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "AMMK", tms_status: "전송", unit_no: "A6", analyzer_range: "NO 500ppm", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "61%", purchase_entity: "", so_issue: "26-0187", arrival_status: "3/13", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── AMMK A7 ────
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "AMMK", tms_status: "전송", unit_no: "A7", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-05", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-12-31", site_name: "AMMK", tms_status: "전송", unit_no: "A7", analyzer_range: "NO 500ppm", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "72%", purchase_entity: "", so_issue: "26-0187", arrival_status: "3/13", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── 계룡소각장 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2025-02-14", remaining_percent: "100%", purchase_entity: "발주처", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "9/15", inspection_cycle: "월 2회", md: "1 M/D", monthly_amount: "1,181,819", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2025-08-28", remaining_percent: "80%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", analyzer_range: "HCL 50ppm", gas_name: "HCL 50ppm", concentration: "39.5ppm", volume_L: "10", expiry_date: "2025-04-30", remaining_percent: "42%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2/CO 200/100/500ppm", gas_name: "NO/SO2/CO 200/100/500ppm", concentration: "165.5/80.8/417ppm", volume_L: "10", expiry_date: "2025-08-28", remaining_percent: "23%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── 금강공업 (음성) 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "1", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "61%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/20", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,500,000", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2 500/500ppm", gas_name: "NO/SO2 500/500ppm", concentration: "430/427ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "95%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── GS동해전력 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2 Zero", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "70%", purchase_entity: "디엑스지", so_issue: "25-0033", arrival_status: "도착완료", branch: "본사", inspection_date: "7/2", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2 200/200ppm", gas_name: "NO/SO2 200/200ppm", concentration: "160.7/161.1ppm", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "80%", purchase_entity: "", so_issue: "25-0033", arrival_status: "도착완료", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "1.98%", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "100%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", analyzer_range: "O2 Span", gas_name: "O2 Span", concentration: "20.18%", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "50%", purchase_entity: "", so_issue: "25-0033", arrival_status: "도착완료", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),

  // ──── 동일제강 18호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "18", analyzer_range: "NO Zero", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/13", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "4,175,000", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "18", analyzer_range: "NO/SO2 500/500ppm", gas_name: "NO/SO2 500/500ppm", concentration: "432/472ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "0%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "2차 점검 때 레귤레이터 확인 필요" }),

  // ──── 삼양사 인천 1공장 1호기 ────
  mkItem({ id: gid(), contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", analyzer_range: "NO, SO2 Zero", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "디엑스지", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "2/5", inspection_cycle: "월 2회", md: "", monthly_amount: "1,400,000", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", analyzer_range: "NO/SO2 500/500ppm", gas_name: "NO/SO2 500/500ppm", concentration: "429/428ppm", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "80%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", analyzer_range: "O2 Zero", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "80%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
  mkItem({ id: gid(), contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", analyzer_range: "O2 25%", gas_name: "O2 25%", concentration: "21.04%", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "65%", purchase_entity: "", so_issue: "", arrival_status: "", branch: "본사", inspection_date: "", inspection_cycle: "", md: "", monthly_amount: "", notes: "" }),
];
