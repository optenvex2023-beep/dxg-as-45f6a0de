import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { saveAs } from "file-saver";
import type { OutboundInspection, InspectionReport, InspectionCheckItem } from "@/types";
import { resolvePhotoUrl } from "@/lib/reportPhotoStorage";

const FIRST_TEMPLATE_URL = "/templates/first-report-template.docx";
const FINAL_TEMPLATE_URL = "/templates/final-report-template.docx";
const QA_SIGNATURE_IMAGE_URL = "/images/qa-signature.png";
const MFG_SIGNATURE_IMAGE_URL = "/images/manufacturing-signature.jpg";
const SIGNATURE_IMAGE_EMU = { width: 650000, height: 450000 };
const SIGNATURE_IMAGE_SIZE_PX: [number, number] = [68, 47];

/** Safely return a string – never "undefined" or "null" */
function safe(val: unknown): string {
  if (val === undefined || val === null) return "";
  const s = String(val);
  return s === "undefined" || s === "null" ? "" : s;
}

/** Boolean flag for conditional sections in docxtemplater */
function chk(val: boolean): boolean {
  return val;
}

/* ─── Fetch image as base64 (with EXIF orientation applied) ─── */
async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(binary);
}

async function normalizeImageOrientation(blob: Blob): Promise<string> {
  // Use createImageBitmap to honor EXIF orientation, then re-encode via canvas.
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" } as any);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no ctx");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return dataUrl.split(",")[1] || "";
  } catch {
    // Fallback: return original bytes as base64
    const buf = await blob.arrayBuffer();
    return arrayBufferToBase64(buf);
  }
}

async function fetchImageBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) return "";
  const blob = await res.blob();
  return normalizeImageOrientation(blob);
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
  // MFG signature tags
  content = content.replace(/\{\{MFG_SIGNATURE_IMAGE\}\}/g, "{{%MFG_SIGNATURE_IMAGE}}");
  content = content.replace(/\{\{MFG_SIGNATURE\}\}/g, "{{%MFG_SIGNATURE}}");
  // Photo image tags (inside loops and top-level)
  content = content.replace(/\{\{LEFT_IMAGE\}\}/g, "{{%LEFT_IMAGE}}");
  content = content.replace(/\{\{RIGHT_IMAGE\}\}/g, "{{%RIGHT_IMAGE}}");
  zip.file("word/document.xml", content);
}

function ensureContentType(zip: PizZip, extension: string, contentType: string) {
  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) return;

  let content = contentTypesFile.asText();
  const hasDefault = content.includes(`Extension="${extension}"`) && content.includes(`ContentType="${contentType}"`);
  if (hasDefault) return;

  content = content.replace(
    "</Types>",
    `<Default Extension="${extension}" ContentType="${contentType}"/></Types>`
  );
  zip.file("[Content_Types].xml", content);
}

function ensureImageContentTypes(zip: PizZip) {
  ensureContentType(zip, "png", "image/png");
  ensureContentType(zip, "jpg", "image/jpeg");
  ensureContentType(zip, "jpeg", "image/jpeg");
}

function getApprovalTableParts(content: string) {
  const tables = content.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/g) || [];

  for (const table of tables) {
    if (!table.includes("점검자") || !table.includes("부서장")) continue;

    const rows = table.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || [];
    if (rows.length < 2) continue;

    const valueRow = rows[1];
    const cells = valueRow.match(/<w:tc\b[\s\S]*?<\/w:tc>/g) || [];
    if (cells.length < 4) continue;

    return { table, valueRow, cells };
  }

  return null;
}

function replaceTableCellContent(cellXml: string, innerXml: string) {
  if (cellXml.includes("</w:tcPr>")) {
    return cellXml.replace(/(<w:tc\b[\s\S]*?<\/w:tcPr>)[\s\S]*?(<\/w:tc>)/, `$1${innerXml}$2`);
  }

  return cellXml.replace(/(<w:tc\b[^>]*>)[\s\S]*?(<\/w:tc>)/, `$1${innerXml}$2`);
}

function buildCenteredImageParagraph(imageRunXml: string) {
  return `<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:textAlignment w:val="baseline"/></w:pPr>${imageRunXml}</w:p>`;
}

