import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import type { OutboundInspection, InspectionReport, InspectionCheckItem } from "@/types";

const TEMPLATE_URL = "/templates/first-report-template.docx";

/* ─── Check item → template boolean key mapping ─── */
const CHECK_ITEM_KEY_MAP: Array<{ category: string; item: string; key: string }> = [
  { category: "광학부", item: "Beam Splitter", key: "BEAMSPLITTER" },
  { category: "광학부", item: "Focusing Lens", key: "FOCUSINGLENS" },
  { category: "광학부", item: "M/U Window", key: "MUWINDOW" },
  { category: "Spectrometer", item: "스펙트럼 형상", key: "SPECTRUM" },
  { category: "UV Lamp", item: "UV Lamp 광원", key: "UVLAMP" },
  { category: "UV Lamp Driver", item: "DC 출력 상태", key: "DCOUTPUT" },
  { category: "SMPS", item: "동작 상태 (5V, 12V, 24V)", key: "SMPS" },
  { category: "배선 결선", item: "배선 단락, 단선", key: "WIRING" },
  { category: "Main Control CPU Board", item: "부팅 여부 / 동작 상태", key: "CPU" },
  { category: "냉각 팬", item: "동작 상태", key: "COOLINGFAN_OPERATION" },
  { category: "프로브", item: "외관 상태", key: "PROBE_APPEARANCE" },
  { category: "프로브", item: "온도센서 / 동작 상태", key: "PROBE_TEMPSENSOR" },
];

function buildCheckFlags(items: InspectionCheckItem[]): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const mapping of CHECK_ITEM_KEY_MAP) {
    const item = items.find(i => i.category === mapping.category && i.item === mapping.item);
    flags[`CHECK_${mapping.key}_OK`] = item?.result === "양호";
    flags[`CHECK_${mapping.key}_NEED`] = item?.result === "추가점검 필요";
  }
  return flags;
}

