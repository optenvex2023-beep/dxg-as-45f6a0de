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

  // 1) Detect site name
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

  // 3) Find Zero Span Test section and extract gas data
  const items: { gas_name: string; remaining_percent: string; expiry_date: string }[] = [];

  // Look for "Zero Span" section
  const zeroSpanIdx = text.toLowerCase().indexOf("zero span");
  const relevantText = zeroSpanIdx >= 0 ? text.substring(zeroSpanIdx) : text;

  // Extract gas names and their remaining percentages
  // Common patterns: "NO 200ppm", "O2 25%", "SO2 200ppm", etc.
  const gasPattern = /((?:NO|NO2|SO2|CO|CO2|O2|HCl|NH3|H2S|CH4|THC|N2)\s*(?:Zero|Span)?\s*(?:\d+\s*(?:ppm|%|vol%))?)/gi;
  const gasMatches = relevantText.match(gasPattern) || [];
  const uniqueGases = [...new Set(gasMatches.map((g) => g.trim()))];

  // Extract remaining percentages
  // Pattern: number followed by % (e.g. "96%", "85 %")
  const remainingPattern = /(?:잔량|잔여|remaining)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%/gi;
  const remainMatches = [...relevantText.matchAll(remainingPattern)];

  // Extract expiry dates
  // Patterns: YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD, YYYY년 MM월 DD일
  const datePattern = /(?:유효\s*기간|유효일|만료|expiry)\s*[:：]?\s*(\d{4}[-./]\d{1,2}[-./]\d{1,2}|\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일)/gi;
  const dateMatches = [...relevantText.matchAll(datePattern)];

  // Also try to find tabular data with "점검후" values
  // Look for lines after "점검후" marker
  const postInspectionIdx = relevantText.indexOf("점검후");
  const postText = postInspectionIdx >= 0 ? relevantText.substring(postInspectionIdx) : relevantText;

  // Find all percentage values in post-inspection area
  const pctPattern = /(\d+(?:\.\d+)?)\s*%/g;
  const pctMatches = [...postText.matchAll(pctPattern)];

  // Find all date values in post-inspection area
  const allDatePattern = /(\d{4}[-./]\d{1,2}[-./]\d{1,2})/g;
  const allDateMatches = [...postText.matchAll(allDatePattern)];

  // Build items from what we found
  if (uniqueGases.length > 0) {
    for (let i = 0; i < uniqueGases.length; i++) {
      const gasName = uniqueGases[i];
      // Try to pair with remaining percent and expiry
      const remaining = remainMatches[i]?.[1] ? `${remainMatches[i][1]}%` : (pctMatches[i]?.[1] ? `${pctMatches[i][1]}%` : "");
      const expiry = dateMatches[i]?.[1] || allDateMatches[i]?.[1] || "";
      // Normalize date format
      const normalizedExpiry = expiry
        .replace(/\s*년\s*/, "-")
        .replace(/\s*월\s*/, "-")
        .replace(/\s*일\s*/, "")
        .replace(/\./g, "-")
        .replace(/\//g, "-");

      items.push({
        gas_name: gasName,
        remaining_percent: remaining,
        expiry_date: normalizedExpiry,
      });
    }
  }

  // If no structured gas data found, try a more general table-row approach
  if (items.length === 0) {
    // Look for rows with gas-related keywords and percentages
    const lines = relevantText.split("\n");
    for (const line of lines) {
      const gasMatch = line.match(/(NO|NO2|SO2|CO|CO2|O2|HCl|NH3|H2S|CH4|THC|N2)/i);
      const pctMatch = line.match(/(\d+(?:\.\d+)?)\s*%/);
      const dtMatch = line.match(/(\d{4}[-./]\d{1,2}[-./]\d{1,2})/);
      if (gasMatch) {
        items.push({
          gas_name: gasMatch[0],
          remaining_percent: pctMatch ? `${pctMatch[1]}%` : "",
          expiry_date: dtMatch ? dtMatch[1].replace(/[./]/g, "-") : "",
        });
      }
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