type ApprovalSignatureImageOptions = {
  cellIndex: number;
  docPrId: number;
  fileName: string;
  label: string;
  relationId: string;
  signatureBase64: string;
};

function writeBase64MediaFile(zip: PizZip, fileName: string, signatureBase64: string) {
  const binary = atob(signatureBase64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  zip.file(`word/media/${fileName}`, bytes);
}

function ensureDocumentImageRelationship(zip: PizZip, relationId: string, fileName: string) {
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!relsFile) return;

  let relsContent = relsFile.asText();
  if (relsContent.includes(`Id="${relationId}"`)) return;

  relsContent = relsContent.replace(
    "</Relationships>",
    `<Relationship Id="${relationId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${fileName}"/></Relationships>`
  );

  zip.file("word/_rels/document.xml.rels", relsContent);
}

function buildSignatureImageRunXml(relationId: string, docPrId: number, label: string, fileName: string) {
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${SIGNATURE_IMAGE_EMU.width}" cy="${SIGNATURE_IMAGE_EMU.height}"/><wp:docPr id="${docPrId}" name="${label}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${docPrId}" name="${fileName}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relationId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${SIGNATURE_IMAGE_EMU.width}" cy="${SIGNATURE_IMAGE_EMU.height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

function embedApprovalSignatureImage(zip: PizZip, options: ApprovalSignatureImageOptions) {
  const { cellIndex, docPrId, fileName, label, relationId, signatureBase64 } = options;
  if (!signatureBase64) return;

  ensureImageContentTypes(zip);
  writeBase64MediaFile(zip, fileName, signatureBase64);
  ensureDocumentImageRelationship(zip, relationId, fileName);

  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;

  const content = contentFile.asText();
  const imageRunXml = buildSignatureImageRunXml(relationId, docPrId, label, fileName);
  const updatedContent = replaceApprovalValueCell(content, cellIndex, buildCenteredImageParagraph(imageRunXml));

  if (updatedContent !== content) {
    zip.file("word/document.xml", updatedContent);
  }
}

function replaceApprovalValueCell(content: string, cellIndex: number, innerXml: string) {
  const tableParts = getApprovalTableParts(content);
  if (!tableParts || !tableParts.cells[cellIndex]) return content;

  const originalCell = tableParts.cells[cellIndex];
  const updatedCell = replaceTableCellContent(originalCell, innerXml);
  const updatedRow = tableParts.valueRow.replace(originalCell, updatedCell);
  const updatedTable = tableParts.table.replace(tableParts.valueRow, updatedRow);

  return content.replace(tableParts.table, updatedTable);
}

/* ─── Post-process: center-align name cells in the exported document ─── */
function postProcessNameAlignment(zip: PizZip) {
  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;
  let content = contentFile.asText();

  // Strategy: find the signature table (contains 점검자), then center-align
  // ALL paragraphs in the row below the header row (the value row).
  // The signature table has 2 rows: [점검자 | 부서장 | 품질본부 확인 | 품질 서명] header,
  // then a value row with names/signatures.

  // Find the table containing "점검자" - this is the signature table
  const tables = content.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g) || [];
  for (const table of tables) {
    if (!table.includes("점검자")) continue;

    // Get all rows in this table
    const rows = table.match(/<w:tr>[\s\S]*?<\/w:tr>/g) || [];
    if (rows.length < 2) continue;

    // The second row contains the name/signature values
    const valueRow = rows[1];
    let newValueRow = valueRow;

    // For each paragraph in this row, ensure center alignment
    newValueRow = newValueRow.replace(/<w:p>([\s\S]*?)<\/w:p>/g, (pMatch, pContent) => {
      if (pContent.includes("<w:pPr>")) {
        // Has pPr - add or replace w:jc
        if (pContent.includes("<w:jc")) {
          pContent = pContent.replace(/<w:jc\s+w:val="[^"]*"\s*\/?>/g, '<w:jc w:val="center"/>');
        } else {
          pContent = pContent.replace(/<\/w:pPr>/, '<w:jc w:val="center"/></w:pPr>');
        }
      } else {
        // No pPr - add one with center alignment
        pContent = '<w:pPr><w:jc w:val="center"/></w:pPr>' + pContent;
      }
      return `<w:p>${pContent}</w:p>`;
    });

    // Also ensure vertical alignment (middle) for each cell in the value row
    newValueRow = newValueRow.replace(/<w:tcPr>([\s\S]*?)<\/w:tcPr>/g, (tcMatch, tcContent) => {
      if (tcContent.includes("<w:vAlign")) {
        tcContent = tcContent.replace(/<w:vAlign\s+w:val="[^"]*"\s*\/?>/g, '<w:vAlign w:val="center"/>');
      } else {
        tcContent += '<w:vAlign w:val="center"/>';
      }
      return `<w:tcPr>${tcContent}</w:tcPr>`;
    });

    content = content.replace(valueRow, newValueRow);
    break;
  }

  zip.file("word/document.xml", content);
}

/* ─── Post-process: add spacing between signature table and Client table ─── */
function postProcessSignatureClientSpacing(zip: PizZip) {
  const contentFile = zip.file("word/document.xml");
  if (!contentFile) return;
  let content = contentFile.asText();

  // Find the signature table (contains 점검자 and 부서장) end tag, then add empty paragraphs
  // Look for the closing </w:tbl> after 부서장 content, then add spacing paragraphs before the next table
  const sigTableEnd = /(<\/w:tbl>)(\s*<w:p[ >])/;
  const match = content.match(sigTableEnd);
  if (match) {
    // Add 2 empty paragraphs with minimal spacing for a compact gap
    const spacingParas = Array(2).fill(
      '<w:p><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/></w:pPr></w:p>'
    ).join("");
    content = content.replace(sigTableEnd, `$1${spacingParas}$2`);
    zip.file("word/document.xml", content);
  }
}

/* ─── Post-process: embed QA signature image directly into XML ─── */
function postProcessQASignatureImage(zip: PizZip, signatureBase64: string) {
  embedApprovalSignatureImage(zip, {
    cellIndex: 3,
    docPrId: 99,
    fileName: "qa_signature.png",
    label: "QA Signature",
    relationId: "rIdQASig",
    signatureBase64,
  });
}

/* ─── Post-process: embed MFG (부서장) signature image directly into XML ─── */
function postProcessMfgSignatureImage(zip: PizZip, signatureBase64: string) {
  embedApprovalSignatureImage(zip, {
    cellIndex: 1,
    docPrId: 98,
    fileName: "mfg_signature.jpg",
    label: "MFG Signature",
    relationId: "rIdMfgSig",
    signatureBase64,
  });
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

/** Fixed model list for template checkboxes */
const FIXED_MODELS = ["DGA-X", "DSM-XG", "RGA-60", "RSM-61", "TGA-50", "LSM-30", "GGA-70-1", "PGA-91"];

function buildModelFlags(selectedModels: string[]): Record<string, unknown> {
  const flags: Record<string, unknown> = {
    IS_DGA_X: chk(selectedModels.includes("DGA-X")),
    IS_DSM_XG: chk(selectedModels.includes("DSM-XG")),
    IS_RGA_60: chk(selectedModels.includes("RGA-60")),
    IS_RSM_61: chk(selectedModels.includes("RSM-61")),
    IS_TGA_50: chk(selectedModels.includes("TGA-50")),
    IS_LSM_30: chk(selectedModels.includes("LSM-30")),
    IS_GGA_70_1: chk(selectedModels.includes("GGA-70-1")),
    IS_PGA_91: chk(selectedModels.includes("PGA-91")),
  };
  // 기타: any selected model NOT in the fixed 8
  const otherModels = selectedModels.filter(m => !FIXED_MODELS.includes(m));
  flags.IS_OTHER_MODEL = chk(otherModels.length > 0);
  flags.OTHER_MODEL_NAME = otherModels.length > 0 ? otherModels.join(", ") : "";
  flags.MODEL_LIST = "";
  return flags;
}

function buildCheckFlags(items: InspectionCheckItem[]): Record<string, unknown> {
  const flags: Record<string, unknown> = {};
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
/** Safely coerce a JSON value to string[] */
function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter(v => typeof v === "string");
  return [];
}

async function buildTemplateData(
  inspection: OutboundInspection,
  report: InspectionReport,
  qaSignatureBase64: string,
  mfgSignatureBase64: string,
): Promise<Record<string, unknown>> {
  const data = report.inspection_data;
  const equipItem = inspection.equipment_items.find(e => e.id === report.equipment_item_id);
  const serialNo = safe(report.serial_numbers[report.equipment_item_id]) || safe(equipItem?.serial_no);

  // Safely extract arrays from JSON data
  const selectedModels = toStringArray(data.model_checks);
  const selectedInboundItems = toStringArray(data.inbound_items);
  const selectedInboundType = toStringArray(data.inbound_type);
  const selectedVoltageMain = toStringArray(data.voltage_main);
  const selectedVoltagePurge = toStringArray(data.voltage_purge);
  const selectedMeasureGas = toStringArray(data.measure_gas);
  const selectedInstallType = toStringArray(data.install_type);

  console.log("[WordExport] selectedModels:", selectedModels);
  console.log("[WordExport] selectedInboundItems:", selectedInboundItems);
  console.log("[WordExport] selectedVoltageMain:", selectedVoltageMain);
  console.log("[WordExport] selectedVoltagePurge:", selectedVoltagePurge);
  console.log("[WordExport] selectedMeasureGas:", selectedMeasureGas);
  console.log("[WordExport] selectedInstallType:", selectedInstallType);

  // Pre-fetch all photo images
  const photoImageMap = await fetchAllPhotoImages(data.photos || []);

  const extraSlotTitleByKey: Record<string, string> = {};
  for (const s of (data.photo_extra_slots || [])) extraSlotTitleByKey[s.key] = s.title || "";
  const extraSlotKeys = new Set(Object.keys(extraSlotTitleByKey));

  const buildPhotoRows = (slotKey: string, includeUserAddedSlots = false) => {
    let slotPhotos = (data.photos || []).filter(p => p.page_slot === slotKey);
    if (includeUserAddedSlots) {
      // Photos from user-added extra photo slots are appended here so they are
      // not lost in Word (template has a fixed number of slots).
      for (const p of (data.photos || [])) {
        if (!extraSlotKeys.has(p.page_slot)) continue;
        const title = extraSlotTitleByKey[p.page_slot] || "";
        slotPhotos = slotPhotos.concat({
          ...p,
          caption: title ? `[${title}] ${safe(p.caption)}`.trim() : safe(p.caption),
        });
      }
    }
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

  // Fold user-added extra rows/summary items back into existing template fields
  // (template has fixed slots, so we append as extra lines to preserve content).
  const mergeExtras = (base: string, extras: Array<{ label?: string; value?: string }> | undefined): string => {
    const list = (extras || []).filter(e => (e?.label || "").trim() || (e?.value || "").trim());
    if (!list.length) return base;
    const lines = list.map(e => {
      const lbl = (e.label || "").trim();
      const val = (e.value || "").trim();
      return lbl ? `[${lbl}] ${val}` : val;
    });
    return [base, ...lines].filter(Boolean).join("\n");
  };

  const extraSummaryPairs: Array<{ label: string; value: string }> = [];
  const totalSummary = Math.max(
    (data.summary_labels?.length || 0),
    (data.summary_items?.length || 0),
  );
  for (let i = 4; i < totalSummary; i++) {
    extraSummaryPairs.push({
      label: safe(data.summary_labels?.[i]),
      value: safe(data.summary_items?.[i]),
    });
  }

  // QA signature: only when explicitly reviewed
  const qaReviewDone = report.qa_review_status === "검토완료" && report.qa_signature_applied;

  // Build model flags with debug
  const modelFlags = buildModelFlags(selectedModels);
  console.log("[WordExport] modelFlags:", modelFlags);

  // Build inbound item flags with debug
  const inboundFlags: Record<string, unknown> = {
    IS_MAIN_UNIT: chk(selectedInboundItems.includes("Main Unit")),
    IS_ACU: chk(selectedInboundItems.includes("ACU")),
    IS_PROBE: chk(selectedInboundItems.includes("Probe")),
    IS_PURGE_AIR_UNIT: chk(selectedInboundItems.includes("Purge Air Unit")),
    IS_OTHER_UNIT: chk(selectedInboundItems.includes("기타")),
    CHECK_MAIN_UNIT: chk(selectedInboundItems.includes("Main Unit")),
    CHECK_ACU: chk(selectedInboundItems.includes("ACU")),
    CHECK_PROBE: chk(selectedInboundItems.includes("Probe")),
    CHECK_PURGE: chk(selectedInboundItems.includes("Purge Air Unit")),
    CHECK_ETC: chk(selectedInboundItems.includes("기타")),
    INCOMING_ETC_TEXT: "",
  };
  console.log("[WordExport] inboundFlags:", inboundFlags);

  // When manufacturing review is completed, 부서장 cell shows ONLY the signature image (no name text)
  const mfgReviewDone = report.manufacturing_review_completed === true;
  const deptHeadNameValue = mfgReviewDone ? "" : safe(data.department_head);

  const raw: Record<string, unknown> = {
    // ── Cover page ──
    INSPECTOR_NAME: safe(report.inspector_name),
    INSPECTOR_NAM: safe(report.inspector_name),
    DEPT_HEAD_NAME: deptHeadNameValue,
    DEPT_HEAD_NAM: deptHeadNameValue,
    QA_REVIEWER_NAME: qaReviewDone ? safe(report.qa_reviewer_name) : "",
    QA_REVIEWER_NAM: qaReviewDone ? safe(report.qa_reviewer_name) : "",

    QA_SIGNATURE_IMAGE: qaReviewDone && qaSignatureBase64 ? qaSignatureBase64 : "",
    QA_SIGNATURE_IMAG: qaReviewDone && qaSignatureBase64 ? qaSignatureBase64 : "",

    // Manufacturing (부서장) signature - image only, no text
    MFG_SIGNATURE_IMAGE: mfgReviewDone && mfgSignatureBase64 ? mfgSignatureBase64 : "",
    MFG_SIGNATURE: mfgReviewDone && mfgSignatureBase64 ? mfgSignatureBase64 : "",

    CLIENT_NAME: safe(data.client_name),
    CLIENT_N: safe(data.client_name),
    SERIAL_NO: serialNo,
    SERIAL: serialNo,
    INBOUND_DATE: safe(data.inbound_date),
    REPORT_DATE: safe(report.created_date),
    MANAGEMENT_NO: safe(inspection.manage_no),

    // ── Model checkboxes (fixed 8 models + 기타) ──
    ...modelFlags,

    // ── Inbound items ──
    ...inboundFlags,

    // ── Inbound items multiline ──
    INBOUND_ITEMS_LIST: selectedInboundItems.map(i => `☑ ${i}`).join("\n"),

    // ── Inspection type ──
    IS_REGULAR_INSPECTION: chk(selectedInboundType.includes("정기 반출 점검")),
    IS_EMERGENCY_INSPECTION: chk(selectedInboundType.includes("긴급 점검")),
    IS_INCOMING_INSPECTION: chk(selectedInboundType.includes("입고 점검")),

    // ── Voltage ──
    CHECK_MAIN_110V: chk(selectedVoltageMain.includes("110V")),
    CHECK_MAIN_220V: chk(selectedVoltageMain.includes("220V")),
    CHECK_PURGE_220V: chk(selectedVoltagePurge.includes("220V")),
    CHECK_PURGE_380_480V: chk(selectedVoltagePurge.includes("380-480V")),

    // ── Basic check: gas ──
    CHECK_GAS_NOX: chk(selectedMeasureGas.includes("NOx")),
    CHECK_GAS_NO2: chk(selectedMeasureGas.includes("NO2")),
    CHECK_GAS_SO2: chk(selectedMeasureGas.includes("SO2")),
    CHECK_GAS_NH3: chk(selectedMeasureGas.includes("NH3")),
    CHECK_GAS_CO: chk(selectedMeasureGas.includes("CO")),
    CHECK_GAS_HCL: chk(selectedMeasureGas.includes("HCl")),
    CHECK_GAS_O2: chk(selectedMeasureGas.includes("O2")),
    CHECK_GAS_FLOW: chk(selectedMeasureGas.includes("Flow")),
    CHECK_GAS_ETC: chk(false),
    GAS_ETC_TEXT: "",

    // ── Basic check: install type ──
    CHECK_INSTALL_BLR: chk(selectedInstallType.includes("BLR")),
    CHECK_INSTALL_SCR: chk(selectedInstallType.includes("SCR")),
    CHECK_INSTALL_ESP: chk(selectedInstallType.includes("ESP")),
    CHECK_INSTALL_FGD: chk(selectedInstallType.includes("FGD")),
    CHECK_INSTALL_TMS: chk(selectedInstallType.includes("TMS")),
    CHECK_INSTALL_ETC: chk(false),
    INSTALL_ETC_TEXT: "",

    // ── Section II: check item boolean flags ──
    ...buildCheckFlags(data.check_items),

    // ── Section III: replacement parts list ──
    REPLACEMENT_LIST: (data.replacement_parts || []).map(p => ({
      ITEM_NAME: safe(p.name),
      ITEM_QT: safe(p.qty),
      ITEM_QTY: safe(p.qty),
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
    WIRING_STATUS: mergeExtras(safe(data.wiring_status), data.detail_extra_rows),

    // ── Probe detail ──
    PROBE_APPEARANCE_DETAIL: safe(data.probe_exterior),
    PROBE_TEMPSENSOR_DETAIL: safe(data.probe_temp_sensor),
    PROBE_CORNERMIRROR_DETAIL: safe(data.probe_corner_mirror),
    PROBE_LENGTH_DETAIL: safe(data.probe_length),
    PROBE_MEASURE_SECTION_DETAIL: safe(data.probe_measure_section),
    GAS_DIRECTION_DETAIL: mergeExtras(safe(data.probe_gas_direction), data.probe_extra_rows),

    // ── Summary ──
    SUMMARY_FIRST_INSPECTION: safe(data.summary_items?.[0]),
    SUMMARY_SPECTROMETER_ALIGNMENT: safe(data.summary_items?.[1]),
    SUMMARY_PROBE_ALIGNMENT: safe(data.summary_items?.[2]),
    SUMMARY_STANDARD_GAS_CALIBRATION: mergeExtras(safe(data.summary_items?.[3]), extraSummaryPairs),

    // ── Photo rows (images + captions) ──
    REPLACEMENT_PHOTO_ROWS: buildPhotoRows("replacement_parts"),
    OPTICAL_PHOTOS_ROWS: buildPhotoRows("body_optics"),
    ELECTRICAL_PHOTOS_ROWS: buildPhotoRows("cpu_smps"),
    PROBE_PHOTOS_ROWS: buildPhotoRows("ao_probe"),
    OTHER_PHOTOS_ROWS: buildPhotoRows("spectrometer", true),

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

  // Fetch template and signature images in parallel
  const qaNeeded = report.qa_review_status === "검토완료" && report.qa_signature_applied;
  const mfgNeeded = report.manufacturing_review_completed === true;
  const [templateResponse, qaSignatureBase64, mfgSignatureBase64] = await Promise.all([
    fetch(templateUrl),
    qaNeeded ? fetchImageBase64(QA_SIGNATURE_IMAGE_URL) : Promise.resolve(""),
    mfgNeeded ? fetchImageBase64(MFG_SIGNATURE_IMAGE_URL) : Promise.resolve(""),
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
      // QA/MFG signature: ~1.98cm x 1.49cm ≈ 75px x 56px
      if (tagName && (tagName.includes("SIGNATURE") || tagName.includes("MFG_SIGNATURE"))) {
        return SIGNATURE_IMAGE_SIZE_PX;
      }
      // Photo images: enlarged to fill photo cells with minimal padding
      // Aspect ratio (4:3) preserved; Word will scale within the cell.
      return [280, 210];
    },
  });

  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule],
  });

  const templateData = await buildTemplateData(inspection, report, qaSignatureBase64, mfgSignatureBase64);
  doc.render(templateData);

  // Post-process: center-align name cells
  const outputZip = doc.getZip();
  ensureImageContentTypes(outputZip);

  // Post-process: center-align name cells
  postProcessNameAlignment(outputZip);

  // Post-process: add spacing between signature table and Client table
  postProcessSignatureClientSpacing(outputZip);

  // Post-process: embed QA signature image if image module didn't handle it
  if (qaNeeded && qaSignatureBase64) {
    postProcessQASignatureImage(outputZip, qaSignatureBase64);
  }

  // Post-process: embed MFG signature image in 부서장 cell
  if (mfgNeeded && mfgSignatureBase64) {
    postProcessMfgSignatureImage(outputZip, mfgSignatureBase64);
  }

  const blob = outputZip.generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const fileName = `${safe(reportTitle)}_${safe(inspection.manage_no)}_${safe(report.created_date)}.docx`;
  saveAs(blob, fileName);
}
