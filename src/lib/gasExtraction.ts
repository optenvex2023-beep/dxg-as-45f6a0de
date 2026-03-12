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

type ExtractedGasItem = ExtractedGasData["items"][number];

type PdfToken = {
  text: string;
  x: number;
  y: number;
  width: number;
  page: number;
};

type PdfRow = {
  page: number;
  y: number;
  text: string;
  tokens: PdfToken[];
};

type PdfColumn = {
  gas_name: string;
  center: number;
  left: number;
  right: number;
};

const GAS_LABEL_REGEX = /(NO2|SO2|CO2|HCl|NH3|H2S|CH4|THC|N2|NO|CO|O2)\s*[-_/]?\s*(Zero|Span)/gi;

const ZERO_SPAN_START_REGEX = /6\.\s*Zero\s*Span\s*Test|Zero\s*Span\s*Test/i;
const ZERO_SPAN_END_REGEX = /7\.\s*특이사항|특이사항|자재교체\s*내용\s*및\s*작업내용|자재교체|작업\s*내용/i;

const normalizeSpacing = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeDateStr = (raw: string): string => {
  const normalized = raw.replace(/\./g, "-").replace(/\//g, "-").trim();

  const m2 = normalized.match(/^(\d{2})-(\d{1,2})-(\d{1,2})$/);
  if (m2) {
    const year2 = Number.parseInt(m2[1], 10);
    const fullYear = year2 >= 50 ? 1900 + year2 : 2000 + year2;
    return `${fullYear}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`;
  }

  const m4 = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m4) {
    return `${m4[1]}-${m4[2].padStart(2, "0")}-${m4[3].padStart(2, "0")}`;
  }

  return raw;
};

const extractGasLabelCandidates = (raw: string): string[] => {
  const value = normalizeSpacing(raw.replace(/[|,;]+/g, " "));
  if (!value) return [];

  const regex = new RegExp(GAS_LABEL_REGEX.source, "gi");
  const labels: string[] = [];

  for (const match of value.matchAll(regex)) {
    const gas = match[1].toUpperCase();
    const mode = match[2].toLowerCase() === "zero" ? "Zero" : "Span";
    const label = `${gas} ${mode}`;
    if (!labels.includes(label)) labels.push(label);
  }

  return labels;
};

const parseRemainingValue = (raw: string): string => {
  const value = normalizeSpacing(raw);
  if (!value) return "";
  if (/n\/?a/i.test(value)) return "N/A";

  const pctMatch = value.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (pctMatch) return `${pctMatch[1]}%`;

  return value;
};

const parseExpiryValue = (raw: string): string => {
  const value = normalizeSpacing(raw);
  if (!value) return "";
  if (/n\/?a/i.test(value)) return "N/A";

  const dateMatch = value.match(/(\d{2,4}[-./]\d{1,2}[-./]\d{1,2})/);
  if (dateMatch) return normalizeDateStr(dateMatch[1]);

  return value;
};

const extractSiteAndUnit = (text: string): { site_name: string; unit_no: string } => {
  let site_name = "";

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

  if (site_name) {
    const boundaryKeywords = [
      "대상", "호기", "일자", "시간", "구분", "점검자", "담당",
      "일시", "장비", "모델", "시리얼", "Serial", "Model",
      "점검", "검사", "기간", "결과", "비고", "확인",
    ];

    for (const kw of boundaryKeywords) {
      const idx = site_name.indexOf(kw);
      if (idx > 0) site_name = site_name.substring(0, idx).trim();
    }

    site_name = site_name
      .replace(/\s+\d+호기.*$/i, "")
      .replace(/\s+\d{4}년.*$/i, "")
      .replace(/\s+\d{4}[-./]\d{1,2}[-./]\d{1,2}.*$/i, "")
      .trim();
  }

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

  return { site_name, unit_no };
};

const extractSection6Text = (rawText: string): string => {
  const startMatch = rawText.match(ZERO_SPAN_START_REGEX);
  if (!startMatch) return "";

  const startIdx = rawText.indexOf(startMatch[0]);
  const afterStart = rawText.slice(startIdx + startMatch[0].length);
  const endMatch = afterStart.match(ZERO_SPAN_END_REGEX);
  const endIdx = endMatch ? startIdx + startMatch[0].length + afterStart.indexOf(endMatch[0]) : rawText.length;

  return rawText.slice(startIdx, endIdx);
};

