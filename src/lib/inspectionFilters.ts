import type { OutboundInspection } from "@/types";

/** Treats null, undefined, "", whitespace-only, dashes, and "N/A" as empty */
export const isEmpty = (v: string | null | undefined): boolean =>
  v == null || ["", " ", "-", "—", "–", "N/A"].includes(v.trim());

/** 점검중 판정: 최종점검완료일자가 비어있고, 입고일자 또는 1차점검완료일자가 있는 경우 */
export const isInProgress = (rec: OutboundInspection): boolean =>
  isEmpty(rec.final_inspection_done_date) &&
  (!isEmpty(rec.inbound_date) || !isEmpty(rec.first_inspection_done_date));
