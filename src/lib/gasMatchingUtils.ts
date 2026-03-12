/**
 * Generic gas matching utilities for mapping Zero Span Test labels
 * to calibration gas inventory rows.
 */

/** Known gas chemical symbols (order matters — longer first to avoid partial matches) */
const GAS_SYMBOLS = [
  "NO2", "SO2", "CO2", "H2S", "NH3", "CH4", "THC", "HCl",
  "NO", "CO", "O2", "N2",
] as const;

export interface ParsedGasLabel {
  /** Original label from the report, e.g. "NO Span" */
  original: string;
  /** Detected base gas symbol, e.g. "NO" */
  baseGas: string;
  /** Whether it's a Zero or Span calibration */
  type: "zero" | "span" | "unknown";
}

/**
 * Parse a Calibration row gas label into its base gas and Zero/Span type.
 * Examples:
 *   "NO Span"  → { baseGas: "NO",  type: "span" }
 *   "O2 Zero"  → { baseGas: "O2",  type: "zero" }
 *   "N2 Zero"  → { baseGas: "N2",  type: "zero" }  (N2 is the zero gas for NO)
 *   "SO2 Span" → { baseGas: "SO2", type: "span" }
 */
export function parseGasLabel(label: string): ParsedGasLabel {
  const trimmed = label.trim();
  const upper = trimmed.toUpperCase();

  // Detect Zero vs Span
  let type: "zero" | "span" | "unknown" = "unknown";
  if (/ZERO/i.test(trimmed)) type = "zero";
  else if (/SPAN/i.test(trimmed)) type = "span";

  // Detect base gas symbol
  let baseGas = "";
  for (const sym of GAS_SYMBOLS) {
    if (upper.includes(sym.toUpperCase())) {
      baseGas = sym;
      break;
    }
  }

  return { original: trimmed, baseGas, type };
}

/**
 * Normalize an inventory gas_name for comparison.
 * Strips whitespace, punctuation, converts to uppercase.
 */
function normalizeForMatch(s: string): string {
  return s.replace(/[\s\-_()（）\[\]#,./]/g, "").toUpperCase();
}

/**
 * Check if an inventory gas_name represents a Zero gas row.
 * Zero rows typically contain "Zero" or the concentration is "N2".
 */
function isInventoryZeroRow(gasName: string, concentration: string): boolean {
  const upper = gasName.toUpperCase();
  if (upper.includes("ZERO")) return true;
  // N2 as concentration indicates a zero gas
  if (concentration.toUpperCase().trim() === "N2") return true;
  return false;
}

/**
 * Check if an inventory gas_name contains a specific gas symbol.
 * Handles combined gases like "NO/SO2 200/200ppm".
 */
function inventoryContainsGas(gasName: string, targetGas: string): boolean {
  const normalized = normalizeForMatch(gasName);
  const targetNorm = targetGas.toUpperCase();
  
  // Direct inclusion check
  if (normalized.includes(targetNorm)) return true;
  
  // Split combined gas names (e.g. "NO/SO2/CO Zero" → ["NO", "SO2", "CO"])
  const parts = gasName.split(/[/,]/).map(p => p.trim().toUpperCase());
  for (const part of parts) {
    // Extract just the gas symbol from each part
    for (const sym of GAS_SYMBOLS) {
      if (part.includes(sym.toUpperCase()) && sym.toUpperCase() === targetNorm) {
        return true;
      }
    }
  }
  
  return false;
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
 * Strategy:
 * 1. Filter by site + unit first (done externally)
 * 2. Determine if extracted label is Zero or Span
 * 3. For Span: match inventory rows containing the same gas symbol that are NOT Zero rows
 * 4. For Zero: match inventory rows that ARE Zero rows for the same gas
 *    - Special: N2 Zero → matches "NO Zero" or any row with N2 concentration
 */
export function matchGasToInventory(
  parsed: ParsedGasLabel,
  candidates: { id: string; gas_name: string; concentration: string }[]
): GasMatchResult[] {
  const results: GasMatchResult[] = [];

  if (!parsed.baseGas) return results;

  for (const inv of candidates) {
    const invIsZero = isInventoryZeroRow(inv.gas_name, inv.concentration);
    
    if (parsed.type === "span") {
      // Span gas: find non-zero rows that contain this gas symbol
      if (!invIsZero && inventoryContainsGas(inv.gas_name, parsed.baseGas)) {
        results.push({
          inventoryId: inv.id,
          inventoryGasName: inv.gas_name,
          confidence: 0.9,
        });
      }
    } else if (parsed.type === "zero") {
      // Zero gas: find zero rows
      if (invIsZero) {
        // N2 is used as zero gas for multiple analyzers (typically NO)
        if (parsed.baseGas === "N2") {
          // N2 Zero matches any Zero row (NO Zero, or combined Zero rows)
          if (inventoryContainsGas(inv.gas_name, "NO") || 
              inventoryContainsGas(inv.gas_name, "N2") ||
              inv.concentration.toUpperCase().trim() === "N2") {
            results.push({
              inventoryId: inv.id,
              inventoryGasName: inv.gas_name,
              confidence: 0.85,
            });
          }
        } else {
          // O2 Zero → O2 Zero, SO2 Zero → SO2 Zero, etc.
          if (inventoryContainsGas(inv.gas_name, parsed.baseGas)) {
            results.push({
              inventoryId: inv.id,
              inventoryGasName: inv.gas_name,
              confidence: 0.9,
            });
          }
        }
      }
    } else {
      // Unknown type: fallback to simple gas name matching
      if (inventoryContainsGas(inv.gas_name, parsed.baseGas)) {
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
