import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { saveAs } from "file-saver";
import type { OutboundInspection, InspectionReport, InspectionCheckItem } from "@/types";
import { resolvePhotoUrl } from "@/lib/reportPhotoStorage";

const FIRST_TEMPLATE_URL = "/templates/first-report-template.docx";
const FINAL_TEMPLATE_URL = "/templates/final-report-template.docx";
const QA_SIGNATURE_IMAGE_URL = "/images/qa-signature.png";

/** Safely return a string – never "undefined" or "null" */
function safe(val: unknown): string {
  if (val === undefined || val === null) return "";
  const s = String(val);
  return s === "undefined" || s === "null" ? "" : s;
}

/** Boolean → checkbox character */
function chk(val: boolean): string {
  return val ? "☑" : "☐";
}

/* ─── Fetch image as base64 ─── */
async function fetchImageBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) return "";
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/* ─── Rewrite template XML to convert {{IMAGE_TAG}} to {%IMAGE_TAG} ─── */
function rewriteImageTags(zip: PizZip) {
  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;
  let content = contentFile.asText();
  // With custom delimiters {{ }}, image module expects {{%TAG}}
  // QA signature tags
  content = content.replace(/\{\{QA_SIGNATURE_IMAG\}\}/g, "{{%QA_SIGNATURE_IMAG}}");
  content = content.replace(/\{\{QA_SIGNATURE_IMAGE\}\}/g, "{{%QA_SIGNATURE_IMAGE}}");
  content = content.replace(/\{\{QA_SIGNATURE\}\}/g, "{{%QA_SIGNATURE}}");
  // Photo image tags (inside loops and top-level)
  content = content.replace(/\{\{LEFT_IMAGE\}\}/g, "{{%LEFT_IMAGE}}");
  content = content.replace(/\{\{RIGHT_IMAGE\}\}/g, "{{%RIGHT_IMAGE}}");
  zip.file("word/document.xml", content);
}

/* ─── Post-process: center-align name cells in the exported document ─── */
function postProcessNameAlignment(zip: PizZip) {
  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;
  let content = contentFile.asText();

  // Find rendered name values and ensure their paragraph has center alignment
  // The names appear as plain text runs after rendering. We look for paragraphs
  // containing INSPECTOR_NAME / DEPT_HEAD_NAME / QA_REVIEWER_NAME text or their
  // rendered values, and ensure the paragraph properties include center justification.
  // Strategy: Add w:jc center to all <w:p> that are inside table cells containing these names.
  // Simpler approach: find all <w:tc> cells, and for ones that appear to be name cells
  // in the QA signature table row, add center alignment.

  // More robust: ensure any paragraph in the document that had these template keys
  // gets center alignment. After render, the keys are replaced with actual names.
  // We'll look for the signature table pattern and center-align all cells in those rows.

  // Alternative simple approach: add center alignment to all paragraphs globally is too broad.
  // Instead, patch paragraphs that don't have w:jc and are inside signature table cells.
  // For simplicity, we'll scan for known patterns around the name cells.

  // The safest approach: find runs that might contain the rendered names near 점검자/부서장/품질
  // and add center justification to their parent paragraphs.
  // We use a regex to find <w:p> elements that don't have <w:jc> and add center alignment.

  // Find paragraphs that are right after cells containing 점검자, 부서장, 품질본부 확인
  const nameKeys = ["점검자", "부서장", "품질본부"];
  for (const key of nameKeys) {
    // Pattern: find the table cell containing the key, then the NEXT cell (which has the name value)
    // and center-align the paragraph in that next cell
    const cellPattern = new RegExp(
      `(<w:tc[^>]*>(?:(?!<\\/w:tc>).)*?${key}(?:(?!<\\/w:tc>).)*?<\\/w:tc>\\s*<w:tc[^>]*>\\s*<w:tcPr>(?:(?!<\\/w:tcPr>).)*?<\\/w:tcPr>\\s*<w:p[^>]*>)(\\s*<w:pPr>)((?:(?!<\\/w:pPr>).)*?)(<\\/w:pPr>)`,
      "gs"
    );
    content = content.replace(cellPattern, (match, before, pprOpen, pprContent, pprClose) => {
      if (pprContent.includes("<w:jc")) {
        // Replace existing alignment with center
        return before + pprOpen + pprContent.replace(/<w:jc\s+w:val="[^"]*"\s*\/?>/, '<w:jc w:val="center"/>') + pprClose;
      }
      return before + pprOpen + pprContent + '<w:jc w:val="center"/>' + pprClose;
    });
  }

  zip.file("word/document.xml", content);
}

