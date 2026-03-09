import type { CalibrationGasInventoryItem, SiteAlias } from "@/types/calibrationGas";

/** Site name aliases for normalization */
export const siteAliases: SiteAlias[] = [
  { canonical: "AMMK", aliases: ["(유)에이엠케이", "에이엠케이", "한국타코닉", "구.한국타코닉"] },
  { canonical: "KEP", aliases: ["한국엔지니어링플라스틱", "KEP(한국엔지니어링플라스틱)"] },
  { canonical: "어프로티움 울산제3공장", aliases: ["덕양케미칼(1공장)", "덕양케미칼"] },
  { canonical: "어프로티움 울산제2공장", aliases: [] },
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
  { canonical: "GS동해전력", aliases: [] },
  { canonical: "금산군 소각장", aliases: ["대경에스코"] },
  { canonical: "동양환경", aliases: [] },
  { canonical: "동우화인켐", aliases: [] },
  { canonical: "동일산업", aliases: [] },
  { canonical: "동일제강", aliases: [] },
  { canonical: "동희오토 서산공장", aliases: ["동희오토"] },
  { canonical: "드림아스콘", aliases: [] },
  { canonical: "모나리자 전주공장", aliases: ["모나리자"] },
  { canonical: "부국산업", aliases: [] },
  { canonical: "삼보산업 창원", aliases: [] },
  { canonical: "삼현", aliases: [] },
  { canonical: "삼현 (신규)", aliases: [] },
  { canonical: "성훈엔지니어링", aliases: [] },
  { canonical: "수완에너지", aliases: [] },
  { canonical: "수원하수슬러지 처리시설", aliases: [] },
  { canonical: "쌍용C&B", aliases: [] },
  { canonical: "씨엔씨티에너지 학하CES", aliases: [] },
  { canonical: "여천NCC 1공장", aliases: [] },
  { canonical: "여천NCC 3공장", aliases: [] },
  { canonical: "여천NCC 4공장", aliases: [] },
  { canonical: "오뚜기 대풍공장", aliases: [] },
  { canonical: "일진전기", aliases: [] },
  { canonical: "전북대학교병원", aliases: [] },
  { canonical: "한국주철관공업", aliases: [] },
  { canonical: "현성세라믹", aliases: [] },
  { canonical: "휴스틸", aliases: [] },
  { canonical: "영화금속", aliases: [] },
  { canonical: "금강공업 언양", aliases: [] },
  { canonical: "디알액시온 원산", aliases: [] },
  { canonical: "영월빛드림", aliases: [] },
  { canonical: "태평양금속", aliases: ["태평양금속 (구미)"] },
  { canonical: "삼일씨엔에스", aliases: [] },
  { canonical: "이구산업", aliases: [] },
  { canonical: "김포발전-TMS", aliases: [] },
  { canonical: "김포발전-SCR", aliases: [] },
  { canonical: "GS EPS", aliases: [] },
  { canonical: "삼우 2공장", aliases: [] },
  { canonical: "브이피에이치메탈", aliases: [] },
  { canonical: "명화공업(CPC)", aliases: [] },
  { canonical: "명화공업-세명(COBA)", aliases: [] },
  { canonical: "울산 GPS", aliases: [] },
  { canonical: "코미코", aliases: [] },
  { canonical: "한국가스공사 창원수소", aliases: [] },
  { canonical: "프린스페이퍼", aliases: ["네오그린텍"] },
  { canonical: "검단지역난방설비", aliases: ["청라에너지"] },
  { canonical: "한국 바스프 여수", aliases: ["한전산업개발", "사이스여수열병합"] },
  { canonical: "앰코테크놀로지 송도", aliases: [] },
  { canonical: "클린코리아 경주", aliases: [] },
];

let _id = 0;
function gid(): string { return `cgas-${++_id}`; }

/** Helper to create item with defaults */
function mk(base: Partial<CalibrationGasInventoryItem> & { site_name: string; unit_no: string; gas_name: string }): CalibrationGasInventoryItem {
  return {
    id: gid(),
    contract_end_date: base.contract_end_date ?? null,
    site_name: base.site_name,
    tms_status: base.tms_status ?? "",
    unit_no: base.unit_no,
    analyzer_range: base.analyzer_range ?? base.gas_name,
    gas_name: base.gas_name,
    concentration: base.concentration ?? "",
    volume_L: base.volume_L ?? "",
    expiry_date: base.expiry_date ?? null,
    remaining_percent: base.remaining_percent ?? "",
    purchase_entity: base.purchase_entity ?? "",
    so_issue: base.so_issue ?? "",
    arrival_status: base.arrival_status ?? "",
    branch: base.branch ?? "",
    gas_inspection_first: base.gas_inspection_first ?? "",
    gas_inspection_last: base.gas_inspection_last ?? "",
    gas_inspection_next: base.gas_inspection_next ?? "",
    gas_inspection_round: base.gas_inspection_round ?? "",
    gas_inspection_so: base.gas_inspection_so ?? "",
    gas_inspection_so_arrival: base.gas_inspection_so_arrival ?? "",
    velocity_inspection_first: base.velocity_inspection_first ?? "",
    velocity_inspection_last: base.velocity_inspection_last ?? "",
    velocity_inspection_next: base.velocity_inspection_next ?? "",
    velocity_inspection_round: base.velocity_inspection_round ?? "",
    velocity_inspection_so: base.velocity_inspection_so ?? "",
    inspection_notes: base.inspection_notes ?? "",
    inspection_date: base.inspection_date ?? "",
    inspection_cycle: base.inspection_cycle ?? "",
    md: base.md ?? "",
    monthly_amount: base.monthly_amount ?? "",
    contract_consumables: base.contract_consumables ?? "",
    notes: base.notes ?? "",
  };
}