const splitTextRowCells = (line: string): string[] => {
  if (line.includes("\t")) {
    return line.split("\t").map((v) => v.trim()).filter(Boolean);
  }

  return line.split(/\s{2,}/).map((v) => v.trim()).filter(Boolean);
};

const extractItemsFromSectionText = (rawText: string): ExtractedGasItem[] => {
  const sectionText = extractSection6Text(rawText);
  if (!sectionText) return [];

  const lines = sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const calibrationLine = lines.find((line) => /\bcalibration\b/i.test(line));
  if (!calibrationLine) return [];

  const remainingLine = lines.find((line) => /표준\s*가스\s*잔량|표준가스잔량/.test(line));
  const expiryLine = lines.find((line) => /유효\s*기간|유효기간/.test(line));

  const calibrationCells = splitTextRowCells(calibrationLine);
  const remainingCells = remainingLine ? splitTextRowCells(remainingLine) : [];
  const expiryCells = expiryLine ? splitTextRowCells(expiryLine) : [];

  const items: ExtractedGasItem[] = [];

  for (let col = 0; col < calibrationCells.length; col++) {
    const labels = extractGasLabelCandidates(calibrationCells[col]);

    // Fail-safe: uncertain/merged cells are skipped instead of concatenated.
    if (labels.length !== 1) continue;

    const gas_name = labels[0];
    const remaining_percent = col < remainingCells.length ? parseRemainingValue(remainingCells[col]) : "";
    const expiry_date = col < expiryCells.length ? parseExpiryValue(expiryCells[col]) : "";

    items.push({ gas_name, remaining_percent, expiry_date });
  }

  return items;
};

/* ── PDF text extraction using pdfjs-dist ── */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
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

const tokenWidth = (token: PdfToken): number => Math.max(token.width, Math.max(token.text.length, 1) * 4);
const tokenCenter = (token: PdfToken): number => token.x + tokenWidth(token) / 2;

const splitTokensToCells = (tokens: PdfToken[], gapThreshold: number) => {
  const ordered = [...tokens].sort((a, b) => a.x - b.x);
  if (ordered.length === 0) return [] as { text: string; center: number }[];

  const cells: { text: string; center: number }[] = [];
  let current: PdfToken[] = [ordered[0]];
  let currentEnd = ordered[0].x + tokenWidth(ordered[0]);

  for (let i = 1; i < ordered.length; i++) {
    const next = ordered[i];
    const nextStart = next.x;
    const gap = nextStart - currentEnd;

    if (gap > gapThreshold) {
      const left = Math.min(...current.map((t) => t.x));
      const right = Math.max(...current.map((t) => t.x + tokenWidth(t)));
      cells.push({
        text: normalizeSpacing(current.map((t) => t.text).join(" ")),
        center: (left + right) / 2,
      });
      current = [next];
      currentEnd = next.x + tokenWidth(next);
    } else {
      current.push(next);
      currentEnd = Math.max(currentEnd, next.x + tokenWidth(next));
    }
  }

  const left = Math.min(...current.map((t) => t.x));
  const right = Math.max(...current.map((t) => t.x + tokenWidth(t)));
  cells.push({
    text: normalizeSpacing(current.map((t) => t.text).join(" ")),
    center: (left + right) / 2,
  });

  return cells;
};

const buildColumnBounds = (columns: Array<{ gas_name: string; center: number }>): PdfColumn[] => {
  const sorted = [...columns].sort((a, b) => a.center - b.center);
  if (sorted.length === 0) return [];

  const gaps = sorted.slice(1).map((col, i) => col.center - sorted[i].center).filter((g) => g > 0);
  const defaultHalfGap = gaps.length > 0 ? Math.max(28, Math.min(...gaps) / 2) : 60;

  return sorted.map((col, i) => {
    const left = i === 0 ? col.center - defaultHalfGap : (sorted[i - 1].center + col.center) / 2;
    const right = i === sorted.length - 1 ? col.center + defaultHalfGap : (col.center + sorted[i + 1].center) / 2;
    return { ...col, left, right };
  });
};