/* ─── Post-process: embed QA signature image directly into XML ─── */
function postProcessQASignatureImage(zip: PizZip, signatureBase64: string) {
  if (!signatureBase64) return;

  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;
  let content = contentFile.asText();

  // Check if there are still unresolved QA_SIGNATURE placeholders as text
  const placeholderPatterns = [
    /\{%QA_SIGNATURE_IMAGE\}/g,
    /\{%QA_SIGNATURE_IMAG\}/g,
    /\{%QA_SIGNATURE\}/g,
    /\{\{QA_SIGNATURE_IMAGE\}\}/g,
    /\{\{QA_SIGNATURE_IMAG\}\}/g,
    /\{\{QA_SIGNATURE\}\}/g,
    /QA_SIGNATURE_IMAGE/g,
    /QA_SIGNATURE_IMAG/g,
  ];

  let hasPlaceholder = false;
  for (const p of placeholderPatterns) {
    if (p.test(content)) {
      hasPlaceholder = true;
      break;
    }
  }

  if (!hasPlaceholder) return; // Image module handled it successfully

  // Add the image to the docx media folder
  const binary = atob(signatureBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const mediaPath = "word/media/qa_signature.png";
  zip.file(mediaPath, bytes);

  // Add relationship for the image
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!relsFile) return;
  let relsContent = relsFile.asText();
  const rId = "rIdQASig";
  if (!relsContent.includes(rId)) {
    relsContent = relsContent.replace(
      "</Relationships>",
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qa_signature.png"/></Relationships>`
    );
    zip.file("word/_rels/document.xml.rels", relsContent);
  }

  // Build inline image XML (width ~80px = 762000 EMU, height ~40px = 381000 EMU)
  const imgXml = `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="762000" cy="381000"/><wp:docPr id="99" name="QA Signature"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="99" name="qa_signature.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="762000" cy="381000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;

  // Replace placeholder text runs with the image
  // Find <w:r> elements containing the placeholder text and replace with image run
  for (const p of placeholderPatterns) {
    // Replace the text content within <w:t> tags
    content = content.replace(
      new RegExp(`(<w:r[^>]*>(?:<w:rPr>(?:(?!<\\/w:rPr>).)*<\\/w:rPr>)?\\s*<w:t[^>]*>)[^<]*(?:QA_SIGNATURE[^<]*)(</w:t>\\s*</w:r>)`, "g"),
      `<w:r>${imgXml}</w:r>`
    );
  }

  // Also clean up any remaining plain-text placeholders
  content = content.replace(/\{%QA_SIGNATURE_IMAGE\}/g, "");
  content = content.replace(/\{%QA_SIGNATURE_IMAG\}/g, "");
  content = content.replace(/\{%QA_SIGNATURE\}/g, "");
  content = content.replace(/\{\{QA_SIGNATURE_IMAGE\}\}/g, "");
  content = content.replace(/\{\{QA_SIGNATURE_IMAG\}\}/g, "");
  content = content.replace(/\{\{QA_SIGNATURE\}\}/g, "");

  zip.file("word/document.xml", content);
}

/* ─── Check item → template boolean key mapping ─── */
const CHECK_ITEM_KEY_MAP: Array<{ category: string; item: string; key: string }> = [
  { category: "광학부", item: "Beam Splitter", key: "BEAMSPLITTER" },
  { category: "광학부", item: "Focusing Lens", key: "FOCUSINGLENS" },
  { category: "광학부", item: "M/U Window", key: "MUWINDOW" },
  { category: "Spectrometer", item: "스펙트럼 형상", key: "SPECTRUM" },
  { category: "Spectrometer", item: "신호 상태", key: "SIGNAL" },
  { category: "UV Lamp", item: "UV Lamp 광원", key: "UVLAMP" },
  { category: "UV Lamp Driver", item: "DC 출력 상태", key: "DCOUTPUT" },
  { category: "SMPS", item: "동작 상태 (5V, 12V, 24V)", key: "SMPS" },
  { category: "배선 결선", item: "배선 단락, 단선", key: "WIRING" },
  { category: "Main Control CPU Board", item: "부팅 여부 / 동작 상태", key: "CPU" },
  { category: "냉각 팬", item: "동작 상태", key: "COOLINGFAN_OPERATION" },
  { category: "프로브", item: "외관 상태", key: "PROBE_APPEARANCE" },
  { category: "프로브", item: "온도센서 / 동작 상태", key: "PROBE_TEMPSENSOR" },
  { category: "프로브", item: "코너큐브 미러", key: "PROBE_CORNERMIRROR" },
];

function buildCheckFlags(items: InspectionCheckItem[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (const mapping of CHECK_ITEM_KEY_MAP) {
    const item = items.find(i => i.category === mapping.category && i.item === mapping.item);
    flags[`CHECK_${mapping.key}_OK`] = chk(item?.result === "양호");
    flags[`CHECK_${mapping.key}_NEED`] = chk(item?.result === "추가점검 필요");
  }
  return flags;
}

/** Deep-sanitise: replace any undefined/null with "" in the final context */
function sanitizeExportContext(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      result[key] = "";
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return sanitizeExportContext(item as Record<string, unknown>);
        }
        return item === undefined || item === null ? "" : item;
      });
    } else if (typeof value === "object") {
      result[key] = sanitizeExportContext(value as Record<string, unknown>);
    } else if (typeof value === "string" && (value === "undefined" || value === "null")) {
      result[key] = "";
    } else {
      result[key] = value;
    }
  }
  return result;
}

/* ─── Pre-fetch all photo images as base64 ─── */
async function fetchAllPhotoImages(photos: Array<{ id: string; file_url: string }>): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!photos || photos.length === 0) return map;

  const results = await Promise.allSettled(
    photos.map(async (p) => {
      if (!p.file_url) return { id: p.id, base64: "" };
      try {
        const url = resolvePhotoUrl(p.file_url);
        const base64 = await fetchImageBase64(url);
        return { id: p.id, base64 };
      } catch {
        console.warn(`[WordExport] Failed to fetch photo: ${p.file_url}`);
        return { id: p.id, base64: "" };
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.base64) {
      map.set(r.value.id, r.value.base64);
    }
  }
  return map;
}

/* ─── Build full template data object ─── */
async function buildTemplateData(
  inspection: OutboundInspection,
  report: InspectionReport,
  qaSignatureBase64: string,
): Promise<Record<string, unknown>> {
  const data = report.inspection_data;
  const equipItem = inspection.equipment_items.find(e => e.id === report.equipment_item_id);
  const serialNo = safe(report.serial_numbers[report.equipment_item_id]) || safe(equipItem?.serial_no);

  // Pre-fetch all photo images
  const photoImageMap = await fetchAllPhotoImages(data.photos || []);

  const buildPhotoRows = (slotKey: string) => {
    const slotPhotos = (data.photos || []).filter(p => p.page_slot === slotKey);
    const rows: Array<{
      LEFT_IMAGE: string;
      RIGHT_IMAGE: string;
      LEFT_CAPTION: string;
      RIGHT_CAPTION: string;
    }> = [];
    for (let i = 0; i < slotPhotos.length; i += 2) {
      rows.push({
        LEFT_IMAGE: slotPhotos[i] ? (photoImageMap.get(slotPhotos[i].id) || "") : "",
        RIGHT_IMAGE: slotPhotos[i + 1] ? (photoImageMap.get(slotPhotos[i + 1].id) || "") : "",
        LEFT_CAPTION: safe(slotPhotos[i]?.caption),
        RIGHT_CAPTION: safe(slotPhotos[i + 1]?.caption),
      });
    }
    return rows;
  };

  // QA signature: only when explicitly reviewed
  const qaReviewDone = report.qa_review_status === "검토완료" && report.qa_signature_applied;

  const raw: Record<string, unknown> = {
    // ── Cover page ── (keys must match template placeholders exactly)
    INSPECTOR_NAME: safe(report.inspector_name),
    INSPECTOR_NAM: safe(report.inspector_name),
    DEPT_HEAD_NAME: safe(data.department_head),
    DEPT_HEAD_NAM: safe(data.department_head),
    QA_REVIEWER_NAME: qaReviewDone ? safe(report.qa_reviewer_name) : "",
    QA_REVIEWER_NAM: qaReviewDone ? safe(report.qa_reviewer_name) : "",

    // Image tag – base64 data for image module (empty string = no image)
    QA_SIGNATURE_IMAGE: qaReviewDone && qaSignatureBase64 ? qaSignatureBase64 : "",
    QA_SIGNATURE_IMAG: qaReviewDone && qaSignatureBase64 ? qaSignatureBase64 : "",

    CLIENT_NAME: safe(data.client_name),
    CLIENT_N: safe(data.client_name),
    SERIAL_NO: serialNo,
    SERIAL: serialNo,
    INBOUND_DATE: safe(data.inbound_date),
    REPORT_DATE: safe(report.created_date),
    MANAGEMENT_NO: safe(inspection.manage_no),

    // ── Model checkboxes (individual flags) ──
    IS_DGA_X: chk(data.model_checks.includes("DGA-X")),
    IS_DSM_XG: chk(data.model_checks.includes("DSM-XG")),
    IS_RGA_60: chk(data.model_checks.includes("RGA-60")),
    IS_RSM_61: chk(data.model_checks.includes("RSM-61")),
    IS_TGA_50: chk(data.model_checks.includes("TGA-50")),
    IS_LSM_30: chk(data.model_checks.includes("LSM-30")),
    IS_GGA_70_1: chk(data.model_checks.includes("GGA-70-1")),
    IS_PGA_91: chk(data.model_checks.includes("PGA-91")),
    IS_OTHER_MODEL: chk(false),
    OTHER_MODEL_NAME: "",

    // ── Model multiline (linebreaks: true makes \n → actual line breaks in Word) ──
    MODEL_LIST: (data.model_checks || []).map(m => `☑ ${m}`).join("\n"),

    // ── Inbound items ──
    IS_MAIN_UNIT: chk(data.inbound_items.includes("Main Unit")),
    IS_ACU: chk(data.inbound_items.includes("ACU")),
    IS_PROBE: chk(data.inbound_items.includes("Probe")),
    IS_PURGE_AIR_UNIT: chk(data.inbound_items.includes("Purge Air Unit")),
    CHECK_MAIN_UNIT: chk(data.inbound_items.includes("Main Unit")),
    CHECK_ACU: chk(data.inbound_items.includes("ACU")),
    CHECK_PROBE: chk(data.inbound_items.includes("Probe")),
    CHECK_PURGE: chk(data.inbound_items.includes("Purge Air Unit")),
    CHECK_ETC: chk(false),
    INCOMING_ETC_TEXT: "",

    // ── Inbound items multiline ──
    INBOUND_ITEMS_LIST: (data.inbound_items || []).map(i => `☑ ${i}`).join("\n"),

    // ── Inspection type ──
    IS_REGULAR_INSPECTION: chk(data.inbound_type.includes("정기 반출 점검")),
    IS_EMERGENCY_INSPECTION: chk(data.inbound_type.includes("긴급 점검")),
    IS_INCOMING_INSPECTION: chk(data.inbound_type.includes("입고 점검")),

    // ── Basic check: gas ──
    CHECK_GAS_NOX: chk(data.measure_gas.includes("NOx")),
    CHECK_GAS_NO2: chk(data.measure_gas.includes("NO2")),
    CHECK_GAS_SO2: chk(data.measure_gas.includes("SO2")),
    CHECK_GAS_NH3: chk(data.measure_gas.includes("NH3")),
    CHECK_GAS_CO: chk(data.measure_gas.includes("CO")),
    CHECK_GAS_HCL: chk(data.measure_gas.includes("HCl")),
    CHECK_GAS_O2: chk(data.measure_gas.includes("O2")),

    // ── Basic check: install type ──
    CHECK_INSTALL_BLR: chk(data.install_type.includes("BLR")),
    CHECK_INSTALL_SCR: chk(data.install_type.includes("SCR")),
    CHECK_INSTALL_ESP: chk(data.install_type.includes("ESP")),
    CHECK_INSTALL_FGD: chk(data.install_type.includes("FGD")),
    CHECK_INSTALL_TMS: chk(data.install_type.includes("TMS")),
    CHECK_INSTALL_ETC: chk(false),
    INSTALL_ETC_TEXT: "",

    // ── Section II: check item boolean flags ──
    ...buildCheckFlags(data.check_items),

    // ── Section III: replacement parts list ──
    REPLACEMENT_LIST: (data.replacement_parts || []).map(p => ({
      ITEM_NAME: safe(p.name),
      ITEM_QT: safe(p.qty),
      ITEM_STATUS: safe(p.status),
      ITEM_COMMENT: safe(p.note),
    })),

    // ── Section IV: detail text fields ──
    CPU_STATUS: safe(data.main_control_cpu),
    OPTICS_CONTAMINATION: safe(data.optics_window_lens),
    BEAMSPLITTER_CONTAMINATION: safe(data.beam_splitter_contamination),
    BEAMSPLITTER_COMMENT: safe(data.beam_splitter_result),
    SPECTROMETER_STATUS: safe(data.spectrometer_status),
    SPECTROMETER_COMMENT: safe(data.spectrometer_result),
    UVLAMP_STATUS: safe(data.uv_lamp_note),
    COOLINGFAN_STATUS: safe(data.cooling_fan_status),
    SMPS_STATUS: safe(data.smps_note),
    WIRING_STATUS: safe(data.wiring_status),

    // ── Probe detail ──
    PROBE_APPEARANCE_DETAIL: safe(data.probe_exterior),
    PROBE_TEMPSENSOR_DETAIL: safe(data.probe_temp_sensor),
    PROBE_CORNERMIRROR_DETAIL: safe(data.probe_corner_mirror),
    PROBE_LENGTH_DETAIL: safe(data.probe_length),
    PROBE_MEASURE_SECTION_DETAIL: safe(data.probe_measure_section),
    GAS_DIRECTION_DETAIL: safe(data.probe_gas_direction),

    // ── Summary ──
    SUMMARY_FIRST_INSPECTION: safe(data.summary_items?.[0]),
    SUMMARY_SPECTROMETER_ALIGNMENT: safe(data.summary_items?.[1]),
    SUMMARY_PROBE_ALIGNMENT: safe(data.summary_items?.[2]),
    SUMMARY_STANDARD_GAS_CALIBRATION: safe(data.summary_items?.[3]),

    // ── Photo rows (images + captions) ──
    REPLACEMENT_PHOTO_ROWS: buildPhotoRows("replacement_parts"),
    OPTICAL_PHOTOS_ROWS: buildPhotoRows("body_optics"),
    ELECTRICAL_PHOTOS_ROWS: buildPhotoRows("cpu_smps"),
    PROBE_PHOTOS_ROWS: buildPhotoRows("ao_probe"),
    OTHER_PHOTOS_ROWS: buildPhotoRows("spectrometer"),

    LEFT_IMAGE: "",
    RIGHT_IMAGE: "",
    LEFT_CAPTION: "",
    RIGHT_CAPTION: "",
  };

  // Dev-mode safety log: show critical keys and detect undefined
  if (import.meta.env.DEV) {
    console.log("[WordExport] exportContext critical keys:", {
      INSPECTOR_NAME: raw.INSPECTOR_NAME,
      DEPT_HEAD_NAME: raw.DEPT_HEAD_NAME,
      QA_REVIEWER_NAME: raw.QA_REVIEWER_NAME,
      QA_SIGNATURE_IMAGE: raw.QA_SIGNATURE_IMAGE ? "(base64 present)" : "(empty)",
    });
    const undefinedKeys = Object.entries(raw).filter(([, v]) => v === undefined || v === null).map(([k]) => k);
    if (undefinedKeys.length > 0) {
      console.warn("[WordExport] undefined keys detected before sanitize:", undefinedKeys);
    }
  }

  return sanitizeExportContext(raw);
}

/* ─── Export function ─── */
export async function exportReportToWord(
  inspection: OutboundInspection,
  report: InspectionReport,
  reportTitle: string,
) {
  const templateUrl = report.report_type === "final" ? FINAL_TEMPLATE_URL : FIRST_TEMPLATE_URL;

  // Fetch template and QA signature image in parallel
  const qaNeeded = report.qa_review_status === "검토완료" && report.qa_signature_applied;
  const [templateResponse, qaSignatureBase64] = await Promise.all([
    fetch(templateUrl),
    qaNeeded ? fetchImageBase64(QA_SIGNATURE_IMAGE_URL) : Promise.resolve(""),
  ]);

  if (!templateResponse.ok) throw new Error("Template file not found");
  const templateBuffer = await templateResponse.arrayBuffer();

  const zip = new PizZip(templateBuffer);

  // Rewrite image tags in XML before docxtemplater processes them (BOTH report types)
  rewriteImageTags(zip);

  // Configure image module
  const imageModule = new ImageModule({
    centered: false,
    getImage: (tagValue: string) => {
      if (!tagValue) return new Uint8Array(0).buffer;
      // tagValue is base64 string
      const binary = atob(tagValue);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    },
    getSize: (tagValue: string, tagName: string) => {
      // QA signature: small size to fit table cell
      if (tagName && (tagName.includes("QA_SIGNATURE") || tagName.includes("SIGNATURE"))) {
        return [80, 40];
      }
      // Photo images: larger size to fill photo cells
      return [200, 150];
    },
  });

  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule],
  });

  const templateData = await buildTemplateData(inspection, report, qaSignatureBase64);
  doc.render(templateData);

  // Post-process: center-align name cells
  const outputZip = doc.getZip();
  postProcessNameAlignment(outputZip);

  // Post-process: embed QA signature image if image module didn't handle it
  if (qaNeeded && qaSignatureBase64) {
    postProcessQASignatureImage(outputZip, qaSignatureBase64);
  }

  const blob = outputZip.generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const fileName = `${safe(reportTitle)}_${safe(inspection.manage_no)}_${safe(report.created_date)}.docx`;
  saveAs(blob, fileName);
}
