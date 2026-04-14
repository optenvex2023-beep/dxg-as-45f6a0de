/**
 * Inspection cycle automation logic for calibration gas management.
 *
 * Rules:
 * - First entry: if 최초(first) is set and 최종(last) is empty → 예정(next) = first + 2y, 차수 = "2차"
 * - Completion: when user enters completion date →
 *   - 최종 = completion date
 *   - if previous round ≤ 2차 → next = completion + 2y
 *   - if previous round ≥ 3차 → next = completion + 1y
 *   - round increments by 1
 */

/** Parse "N차" → number */
export function parseRound(round: string): number {
  const m = round.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Format number → "N차" */
export function formatRound(n: number): string {
  return `${n}차`;
}

/** Parse "YYYY-MM-DD" into local Date without UTC shift */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format Date to "YYYY-MM-DD" using local values */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add years to a date string (YYYY-MM-DD) */
function addYears(dateStr: string, years: number): string {
  const d = parseLocalDate(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return formatLocalDate(d);
}

/** Format date to YYYY-MM-DD */
export function toDateStr(d: Date): string {
  return formatLocalDate(d);
}

/**
 * Calculate next scheduled date and round when first entry is made.
 * Called when 최초 is entered and 최종 is empty.
 */
export function calcFirstEntry(firstDate: string): { next: string; round: string } {
  return {
    next: addYears(firstDate, 2),
    round: "2차",
  };
}

/**
 * Calculate updates when an inspection is completed.
 * @param completionDate - the date the inspection was completed
 * @param currentRound - current round string like "5차"
 */
export function calcCompletion(completionDate: string, currentRound: string): {
  last: string;
  next: string;
  round: string;
} {
  const roundNum = parseRound(currentRound);
  const nextRoundNum = roundNum > 0 ? roundNum + 1 : 2;

  // ≤ 2차 (previous cycle) → +2 years; ≥ 3차 → +1 year
  const yearsToAdd = roundNum < 3 ? 2 : 1;

  return {
    last: completionDate,
    next: addYears(completionDate, yearsToAdd),
    round: formatRound(nextRoundNum),
  };
}

/**
 * Check if a date is within 60 days from today.
 */
export function isWithin60Days(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const sixtyLater = new Date(today);
  sixtyLater.setDate(sixtyLater.getDate() + 60);
  return target >= today && target <= sixtyLater;
}

/**
 * Check if a date is within 60 days from today OR already past.
 * Used for inspection due-date highlighting (green shade).
 */
export function isDueOrPast(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const sixtyLater = new Date(today);
  sixtyLater.setDate(sixtyLater.getDate() + 60);
  // past dates OR within 60 days
  return target <= sixtyLater;
}