/** Full inventory from Excel "유지보수 사업장 교정가스 현황_260309 ★" */
export const seedCalibrationGasInventory: CalibrationGasInventoryItem[] = [

  // ══════════════════════════════════════
  // WTC 1호기
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "170", volume_L: "47", expiry_date: "2026-05-21", remaining_percent: "70%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", gas_inspection_so: "26-0168", gas_inspection_so_arrival: "26-0168(도착완료)", velocity_inspection_first: "2017-07-26", velocity_inspection_last: "2025-08-06", velocity_inspection_next: "2026-08-05", velocity_inspection_round: "6차", velocity_inspection_so: "26-0168", inspection_notes: "가스분석기 유속계 정도검사 3,4월 종료되는걸로 희망(기준일 맞추기 위해서)", inspection_date: "2/23", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,850,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.02%", volume_L: "30", expiry_date: "2027-01-28", remaining_percent: "94%" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "47", expiry_date: "2026-05-21", remaining_percent: "100%", gas_inspection_first: "2024-05-16", gas_inspection_next: "2026-03-01", gas_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "30", expiry_date: "2027-01-28", remaining_percent: "95%" }),

  // WTC 2호기
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", gas_name: "NO 200ppm", concentration: "170", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "70%", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", velocity_inspection_first: "2017-07-27", velocity_inspection_last: "2025-07-29", velocity_inspection_next: "2026-07-28" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.02%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "94%" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "비전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "95%" }),

  // WTC 3호기
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", gas_name: "NO 200ppm", concentration: "170", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "70%", gas_inspection_first: "2017-07-14", gas_inspection_last: "2025-05-21", gas_inspection_next: "2026-03-01", gas_inspection_round: "5차", velocity_inspection_first: "2017-07-27", velocity_inspection_last: "2025-08-06", velocity_inspection_next: "2026-08-05", velocity_inspection_round: "6차" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", gas_name: "O2 25%", concentration: "21.02%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "94%" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2026-05-21", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-06-30", site_name: "WTC", tms_status: "전송", unit_no: "3", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "#1,2,3호기 공동 사용", expiry_date: "2027-01-28", remaining_percent: "95%" }),

  // ══════════════════════════════════════
  // LG화학 나주공장 KFC
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT-9601", gas_name: "NO Zero", concentration: "N2", purchase_entity: "디엑스지", branch: "호남", inspection_date: "", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "2,166,667", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT-9601", gas_name: "NO 402ppm", concentration: "402", expiry_date: null, remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT-9601", gas_name: "NO2 400ppm", concentration: "400", expiry_date: "2022-01-26", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT7301A", gas_name: "-", concentration: "-" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT7501A", gas_name: "-", concentration: "-" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT7701A", gas_name: "NOx", concentration: "25.7" }),
  mk({ contract_end_date: "2026-05-30", site_name: "LG화학 나주공장 KFC", tms_status: "비전송", unit_no: "AT7701A", gas_name: "NH3", concentration: "20" }),

  // ══════════════════════════════════════
  // LS전선
  // ══════════════════════════════════════
  mk({ contract_end_date: null, site_name: "LS전선", tms_status: "", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-22", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2021-12-02", gas_inspection_last: "2025-12-01", gas_inspection_next: "2026-12-01", gas_inspection_round: "3차", velocity_inspection_first: "2021-09-09", velocity_inspection_last: "2026-01-27", velocity_inspection_next: "2027-01-27", velocity_inspection_round: "2차", inspection_date: "2/27", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,100,000", contract_consumables: "월1회", notes: "계약없이 매달 발주로 진행" }),
  mk({ contract_end_date: null, site_name: "LS전선", tms_status: "", unit_no: "1", gas_name: "NO/SO2 200/500ppm", concentration: "171.9/427ppm", volume_L: "10", expiry_date: "2026-12-22", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // OCI포항 Tar(#2)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", gas_name: "NO/SO2/CO Zero", concentration: "N2", volume_L: "10", remaining_percent: "90%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2025-11-10", gas_inspection_next: "2027-11-09", gas_inspection_round: "1차", gas_inspection_so: "사업장 진행(별도관리X)", velocity_inspection_first: "2024-03-11", velocity_inspection_next: "2026-03-10", velocity_inspection_so: "사업장 진행(별도관리X)", inspection_cycle: "월 4회(주 1회)", md: "2 M/D", monthly_amount: "5,000,000", contract_consumables: "월2회 이상" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", gas_name: "NO/SO2 200/200ppm", concentration: "170/170ppm", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "80%", notes: "25.11.17_월 500견적으로 내년 계약 가능할듯 (이승일매니저)" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", gas_name: "CO 500ppm (비전송)", concentration: "425ppm", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "100%", notes: "26.03.04_O2 sensor 반응속도 느림? 25년 11월 정도검사 후 운영으로 유상청구는 어려운" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#2)", gas_name: "O2 Span", concentration: "21.01%", volume_L: "10", expiry_date: "2026-10-23", remaining_percent: "98%" }),

  // OCI포항 Tar(#3)
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#3)", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", gas_inspection_first: "2022-01-19", gas_inspection_last: "2024-08-04", gas_inspection_next: "2026-08-03", velocity_inspection_first: "2021-11-10", velocity_inspection_last: "2025-11-08", velocity_inspection_next: "2026-11-08", inspection_date: "2/13" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#3)", gas_name: "NO/SO2 200/200ppm", concentration: "170/170ppm", volume_L: "10", expiry_date: "2026-12-17", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#3)", gas_name: "CO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-12-17", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "Tar(#3)", gas_name: "O2 Span", concentration: "21.00%", volume_L: "10", expiry_date: "2026-12-22", remaining_percent: "93%", gas_inspection_first: "2022-01-19", gas_inspection_last: "2024-01-18", gas_inspection_next: "2026-01-18" }),

  // OCI포항 카본(#28)
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "카본(#28)", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", gas_inspection_first: "2022-02-04", gas_inspection_last: "2026-02-03", gas_inspection_next: "2027-02-03", gas_inspection_round: "2차", velocity_inspection_first: "2021-11-10", velocity_inspection_last: "2025-11-09", velocity_inspection_next: "2026-11-09", velocity_inspection_round: "2차" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "카본(#28)", gas_name: "NO/SO2 600/600ppm", concentration: "515/515ppm", volume_L: "10", expiry_date: "2026-11-26", remaining_percent: "85%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "카본(#28)", gas_name: "O2 Span", concentration: "21.00%", volume_L: "10", expiry_date: "2026-10-22", remaining_percent: "90%" }),

  // OCI포항 PAP(#19)
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "PAP(#19)", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "35%", gas_inspection_first: "2022-09-01", gas_inspection_last: "2024-08-31", gas_inspection_next: "2026-08-31", gas_inspection_round: "2차", velocity_inspection_first: "2021-11-09", velocity_inspection_last: "2025-11-08", velocity_inspection_next: "2026-02-13", velocity_inspection_round: "2차", inspection_notes: "기기 정도검사 확인 필요", inspection_date: "2/27" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "전송", unit_no: "PAP(#19)", gas_name: "NO/SO2 200/100ppm", concentration: "175/85ppm", volume_L: "10", expiry_date: "2026-04-22", remaining_percent: "84%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "미전송", unit_no: "PAP(#19)", gas_name: "O2 Span (비전송)", concentration: "20.94%", volume_L: "10", expiry_date: "2026-07-03", remaining_percent: "68%" }),

  // OCI포항 Dust
  mk({ contract_end_date: "2026-12-31", site_name: "OCI포항", tms_status: "", unit_no: "Dust", gas_name: "Dust", volume_L: "10", gas_inspection_first: "2023-02-20", gas_inspection_next: "2025-02-20", gas_inspection_round: "1차" }),

  // ══════════════════════════════════════
  // GS동해전력 1호기
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "70%", purchase_entity: "디엑스지", so_issue: "25-0033", arrival_status: "도착완료", branch: "본사", gas_inspection_first: "2017-07-20", gas_inspection_last: "2024-07-19", gas_inspection_next: "2025-07-19", velocity_inspection_first: "2021-07-20", velocity_inspection_last: "2023-07-19", velocity_inspection_next: "2025-07-19", velocity_inspection_round: "5차", inspection_notes: "사업장진행", inspection_date: "7/2", inspection_cycle: "월 2회", md: "2 M/D", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 200/200ppm", concentration: "160.7/161.1ppm", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "80%", so_issue: "25-0033", arrival_status: "도착완료" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "1.98%", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "100%", gas_inspection_first: "2016-06-29", gas_inspection_last: "2024-06-28", gas_inspection_next: "2025-06-28", velocity_inspection_first: "2016-06-29", velocity_inspection_last: "2024-06-28", velocity_inspection_next: "2025-06-28", velocity_inspection_round: "7차" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", gas_name: "O2 Span", concentration: "20.18%", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "50%", so_issue: "25-0033", arrival_status: "도착완료" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "1", gas_name: "Dust", gas_inspection_first: "2016-06-29", gas_inspection_last: "2024-06-28", gas_inspection_next: "2025-06-28" }),

  // GS동해전력 2호기
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "90%", so_issue: "25-0033", arrival_status: "도착완료", gas_inspection_first: "2017-07-20", gas_inspection_last: "2024-07-19", gas_inspection_next: "2025-07-19", velocity_inspection_first: "2017-07-20", velocity_inspection_last: "2024-07-19", velocity_inspection_next: "2025-07-19", velocity_inspection_round: "5차" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 200/200ppm", concentration: "161.1/161.2ppm", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "90%", purchase_entity: "25-0033", arrival_status: "도착완료" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "90%", purchase_entity: "25-0033", arrival_status: "도착완료", gas_inspection_first: "2022-06-22", gas_inspection_next: "2025-06-21", gas_inspection_round: "2차", velocity_inspection_first: "2022-06-22", velocity_inspection_next: "2025-06-21", velocity_inspection_round: "2차" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "2", gas_name: "O2 Span", concentration: "20.01%", volume_L: "10", expiry_date: "2026-02-03", remaining_percent: "90%", purchase_entity: "25-0033", arrival_status: "도착완료" }),
  mk({ contract_end_date: "2027-12-31", site_name: "GS동해전력", tms_status: "전송", unit_no: "2", gas_name: "Dust", gas_inspection_first: "2017-07-20", gas_inspection_last: "2024-07-19", gas_inspection_next: "2025-07-19" }),

  // ══════════════════════════════════════
  // KEP 41(30톤)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2021-09-27", gas_inspection_last: "2025-08-20", gas_inspection_next: "2026-08-19", gas_inspection_so: "25-3346", gas_inspection_so_arrival: "25-3346", velocity_inspection_first: "2021-09-27", velocity_inspection_last: "2025-03-25", velocity_inspection_next: "2026-03-24", velocity_inspection_so: "25-3346", inspection_date: "2/2", inspection_cycle: "월 2회(30,80,100 2회 921LMP 2회)->매주", md: "2 M/D", monthly_amount: "3,120,000", notes: "2개월 전 인상 언급해야한다고 함" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", gas_name: "NO 200ppm", concentration: "171.5ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "41(30톤)", gas_name: "Dust", gas_inspection_first: "2025-05-07", gas_inspection_next: "2027-05-06" }),

  // KEP 57(80톤)
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "57(80톤)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", gas_inspection_first: "2021-10-06", gas_inspection_last: "2025-10-05", gas_inspection_next: "2026-10-05", gas_inspection_round: "3차", velocity_inspection_first: "2021-09-28", velocity_inspection_last: "2025-09-27", velocity_inspection_next: "2026-09-27", inspection_date: "2/2" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "57(80톤)", gas_name: "NO 200ppm", concentration: "171.7ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "57(80톤)", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", inspection_date: "2/19" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "57(80톤)", gas_name: "Dust", concentration: "교체", gas_inspection_first: "2024-10-30", gas_inspection_next: "2026-10-29", gas_inspection_round: "1차" }),

  // KEP 48(100톤)
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "48(100톤)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", gas_inspection_first: "2021-10-07", gas_inspection_last: "2025-08-20", gas_inspection_next: "2026-08-19", velocity_inspection_first: "2021-09-28", velocity_inspection_last: "2025-03-07", velocity_inspection_next: "2026-03-07", inspection_date: "2/2" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "48(100톤)", gas_name: "NO 200ppm", concentration: "171.6ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "48(100톤)", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", inspection_date: "2/19" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "48(100톤)", gas_name: "Dust", concentration: "교체", gas_inspection_first: "2024-06-27", gas_inspection_next: "2026-06-26", gas_inspection_round: "1차" }),

  // KEP #6(921M)
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#6(921M)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", gas_inspection_first: "2022-08-11", gas_inspection_last: "2024-08-10", gas_inspection_next: "2026-08-10", gas_inspection_round: "2차", gas_inspection_so: "25-3346", gas_inspection_so_arrival: "25-3346", velocity_inspection_first: "2021-09-28", velocity_inspection_last: "2025-09-27", velocity_inspection_next: "2026-09-27", inspection_date: "2/9" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#6(921M)", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#6(921M)", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", inspection_date: "2/23" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#6(921M)", gas_name: "Dust", gas_inspection_first: "2022-11-03", gas_inspection_last: "2024-08-21", gas_inspection_next: "2026-08-20", gas_inspection_round: "2차" }),

  // KEP #7(921L)
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#7(921L)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", gas_inspection_first: "2022-08-11", gas_inspection_last: "2024-08-10", gas_inspection_next: "2026-08-10", gas_inspection_round: "2차", velocity_inspection_first: "2021-09-28", velocity_inspection_last: "2025-09-27", velocity_inspection_next: "2026-09-27", inspection_date: "2/9" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#7(921L)", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#7(921L)", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", inspection_date: "2/23" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#7(921L)", gas_name: "Dust" }),

  // KEP #8(921P)
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#8(921P)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", gas_inspection_first: "2022-08-11", gas_inspection_last: "2024-08-10", gas_inspection_next: "2026-08-10", gas_inspection_round: "2차", velocity_inspection_first: "2021-09-28", velocity_inspection_last: "2025-09-27", velocity_inspection_next: "2026-09-27", inspection_date: "2/9" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#8(921P)", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#8(921P)", gas_name: "O2 25%", concentration: "21.04%", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "99%", inspection_date: "2/23" }),
  mk({ contract_end_date: "2026-12-31", site_name: "KEP", tms_status: "전송", unit_no: "#8(921P)", gas_name: "Dust" }),

  // ══════════════════════════════════════
  // 계룡소각장 1호기
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2025-02-14", remaining_percent: "100%", purchase_entity: "발주처", branch: "본사", gas_inspection_first: "2019-09-20", gas_inspection_last: "2025-09-20", gas_inspection_next: "2026-09-20", gas_inspection_so: "사업장진행", gas_inspection_so_arrival: "사업장진행", velocity_inspection_first: "2019-10-11", velocity_inspection_last: "2025-10-10", velocity_inspection_next: "2026-10-10", velocity_inspection_so: "사업장진행", inspection_date: "9/15", inspection_cycle: "월 2회", md: "1 M/D", monthly_amount: "1,181,819", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2025-08-28", remaining_percent: "80%" }),
  mk({ contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", gas_name: "HCL 50ppm", concentration: "39.5ppm", volume_L: "10", expiry_date: "2025-04-30", remaining_percent: "42%" }),
  mk({ contract_end_date: "2027-02-28", site_name: "계룡소각장", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2/CO 200/100/500ppm", concentration: "165.5/80.8/417ppm", volume_L: "10", expiry_date: "2025-08-28", remaining_percent: "23%", gas_inspection_last: "2025-09-20", gas_inspection_next: "2026-09-20" }),

  // ══════════════════════════════════════
  // 금강공업 (음성)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "61%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-06-16", gas_inspection_last: "2025-06-15", gas_inspection_next: "2026-06-15", gas_inspection_round: "3차", gas_inspection_so: "사업장신청", velocity_inspection_first: "2021-07-05", velocity_inspection_last: "2025-07-04", velocity_inspection_next: "2026-07-04", velocity_inspection_round: "2차", inspection_notes: "정도검사(유속) s/o 이력없음", inspection_date: "2/20", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,500,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 500/500ppm", concentration: "430/427ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "95%" }),
  mk({ contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "79%", velocity_inspection_first: "2021-06-18", velocity_inspection_last: "2025-06-17", velocity_inspection_next: "2026-06-17", velocity_inspection_round: "2차" }),
  mk({ contract_end_date: "2027-02-28", site_name: "금강공업 (음성)", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 500/500ppm", concentration: "431/428ppm", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "69%" }),

  // ══════════════════════════════════════
  // 금산군 소각장 (대경에스코)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "금산군 소각장", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", remaining_percent: "24%", purchase_entity: "디엑스지", so_issue: "26-0193", arrival_status: "3/6", branch: "본사", gas_inspection_first: "2019-05-21", gas_inspection_last: "2026-01-19", gas_inspection_next: "2027-01-19", gas_inspection_round: "4차", gas_inspection_so: "사업장신청", velocity_inspection_first: "2019-01-16", velocity_inspection_last: "2026-01-16", velocity_inspection_next: "2027-01-16", velocity_inspection_round: "5차", velocity_inspection_so: "사업장진행(일정관리X)", inspection_cycle: "월 4회(주 1회)", md: "2 M/D", monthly_amount: "2,600,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-12-31", site_name: "금산군 소각장", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2/CO 200/200/600ppm", concentration: "171.2/170.7/518ppm", volume_L: "10", expiry_date: "2026-09-10", remaining_percent: "56%", gas_inspection_first: "2019-06-26", gas_inspection_last: "2026-01-19", gas_inspection_next: "2027-01-19", gas_inspection_round: "4차" }),
  mk({ contract_end_date: "2026-12-31", site_name: "금산군 소각장", tms_status: "전송", unit_no: "1", gas_name: "HCL 50ppm", concentration: "43ppm", volume_L: "30", expiry_date: "2026-07-07", remaining_percent: "100%", gas_inspection_first: "2019-05-21", gas_inspection_last: "2026-01-19", gas_inspection_next: "2027-01-19", gas_inspection_round: "4차" }),
  mk({ contract_end_date: "2026-12-31", site_name: "금산군 소각장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.84%", volume_L: "10", expiry_date: "2026-11-19", remaining_percent: "67%", inspection_date: "2/26" }),
  mk({ contract_end_date: "2026-12-31", site_name: "금산군 소각장", tms_status: "전송", unit_no: "1", gas_name: "Dust", remaining_percent: "." }),

  // ══════════════════════════════════════
  // 어프로티움 울산제3공장 1호기
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-09", remaining_percent: "88%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2021-01-20", gas_inspection_last: "2026-01-19", gas_inspection_next: "2027-01-19", velocity_inspection_first: "2020-06-29", velocity_inspection_last: "2025-06-28", velocity_inspection_next: "2026-06-28", velocity_inspection_round: "3차", velocity_inspection_so: "25-3335", inspection_date: "2/6", inspection_cycle: "월 2회(24/6/1~)", md: "2 M/D", monthly_amount: "1,800,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "176ppm", volume_L: "10", expiry_date: "2026-07-09", remaining_percent: "76%", notes: "010-4773-9954 (김다솜) 금액 오를 시 유선으로 사전 인폼 요청" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.02%", volume_L: "10", expiry_date: "2026-07-09", remaining_percent: "62%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "20.74%", volume_L: "10", expiry_date: "2026-07-09", remaining_percent: "80%" }),

  // 어프로티움 울산제3공장 3(신규분)
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "3(신규분)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "95%", gas_inspection_first: "2024-05-30", gas_inspection_last: "2026-01-21", gas_inspection_next: "2028-01-20", gas_inspection_round: "2차", velocity_inspection_first: "2024-03-11", velocity_inspection_next: "2026-03-10", velocity_inspection_round: "1차", inspection_date: "2/26" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "3(신규분)", gas_name: "NO 200ppm", concentration: "169.6ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "3(신규분)", gas_name: "O2 Zero", concentration: "2.02%", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "89%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "어프로티움 울산제3공장", tms_status: "전송", unit_no: "3(신규분)", gas_name: "O2 25%", concentration: "21.07%", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "89%" }),

  // ══════════════════════════════════════
  // 어프로티움 울산제2공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-10-31", site_name: "어프로티움 울산제2공장", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2021-07-15", gas_inspection_last: "2025-07-14", gas_inspection_next: "2026-07-14", gas_inspection_round: "3차", velocity_inspection_first: "2021-06-16", velocity_inspection_last: "2025-06-15", velocity_inspection_next: "2026-06-15", velocity_inspection_round: "3차", inspection_date: "2/19", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,100,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-10-31", site_name: "어프로티움 울산제2공장", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "171ppm", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "91%" }),
  mk({ contract_end_date: "2026-10-31", site_name: "어프로티움 울산제2공장", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "1.97%", volume_L: "10", expiry_date: "2026-09-24", remaining_percent: "96%" }),
  mk({ contract_end_date: "2026-10-31", site_name: "어프로티움 울산제2공장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.01%", volume_L: "10", expiry_date: "2026-09-24", remaining_percent: "94%" }),

  // ══════════════════════════════════════
  // 동서식품
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-20", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-08-04", gas_inspection_last: "2025-08-03", gas_inspection_next: "2026-08-03", gas_inspection_round: "2차", gas_inspection_so: "사업장진행", gas_inspection_so_arrival: "사업장진행", velocity_inspection_first: "2021-08-17", velocity_inspection_last: "2025-08-06", velocity_inspection_next: "2026-08-16", velocity_inspection_round: "3차", inspection_notes: "23/7/20 동서식품 자체 신청함", inspection_date: "2/9", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,000,000", contract_consumables: "월1회", notes: "갱신 계약 관련 동결을 원하고 있으며, 송재석 차장이 최종본 들고 계약, 큰 이슈 없는 사업장이라 영업담당자는 동결에 동의" }),
  mk({ contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "170.4ppm", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.01%", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "동서식품", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2027-01-28", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 동양환경
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "동양환경", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", remaining_percent: "60%", purchase_entity: "디엑스지", branch: "호남", gas_inspection_first: "2017-02-21", gas_inspection_last: "2026-02-20", gas_inspection_next: "2027-02-20", gas_inspection_round: "6차", gas_inspection_so: "청구불가(사업장 신청)", velocity_inspection_first: "2016-10-12", velocity_inspection_last: "2025-10-11", velocity_inspection_next: "2026-10-11", inspection_cycle: "월 4회(추가20만)", monthly_amount: "2,300,000", contract_consumables: "월4회" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동양환경", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2/CO 200/100/250ppm", concentration: "171.2/84.4/213.6ppm", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "90%", inspection_date: "2/11" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동양환경", tms_status: "전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.09%", volume_L: "10", expiry_date: "2026-04-02", remaining_percent: "40%", so_issue: "26-0242", arrival_status: "3/20", inspection_date: "2/19" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동양환경", tms_status: "전송", unit_no: "2", gas_name: "HCL 50ppm", concentration: "43.6ppm", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "65%", gas_inspection_first: "2022-02-07", gas_inspection_last: "2026-02-06", gas_inspection_next: "2027-02-06", gas_inspection_round: "2차", inspection_date: "2/23" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동양환경", tms_status: "전송", unit_no: "2", gas_name: "Dust", gas_inspection_next: "2027-03-28" }),

  // ══════════════════════════════════════
  // 동우화인켐
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-05-31", site_name: "동우화인켐", tms_status: "전송", unit_no: "33", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-03", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_last: "2025-07-27", gas_inspection_next: "2026-07-27", gas_inspection_so: "25-1717(25/8/5 완료)", gas_inspection_so_arrival: "25-1717(25/8/5 완료)", velocity_inspection_first: "2017-08-18", velocity_inspection_last: "2025-06-23", velocity_inspection_next: "2026-06-22", velocity_inspection_round: "5차", inspection_notes: "25년 유속계 동우화인켐 S/O 이력없음", inspection_date: "2/19", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,100,000", contract_consumables: "월1회", notes: "250429_윤태선책임_기존 계약 2년 연장 계획 ,,, 5월 중 요청 예정" }),
  mk({ contract_end_date: "2027-05-31", site_name: "동우화인켐", tms_status: "전송", unit_no: "33", gas_name: "NO 500ppm", concentration: "420ppm", volume_L: "10", expiry_date: "2026-09-03", remaining_percent: "95%" }),
  mk({ contract_end_date: "2027-05-31", site_name: "동우화인켐", tms_status: "전송", unit_no: "33", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-09-03", remaining_percent: "96%" }),
  mk({ contract_end_date: "2027-05-31", site_name: "동우화인켐", tms_status: "전송", unit_no: "33", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-09-03", remaining_percent: "98%" }),

  // ══════════════════════════════════════
  // 동일산업
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-30", site_name: "동일산업", tms_status: "전송", unit_no: "5", gas_name: "NO/SO2 500/500ppm", concentration: "424/428ppm", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "83%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_so: "사업장진행", gas_inspection_so_arrival: "26-0241(26/3/20)", velocity_inspection_so: "사업장진행", inspection_date: "2/24" }),
  mk({ contract_end_date: "2026-09-30", site_name: "동일산업", tms_status: "전송", unit_no: "5", gas_name: "Dust", volume_L: "10", remaining_percent: "75%", gas_inspection_first: "2017-03-22", gas_inspection_last: "3/26~28", gas_inspection_next: "2026-03-21" }),

  // ══════════════════════════════════════
  // 동일제강
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "18", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-03-04", gas_inspection_last: "2025-03-03", gas_inspection_next: "2026-03-03", gas_inspection_so: "25-3324", gas_inspection_so_arrival: "25-3324(~26/1/19)", velocity_inspection_first: "2021-01-18", velocity_inspection_last: "2026-01-17", velocity_inspection_next: "2027-01-17", velocity_inspection_round: "4차", velocity_inspection_so: "25-3324", inspection_notes: "#38호기 유속 5월\n#18,19,36,41 26/1/22 유속계 취외+26/2/13 설치", inspection_date: "2/13", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "4,175,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "18", gas_name: "NO/SO2 500/500ppm", concentration: "432/472ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "0%", notes: "2차 점검 때 레귤레이터 확인 필요" }),

  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "19", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", gas_inspection_first: "2021-03-03", gas_inspection_last: "2025-03-02", gas_inspection_next: "2026-03-02", velocity_inspection_first: "2021-01-18", velocity_inspection_last: "2026-01-17", velocity_inspection_next: "2027-01-17", velocity_inspection_round: "4차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "19", gas_name: "NO/SO2 500/500ppm", concentration: "428/422ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "90%" }),

  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "36", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", gas_inspection_first: "2021-03-03", gas_inspection_last: "2025-03-02", gas_inspection_next: "2026-03-02", velocity_inspection_first: "2021-01-18", velocity_inspection_last: "2026-01-17", velocity_inspection_next: "2027-01-17", velocity_inspection_round: "4차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "36", gas_name: "NO/SO2 500/500ppm", concentration: "432/430ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "85%" }),

  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "38", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", gas_inspection_first: "2021-03-03", gas_inspection_last: "2025-03-02", gas_inspection_next: "2026-03-02", velocity_inspection_first: "2021-05-24", velocity_inspection_last: "2025-05-23", velocity_inspection_next: "2026-05-23", velocity_inspection_round: "3차", inspection_date: "2/27" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "38", gas_name: "NO 500ppm", concentration: "424ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "72%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "38", gas_name: "O2 Zero", concentration: "2.01%", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "97%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "38", gas_name: "O2 25%", concentration: "20.64%", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "95%" }),

  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "41", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", gas_inspection_first: "2021-03-04", gas_inspection_last: "2025-03-03", gas_inspection_next: "2026-03-03", velocity_inspection_first: "2021-01-18", velocity_inspection_last: "2026-01-17", velocity_inspection_next: "2027-01-17", velocity_inspection_round: "4차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "41", gas_name: "NO/SO2 500/500ppm", concentration: "425/425ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "90%" }),

  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "47", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-04-21", remaining_percent: "30%", gas_inspection_first: "2025-05-28", gas_inspection_next: "2027-05-27", gas_inspection_so: "재확인필요", velocity_inspection_first: "2025-04-23", velocity_inspection_next: "2027-04-22" }),
  mk({ contract_end_date: "2026-11-30", site_name: "동일제강", tms_status: "전송", unit_no: "47", gas_name: "NO/SO2 500/500ppm", concentration: "430/428ppm", volume_L: "10", expiry_date: "2026-04-21", remaining_percent: "50%" }),

  // ══════════════════════════════════════
  // 동희오토 서산공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "동희오토 서산공장", tms_status: "전송", unit_no: "30", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2022-02-16", gas_inspection_last: "2026-02-15", gas_inspection_next: "2027-02-15", gas_inspection_round: "2차", velocity_inspection_first: "2021-08-17", velocity_inspection_last: "2025-08-16", velocity_inspection_next: "2026-08-16", velocity_inspection_round: "2차", inspection_date: "2/23", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,200,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동희오토 서산공장", tms_status: "전송", unit_no: "30", gas_name: "NO 500ppm", concentration: "429ppm", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "96%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동희오토 서산공장", tms_status: "비전송", unit_no: "30", gas_name: "O2 25%", concentration: "21.00%", expiry_date: "2025-06-26", remaining_percent: "비전송" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동희오토 서산공장", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-03", remaining_percent: "100%", gas_inspection_first: "2024-12-05", gas_inspection_next: "2026-12-06", gas_inspection_round: "1차", velocity_inspection_first: "2024-11-07", velocity_inspection_next: "2026-11-06", velocity_inspection_round: "1차", notes: "분석기 계약 내 24. 12까지" }),
  mk({ contract_end_date: "2026-12-31", site_name: "동희오토 서산공장", tms_status: "전송", unit_no: "3", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-12-03", remaining_percent: "100%", notes: "유지보수용역 포함되어 있음" }),

  // ══════════════════════════════════════
  // 드림아스콘
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "85%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2020-12-17", gas_inspection_last: "2025-12-16", gas_inspection_next: "2026-12-16", velocity_inspection_first: "2021-05-24", velocity_inspection_last: "2025-05-23", velocity_inspection_next: "2026-05-23", velocity_inspection_round: "3차", velocity_inspection_so: "25-3329(#2 완료)", inspection_notes: "Nox 총량미달 cleansys에 이미 비전송상태 (25.07.11)->Fiti에 물어보니,, 정도검사기록부에 SO2항목만 확인했다고 기록한다고 함", inspection_date: "2/20", inspection_cycle: "월 2회", monthly_amount: "2,010,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 500/500ppm", concentration: "426ppm", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "21%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "비전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2024-01-29", remaining_percent: "70%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "비전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.54%", volume_L: "10", expiry_date: "2024-01-29", remaining_percent: "80%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "70%", velocity_inspection_first: "2020-01-23", velocity_inspection_last: "2026-01-22", velocity_inspection_next: "2027-01-22", velocity_inspection_round: "4차", inspection_notes: "Nox 총량미달 cleansys에 이미 비전송상태 (25.07.11)->Fiti에 물어보니,, 정도검사기록부에 SO2항목만 확인했다고 기록한다고 함" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 500/500ppm", concentration: "427ppm", volume_L: "10", expiry_date: "2026-09-22", remaining_percent: "75%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "비전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.01%", volume_L: "10", expiry_date: "2024-01-29", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "드림아스콘", tms_status: "비전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.55%", volume_L: "10", expiry_date: "2024-01-29", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 모나리자 전주공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "모나리자 전주공장", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", remaining_percent: "25%", purchase_entity: "발주처", branch: "호남", gas_inspection_first: "2016-12-07", gas_inspection_last: "2024-12-06", gas_inspection_next: "2025-12-06", gas_inspection_round: "7차", gas_inspection_so: "청구불가", gas_inspection_so_arrival: "사업장진행", velocity_inspection_first: "2016-08-29", velocity_inspection_last: "2025-08-28", velocity_inspection_next: "2026-08-28", velocity_inspection_round: "7차", inspection_notes: "신청은 사업장\n유속 정도검사비 청구 가능(25년 청구완료)", inspection_date: "2/2", inspection_cycle: "월 2회", md: "1 M/D", monthly_amount: "1,350,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "모나리자 전주공장", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 200/200ppm", concentration: "181.5/181.7ppm", volume_L: "10", expiry_date: "2026-09-23", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "모나리자 전주공장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "20.02%", volume_L: "10", expiry_date: "2026-01-07", remaining_percent: "40%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "모나리자 전주공장", tms_status: "전송", unit_no: "1", gas_name: "HCL 50ppm", concentration: "39ppm", volume_L: "10", expiry_date: "2026-03-03", remaining_percent: "80%" }),

  // ══════════════════════════════════════
  // 무림에스피 대구공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "7", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "93%", purchase_entity: "디엑스지(변동될 수 있음)", so_issue: "26-0203", arrival_status: "3/13", branch: "영남", gas_inspection_first: "2021-11-23", gas_inspection_last: "2025-11-22", gas_inspection_next: "2026-11-22", gas_inspection_round: "2차", gas_inspection_so: "청구불가", velocity_inspection_first: "2021-09-30", velocity_inspection_last: "2025-09-29", velocity_inspection_next: "2026-09-29", velocity_inspection_round: "2차", inspection_date: "2/25", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,500,000", contract_consumables: "월1회", notes: "계약 후 이진호 과장님(현업) 앞으로 완료됐음 공유 필요(그래야 구매요청하신다고 함)" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "7", gas_name: "NO 200ppm", concentration: "173ppm", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "83%", so_issue: "26-0203", arrival_status: "3/13" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "7", gas_name: "O2 Zero", concentration: "1.98%", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "80%", so_issue: "26-0203", arrival_status: "3/13" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "7", gas_name: "O2 25%", concentration: "21.30%", volume_L: "10", expiry_date: "2026-12-23", remaining_percent: "100%", notes: "26년 12월 중 연장 작업 필요" }),

  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "8", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "95%", so_issue: "26-0203", arrival_status: "3/13" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "8", gas_name: "NO 200ppm", concentration: "174.1ppm", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "79%", purchase_entity: "26-0203", arrival_status: "3/13" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "8", gas_name: "O2 Zero", concentration: "1.98%", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "80%", purchase_entity: "26-0203", arrival_status: "3/13" }),
  mk({ contract_end_date: "2027-01-31", site_name: "무림에스피 대구공장", tms_status: "전송", unit_no: "8", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2026-03-25", remaining_percent: "50%", purchase_entity: "26-0203", arrival_status: "3/13" }),

  // ══════════════════════════════════════
  // 대륜발전 (별내에너지)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "1", gas_name: "N2 Zero", concentration: "N2", expiry_date: "2023-07-29", remaining_percent: "100%", purchase_entity: "발주처", branch: "본사", gas_inspection_first: "2019-08-30", gas_inspection_last: "2025-08-28", gas_inspection_next: "2026-08-28", gas_inspection_round: "4차", gas_inspection_so: "유지보수 계약 내 포함", gas_inspection_so_arrival: "사업장진행", velocity_inspection_first: "2019-09-09", velocity_inspection_last: "2025-09-08", velocity_inspection_next: "2026-09-08", velocity_inspection_round: "4차", velocity_inspection_so: "유지보수 계약 내 포함", inspection_notes: "사업장진행(신청서만 접수완료)(유지보수 계약 내 정도검사 노무비 포함)", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,500,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "1", gas_name: "NO 100ppm", concentration: "85ppm", expiry_date: "2023-09-27", remaining_percent: "98%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", expiry_date: "2024-01-29", remaining_percent: "100%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "20.10%", expiry_date: "2024-01-29", remaining_percent: "100%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", expiry_date: "2023-09-27", remaining_percent: "100%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "2", gas_name: "NO 100ppm", concentration: "85ppm", expiry_date: "2023-07-29", remaining_percent: "100%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.00%", expiry_date: "2024-01-29", remaining_percent: "100%" }),
  mk({ contract_end_date: "2027-10-01", site_name: "대륜발전", tms_status: "전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.00%", expiry_date: "2023-11-29", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 부국산업
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "전송", unit_no: "12", gas_name: "NO/O2 Zero", concentration: "N2", expiry_date: "2023-08-28", remaining_percent: "60%", purchase_entity: "디엑스지", branch: "호남", gas_inspection_first: "2020-12-01", gas_inspection_last: "2025-12-01", gas_inspection_next: "2026-12-01", gas_inspection_so: "사업장 신청", velocity_inspection_first: "2020-11-26", velocity_inspection_last: "2025-11-25", velocity_inspection_next: "2026-11-25", velocity_inspection_so: "사업장 신청", inspection_notes: "25.11.13 유속 반출", inspection_date: "10/15", inspection_cycle: "월 1.5회", monthly_amount: "1,800,000", contract_consumables: "월1-5회", notes: "23/8/28 교체" }),
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "전송", unit_no: "12", gas_name: "NO 600ppm", concentration: "515ppm", expiry_date: "2026-05-22", remaining_percent: "85%" }),
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "비전송", unit_no: "12", gas_name: "O2 25%", concentration: "20.98%", expiry_date: "2023-09-26", remaining_percent: "80%" }),
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "전송", unit_no: "22", gas_name: "NO/O2 Zero", concentration: "N2", expiry_date: "2023-08-28", remaining_percent: "70%", notes: "23/8/28 교체" }),
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "전송", unit_no: "22", gas_name: "NO 600ppm", concentration: "516ppm", expiry_date: "2026-05-22", remaining_percent: "80%", velocity_inspection_so: "-" }),
  mk({ contract_end_date: "2027-02-28", site_name: "부국산업", tms_status: "비전송", unit_no: "22", gas_name: "O2 25%", concentration: "20.98%", expiry_date: "2023-09-26", remaining_percent: "80%" }),

  // ══════════════════════════════════════
  // 성합 (삼보산업 서산)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 500/500ppm", concentration: "429/423ppm", volume_L: "10", expiry_date: "2026-10-22", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-07-21", gas_inspection_last: "2025-07-20", gas_inspection_next: "2026-07-20", velocity_inspection_first: "2021-08-12", velocity_inspection_last: "2025-08-11", velocity_inspection_next: "2026-08-11", inspection_notes: "25/9/12 완료통보서 수신", inspection_date: "11/14", inspection_cycle: "격월 1회", monthly_amount: "2,500,000", contract_consumables: "월1회", notes: "긴급 50만 별도" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-10-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "3", gas_name: "NO/SO2 500/500ppm", concentration: "429/427ppm", volume_L: "10", expiry_date: "2027-01-21", remaining_percent: "100%", gas_inspection_first: "2021-08-25", gas_inspection_last: "2025-08-24", gas_inspection_next: "2026-08-24", velocity_inspection_first: "2021-08-13", velocity_inspection_last: "2025-08-12", velocity_inspection_next: "2026-08-12" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-21", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "5", gas_name: "NO/SO2 500/500ppm", concentration: "430/430ppm", volume_L: "10", expiry_date: "2026-04-29", remaining_percent: "96%", gas_inspection_first: "2021-08-25", gas_inspection_last: "2025-08-24", gas_inspection_next: "2026-08-24", velocity_inspection_first: "2021-09-08", velocity_inspection_last: "2025-09-07", velocity_inspection_next: "2026-09-07" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "5", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-04-29", remaining_percent: "84%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "11", gas_name: "NO/SO2 500/500ppm", concentration: "428/425ppm", volume_L: "10", expiry_date: "2027-01-21", remaining_percent: "97%", gas_inspection_first: "2021-07-21", gas_inspection_last: "2025-07-20", gas_inspection_next: "2026-07-20", velocity_inspection_first: "2021-08-12", velocity_inspection_last: "2025-08-11", velocity_inspection_next: "2026-08-11" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성합", tms_status: "전송", unit_no: "11", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-21", remaining_percent: "97%" }),

  // ══════════════════════════════════════
  // 삼보산업 창원
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "삼보산업 창원", tms_status: "전송", unit_no: "5", gas_name: "NO/SO2 500/500ppm", concentration: "433/428ppm", volume_L: "10", expiry_date: "2026-10-29", remaining_percent: "85%", purchase_entity: "디엑스지", branch: "호남", gas_inspection_first: "2021-12-03", gas_inspection_last: "2025-12-02", gas_inspection_next: "2026-12-02", gas_inspection_round: "2차", gas_inspection_so: "사업장 신청", velocity_inspection_first: "2021-06-21", velocity_inspection_last: "2025-06-20", velocity_inspection_next: "2026-06-20", velocity_inspection_round: "3차", velocity_inspection_so: "사업장 신청", inspection_date: "2/9", inspection_cycle: "월 1회", monthly_amount: "1,150,000", contract_consumables: "월1회", notes: "25.12.12_12/15~19 사이에 계약서 재작성 여부 연락준다고 함" }),
  mk({ contract_end_date: "2026-12-31", site_name: "삼보산업 창원", tms_status: "전송", unit_no: "5", gas_name: "NO Zero", concentration: "N2", volume_L: "10", remaining_percent: "35%" }),

  // ══════════════════════════════════════
  // 삼양사 인천 1공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2016-09-23", gas_inspection_last: "2025-09-22", gas_inspection_next: "2026-09-22", gas_inspection_so: "사업장 신청", velocity_inspection_first: "2021-04-15", velocity_inspection_last: "2025-04-14", velocity_inspection_next: "2026-04-14", velocity_inspection_so: "사업장 신청", inspection_date: "2/5", inspection_cycle: "월 2회", monthly_amount: "1,400,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 500/500ppm", concentration: "429/428ppm", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "80%", notes: "23/7/19 담당자 통화 시에는 점검 누락이나 서비스등의 사유로 인상을 좀 꺼려하고 있긴 하나, 인상이 필요하다면, 보고는 해보겠다... 라고 답변" }),
  mk({ contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "80%", gas_inspection_first: "2017-12-07", gas_inspection_last: "2025-09-07", gas_inspection_next: "2026-09-07", inspection_date: "2/27", notes: "23/8/1 정두현 과장: 작년에 1600으로 10%인상해서 올해는 동결하고 다음번에 인상이야기 하는게 맞는 것 같다." }),
  mk({ contract_end_date: "2026-07-31", site_name: "삼양사 인천 1공장", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.04%", volume_L: "10", expiry_date: "2026-06-03", remaining_percent: "65%", velocity_inspection_first: "2023-08-01", velocity_inspection_next: "동결진행" }),

  // ══════════════════════════════════════
  // 삼현
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "99%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-04-06", gas_inspection_last: "2025-04-05", gas_inspection_next: "2026-04-05", gas_inspection_round: "2차", gas_inspection_so: "청구불가", gas_inspection_so_arrival: "26-0298(~3/20)", velocity_inspection_first: "2020-12-22", velocity_inspection_last: "2025-12-21", velocity_inspection_next: "2026-12-21", inspection_notes: "#2,3 유속계 정도검사기록부 발급 12월까지 발주처가 받아야 함\n#10 유속 -9/18 사내 도착", inspection_date: "2/20", inspection_cycle: "월 2회", md: "2M/D", monthly_amount: "2,755,682", contract_consumables: "2주1회" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "2", gas_name: "NO 600ppm", concentration: "506ppm", volume_L: "10", expiry_date: "2027-01-29", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "비전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.03%", volume_L: "미적용", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "비전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.03%", volume_L: "미적용", remaining_percent: "-" }),

  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "82%" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "3", gas_name: "NO 600ppm", concentration: "514ppm", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "36%" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "비전송", unit_no: "3", gas_name: "O2 Zero", concentration: "2.03%", volume_L: "미적용", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "비전송", unit_no: "3", gas_name: "O2 25%", concentration: "21.03%", volume_L: "미적용", remaining_percent: "-" }),

  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "9(구 8호기)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-22", remaining_percent: "91%", gas_inspection_first: "2021-04-06", gas_inspection_last: "2025-04-05", gas_inspection_next: "2026-04-05", gas_inspection_round: "2차", velocity_inspection_first: "2020-12-22", velocity_inspection_last: "2025-12-21", velocity_inspection_next: "2027-01-21" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "9(구 8호기)", gas_name: "NO 600ppm", concentration: "516ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "52%", so_issue: "25-1532", arrival_status: "3/13" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "9(구 8호기)", gas_name: "O2 Zero", concentration: "2.03%", volume_L: "미적용", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "삼현", tms_status: "전송", unit_no: "9(구 8호기)", gas_name: "O2 25%", concentration: "21.07%", volume_L: "미적용", remaining_percent: "-" }),

  // 삼현 (신규)
  mk({ site_name: "삼현 (신규)", tms_status: "전송", unit_no: "10", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-29", remaining_percent: "100%", gas_inspection_first: "2023-09-26", gas_inspection_last: "2025-09-25", gas_inspection_next: "2027-09-25", gas_inspection_round: "2차", gas_inspection_so: "청구불가", velocity_inspection_first: "2023-09-04", velocity_inspection_last: "2025-09-03", velocity_inspection_next: "2027-09-03", velocity_inspection_round: "1차" }),
  mk({ site_name: "삼현 (신규)", tms_status: "전송", unit_no: "10", gas_name: "NO 600ppm", concentration: "516ppm", volume_L: "10", expiry_date: "2027-01-29", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 성훈엔지니어링
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2020-09-07", gas_inspection_last: "2025-09-06", gas_inspection_next: "2026-09-06", gas_inspection_round: "3차", gas_inspection_so: "청구불가", velocity_inspection_first: "2020-06-30", velocity_inspection_last: "2025-08-11", velocity_inspection_next: "2026-08-11", velocity_inspection_round: "3차", inspection_notes: "9/30 가스상 정도검사 완료", inspection_date: "2/19", inspection_cycle: "월 2회", monthly_amount: "4,880,000", contract_consumables: "월2회", notes: "정부지원금이 多, 그래서 21~24년까지 금액 고정으로 가기로 협의됐다고 함 (송재석CJ)" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 400/500ppm", concentration: "353/403ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", velocity_inspection_first: "2020-06-30", velocity_inspection_last: "2025-06-29", velocity_inspection_next: "2026-06-29", velocity_inspection_round: "3차" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 400/500ppm", concentration: "353/402ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", purchase_entity: "표준가스" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "3", gas_name: "NO/SO2 400/500ppm", concentration: "352/401ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "14", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", velocity_inspection_first: "2020-06-30", velocity_inspection_last: "2025-07-31", velocity_inspection_next: "2026-07-30", velocity_inspection_round: "3차", inspection_date: "2/25" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "14", gas_name: "NO/SO2 400/500ppm", concentration: "357/403ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "16→24", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", velocity_inspection_first: "2020-07-01", velocity_inspection_last: "2025-06-30", velocity_inspection_next: "2026-06-30", velocity_inspection_round: "3차" }),
  mk({ contract_end_date: "2026-09-30", site_name: "성훈엔지니어링", tms_status: "전송", unit_no: "16→24", gas_name: "NO/SO2 400/500ppm", concentration: "315/401ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "95%" }),

  // ══════════════════════════════════════
  // 배터리솔루션즈 (구.세기리텍)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "비전송", unit_no: "1(In-Situ)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-26", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2020-12-03", gas_inspection_round: "2차", gas_inspection_so: "비전송", gas_inspection_so_arrival: "비전송", velocity_inspection_first: "2020-11-30", velocity_inspection_round: "2차", velocity_inspection_so: "비전송", inspection_notes: "비전송이라 진행 여부 확인 필요..(22년도에도 안함)", inspection_date: "2/11", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "2,500,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "비전송", unit_no: "1(In-Situ)", gas_name: "NO/SO2 500/500ppm", concentration: "428/424ppm", volume_L: "10", expiry_date: "2026-11-26", remaining_percent: "85%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "비전송", unit_no: "2(In-Situ)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-26", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "비전송", unit_no: "2(In-Situ)", gas_name: "NO/SO2 500/500ppm", concentration: "430/425ppm", volume_L: "10", expiry_date: "2026-11-26", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "전송", unit_no: "9(샘플링)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "99%", gas_inspection_first: "2022-03-04", gas_inspection_last: "2024-03-03", gas_inspection_next: "2026-03-03", gas_inspection_round: "3차", gas_inspection_so: "26-0277", gas_inspection_so_arrival: "26-0277(~3/20)", velocity_inspection_first: "2022-03-24", velocity_inspection_last: "2024-03-23", velocity_inspection_next: "2026-03-23", velocity_inspection_round: "2차", velocity_inspection_so: "26-0277", inspection_date: "2/25" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "전송", unit_no: "9(샘플링)", gas_name: "NO/SO2 500/500ppm", concentration: "427/426ppm", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "전송", unit_no: "4(샘플링)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-21", remaining_percent: "100%", gas_inspection_first: "2024-11-19", gas_inspection_next: "2026-11-18", gas_inspection_round: "1차", velocity_inspection_first: "2024-12-05", velocity_inspection_next: "2026-12-04", velocity_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "배터리솔루션즈", tms_status: "전송", unit_no: "4(샘플링)", gas_name: "NO 210ppm", concentration: "170ppm", volume_L: "10", expiry_date: "2026-08-21", remaining_percent: "85%" }),

  // ══════════════════════════════════════
  // 수완에너지
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", remaining_percent: "100%", purchase_entity: "발주처", branch: "호남", gas_inspection_first: "2020-11-26", gas_inspection_last: "2025-12-25", gas_inspection_next: "2026-12-25", gas_inspection_round: "3차", velocity_inspection_first: "2020-07-09", velocity_inspection_last: "2025-07-08", velocity_inspection_next: "2026-07-08", velocity_inspection_round: "3차", inspection_notes: "사업장 자체 신청\n진행비만 받음\n(유속계 25/8/1 설치)", inspection_date: "2/5", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "950,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "1", gas_name: "NO 100ppm", concentration: "87.4ppm", expiry_date: "2026-05-26", remaining_percent: "95%" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", expiry_date: "2026-12-15", remaining_percent: "100%", gas_inspection_first: "2020-11-03", gas_inspection_last: "2025-11-02", gas_inspection_next: "2026-11-02", gas_inspection_round: "3차" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.11%", expiry_date: "2026-12-15", remaining_percent: "95%" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", remaining_percent: "100%", gas_inspection_first: "2020-11-03", gas_inspection_last: "2025-11-02", gas_inspection_next: "2026-11-02", gas_inspection_round: "3차" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "2", gas_name: "NO 100ppm", concentration: "89.9ppm", expiry_date: "2026-05-26", remaining_percent: "90%" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.01%", expiry_date: "2026-12-15", remaining_percent: "95%", purchase_entity: "11/3/20", gas_inspection_last: "2025-11-02", gas_inspection_next: "2026-11-02", gas_inspection_round: "3차" }),
  mk({ contract_end_date: "2027-06-30", site_name: "수완에너지", tms_status: "전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.03%", expiry_date: "2026-12-15", remaining_percent: "95%" }),

  // ══════════════════════════════════════
  // 수원하수슬러지 처리시설
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "수원하수슬러지 처리시설", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-16", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-03-30", gas_inspection_last: "2025-03-29", gas_inspection_next: "2026-03-29", gas_inspection_round: "3차", gas_inspection_so: "26-0212", gas_inspection_so_arrival: "26-0212(~3/13)", velocity_inspection_first: "2021-03-18", velocity_inspection_last: "2025-03-17", velocity_inspection_next: "2026-03-17", velocity_inspection_round: "2차", velocity_inspection_so: "26-0212", inspection_date: "10/16", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "1,300,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "수원하수슬러지 처리시설", tms_status: "전송", unit_no: "1", gas_name: "NO 500ppm", concentration: "431.31ppm", volume_L: "10", expiry_date: "2026-09-16", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 쌍용C&B
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "47", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2017-07-06", gas_inspection_last: "2025-07-05", gas_inspection_next: "2025-07-05", gas_inspection_so: "26-0258", gas_inspection_so_arrival: "청구불가", velocity_inspection_first: "2017-04-21", velocity_inspection_last: "2025-04-20", velocity_inspection_next: "2026-04-20", velocity_inspection_round: "6차", velocity_inspection_so: "26-0258", inspection_notes: "정도검사수수료만 가능\n유지보수 계약 내 정도검사 지원 역무 포함\n정도검사용 가스는 발주 불가(시험기관 지원하기에 부담 불가하다고 함)", inspection_date: "2/6", inspection_cycle: "월 2회", monthly_amount: "2,150,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2/CO 200/200/500ppm", concentration: "168.3/168.2/429ppm", volume_L: "47", expiry_date: "2026-05-21", remaining_percent: "86%", gas_inspection_first: "2021-07-16", gas_inspection_last: "2025-07-15", gas_inspection_next: "2026-07-15", gas_inspection_round: "CO항목" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.08%", volume_L: "10", expiry_date: "2026-06-18", remaining_percent: "85%", gas_inspection_first: "2017-07-06", gas_inspection_last: "2025-07-05", gas_inspection_next: "2026-07-05" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "2", gas_name: "HCL 50ppm", concentration: "42.5ppm", volume_L: "10", expiry_date: "2026-04-29", remaining_percent: "83%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "2", gas_name: "Dust" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "47", remaining_percent: "60%", gas_inspection_first: "2017-07-06", gas_inspection_last: "2025-07-05", gas_inspection_next: "2026-07-05", inspection_date: "2/20" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "3", gas_name: "NO/SO2/CO 200/200/500ppm", concentration: "168.5/167.2/428ppm", volume_L: "47", expiry_date: "2027-02-04", remaining_percent: "100%", gas_inspection_first: "2021-07-23", gas_inspection_last: "2025-07-22", gas_inspection_next: "2026-07-22", gas_inspection_round: "CO항목" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "3", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2026-07-30", remaining_percent: "90%", gas_inspection_first: "2017-07-06", gas_inspection_last: "2025-07-05", gas_inspection_next: "2026-07-05" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "3", gas_name: "HCL 50ppm", concentration: "39.5ppm", volume_L: "10", expiry_date: "2026-06-22", remaining_percent: "88%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "쌍용C&B", tms_status: "전송", unit_no: "3", gas_name: "Dust" }),

  // ══════════════════════════════════════
  // 씨엔씨티에너지 학하CES
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "95%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-04-21", gas_inspection_last: "2025-04-20", gas_inspection_next: "2026-04-20", gas_inspection_round: "3차", gas_inspection_so: "25-1148", gas_inspection_so_arrival: "25-1148(~26/3/20)", velocity_inspection_first: "2020-08-11", velocity_inspection_last: "2025-08-10", velocity_inspection_next: "2026-08-10", inspection_notes: "진행비 별도 청구X", inspection_date: "2/26", inspection_cycle: "월 1회", md: "2 M/D", monthly_amount: "3,900,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "1", gas_name: "NO 100ppm", concentration: "85.2ppm", volume_L: "10", expiry_date: "2026-08-04", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "97%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.04%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "97%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "2", gas_name: "NO 100ppm", concentration: "85.1ppm", volume_L: "10", expiry_date: "2026-05-20", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "2", gas_name: "O2 Zero", concentration: "1.99%", volume_L: "10", expiry_date: "2026-05-21", remaining_percent: "91%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "2", gas_name: "O2 25%", concentration: "20.97%", volume_L: "10", expiry_date: "2026-05-21", remaining_percent: "92%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "3", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "3", gas_name: "NO 100ppm", concentration: "85.6ppm", volume_L: "10", expiry_date: "2026-08-04", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "3", gas_name: "O2 Zero", concentration: "2.03%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "3", gas_name: "O2 25%", concentration: "20.86%", volume_L: "10", expiry_date: "2026-05-21", remaining_percent: "92%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "4", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "92%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "4", gas_name: "NO 100ppm", concentration: "85.7ppm", volume_L: "10", expiry_date: "2026-08-04", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "4", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "97%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "4", gas_name: "O2 25%", concentration: "21.03%", volume_L: "10", expiry_date: "2026-09-30", remaining_percent: "88%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "6", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "6", gas_name: "NO 100ppm", concentration: "86.4ppm", volume_L: "10", expiry_date: "2026-06-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "6", gas_name: "O2 Zero", concentration: "1.99%", volume_L: "10", expiry_date: "2026-05-21", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "6", gas_name: "O2 25%", concentration: "20.40%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "7", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-02", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "7", gas_name: "NO 100ppm", concentration: "86.8ppm", volume_L: "10", expiry_date: "2026-08-04", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "7", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "씨엔씨티에너지 학하CES", tms_status: "전송", unit_no: "7", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 여천NCC
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "여천NCC 1공장", tms_status: "전송", unit_no: "", gas_name: "-", remaining_percent: "-", purchase_entity: "발주처", branch: "호남", gas_inspection_last: "2023-07-01", notes: "정도검사 사전점검 관련 비용 청구 차후에 될 수 있게 조정요청" }),
  mk({ site_name: "여천NCC 3공장", tms_status: "전송", unit_no: "", gas_name: "-", remaining_percent: "-", gas_inspection_last: "2023-05-01" }),
  mk({ site_name: "여천NCC 4공장", tms_status: "전송", unit_no: "", gas_name: "-", remaining_percent: "-", gas_inspection_last: "2023-07-01" }),

  // ══════════════════════════════════════
  // 오뚜기 대풍공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-30", site_name: "오뚜기 대풍공장", tms_status: "전송", unit_no: "54", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-06-22", gas_inspection_last: "2025-06-21", gas_inspection_next: "2026-06-21", gas_inspection_round: "2차", gas_inspection_so: "사업장 신청", gas_inspection_so_arrival: "무상 공급으로 가는 이력 확인…", velocity_inspection_first: "2021-06-11", velocity_inspection_last: "2025-06-10", velocity_inspection_next: "2026-06-10", velocity_inspection_round: "3차", inspection_notes: "*25년 유속-정도 사업장 직접 신청", inspection_date: "2/13", inspection_cycle: "월 1회", monthly_amount: "750,000", contract_consumables: "월1회", notes: "기기 계약 체결 시 유지보수 계약을 싸게 제출했다고 함, 80만정도는 받아야 하지 않나 (송재석 CJ)" }),
  mk({ contract_end_date: "2026-09-30", site_name: "오뚜기 대풍공장", tms_status: "전송", unit_no: "54", gas_name: "NO 200ppm", concentration: "171ppm", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "오뚜기 대풍공장", tms_status: "전송", unit_no: "54", gas_name: "O2 Zero", concentration: "2.01%", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "99%" }),
  mk({ contract_end_date: "2026-09-30", site_name: "오뚜기 대풍공장", tms_status: "전송", unit_no: "54", gas_name: "O2 25%", concentration: "21.04%", volume_L: "10", expiry_date: "2026-12-10", remaining_percent: "93%" }),

  // ══════════════════════════════════════
  // 오라이온코리아 (오리온엔지니어드카본즈)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "전송", unit_no: "A boiler", gas_name: "-", remaining_percent: "-", branch: "호남", inspection_date: "1/9", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "2,400,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "전송", unit_no: "B boiler", gas_name: "-", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "전송", unit_no: "C boiler", gas_name: "-", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "전송", unit_no: "D boiler", gas_name: "-", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "전송", unit_no: "E boiler", gas_name: "-", remaining_percent: "-" }),
  mk({ contract_end_date: "2026-04-30", site_name: "오라이온코리아", tms_status: "비전송", unit_no: "F boiler", gas_name: "-", remaining_percent: "-" }),

  // ══════════════════════════════════════
  // 일진전기
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-04-30", site_name: "일진전기", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-30", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2023-01-12", gas_inspection_last: "2025-01-11", gas_inspection_next: "2027-01-11", gas_inspection_round: "1차", velocity_inspection_first: "2022-10-25", velocity_inspection_last: "2024-10-24", velocity_inspection_next: "2026-10-24", velocity_inspection_round: "2차", inspection_notes: "#2 Nox 25/7/2 완료\n#2 유속 25/9/2 취외완료", inspection_date: "2/27", inspection_cycle: "월 1회", monthly_amount: "1,180,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-04-30", site_name: "일진전기", tms_status: "전송", unit_no: "1", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-05-14", remaining_percent: "97%" }),
  mk({ contract_end_date: "2026-04-30", site_name: "일진전기", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-02-18", remaining_percent: "100%", purchase_entity: "디엑스지", gas_inspection_first: "2021-07-19", gas_inspection_last: "2025-07-18", gas_inspection_next: "2026-07-18", gas_inspection_round: "2차", velocity_inspection_first: "2021-08-17", velocity_inspection_last: "2025-08-16", velocity_inspection_next: "2026-08-16", velocity_inspection_round: "2차", velocity_inspection_so: "25-1545", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-04-30", site_name: "일진전기", tms_status: "전송", unit_no: "2", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2027-02-18", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 전북대학교병원
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "전북대학교병원", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", remaining_percent: "80%", purchase_entity: "디엑스지", branch: "호남", gas_inspection_first: "2022-05-03", gas_inspection_last: "2024-05-02", gas_inspection_next: "2026-05-02", gas_inspection_round: "2차", gas_inspection_so: "26-0343", gas_inspection_so_arrival: "26-0343(~3/27)", velocity_inspection_first: "2021-12-23", velocity_inspection_last: "2025-12-22", velocity_inspection_next: "2026-12-22", velocity_inspection_round: "2차", inspection_date: "2/5", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,123,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-05-31", site_name: "전북대학교병원", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "170.9ppm", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "85%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "전북대학교병원", tms_status: "전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.02%", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "전북대학교병원", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.01%", volume_L: "10", expiry_date: "2026-07-16", remaining_percent: "95%" }),

  // ══════════════════════════════════════
  // 한국주철관공업
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "한국주철관공업", tms_status: "전송", unit_no: "2", gas_name: "NO/SO2 200/600ppm", concentration: "171.6/524ppm", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", purchase_entity: "발주처", branch: "영남", gas_inspection_last: "2023-10-05", gas_inspection_next: "2024-10-05", gas_inspection_so: "사업장 자체진행", velocity_inspection_last: "2024-09-29", velocity_inspection_next: "2025-09-29", velocity_inspection_so: "사업장 자체진행", monthly_amount: "2,100,000", contract_consumables: "월4회", notes: "25.12.10_내부 컨설팅 시 3년 계약 사례 접하고, 개인적인 궁금사항으로 문의함\n내부 보고해보고 연락하겠다고 함" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한국주철관공업", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한국주철관공업", tms_status: "전송", unit_no: "8", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2027-01-07", remaining_percent: "100%", inspection_date: "2/27" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한국주철관공업", tms_status: "전송", unit_no: "8", gas_name: "O2 25%", concentration: "21%", volume_L: "10", expiry_date: "2026-11-10", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한국주철관공업", tms_status: "전송", unit_no: "8", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-10", remaining_percent: "85%" }),

  // ══════════════════════════════════════
  // 한솔제지 대전
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "2(혐기성)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", purchase_entity: "발주처", branch: "본사", gas_inspection_first: "2022-12-29", gas_inspection_last: "2024-12-28", gas_inspection_next: "2026-12-28", gas_inspection_round: "2차", velocity_inspection_first: "2022-11-16", velocity_inspection_last: "2024-11-15", velocity_inspection_next: "2026-11-15", velocity_inspection_round: "2차", inspection_notes: "#3 24/11/22 KEMTI 입고\n정도검사 진행여부는 상황별 다름", inspection_date: "2/13", inspection_cycle: "월 2회", monthly_amount: "2,550,000", contract_consumables: "월1회", notes: "22/11/16(PGA-94)->23/4/17(PGA-93) 다시취득 (LNG 변경,, 혐기성X 확인완료)" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "2(혐기성)", gas_name: "NO 200ppm", concentration: "175.8ppm", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%", notes: "2-3호기 가스 같은거 사용\n25.12.12 다음 점검 일정에 계약서 전달해주기로 함" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "2(혐기성)", gas_name: "O2 25%", concentration: "21.35%", volume_L: "10", expiry_date: "2026-10-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "3(LNG)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "79%", gas_inspection_first: "2022-12-29", gas_inspection_last: "2024-12-28", gas_inspection_next: "2026-12-28", gas_inspection_round: "2차", velocity_inspection_first: "2023-04-17", velocity_inspection_last: "2024-11-15", velocity_inspection_next: "2026-11-15", velocity_inspection_round: "2차" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "3(LNG)", gas_name: "NO 200ppm", concentration: "175.8ppm", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "3(LNG)", gas_name: "O2 25%", concentration: "21.35%", volume_L: "10", expiry_date: "2026-10-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "4", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", gas_inspection_first: "2021-06-24", gas_inspection_last: "2025-06-23", gas_inspection_next: "2026-06-23", gas_inspection_round: "3차", velocity_inspection_first: "2021-06-21", velocity_inspection_last: "2025-06-20", velocity_inspection_next: "2026-06-20", velocity_inspection_round: "2차", inspection_date: "2/23", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "4", gas_name: "NO 200ppm", concentration: "176.3ppm", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "4", gas_name: "O2 25%", concentration: "20.30%", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "5", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", gas_inspection_first: "2021-06-24", gas_inspection_last: "2025-06-23", gas_inspection_next: "2026-06-23", gas_inspection_round: "3차", velocity_inspection_first: "2021-06-22", velocity_inspection_last: "2025-08-10", velocity_inspection_next: "2026-08-10" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "5", gas_name: "NO 200ppm", concentration: "175.8ppm", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "한솔제지 대전", tms_status: "전송", unit_no: "5", gas_name: "O2 25%", concentration: "21.35%", volume_L: "10", expiry_date: "2026-12-15", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 한솔제지 천안
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-02-28", site_name: "한솔제지 천안", tms_status: "전송", unit_no: "1", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2023-09-29", remaining_percent: "91%", purchase_entity: "디엑스지(삼진아이앤티 통해 구매)", branch: "본사", gas_inspection_first: "2021-07-22", gas_inspection_last: "2025-07-21", gas_inspection_next: "2026-07-21", gas_inspection_round: "3차", velocity_inspection_first: "2021-09-29", velocity_inspection_last: "2025-09-28", velocity_inspection_next: "2026-09-28", velocity_inspection_round: "2차", inspection_notes: "9월 초 통합점검으로 9월 중순 취외 요청\n9월 취외 완료 상태", inspection_date: "2/26", inspection_cycle: "월 1회", monthly_amount: "1,150,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2027-02-28", site_name: "한솔제지 천안", tms_status: "전송", unit_no: "1", gas_name: "NO 200ppm", concentration: "170ppm", volume_L: "10", expiry_date: "2026-03-20", remaining_percent: "80%", so_issue: "26-0307", arrival_status: "3/17" }),
  mk({ contract_end_date: "2027-02-28", site_name: "한솔제지 천안", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-03-20", remaining_percent: "88%", so_issue: "26-0307", arrival_status: "3/17" }),

  // ══════════════════════════════════════
  // 현대성우캐스팅
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "1(2공장)(용해로)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-07-28", gas_inspection_last: "2025-07-27", gas_inspection_next: "2026-07-27", gas_inspection_round: "2차", velocity_inspection_first: "2021-08-27", velocity_inspection_last: "2025-03-01", velocity_inspection_next: "2026-03-01", velocity_inspection_round: "3차", velocity_inspection_so: "26-0088", inspection_notes: "중간가스는 2set 발주해서 사용하는 방법 고민해봐야할듯..?!\n#1,16 피토관 곧 교체 필요(정문식C)\n#3 피토관 끝.. 용접 떨어짐?!ㅠ", inspection_date: "3/3", inspection_cycle: "월 2회", md: "2 M/D", monthly_amount: "2,200,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "1(2공장)(용해로)", gas_name: "NO 600ppm", concentration: "514ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "3(2공장)(칩용해로)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-02-12", remaining_percent: "90%", so_issue: "26-0081", arrival_status: "3/6", gas_inspection_first: "2023-10-20", gas_inspection_last: "2025-10-19", gas_inspection_next: "2027-10-19", velocity_inspection_first: "2023-06-22", velocity_inspection_last: "2025-06-21", velocity_inspection_next: "2027-06-21", velocity_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "3(2공장)(칩용해로)", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2027-02-26", remaining_percent: "86%", purchase_entity: "26-0081", arrival_status: "3/6" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "16(1공장)(용해로3호기)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%", gas_inspection_first: "2021-07-28", gas_inspection_last: "2025-07-27", gas_inspection_next: "2026-07-27", gas_inspection_round: "2차", velocity_inspection_first: "2021-09-10", velocity_inspection_last: "2025-03-01", velocity_inspection_next: "2026-03-01", velocity_inspection_round: "3차", velocity_inspection_so: "26-0088", inspection_date: "2/10" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "16(1공장)(용해로3호기)", gas_name: "NO 600ppm", concentration: "514ppm", volume_L: "10", expiry_date: "2027-01-08", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "2(1공장)(칩용해로)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-02-12", remaining_percent: "80%", so_issue: "26-0081", arrival_status: "3/6", gas_inspection_first: "2023-10-20", gas_inspection_last: "2025-10-19", gas_inspection_next: "2027-10-19", velocity_inspection_first: "2023-06-22", velocity_inspection_last: "2025-06-21", velocity_inspection_next: "2027-06-21", velocity_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-11-30", site_name: "현대성우캐스팅", tms_status: "전송", unit_no: "2(1공장)(칩용해로)", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2027-02-26", remaining_percent: "65%", purchase_entity: "26-0081", arrival_status: "3/6" }),

  // ══════════════════════════════════════
  // 현성세라믹
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-03-31", site_name: "현성세라믹", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2022-03-03", gas_inspection_last: "2024-03-02", gas_inspection_next: "2026-03-02", gas_inspection_round: "2차", gas_inspection_so: "26-0315", gas_inspection_so_arrival: "26-0315(~3/24)", velocity_inspection_first: "2021-12-28", velocity_inspection_last: "2025-12-27", velocity_inspection_next: "2026-12-27", velocity_inspection_round: "2차", inspection_notes: "지원금 대상으로 빠른 진행 요청", inspection_date: "9/15", inspection_cycle: "월 1회", monthly_amount: "1,050,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-03-31", site_name: "현성세라믹", tms_status: "전송", unit_no: "1", gas_name: "NO/SO2 500/500ppm", concentration: "425/421ppm", volume_L: "10", expiry_date: "2026-08-06", remaining_percent: "92%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "현성세라믹", tms_status: "비전송??", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "100%", gas_inspection_first: "2024-05-23", gas_inspection_next: "2026-05-22", gas_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-03-31", site_name: "현성세라믹", tms_status: "비전송??", unit_no: "1", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "현성세라믹", tms_status: "전송", unit_no: "Dust", gas_name: "Dust", gas_inspection_first: "2023-11-21", gas_inspection_last: "2024-05-23", gas_inspection_next: "2026-05-22", gas_inspection_round: "2차" }),

  // ══════════════════════════════════════
  // 휴스틸
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-11-30", site_name: "휴스틸", tms_status: "전송", unit_no: "13", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-22", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-09-28", gas_inspection_last: "2025-09-27", gas_inspection_next: "2026-09-27", gas_inspection_round: "2차", velocity_inspection_first: "2021-08-17", velocity_inspection_last: "2025-08-16", velocity_inspection_next: "2026-08-16", velocity_inspection_round: "2차", inspection_date: "3/3", inspection_cycle: "월 1회", monthly_amount: "1,300,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-11-30", site_name: "휴스틸", tms_status: "전송", unit_no: "13", gas_name: "NO 500ppm", concentration: "430ppm", volume_L: "10", expiry_date: "2027-01-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "휴스틸", tms_status: "전송", unit_no: "17", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-22", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-11-30", site_name: "휴스틸", tms_status: "전송", unit_no: "17", gas_name: "NO 500ppm", concentration: "430ppm", volume_L: "10", expiry_date: "2027-01-22", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 영화금속
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-07-31", site_name: "영화금속", tms_status: "전송", unit_no: "27", gas_name: "NO/SO2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-15", remaining_percent: "99%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2022-12-13", gas_inspection_last: "2024-12-12", gas_inspection_next: "2026-12-12", gas_inspection_round: "2차", velocity_inspection_first: "2022-11-29", velocity_inspection_last: "2025-06-04", velocity_inspection_next: "2026-06-04", velocity_inspection_round: "2차", inspection_cycle: "월 2회", monthly_amount: "1,100,000", contract_consumables: "월2회" }),
  mk({ contract_end_date: "2026-07-31", site_name: "영화금속", tms_status: "전송", unit_no: "27", gas_name: "NO/SO2 300/300ppm", concentration: "255/255ppm", volume_L: "10", expiry_date: "2027-01-15", remaining_percent: "99%", inspection_date: "2/23" }),

  // ══════════════════════════════════════
  // 금강공업 언양
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "금강공업 언양", unit_no: "25", gas_name: "NO Zero", concentration: "NO Zero", expiry_date: "2026-11-26", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2022-08-09", gas_inspection_last: "2024-08-08", gas_inspection_next: "2026-08-08", gas_inspection_round: "2차", velocity_inspection_first: "2022-03-24", velocity_inspection_last: "2024-03-23", velocity_inspection_next: "2026-03-23", velocity_inspection_round: "2차", inspection_date: "2/20", inspection_cycle: "월 1회", monthly_amount: "1,200,000", notes: "26.03.04_부착면제 예정으로 정도검사 홀딩…" }),
  mk({ contract_end_date: "2026-12-31", site_name: "금강공업 언양", unit_no: "25", gas_name: "NO 500ppm", concentration: "427ppm", expiry_date: "2026-11-26", remaining_percent: "95%" }),

  // ══════════════════════════════════════
  // 디알액시온 원산
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "디알액시온 원산", unit_no: "7", gas_name: "NO Zero", concentration: "N2", remaining_percent: "26%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2022-12-13", gas_inspection_last: "2025-01-17", gas_inspection_next: "2027-01-16", gas_inspection_round: "2차", velocity_inspection_first: "2022-09-30", velocity_inspection_last: "2024-09-29", velocity_inspection_next: "2026-09-29", velocity_inspection_round: "2차", inspection_date: "2/3", inspection_cycle: "월 1회", monthly_amount: "1,100,000", notes: "25.11.19_내년 유지 유선 통화 완료 (서병재T)" }),
  mk({ contract_end_date: "2026-12-31", site_name: "디알액시온 원산", unit_no: "7", gas_name: "NO 600ppm", concentration: "510ppm", expiry_date: "2026-07-03", remaining_percent: "94%" }),

  // ══════════════════════════════════════
  // 롯데패키징솔루션즈 평택
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-01-31", site_name: "롯데패키징솔루션즈 평택", unit_no: "12", gas_name: "NO Zero", concentration: "N2", expiry_date: "2027-01-07", remaining_percent: "93%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2021-01-26", gas_inspection_last: "2025-12-06", gas_inspection_next: "2026-12-06", gas_inspection_round: "4차", velocity_inspection_first: "2020-11-30", velocity_inspection_last: "2025-11-29", velocity_inspection_next: "2026-11-29", velocity_inspection_round: "2차", inspection_date: "2/23", inspection_cycle: "월 1회", monthly_amount: "950,000", notes: "가스 일괄구매 26년 1월 재검토 예정" }),
  mk({ contract_end_date: "2027-01-31", site_name: "롯데패키징솔루션즈 평택", unit_no: "12", gas_name: "NO 200ppm", concentration: "170ppm", expiry_date: "2027-01-07", remaining_percent: "92%" }),
  mk({ contract_end_date: "2027-01-31", site_name: "롯데패키징솔루션즈 평택", unit_no: "12", gas_name: "O2 Zero", concentration: "2%", expiry_date: "2026-12-17", remaining_percent: "99%" }),
  mk({ contract_end_date: "2027-01-31", site_name: "롯데패키징솔루션즈 평택", unit_no: "12", gas_name: "O2 25%", concentration: "21.02%", expiry_date: "2026-09-15", remaining_percent: "85%" }),

  // ══════════════════════════════════════
  // 영월빛드림
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-04", site_name: "영월빛드림", unit_no: "", gas_name: "NO Zero", concentration: "N2", expiry_date: "2026-06-18", remaining_percent: "100%", purchase_entity: "요청 시", branch: "본사", inspection_cycle: "주 1회" }),
  mk({ contract_end_date: "2026-05-04", site_name: "영월빛드림", unit_no: "", gas_name: "NO", concentration: "34ppm", expiry_date: "2026-05-19", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-04", site_name: "영월빛드림", unit_no: "", gas_name: "O2 25%", concentration: "21.13%", expiry_date: "2026-06-18", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 롯데패키징솔루션즈 진천
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-04-30", site_name: "롯데패키징솔루션즈 진천", unit_no: "9", gas_name: "NO Zero", concentration: "N2", expiry_date: "2026-12-17", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2022-08-23", gas_inspection_last: "2024-08-22", gas_inspection_next: "2026-08-22", gas_inspection_round: "1차", velocity_inspection_first: "2022-05-17", velocity_inspection_last: "2024-05-16", velocity_inspection_next: "2026-05-16", velocity_inspection_round: "1차", inspection_date: "1/14", inspection_cycle: "월 1회", monthly_amount: "950,000" }),
  mk({ contract_end_date: "2026-04-30", site_name: "롯데패키징솔루션즈 진천", unit_no: "9", gas_name: "NO 200ppm", concentration: "173.3ppm", expiry_date: "2026-12-17", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 태평양금속 (구미)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", expiry_date: "2026-09-17", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "영남", gas_inspection_first: "2023-04-11", gas_inspection_last: "2025-04-10", gas_inspection_next: "2027-04-10", gas_inspection_round: "2차", velocity_inspection_first: "2022-12-14", velocity_inspection_last: "2024-12-13", velocity_inspection_next: "2026-12-13", velocity_inspection_round: "2차", inspection_notes: "#1,2,59-Nox 일괄진행(25년)", inspection_date: "1/29", inspection_cycle: "월 1회(긴급 50만)", md: "2 M/D", monthly_amount: "1,312,500" }),
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "1", gas_name: "NO 600ppm", concentration: "510ppm", expiry_date: "2026-09-17", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", expiry_date: "2026-09-17", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "2", gas_name: "NO 600ppm", concentration: "510ppm", expiry_date: "2026-09-17", remaining_percent: "98%" }),
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "59", gas_name: "NO Zero", concentration: "N2", expiry_date: "2026-09-17", remaining_percent: "100%", gas_inspection_first: "2023-06-28", gas_inspection_last: "2025-04-17", gas_inspection_next: "2027-04-16", gas_inspection_round: "2차" }),
  mk({ contract_end_date: "2026-05-31", site_name: "태평양금속", tms_status: "전송", unit_no: "59", gas_name: "NO 600ppm", concentration: "510ppm", expiry_date: "2026-09-17", remaining_percent: "97%" }),

  // ══════════════════════════════════════
  // 삼일씨엔에스
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-08-31", site_name: "삼일씨엔에스", unit_no: "7", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-06-25", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2023-04-18", gas_inspection_last: "2025-04-17", gas_inspection_next: "2027-04-17", gas_inspection_round: "1차", velocity_inspection_first: "2022-08-24", velocity_inspection_last: "2024-08-23", velocity_inspection_next: "2026-08-23", velocity_inspection_round: "2차", inspection_date: "8/8", inspection_cycle: "월 0.5회", monthly_amount: "1,500,000" }),
  mk({ contract_end_date: "2026-08-31", site_name: "삼일씨엔에스", unit_no: "7", gas_name: "NO 200ppm", concentration: "170ppm", volume_L: "10", expiry_date: "2026-06-25", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "삼일씨엔에스", unit_no: "7", gas_name: "O2 Zero", concentration: "2%", volume_L: "10", expiry_date: "2026-06-25", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "삼일씨엔에스", unit_no: "7", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-06-25", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // 이구산업
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A3", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "73%", purchase_entity: "디엑스지", so_issue: "26-0197", arrival_status: "3/13", branch: "본사", gas_inspection_first: "2023-08-18", gas_inspection_last: "2025-08-17", gas_inspection_next: "2027-08-17", velocity_inspection_first: "2023-07-19", velocity_inspection_last: "2025-07-18", velocity_inspection_next: "2027-07-18", velocity_inspection_round: "1차", velocity_inspection_so: "25-1623(완료)", inspection_notes: "#A28(25) 유속재재산정 필요\n#A5(3) 정도검사 때 유속 재확인 필요할듯….\nA28 올해 대상 아니여서 유지보수 할지 말지는 CS 팀에 문의하고 결정 예정 (5/22)", inspection_date: "2/13", inspection_cycle: "월 2회", monthly_amount: "1,400,000" }),
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A3", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "72%", so_issue: "26-0197", arrival_status: "3/13" }),
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A3", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "81%", so_issue: "26-0197", arrival_status: "3/13" }),
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A28", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "85%", so_issue: "26-0197", arrival_status: "3/13", velocity_inspection_first: "2023-06-22", velocity_inspection_last: "2025-04-22", velocity_inspection_next: "2026-04-21", velocity_inspection_round: "3차", inspection_date: "2/27" }),
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A28", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "65%", purchase_entity: "26-0197", arrival_status: "3/13" }),
  mk({ contract_end_date: "2026-12-31", site_name: "이구산업", unit_no: "#A28", gas_name: "O2 25%", concentration: "미사용", expiry_date: "2025-04-14" }),

  // ══════════════════════════════════════
  // 디에스우일바이오
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-11-30", site_name: "디에스우일바이오", unit_no: "1", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2023-11-15", gas_inspection_last: "2025-11-14", gas_inspection_next: "2027-11-14", gas_inspection_round: "2차", velocity_inspection_first: "2023-11-17", velocity_inspection_last: "2025-11-26", velocity_inspection_next: "2027-11-16", velocity_inspection_round: "1차", inspection_date: "2/6", inspection_cycle: "월 1회", monthly_amount: "1,250,000", notes: "25.10.29 통화_배출량 감소로 부착면제 예상" }),
  mk({ contract_end_date: "2026-11-30", site_name: "디에스우일바이오", unit_no: "1", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "86%", notes: "25.12 폐쇄가능성 있어 소모품 발주 가급적 홀딩 (25.11.21_우용린B 통화완료)" }),
  mk({ contract_end_date: "2026-11-30", site_name: "디에스우일바이오", unit_no: "1", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-08-12", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // AMMK (구.한국타코닉)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "AMMK", unit_no: "A6", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-20", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2023-10-30", gas_inspection_last: "2025-10-29", gas_inspection_next: "2027-10-29", gas_inspection_round: "1차", velocity_inspection_first: "2023-06-28", velocity_inspection_last: "2025-06-27", velocity_inspection_next: "2027-06-27", velocity_inspection_round: "1차", inspection_notes: "7/2 유속계 취외", inspection_date: "2/27", inspection_cycle: "월 1회", md: "2M/D", monthly_amount: "1,500,000" }),
  mk({ contract_end_date: "2026-12-31", site_name: "AMMK", unit_no: "A6", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "61%", so_issue: "26-0187", arrival_status: "3/13" }),
  mk({ contract_end_date: "2026-12-31", site_name: "AMMK", unit_no: "A7", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-11-05", remaining_percent: "100%", gas_inspection_first: "2023-11-20", gas_inspection_last: "2025-11-19", gas_inspection_next: "2027-11-19", gas_inspection_round: "1차" }),
  mk({ contract_end_date: "2026-12-31", site_name: "AMMK", unit_no: "A7", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2026-03-19", remaining_percent: "72%", purchase_entity: "26-0187", arrival_status: "3/13" }),

  // ══════════════════════════════════════
  // 김포발전-TMS
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-09-06", site_name: "김포발전-TMS", unit_no: "", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "85%", purchase_entity: "디엑스지(요청 시)", branch: "본사" }),
  mk({ contract_end_date: "2026-09-06", site_name: "김포발전-TMS", unit_no: "", gas_name: "NO 40ppm", concentration: "34ppm", volume_L: "10", expiry_date: "2025-09-13", remaining_percent: "95%", inspection_notes: "9/17(수) -정도검사 예정" }),
  mk({ contract_end_date: "2026-09-06", site_name: "김포발전-TMS", unit_no: "", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2025-10-30", remaining_percent: "92%" }),

  // 김포발전-SCR
  mk({ site_name: "김포발전-SCR", unit_no: "", gas_name: "NO Zero", concentration: "N2", volume_L: "47", remaining_percent: "45%" }),
  mk({ site_name: "김포발전-SCR", unit_no: "", gas_name: "NO 500ppm", concentration: "425ppm", volume_L: "10", expiry_date: "2025-10-30", remaining_percent: "90%" }),
  mk({ site_name: "김포발전-SCR", unit_no: "", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2025-10-30", remaining_percent: "100%" }),

  // ══════════════════════════════════════
  // GS EPS (SCR 제외)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "7(복합4호기)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%", purchase_entity: "발주처(정두현GJ 확인)", branch: "본사", gas_inspection_first: "2023-11-16", gas_inspection_last: "2025-11-15", gas_inspection_next: "2027-11-15", gas_inspection_so: "청구불가", velocity_inspection_first: "2016-03-22", velocity_inspection_last: "2025-03-21", velocity_inspection_next: "2026-03-21", inspection_notes: "수수료 발주처 부담(별도 S/O 발행 X)", inspection_date: "9/9", inspection_cycle: "월 1회 SCR분기1회", md: "2M/D", monthly_amount: "1,980,000" }),
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "7(복합4호기)", gas_name: "NO 50ppm", concentration: "40ppm", volume_L: "10", expiry_date: "2026-04-29", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "7(복합4호기)", gas_name: "O2 25%", concentration: "20.97%", volume_L: "10", expiry_date: "2026-04-22", remaining_percent: "68%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "8(복합4호기)", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "8(복합4호기)", gas_name: "NO 50ppm", concentration: "40ppm", volume_L: "10", expiry_date: "2026-04-29", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "GS EPS", unit_no: "8(복합4호기)", gas_name: "O2 25%", concentration: "20.97%", volume_L: "10", expiry_date: "2026-09-04", remaining_percent: "85%" }),

  // ══════════════════════════════════════
  // 삼우 2공장
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-03-31", site_name: "삼우 2공장", tms_status: "전송", unit_no: "16", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-17", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2024-02-06", gas_inspection_last: "2026-02-05", gas_inspection_next: "2028-02-05", gas_inspection_round: "1차", velocity_inspection_first: "2024-02-16", velocity_inspection_next: "2026-02-15", velocity_inspection_round: "1차", velocity_inspection_so: "25-3389", inspection_date: "3/3", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,000,000", notes: "3% 인상가능하나… 5만원 이상으로 맞춰보겠다고 함\n26년 1월 O2 가스 제거" }),
  mk({ contract_end_date: "2026-03-31", site_name: "삼우 2공장", tms_status: "전송", unit_no: "16", gas_name: "NO 500ppm", concentration: "431ppm", volume_L: "10", expiry_date: "2026-09-17", remaining_percent: "91%" }),

  // ══════════════════════════════════════
  // 브이피에이치메탈
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-03-31", site_name: "브이피에이치메탈", unit_no: "1", gas_name: "Dust", branch: "영남", gas_inspection_first: "2023-12-13", gas_inspection_last: "2025-12-12", gas_inspection_next: "2027-12-12", gas_inspection_round: "2차", velocity_inspection_first: "2023-10-26", velocity_inspection_last: "2025-10-25", velocity_inspection_next: "2027-10-25", inspection_date: "2/9", monthly_amount: "1,300,000", notes: "10월 예산미반영으로 동결" }),

  // ══════════════════════════════════════
  // 명화공업(CPC) + 명화공업-세명(COBA)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-04-30", site_name: "명화공업(CPC)", tms_status: "전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2027-01-14", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2024-04-09", gas_inspection_next: "2026-04-08", gas_inspection_round: "1차", gas_inspection_so: "26-0313", gas_inspection_so_arrival: "26-0313(~3/24)", velocity_inspection_first: "2024-03-11", velocity_inspection_next: "2026-03-10", velocity_inspection_round: "1차", velocity_inspection_so: "26-0313", inspection_date: "2/24", inspection_cycle: "월 1회", md: "1 M/D", monthly_amount: "1,500,000" }),
  mk({ contract_end_date: "2026-04-30", site_name: "명화공업(CPC)", tms_status: "전송", unit_no: "1", gas_name: "NO 600ppm", concentration: "512ppm", volume_L: "10", expiry_date: "2027-01-14", remaining_percent: "98%" }),
  mk({ site_name: "명화공업-세명(COBA)", tms_status: "전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-09-04", remaining_percent: "100%", branch: "본사", gas_inspection_first: "2025-01-23", gas_inspection_next: "2027-01-22", gas_inspection_round: "1차", velocity_inspection_first: "2024-11-07", velocity_inspection_next: "2026-11-06", velocity_inspection_round: "1차" }),
  mk({ site_name: "명화공업-세명(COBA)", tms_status: "전송", unit_no: "2", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2026-09-04", remaining_percent: "99%" }),

  // ══════════════════════════════════════
  // 울산 GPS
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "6", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-19", remaining_percent: "85%", so_issue: "23-0046", arrival_status: "2/6", branch: "영남", gas_inspection_first: "2024-09-09", gas_inspection_next: "2026-09-08", gas_inspection_round: "1차", velocity_inspection_first: "2023-09-06", velocity_inspection_last: "2025-09-05", velocity_inspection_next: "2027-09-05", velocity_inspection_round: "1차", inspection_cycle: "주1회", md: "2M/D" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "6", gas_name: "NO 40ppm", concentration: "34ppm", volume_L: "10", expiry_date: "2026-07-07", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "6", gas_name: "O2 25%", concentration: "21.01%", volume_L: "10", expiry_date: "2026-02-20", remaining_percent: "75%", so_issue: "23-0046", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "7", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-19", remaining_percent: "85%", so_issue: "23-0046", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "7", gas_name: "NO 40ppm", concentration: "34ppm", volume_L: "10", expiry_date: "2026-07-07", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "전송(TMS)", unit_no: "7", gas_name: "O2 25%", concentration: "21.06%", volume_L: "10", expiry_date: "2026-02-20", remaining_percent: "71%", purchase_entity: "23-0046", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "8", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-19", remaining_percent: "99%", purchase_entity: "비전송", so_issue: "23-0046", arrival_status: "2/6", gas_inspection_first: "2024-09-09", gas_inspection_next: "2026-09-08", gas_inspection_round: "1차", velocity_inspection_first: "2023-09-06", velocity_inspection_last: "X", velocity_inspection_next: "해당없음", velocity_inspection_round: "1차", inspection_notes: "#8,9 비전송", inspection_cycle: "주1회 1대씩 점검 → 격주점검", md: "2M/D" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "8", gas_name: "NO 40ppm", concentration: "34ppm", volume_L: "10", expiry_date: "2026-01-23", remaining_percent: "90%", so_issue: "26-0069", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "8", gas_name: "O2 25%", concentration: "21.01%", volume_L: "10", expiry_date: "2026-02-20", remaining_percent: "100%", so_issue: "23-0046", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "9", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-02-19", remaining_percent: "99%", so_issue: "23-0046", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "9", gas_name: "NO 40ppm", concentration: "34ppm", volume_L: "10", expiry_date: "2026-01-23", remaining_percent: "90%", purchase_entity: "26-0069", arrival_status: "2/6" }),
  mk({ contract_end_date: "2026-12-31", site_name: "울산 GPS", tms_status: "(보조보일러)", unit_no: "9", gas_name: "O2 25%", concentration: "21.01%", volume_L: "10", expiry_date: "2026-02-20", remaining_percent: "99%", purchase_entity: "23-0046", arrival_status: "2/6" }),

  // ══════════════════════════════════════
  // 코미코
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "코미코", tms_status: "전송", unit_no: "1", gas_name: "NO/O2 Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-07-30", remaining_percent: "99%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2025-06-09", gas_inspection_next: "2027-06-08", gas_inspection_round: "1차", velocity_inspection_first: "2025-07-02", velocity_inspection_next: "2027-07-01", inspection_notes: "피토관 휨발생으로 재제작", inspection_date: "2/19", inspection_cycle: "월 1회", monthly_amount: "1,370,000", notes: "25.12.12_12/15~19 사이에 계약서 재작성 여부 연락준다고 함" }),
  mk({ contract_end_date: "2026-12-31", site_name: "코미코", tms_status: "전송", unit_no: "1", gas_name: "NO 600ppm", concentration: "510ppm", volume_L: "10", expiry_date: "2026-07-30", remaining_percent: "89%" }),
  mk({ contract_end_date: "2026-12-31", site_name: "코미코", tms_status: "전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.02%", volume_L: "10", remaining_percent: "", notes: "가스 회수" }),

  // ══════════════════════════════════════
  // 한국가스공사 창원수소
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-03-23", site_name: "한국가스공사 창원수소", unit_no: "1", gas_name: "NO/O2 Zero", volume_L: "10", expiry_date: "2024-02-22", purchase_entity: "발주처", branch: "호남", gas_inspection_first: "2025-03-07", gas_inspection_next: "2027-03-06", gas_inspection_round: "1차", velocity_inspection_first: "2023-06-09", velocity_inspection_last: "2025-06-08", velocity_inspection_next: "2027-06-08", velocity_inspection_round: "1차", inspection_cycle: "월 1회", md: "2M/D", monthly_amount: "978,146" }),
  mk({ contract_end_date: "2026-03-23", site_name: "한국가스공사 창원수소", unit_no: "1", gas_name: "NO 500ppm", volume_L: "10", expiry_date: "2025-11-27" }),
  mk({ contract_end_date: "2026-03-23", site_name: "한국가스공사 창원수소", unit_no: "1", gas_name: "O2 25%", volume_L: "10", expiry_date: "2025-11-27" }),

  // ══════════════════════════════════════
  // 프린스페이퍼 (네오그린텍)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-08-31", site_name: "프린스페이퍼", tms_status: "전송", unit_no: "1(비전송)", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2025-12-04", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_first: "2022-02-25", gas_inspection_last: "2024-02-24", gas_inspection_next: "2026-02-24", gas_inspection_round: "2차", velocity_inspection_first: "2022-02-03", velocity_inspection_last: "2023-09-04", velocity_inspection_next: "2025-09-03", velocity_inspection_round: "2차", inspection_date: "12/23", inspection_cycle: "분기 1회", monthly_amount: "1,000,000", notes: "23/7/21 동결진행" }),
  mk({ contract_end_date: "2026-08-31", site_name: "프린스페이퍼", tms_status: "전송", unit_no: "1(비전송)", gas_name: "NO/SO2 200/200ppm (SO2 비전송)", concentration: "170.5/171.6ppm", volume_L: "10", expiry_date: "2026-03-05", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "프린스페이퍼", tms_status: "전송", unit_no: "1(비전송)", gas_name: "O2 Zero", concentration: "2%", volume_L: "10", expiry_date: "2025-12-26", remaining_percent: "28%", notes: "26년 2월 발주 계획" }),
  mk({ contract_end_date: "2026-08-31", site_name: "프린스페이퍼", tms_status: "전송", unit_no: "1(비전송)", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2025-12-26", remaining_percent: "100%" }),
  mk({ contract_end_date: "2026-08-31", site_name: "프린스페이퍼", tms_status: "전송", unit_no: "1(비전송)", gas_name: "Dust" }),

  // ══════════════════════════════════════
  // 검단지역난방설비 (청라에너지)
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "1", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-05-24", remaining_percent: "100%", purchase_entity: "디엑스지", branch: "본사", gas_inspection_so: "25-3058", gas_inspection_so_arrival: "25-3058(도착완료)", velocity_inspection_so: "25-3058", inspection_cycle: "월1회", md: "1 M/D", monthly_amount: "1,500,000", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "1", gas_name: "NO 100ppm", concentration: "85ppm", volume_L: "10", expiry_date: "2026-05-24", remaining_percent: "88%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "1", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-24", remaining_percent: "95%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "1", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-11-24", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "2", gas_name: "NO Zero", concentration: "N2", volume_L: "10", expiry_date: "2026-05-24", remaining_percent: "100%", contract_consumables: "월1회" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "2", gas_name: "NO 100ppm", concentration: "85ppm", volume_L: "10", expiry_date: "2026-05-24", remaining_percent: "90%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "2", gas_name: "O2 Zero", concentration: "2.00%", volume_L: "10", expiry_date: "2026-11-24", remaining_percent: "96%" }),
  mk({ contract_end_date: "2026-03-31", site_name: "검단지역난방설비", tms_status: "비전송", unit_no: "2", gas_name: "O2 25%", concentration: "21.00%", volume_L: "10", expiry_date: "2026-11-24", remaining_percent: "92%" }),

  // ══════════════════════════════════════
  // 한국 바스프 여수
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-06-30", site_name: "한국 바스프 여수", unit_no: "", gas_name: "-", branch: "호남", inspection_cycle: "분기1회", md: "2 M/D", monthly_amount: "1,200,000" }),

  // ══════════════════════════════════════
  // 앰코테크놀로지 송도
  // ══════════════════════════════════════
  mk({ contract_end_date: "2026-12-31", site_name: "앰코테크놀로지 송도", unit_no: "4,5", gas_name: "NO Zero", concentration: "N2", branch: "본사" }),
  mk({ contract_end_date: "2026-12-31", site_name: "앰코테크놀로지 송도", unit_no: "4,5", gas_name: "NO 200ppm", concentration: "175ppm" }),
  mk({ contract_end_date: "2026-12-31", site_name: "앰코테크놀로지 송도", unit_no: "4,5", gas_name: "O2", concentration: "21.00%", gas_inspection_first: "2025-02-04", gas_inspection_next: "2026-02-03" }),

  // ══════════════════════════════════════
  // 클린코리아 경주
  // ══════════════════════════════════════
  mk({ contract_end_date: "2027-02-28", site_name: "클린코리아 경주", unit_no: "", gas_name: "NO Zero", concentration: "N2", branch: "영남", inspection_cycle: "월2회", monthly_amount: "1,250,000" }),
  mk({ contract_end_date: "2027-02-28", site_name: "클린코리아 경주", unit_no: "", gas_name: "NOx,SO2,CO" }),
  mk({ contract_end_date: "2027-02-28", site_name: "클린코리아 경주", unit_no: "", gas_name: "O2 25%" }),
];

// Data validation log (dev mode)
if (import.meta.env.DEV) {
  const siteMap = new Map<string, Set<string>>();
  for (const item of seedCalibrationGasInventory) {
    if (!siteMap.has(item.site_name)) siteMap.set(item.site_name, new Set());
    if (item.unit_no) siteMap.get(item.site_name)!.add(item.unit_no);
  }
  console.log(`[CalGas] Loaded ${seedCalibrationGasInventory.length} inventory rows across ${siteMap.size} sites`);
  for (const [site, units] of siteMap) {
    console.log(`  ${site}: ${units.size} units [${[...units].join(', ')}]`);
  }
}
