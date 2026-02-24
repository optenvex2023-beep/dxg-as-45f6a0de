import type { OutboundInspection, StatusType } from "@/types";

export function computeStatus(record: Omit<OutboundInspection, "status" | "due_warning">): {
  status: StatusType;
  due_warning: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toDate = (s: string | null) => (s ? new Date(s) : null);

  const reinstallDate = toDate(record.reinstall_date);
  const contractDue = toDate(record.contract_due_date);
  const finalInsp = toDate(record.final_inspection_done_date);
  const firstInsp = toDate(record.first_inspection_done_date);
  const inbound = toDate(record.inbound_date);
  const outbound = toDate(record.outbound_date);
  const plannedOutbound = toDate(record.planned_outbound_date);

  // 1) 설치 완료
  if (reinstallDate && reinstallDate <= today && record.reinstall_confirm_status === "확정") {
    return { status: "설치 완료", due_warning: false };
  }

  // 2) 납기유의
  let dueWarning = false;
  if (contractDue) {
    const warningDate = new Date(contractDue);
    warningDate.setDate(warningDate.getDate() - 7);
    if (today >= warningDate) {
      dueWarning = true;
    }
  }

  // 3) 최종 점검완료
  if (finalInsp) {
    return { status: dueWarning ? "납기유의" : "최종 점검완료", due_warning: dueWarning };
  }

  // 4) 1차 점검완료
  if (firstInsp) {
    return { status: dueWarning ? "납기유의" : "1차 점검완료", due_warning: dueWarning };
  }

  // 5) 입고완료
  if (inbound && inbound <= today) {
    return { status: dueWarning ? "납기유의" : "입고완료", due_warning: dueWarning };
  }

  // 6) 반출완료
  if (outbound && outbound <= today) {
    return { status: dueWarning ? "납기유의" : "반출완료", due_warning: dueWarning };
  }

  // 7) 반출예정
  if (plannedOutbound) {
    return { status: dueWarning ? "납기유의" : "반출예정", due_warning: dueWarning };
  }

  // 8) 확인필요
  return { status: dueWarning ? "납기유의" : "확인필요", due_warning: dueWarning };
}