/* ─── Build full template data object ─── */
function buildTemplateData(
  inspection: OutboundInspection,
  report: InspectionReport,
): Record<string, unknown> {
  const data = report.inspection_data;
  const equipItem = inspection.equipment_items.find(e => e.id === report.equipment_item_id);
  const serialNo = report.serial_numbers[report.equipment_item_id] || equipItem?.serial_no || "";

  // Build photo captions grouped by section (2-column rows)
  const buildPhotoCaptions = (slotKey: string) => {
    const slotPhotos = (data.photos || []).filter(p => p.page_slot === slotKey);
    const rows: Array<{ LEFT_CAPTION: string; RIGHT_CAPTION: string }> = [];
    for (let i = 0; i < slotPhotos.length; i += 2) {
      rows.push({
        LEFT_CAPTION: slotPhotos[i]?.caption || "",
        RIGHT_CAPTION: slotPhotos[i + 1]?.caption || "",
      });
    }
    return rows;
  };

  return {
    // ── Cover page ──
    INSPECTOR_NAM: report.inspector_name,
    DEPT_HEAD_NAM: data.department_head || "",
    QA_REVIEWER_NAM: report.approved_by || "",
    QA_SIGNATURE: report.approved_by ? "검토완료" : "",

    CLIENT_NAME: data.client_name,
    CLIENT_N: data.client_name,
    SERIAL_NO: serialNo,
    SERIAL: serialNo,
    INBOUND_DATE: data.inbound_date,
    REPORT_DATE: report.created_date,
    MANAGEMENT_NO: inspection.manage_no,

    // ── Model checkboxes (☑/☐ via sections) ──
    IS_DGA_X: data.model_checks.includes("DGA-X"),
    IS_DSM_XG: data.model_checks.includes("DSM-XG"),
    IS_RGA_60: data.model_checks.includes("RGA-60"),
    IS_RSM_61: data.model_checks.includes("RSM-61"),
    IS_TGA_50: data.model_checks.includes("TGA-50"),
    IS_LSM_30: data.model_checks.includes("LSM-30"),
    IS_GGA_70_1: data.model_checks.includes("GGA-70-1"),
    IS_PGA_91: data.model_checks.includes("PGA-91"),
    IS_OTHER_MODEL: false,
    OTHER_MODEL_NAME: "",

    // ── Inbound items ──
    IS_MAIN_UNIT: data.inbound_items.includes("Main Unit"),
    IS_ACU: data.inbound_items.includes("ACU"),
    IS_PROBE: data.inbound_items.includes("Probe"),
    IS_PURGE_AIR_UNIT: data.inbound_items.includes("Purge Air Unit"),

    // ── Inspection type ──
    IS_REGULAR_INSPECTION: data.inbound_type.includes("정기 반출 점검"),
    IS_EMERGENCY_INSPECTION: data.inbound_type.includes("긴급 점검"),
    IS_INCOMING_INSPECTION: data.inbound_type.includes("입고 점검"),

    // ── Basic check: gas ──
    CHECK_GAS_NOX: data.measure_gas.includes("NOx"),
    CHECK_GAS_NO2: data.measure_gas.includes("NO2"),
    CHECK_GAS_SO2: data.measure_gas.includes("SO2"),
    CHECK_GAS_NH3: data.measure_gas.includes("NH3"),
    CHECK_GAS_CO: data.measure_gas.includes("CO"),
    CHECK_GAS_HCL: data.measure_gas.includes("HCl"),
    CHECK_GAS_O2: data.measure_gas.includes("O2"),

    // ── Basic check: install type ──
    CHECK_INSTALL_BLR: data.install_type.includes("BLR"),
    CHECK_INSTALL_SCR: data.install_type.includes("SCR"),
    CHECK_INSTALL_ESP: data.install_type.includes("ESP"),
    CHECK_INSTALL_FGD: data.install_type.includes("FGD"),
    CHECK_INSTALL_TMS: data.install_type.includes("TMS"),
    CHECK_INSTALL_ETC: false,
    INSTALL_ETC_TEXT: "",

    // ── Section II: check item boolean flags ──
    ...buildCheckFlags(data.check_items),

    // ── Section III: replacement parts list (row repeat) ──
    REPLACEMENT_LIST: (data.replacement_parts || []).map(p => ({
      ITEM_NAME: p.name,
      ITEM_QT: p.qty,
      ITEM_STATUS: p.status,
      ITEM_COMMENT: p.note,
    })),

    // ── Section IV: detail text fields (linebreaks preserved) ──
    CPU_STATUS: data.main_control_cpu,
    OPTICS_CONTAMINATION: data.optics_window_lens,
    BEAMSPLITTER_CONTAMINATION: data.beam_splitter_contamination,
    BEAMSPLITTER_COMMENT: data.beam_splitter_result,
    SPECTROMETER_STATUS: data.spectrometer_status,
    SPECTROMETER_COMMENT: data.spectrometer_result,
    UVLAMP_STATUS: data.uv_lamp_note,
    COOLINGFAN_STATUS: data.cooling_fan_status,
    SMPS_STATUS: data.smps_note,
    WIRING_STATUS: data.wiring_status,

    // ── Probe detail ──
    PROBE_APPEARANCE_DETAIL: data.probe_exterior,
    PROBE_TEMPSENSOR_DETAIL: data.probe_temp_sensor,
    PROBE_CORNERMIRROR_DETAIL: data.probe_corner_mirror,
    PROBE_LENGTH_DETAIL: data.probe_length,
    PROBE_MEASURE_SECTION_DETAIL: data.probe_measure_section,
    GAS_DIRECTION_DETAIL: data.probe_gas_direction,

    // ── Summary ──
    SUMMARY_FIRST_INSPECTION: data.summary_items[0] || "",
    SUMMARY_SPECTROMETER_ALIGNMENT: data.summary_items[1] || "",
    SUMMARY_PROBE_ALIGNMENT: data.summary_items[2] || "",
    SUMMARY_STANDARD_GAS_CALIBRATION: data.summary_items[3] || "",

    // ── Photo captions by section (images visible in app UI) ──
    REPLACEMENT_PHOTO_ROWS: buildPhotoCaptions("replacement_parts"),
    OPTICAL_PHOTOS_ROWS: buildPhotoCaptions("body_optics"),
    ELECTRICAL_PHOTOS_ROWS: buildPhotoCaptions("cpu_smps"),
    PROBE_PHOTOS_ROWS: buildPhotoCaptions("ao_probe"),
    OTHER_PHOTOS_ROWS: buildPhotoCaptions("spectrometer"),

    // Fallback for template's shared LEFT/RIGHT tags
    LEFT_IMAGE: "",
    RIGHT_IMAGE: "",
    LEFT_CAPTION: "",
    RIGHT_CAPTION: "",
  };
}

/* ─── Export function ─── */
export async function exportReportToWord(
  inspection: OutboundInspection,
  report: InspectionReport,
  reportTitle: string,
) {
  // Fetch template
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) throw new Error("Template file not found");
  const templateBuffer = await response.arrayBuffer();

  // Load template into PizZip
  const zip = new PizZip(templateBuffer);

  // Create Docxtemplater instance with {{ }} delimiters
  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
  });

  // Build and render data
  const templateData = buildTemplateData(inspection, report);
  doc.render(templateData);

  // Generate output blob
  const blob = doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const fileName = `${reportTitle}_${inspection.manage_no}_${report.created_date}.docx`;
  saveAs(blob, fileName);
}