const extractColumnsFromCalibrationRow = (row: PdfRow): PdfColumn[] => {
  // Try multiple thresholds (wide to narrow) to avoid merged cells and over-splitting.
  for (const gapThreshold of [30, 26, 20, 14, 10, 6, 4]) {
    const cells = splitTokensToCells(row.tokens, gapThreshold);

    const cols: Array<{ gas_name: string; center: number }> = [];
    let ambiguous = false;

    for (let i = 0; i < cells.length; i++) {
      const current = cells[i];
      const labels = extractGasLabelCandidates(current.text);

      if (labels.length > 1) {
        ambiguous = true;
        break;
      }

      if (labels.length === 1) {
        cols.push({ gas_name: labels[0], center: current.center });
        continue;
      }

      // If over-split (e.g., "NO" and "Span" separated), try combining adjacent cells.
      if (i + 1 < cells.length) {
        const combined = `${current.text} ${cells[i + 1].text}`;
        const combinedLabels = extractGasLabelCandidates(combined);

        if (combinedLabels.length > 1) {
          ambiguous = true;
          break;
        }

        if (combinedLabels.length === 1) {
          cols.push({
            gas_name: combinedLabels[0],
            center: (current.center + cells[i + 1].center) / 2,
          });
          i += 1;
        }
      }
    }

    if (!ambiguous && cols.length > 0) {
      console.log(`[GasExtraction] Column extraction succeeded with gapThreshold=${gapThreshold}, found ${cols.length} columns:`, cols.map(c => c.gas_name));
      return buildColumnBounds(cols);
    }
  }

  // Last resort: scan individual tokens for gas labels by position
  console.log("[GasExtraction] Threshold-based splitting failed, trying per-token scan");
  const cols: Array<{ gas_name: string; center: number }> = [];
  const tokens = [...row.tokens].sort((a, b) => a.x - b.x);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // Try single token
    const singleLabels = extractGasLabelCandidates(t.text);
    if (singleLabels.length === 1) {
      cols.push({ gas_name: singleLabels[0], center: tokenCenter(t) });
      continue;
    }
    // Try combining with next token (e.g. "NO" + "Span")
    if (i + 1 < tokens.length) {
      const combined = `${t.text} ${tokens[i + 1].text}`;
      const combinedLabels = extractGasLabelCandidates(combined);
      if (combinedLabels.length === 1) {
        cols.push({
          gas_name: combinedLabels[0],
          center: (tokenCenter(t) + tokenCenter(tokens[i + 1])) / 2,
        });
        i += 1;
        continue;
      }
      // Try 3-token combination (e.g. "N2" + "-" + "Zero")
      if (i + 2 < tokens.length) {
        const triple = `${t.text} ${tokens[i + 1].text} ${tokens[i + 2].text}`;
        const tripleLabels = extractGasLabelCandidates(triple);
        if (tripleLabels.length === 1) {
          cols.push({
            gas_name: tripleLabels[0],
            center: (tokenCenter(t) + tokenCenter(tokens[i + 2])) / 2,
          });
          i += 2;
          continue;
        }
      }
    }
  }

  if (cols.length > 0) {
    console.log(`[GasExtraction] Per-token scan found ${cols.length} columns:`, cols.map(c => c.gas_name));
    return buildColumnBounds(cols);
  }

  console.warn("[GasExtraction] No gas columns found in calibration row. Tokens:", tokens.map(t => `"${t.text}"@x=${t.x.toFixed(0)}`));
  return [];
};

const extractCellTextByColumn = (row: PdfRow, col: PdfColumn): string => {
  const inColumn = row.tokens
    .filter((token) => {
      const center = tokenCenter(token);
      return center >= col.left && center < col.right;
    })
    .sort((a, b) => a.x - b.x);

  return normalizeSpacing(inColumn.map((token) => token.text).join(" "));
};

const buildPdfRows = (tokens: PdfToken[], yTolerance = 5): PdfRow[] => {
  const sorted = [...tokens].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  const rows: Array<{ page: number; y: number; tokens: PdfToken[] }> = [];

  for (const token of sorted) {
    const last = rows[rows.length - 1];

    if (last && last.page === token.page && Math.abs(last.y - token.y) <= yTolerance) {
      last.tokens.push(token);
      last.y = (last.y * (last.tokens.length - 1) + token.y) / last.tokens.length;
    } else {
      rows.push({ page: token.page, y: token.y, tokens: [token] });
    }
  }

  return rows.map((row) => {
    const orderedTokens = [...row.tokens].sort((a, b) => a.x - b.x);
    return {
      page: row.page,
      y: row.y,
      tokens: orderedTokens,
      text: normalizeSpacing(orderedTokens.map((t) => t.text).join(" ")),
    };
  });
};

