/**
 * Generic gas matching utilities for mapping Zero Span Test labels
 * to calibration gas inventory rows.
 *
 * Mixed gases (e.g. "NO/SO2", "NO/SO2/CO") are treated as single entries — never split.
 */

/** Known gas chemical symbols (order matters — longer first to avoid partial matches) */
const GAS_SYMBOLS = [
  "NO2", "SO2", "CO2", "H2S", "NH3", "CH4", "THC", "HCl", "NOx",
  "NO", "CO", "O2", "N2",
] as const;

export interface ParsedGasLabel {
  /** Original label from the report, e.g. "NO/SO2 Span" */
  original: string;
  /** Full gas part (may be mixed), e.g. "NO/SO2" or "O2" */
  gasPart: string;
  /** Individual gas symbols in the label, e.g. ["NO", "SO2"] */
  gasSymbols: string[];
  /** Whether it's a Zero or Span calibration */
  type: "zero" | "span" | "unknown";
}

/**
 * Parse a gas label into its gas part(s) and Zero/Span type.
 * Mixed gases are preserved as-is.
 * 
 * Examples:
 *   "NO/SO2 Span"  → { gasPart: "NO/SO2",  gasSymbols: ["NO","SO2"], type: "span" }
 *   "NO/SO2 Zero"  → { gasPart: "NO/SO2",  gasSymbols: ["NO","SO2"], type: "zero" }
 *   "O2 Zero"      → { gasPart: "O2",      gasSymbols: ["O2"],       type: "zero" }
 *   "N2 Zero"      → { gasPart: "N2",      gasSymbols: ["N2"],       type: "zero" }
 *   "NO Span"      → { gasPart: "NO",      gasSymbols: ["NO"],       type: "span" }
 *   "CO"           → { gasPart: "CO",      gasSymbols: ["CO"],       type: "span" }
 */
export function parseGasLabel(label: string): ParsedGasLabel {
  const trimmed = label.trim();

  // Rule: "Zero" in label → zero gas. Otherwise → span gas.
  let type: "zero" | "span" | "unknown" = "unknown";
  if (/ZERO/i.test(trimmed)) {
    type = "zero";
  }

  // Extract the gas part (everything before Zero/Span keyword)
  const modeMatch = trimmed.match(/^(.+?)\s+(Zero|Span)\s*$/i);
  const gasPart = modeMatch ? modeMatch[1].replace(/\s+/g, "").toUpperCase() : trimmed.replace(/\s+/g, "").toUpperCase();

  // Extract individual gas symbols from the gas part
  const gasSymbols: string[] = [];
  const parts = gasPart.split(/[/,]/);
  for (const part of parts) {
    const upper = part.trim().toUpperCase();
    for (const sym of GAS_SYMBOLS) {
      if (upper.includes(sym)) {
        if (!gasSymbols.includes(sym)) gasSymbols.push(sym);
        break;
      }
    }
  }

  // If we found gas symbols but type is still unknown, default to span
  if (gasSymbols.length > 0 && type === "unknown") {
    type = "span";
  }

  return { original: trimmed, gasPart, gasSymbols, type };
}

/**
 * Normalize an inventory gas_name for comparison.
 * Strips whitespace, punctuation, converts to uppercase.
 */
