/**
 * Gas data extraction from text-based PDFs and XLSX files.
 * NO OCR — only works with selectable/searchable text PDFs and Excel sheets.
 */
import * as XLSX from "xlsx";

export interface ExtractedGasData {
  site_name: string;
  unit_no: string;
  items: { gas_name: string; remaining_percent: string; expiry_date: string }[];
}

/* ── PDF text extraction using pdfjs-dist ── */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n");
}

/** Check if a PDF has selectable text (not a scanned image-only PDF) */
export async function isPdfTextBased(file: File): Promise<boolean> {
  try {
    const text = await extractTextFromPdf(file);
    // If we got fewer than 20 meaningful characters, it's likely scanned
    const meaningful = text.replace(/\s+/g, "").length;
    return meaningful >= 20;
  } catch {
    return false;
  }
}

/* ── XLSX extraction ── */
export function extractTextFromXlsx(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const allText: string[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          // Convert to array of arrays for easier parsing
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          for (const row of rows) {
            allText.push(row.map((c: any) => String(c ?? "")).join("\t"));
          }
        }
        resolve(allText.join("\n"));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/* ── Parse extracted text to find gas data ── */
export function parseGasData(rawText: string): ExtractedGasData {
  const text = rawText;

  // 1) Detect site name — extract ONLY the actual site name value
  let site_name = "";
  // Try patterns like "사업장명: XXX" or "사업장 : XXX"
  const sitePatterns = [
    /사업장\s*[명:]?\s*[:：]?\s*([^\n\t,]+)/i,
    /업\s*체\s*명\s*[:：]?\s*([^\n\t,]+)/i,
    /현\s*장\s*명\s*[:：]?\s*([^\n\t,]+)/i,
    /고\s*객\s*명\s*[:：]?\s*([^\n\t,]+)/i,
  ];
  for (const p of sitePatterns) {
    const m = text.match(p);
    if (m) {
      site_name = m[1].trim();
      break;
    }
  }

  // Clean up site name: remove trailing field labels and unrelated content
  // Stop at common boundary keywords that indicate the next field
  if (site_name) {
    const boundaryKeywords = [
      "대상", "호기", "일자", "시간", "구분", "점검자", "담당",
      "일시", "장비", "모델", "시리얼", "Serial", "Model",
      "점검", "검사", "기간", "결과", "비고", "확인",
    ];
    // Cut at the first boundary keyword
    for (const kw of boundaryKeywords) {
      const idx = site_name.indexOf(kw);
      if (idx > 0) {
        site_name = site_name.substring(0, idx).trim();
      }
    }
    // Also remove trailing whitespace tokens that look like field values
    // e.g. "어프로티움 3공장 1호기(In-situ)" → "어프로티움 3공장"
    site_name = site_name
      .replace(/\s+\d+호기.*$/i, "")
      .replace(/\s+\d{4}년.*$/i, "")
      .replace(/\s+\d{4}[-./]\d{1,2}[-./]\d{1,2}.*$/i, "")
      .trim();
  }

  // 2) Detect unit number (호기)
  let unit_no = "";
  const unitPatterns = [
    /(\d+)\s*호기/,
    /호\s*기\s*[:：]?\s*([^\n\t,]+)/i,
    /Unit\s*(?:No\.?)?\s*[:：]?\s*([^\n\t,]+)/i,
  ];
  for (const p of unitPatterns) {
    const m = text.match(p);
    if (m) {
      unit_no = m[1].trim();
      break;
    }
  }

  // 3) Extract gas data ONLY from the "6. Zero Span Test" table section.
  //    Crop text to section 6 boundary to prevent contamination from section 7.
  const items: { gas_name: string; remaining_percent: string; expiry_date: string }[] = [];

  // Isolate section 6 text: start at "Zero Span" heading, end before section 7 or similar
  const sectionStartMatch = text.match(/6\.\s*Zero\s*Span\s*Test|Zero\s*Span\s*Test/i);
  const sectionStartIdx = sectionStartMatch ? text.indexOf(sectionStartMatch[0]) : -1;

  // End boundaries: section 7, 특이사항, 자재교체, or end of text
  const endPatterns = [/7\.\s*특이사항/, /특이사항/, /자재교체/, /작업\s*내용/];
  let sectionEndIdx = text.length;
  if (sectionStartIdx >= 0) {
    for (const ep of endPatterns) {
      const em = text.substring(sectionStartIdx + 10).match(ep);
      if (em) {
        const candidate = sectionStartIdx + 10 + text.substring(sectionStartIdx + 10).indexOf(em[0]);
        if (candidate < sectionEndIdx) sectionEndIdx = candidate;
      }
    }
  }

  const sectionText = sectionStartIdx >= 0
    ? text.substring(sectionStartIdx, sectionEndIdx)
    : text;

  const lines = sectionText.split("\n");

  // Find line indices for key rows within section 6 only
  let calibrationLineIdx = -1;
  let remainingLineIdx = -1;
  let expiryLineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (calibrationLineIdx < 0 && /calibration/i.test(lines[i])) {
      calibrationLineIdx = i;
    }
    if (remainingLineIdx < 0 && /표준가스잔량/.test(lines[i])) {
      remainingLineIdx = i;
    }
    if (expiryLineIdx < 0 && /유효기간/.test(lines[i])) {
      if (calibrationLineIdx >= 0) {
        expiryLineIdx = i;
      }
    }
  }

  // If we didn't find expiry after calibration, search from the start of section
  if (expiryLineIdx < 0) {
    for (let i = 0; i < lines.length; i++) {
      if (/유효기간/.test(lines[i])) {
        expiryLineIdx = i;
        break;
      }
    }
  }

  // Helper: split a line into cells (tab-delimited or multi-space)
  const splitCells = (line: string): string[] => {
    if (line.includes("\t")) {
      return line.split("\t").map((c) => c.trim());
    }
    // For PDF text (space-separated), split on 2+ spaces
    return line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
  };

  // Known gas identifiers — must be standalone gas formula + Zero/Span context
  const gasIdentifiers = /\b(N2|NO|NO2|SO2|CO|CO2|O2|HCl|NH3|H2S|CH4|THC)\s+(Zero|Span)\b/i;
  // Also match standalone gas symbols in Calibration row cells
  const gasSymbolOnly = /^(N2|NO|NO2|SO2|CO|CO2|O2|HCl|NH3|H2S|CH4|THC)\s*(Zero|Span)$/i;

  /** Normalize 2-digit year dates: 26.06.25 → 2026-06-25 */
  const normalizeDateStr = (raw: string): string => {
    const m = raw.match(/^(\d{2})[-./](\d{1,2})[-./](\d{1,2})$/);
    if (m) {
      const yr = parseInt(m[1], 10);
      const fullYear = yr >= 50 ? 1900 + yr : 2000 + yr;
      return `${fullYear}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    }
    // Already 4-digit year
    const m4 = raw.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
    if (m4) {
      return `${m4[1]}-${m4[2].padStart(2, "0")}-${m4[3].padStart(2, "0")}`;
    }
    return raw;
  };

  if (calibrationLineIdx >= 0) {
    const calibCells = splitCells(lines[calibrationLineIdx]);
    const remainCells = remainingLineIdx >= 0 ? splitCells(lines[remainingLineIdx]) : [];
    const expiryCells = expiryLineIdx >= 0 ? splitCells(lines[expiryLineIdx]) : [];

    // Find columns in calibration row that contain gas names (e.g. "N2 Zero", "NO Span")
    for (let col = 0; col < calibCells.length; col++) {
      const cell = calibCells[col];
      if (!gasIdentifiers.test(cell) && !gasSymbolOnly.test(cell)) continue;

      const gasName = cell.trim();

      // Get corresponding remaining % value
      let remaining = "";
      if (col < remainCells.length) {
        const rv = remainCells[col];
        const pctMatch = rv.match(/(\d+(?:\.\d+)?)\s*%?/);
        if (pctMatch) {
          remaining = `${pctMatch[1]}%`;
        } else if (rv && rv !== "표준가스잔량") {
          remaining = rv;
        }
      }

      // Get corresponding expiry date value
      let expiry = "";
      if (col < expiryCells.length) {
        const ev = expiryCells[col];
        const dateMatch = ev.match(/(\d{2,4}[-./]\d{1,2}[-./]\d{1,2})/);
        if (dateMatch) {
          expiry = normalizeDateStr(dateMatch[1].replace(/\./g, "-").replace(/\//g, "-"));
        } else if (/n\/?a/i.test(ev)) {
          expiry = "N/A";
        } else if (ev && ev !== "유효기간") {
          expiry = ev;
        }
      }

      items.push({ gas_name: gasName, remaining_percent: remaining, expiry_date: expiry });
    }
  }

  return { site_name, unit_no, items };
}

/** Full extraction pipeline for a single file */
export async function extractGasDataFromFile(file: File): Promise<ExtractedGasData> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  let rawText: string;
  if (ext === "pdf") {
    rawText = await extractTextFromPdf(file);
  } else if (ext === "xlsx") {
    rawText = await extractTextFromXlsx(file);
  } else {
    throw new Error("지원하지 않는 파일 형식입니다.");
  }

  return parseGasData(rawText);
}