const getSection6Rows = (rows: PdfRow[]): PdfRow[] => {
  const startIdx = rows.findIndex((row) => ZERO_SPAN_START_REGEX.test(row.text));
  if (startIdx < 0) return [];

  let endIdx = rows.length;
  for (let i = startIdx + 1; i < rows.length; i++) {
    if (ZERO_SPAN_END_REGEX.test(rows[i].text)) {
      endIdx = i;
      break;
    }
  }

  return rows.slice(startIdx + 1, endIdx);
};

const findRowByPattern = (rows: PdfRow[], pattern: RegExp): PdfRow | undefined => {
  return rows.find((row) => pattern.test(row.text.replace(/\s+/g, "")) || pattern.test(row.text));
};

const extractItemsFromPdfTable = (tokens: PdfToken[]): ExtractedGasItem[] => {
  const rows = buildPdfRows(tokens);
  const sectionRows = getSection6Rows(rows);
  if (sectionRows.length === 0) return [];

  const calibrationRow = findRowByPattern(sectionRows, /calibration/i);
  if (!calibrationRow) return [];

  const remainingRow = findRowByPattern(sectionRows, /표준가스잔량|표준\s*가스\s*잔량/);
  const expiryRow = findRowByPattern(sectionRows, /유효기간|유효\s*기간/);

  const columns = extractColumnsFromCalibrationRow(calibrationRow);
  if (columns.length === 0) return [];

  const items = columns.map((col) => {
    const remainingRaw = remainingRow ? extractCellTextByColumn(remainingRow, col) : "";
    const expiryRaw = expiryRow ? extractCellTextByColumn(expiryRow, col) : "";

    return {
      gas_name: col.gas_name,
      remaining_percent: parseRemainingValue(remainingRaw),
      expiry_date: parseExpiryValue(expiryRaw),
    };
  });

  // Extra fail-safe: never emit merged labels.
  return items.filter((item) => extractGasLabelCandidates(item.gas_name).length === 1);
};

const extractPdfTokens = async (file: File): Promise<PdfToken[]> => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const tokens: PdfToken[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    for (const item of content.items as any[]) {
      if (!("str" in item)) continue;

      const text = String(item.str ?? "").trim();
      if (!text) continue;

      const transform = item.transform as number[] | undefined;
      if (!transform || transform.length < 6) continue;

      const x = Number(transform[4] ?? 0);
      const y = Number(transform[5] ?? 0);
      const width = Number(item.width ?? 0);

      tokens.push({ text, x, y, width, page: pageNum });
    }
  }

  return tokens;
};

/** Check if a PDF has selectable text (not a scanned image-only PDF) */
export async function isPdfTextBased(file: File): Promise<boolean> {
  try {
    const text = await extractTextFromPdf(file);
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

/* ── Parse extracted text to find site/unit and section-6 table items (for XLSX/fallback) ── */
export function parseGasData(rawText: string): ExtractedGasData {
  const { site_name, unit_no } = extractSiteAndUnit(rawText);
  const items = extractItemsFromSectionText(rawText);
  return { site_name, unit_no, items };
}

/** Full extraction pipeline for a single file */
export async function extractGasDataFromFile(file: File): Promise<ExtractedGasData> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const [rawText, pdfTokens] = await Promise.all([
      extractTextFromPdf(file),
      extractPdfTokens(file),
    ]);

    const { site_name, unit_no } = extractSiteAndUnit(rawText);
    const pdfItems = extractItemsFromPdfTable(pdfTokens);

    if (pdfItems.length > 0) {
      return { site_name, unit_no, items: pdfItems };
    }

    // Fail-safe fallback: still table-row based, never linear concatenation.
    const fallbackItems = extractItemsFromSectionText(rawText)
      .filter((item) => extractGasLabelCandidates(item.gas_name).length === 1);

    return { site_name, unit_no, items: fallbackItems };
  }

  if (ext === "xlsx") {
    const rawText = await extractTextFromXlsx(file);
    return parseGasData(rawText);
  }

  throw new Error("지원하지 않는 파일 형식입니다.");
}