function normalizeForMatch(s: string): string {
  return s.replace(/[\s\-_()（）\[\]#,.]/g, "").toUpperCase();
}

/**
 * Check if an inventory gas_name represents a Zero gas row.
 * Zero rows typically contain "Zero" or have N2 concentration.
 */
function isInventoryZeroRow(gasName: string, concentration: string): boolean {
  const upper = gasName.toUpperCase();
  if (upper.includes("ZERO")) return true;
  if (/\bN2\b/i.test(concentration.trim())) return true;
  return false;
}

/**
 * Extract gas symbols from an inventory gas_name.
 * "NO/SO2 200/200ppm" → ["NO", "SO2"]
 * "O2 25%" → ["O2"]
 * "NO Zero" → ["NO"]
 */
function extractInventoryGasSymbols(gasName: string): string[] {
  const symbols: string[] = [];
  // Remove concentration/numbers for cleaner matching
  const cleaned = gasName.replace(/\d+(\.\d+)?\s*(ppm|%|vol)/gi, "").toUpperCase();
  const parts = cleaned.split(/[/,]/);

  for (const part of parts) {
    const trimmed = part.trim();
    for (const sym of GAS_SYMBOLS) {
      if (trimmed.includes(sym) && !symbols.includes(sym)) {
        symbols.push(sym);
        break;
      }
    }
  }
  return symbols;
}

/**
 * Check if an inventory row's gas symbols match the extracted gas symbols.
 * For mixed gases, ALL symbols must be present in the inventory row.
 */
function gasSymbolsMatch(extractedSymbols: string[], inventoryGasName: string): boolean {
  const invSymbols = extractInventoryGasSymbols(inventoryGasName);
  if (invSymbols.length === 0 || extractedSymbols.length === 0) return false;

  // All extracted symbols must be in the inventory row
  const allExtractedFound = extractedSymbols.every(s => invSymbols.includes(s));
  // And they should cover a similar set (avoid matching a broader inventory row by accident)
  const sizeSimilar = invSymbols.length <= extractedSymbols.length + 1;

  return allExtractedFound && sizeSimilar;
}

export interface GasMatchResult {
  /** The inventory item ID */
  inventoryId: string;
  /** The inventory gas_name for display */
  inventoryGasName: string;
  /** Match confidence: 1.0 = exact, 0.5+ = partial */
  confidence: number;
}

/**
 * Find matching inventory rows for an extracted gas label.
 * 
 * Priority: site + unit (done externally) → gas symbols → Zero/Span type
 * Mixed gases like "NO/SO2" match inventory rows containing both NO and SO2.
 * 
 * Rule: "Zero" in label → match Zero inventory rows. Otherwise → match Span rows.
 * Special: N2 Zero → matches Zero rows for NO (N2 is the zero gas for NO analyzers).
 */
export function matchGasToInventory(
  parsed: ParsedGasLabel,
  candidates: { id: string; gas_name: string; concentration: string }[]
): GasMatchResult[] {
  const results: GasMatchResult[] = [];

  if (parsed.gasSymbols.length === 0) return results;

  for (const inv of candidates) {
    const invIsZero = isInventoryZeroRow(inv.gas_name, inv.concentration);

    if (parsed.type === "span") {
      // Span gas: find non-zero rows that match the gas symbols
      if (!invIsZero && gasSymbolsMatch(parsed.gasSymbols, inv.gas_name)) {
        results.push({
          inventoryId: inv.id,
          inventoryGasName: inv.gas_name,
          confidence: 0.9,
        });
      }
    } else if (parsed.type === "zero") {
      // Zero gas: find zero rows
      if (invIsZero) {
        // N2 Zero → matches NO Zero rows (N2 is zero gas for NO analyzers)
        if (parsed.gasSymbols.length === 1 && parsed.gasSymbols[0] === "N2") {
          const invSymbols = extractInventoryGasSymbols(inv.gas_name);
          if (invSymbols.includes("NO") || invSymbols.includes("N2") ||
              /\bN2\b/i.test(inv.concentration)) {
            results.push({
              inventoryId: inv.id,
              inventoryGasName: inv.gas_name,
              confidence: 0.85,
            });
          }
        } else {
          // Normal zero matching: gas symbols must match
          if (gasSymbolsMatch(parsed.gasSymbols, inv.gas_name)) {
            results.push({
              inventoryId: inv.id,
              inventoryGasName: inv.gas_name,
              confidence: 0.9,
            });
          }
        }
      }
    } else {
      // Unknown type: fallback to simple gas symbol matching
      if (gasSymbolsMatch(parsed.gasSymbols, inv.gas_name)) {
        results.push({
          inventoryId: inv.id,
          inventoryGasName: inv.gas_name,
          confidence: 0.5,
        });
      }
    }
  }

  return results;
}

/**
 * Format a match result for display in the review UI.
 */
export function formatMatchDisplay(parsed: ParsedGasLabel, matched: GasMatchResult | null): string {
  if (!matched) return "매칭 없음";
  return `${parsed.original} → ${matched.inventoryGasName}`;
}
