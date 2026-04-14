import ExcelJS from "exceljs";
import type { CalibrationGasInventoryItem } from "@/types/calibrationGas";

/**
 * Template-based Excel export for calibration gas inventory.
 * Loads the master template, preserves headers/styles/column widths,
 * then fills data from the DB inventory.
 *
 * Column mapping (1-indexed):
 *  A(1)  contract_end_date      N(14) gas_inspection_first
 *  B(2)  site_name              O(15) gas_inspection_last
 *  C(3)  tms_status             P(16) gas_inspection_next
 *  D(4)  unit_no                Q(17) gas_inspection_round
 *  E(5)  analyzer_range         R(18) gas_inspection_so
 *  F(6)  concentration          S(19) gas_inspection_so_arrival
 *  G(7)  volume_L               T(20) velocity_inspection_first
 *  H(8)  expiry_date            U(21) velocity_inspection_last
 *  I(9)  remaining_percent      V(22) velocity_inspection_next
 *  J(10) purchase_entity        W(23) velocity_inspection_round
 *  K(11) so_issue               X(24) velocity_inspection_so
 *  L(12) arrival_status         Y(25) inspection_notes
 *  M(13) branch                 Z(26) inspection_date
 *                               AA(27) inspection_cycle
 *                               AB(28) md
 *                               AC(29) monthly_amount
 *                               AD(30) contract_consumables
 *                               AE(31) notes
 */

const HEADER_ROWS = 3;
const DATA_START = 4;
const LAST_COL = 31; // AE

interface SiteGroup {
  site_name: string;
  items: CalibrationGasInventoryItem[];
}

function groupBySite(inventory: CalibrationGasInventoryItem[]): SiteGroup[] {
  const map = new Map<string, CalibrationGasInventoryItem[]>();
  for (const item of inventory) {
    const key = item.site_name || "(미지정)";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([site_name, items]) => ({ site_name, items }));
}

function setCellValue(cell: ExcelJS.Cell, value: string | null | undefined) {
  if (!value || value.trim() === "") {
    cell.value = null;
    return;
  }
  // Try to detect dates (YYYY-MM-DD format) — use Date.UTC to avoid timezone shift
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    cell.value = new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]));
    cell.numFmt = "yyyy-mm-dd";
    return;
  }
  // Try numeric
  const num = Number(value.replace(/,/g, "").replace(/%$/, ""));
  if (!isNaN(num) && value.replace(/,/g, "").replace(/%$/, "").trim() !== "") {
    if (value.endsWith("%")) {
      cell.value = num / 100;
      cell.numFmt = "0%";
    } else {
      cell.value = num;
    }
    return;
  }
  cell.value = value;
}

export async function exportCalGasWithTemplate(inventory: CalibrationGasInventoryItem[]) {
  // 1. Fetch template
  const resp = await fetch("/templates/calibration-gas-template.xlsx");
  if (!resp.ok) throw new Error("템플릿 파일을 불러올 수 없습니다.");
  const buf = await resp.arrayBuffer();

  // 2. Load workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buf);

  const ws = workbook.getWorksheet("DATA") || workbook.worksheets[0];
  if (!ws) throw new Error("워크시트를 찾을 수 없습니다.");

  // 3. Capture template row 4 styles before clearing
  const templateStyles: Record<number, Partial<ExcelJS.Cell>>[] = [];
  for (let r = DATA_START; r <= DATA_START + 2; r++) {
    const row = ws.getRow(r);
    const styles: Record<number, Partial<ExcelJS.Cell>> = {};
    for (let c = 1; c <= LAST_COL; c++) {
      const cell = row.getCell(c);
      styles[c] = {
        font: cell.font ? { ...cell.font } : undefined,
        alignment: cell.alignment ? { ...cell.alignment } : undefined,
        border: cell.border ? { ...cell.border } : undefined,
        fill: cell.fill ? { ...cell.fill as any } : undefined,
        numFmt: cell.numFmt,
      } as any;
    }
    templateStyles.push(styles);
  }

  // 4. Clear ALL existing data rows (keep headers 1-3)
  const totalExistingRows = ws.rowCount;
  const mergesToRemove: string[] = [];
  ws.model.merges?.forEach((m: string) => {
    const match = m.match(/[A-Z]+(\d+)/);
    if (match && parseInt(match[1]) >= DATA_START) {
      mergesToRemove.push(m);
    }
  });
  mergesToRemove.forEach((m) => {
    try { ws.unMergeCells(m); } catch { /* ignore */ }
  });

  for (let r = DATA_START; r <= totalExistingRows; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= LAST_COL + 15; c++) {
      row.getCell(c).value = null;
    }
  }

  // 5. Group data by site
  const groups = groupBySite(inventory);

  // 6. Fill data rows
  let currentRow = DATA_START;
  const siteStartRows: { startRow: number; endRow: number }[] = [];
  const contractMerges: { startRow: number; endRow: number }[] = [];

  for (const group of groups) {
    const groupStart = currentRow;
    let contractStart = currentRow;
    let prevContract = group.items[0]?.contract_end_date;

    for (let i = 0; i < group.items.length; i++) {
      const item = group.items[i];
      const row = ws.getRow(currentRow);

      const styleIdx = Math.min(i, templateStyles.length - 1);
      const styles = templateStyles[styleIdx];
      for (let c = 1; c <= LAST_COL; c++) {
        const cell = row.getCell(c);
        const s = styles[c];
        if (s) {
          if ((s as any).font) cell.font = (s as any).font;
          if ((s as any).alignment) cell.alignment = (s as any).alignment;
          if ((s as any).border) cell.border = (s as any).border;
          if ((s as any).fill) cell.fill = (s as any).fill;
          if ((s as any).numFmt) cell.numFmt = (s as any).numFmt;
        }
      }

      if (item.contract_end_date !== prevContract && currentRow > contractStart) {
        if (currentRow - 1 > contractStart) {
          contractMerges.push({ startRow: contractStart, endRow: currentRow - 1 });
        }
        contractStart = currentRow;
        prevContract = item.contract_end_date;
      }

      if (i === 0 || item.contract_end_date !== group.items[i - 1]?.contract_end_date) {
        setCellValue(row.getCell(1), item.contract_end_date);
      }

      if (i === 0) {
        row.getCell(2).value = item.site_name;
      }

      row.getCell(3).value = item.tms_status || null;
      row.getCell(4).value = item.unit_no || null;
      row.getCell(5).value = item.analyzer_range || null;

      setCellValue(row.getCell(6), item.concentration);
      setCellValue(row.getCell(7), item.volume_L);
      row.getCell(7).numFmt = 'General';
      setCellValue(row.getCell(8), item.expiry_date);
      setCellValue(row.getCell(9), item.remaining_percent);

      row.getCell(10).value = item.purchase_entity || null;
      row.getCell(11).value = item.so_issue || null;
      row.getCell(12).value = item.arrival_status || null;
      row.getCell(13).value = item.branch || null;

      setCellValue(row.getCell(14), item.gas_inspection_first);
      setCellValue(row.getCell(15), item.gas_inspection_last);
      setCellValue(row.getCell(16), item.gas_inspection_next);
      row.getCell(17).value = item.gas_inspection_round || null;
      row.getCell(18).value = item.gas_inspection_so || null;
      row.getCell(19).value = item.gas_inspection_so_arrival || null;

      setCellValue(row.getCell(20), item.velocity_inspection_first);
      setCellValue(row.getCell(21), item.velocity_inspection_last);
      setCellValue(row.getCell(22), item.velocity_inspection_next);
      row.getCell(23).value = item.velocity_inspection_round || null;
      row.getCell(24).value = item.velocity_inspection_so || null;

      row.getCell(25).value = item.inspection_notes || null;
      setCellValue(row.getCell(26), item.inspection_date);
      row.getCell(27).value = item.inspection_cycle || null;
      row.getCell(28).value = item.md || null;
      setCellValue(row.getCell(29), item.monthly_amount);
      row.getCell(30).value = item.contract_consumables || null;
      row.getCell(31).value = item.notes || null;

      row.commit();
      currentRow++;
    }

    if (currentRow - 1 > contractStart) {
      contractMerges.push({ startRow: contractStart, endRow: currentRow - 1 });
    }
    siteStartRows.push({ startRow: groupStart, endRow: currentRow - 1 });
  }

  for (const { startRow, endRow } of siteStartRows) {
    if (endRow > startRow) {
      // B: site_name
      try { ws.mergeCells(startRow, 2, endRow, 2); } catch { /* skip */ }
    }
  }

  // Merge C (TMS) and D (unit_no) using same logic as UI:
  // TMS: same site_name + same tms_status
  // unit_no: same site_name + same tms_status + same unit_no
  const allItemsForMerge = groups.flatMap(g => g.items);
  {
    let i = 0;
    while (i < allItemsForMerge.length) {
      // TMS merge: consecutive rows with same site_name + tms_status
      let j = i + 1;
      while (j < allItemsForMerge.length
        && allItemsForMerge[j].site_name === allItemsForMerge[i].site_name
        && allItemsForMerge[j].tms_status === allItemsForMerge[i].tms_status) j++;
      if (j - i > 1) {
        try { ws.mergeCells(DATA_START + i, 3, DATA_START + j - 1, 3); } catch { /* skip */ }
      }
      i = j;
    }
    // unit_no merge: consecutive rows with same site_name + tms_status + unit_no
    i = 0;
    while (i < allItemsForMerge.length) {
      let j = i + 1;
      while (j < allItemsForMerge.length
        && allItemsForMerge[j].site_name === allItemsForMerge[i].site_name
        && allItemsForMerge[j].tms_status === allItemsForMerge[i].tms_status
        && allItemsForMerge[j].unit_no === allItemsForMerge[i].unit_no) j++;
      if (j - i > 1) {
        try { ws.mergeCells(DATA_START + i, 4, DATA_START + j - 1, 4); } catch { /* skip */ }
      }
      i = j;
    }
  }

  // Merge gas inspection (N-S, cols 14-19) and velocity inspection (T-X, cols 20-24)
  // based on merge group IDs from the inventory data
  const allItems = groups.flatMap(g => g.items);
  function computeMergeRanges(items: CalibrationGasInventoryItem[], groupKey: "gas_inspection_merge_group" | "velocity_inspection_merge_group" | "purchase_entity_merge_group" | "branch_merge_group") {
    const ranges: { startRow: number; endRow: number }[] = [];
    let i = 0;
    while (i < items.length) {
      const gid = (items[i] as any)[groupKey] ?? 0;
      // Group ID 0 means "no merge group" — skip merging for these rows
      if (gid === 0) {
        i++;
        continue;
      }
      const siteName = items[i].site_name;
      let j = i + 1;
      while (j < items.length
        && ((items[j] as any)[groupKey] ?? 0) === gid
        && items[j].site_name === siteName) j++;
      if (j - i > 1) {
        ranges.push({ startRow: DATA_START + i, endRow: DATA_START + j - 1 });
      }
      i = j;
    }
    return ranges;
  }

  const gasMerges = computeMergeRanges(allItems, "gas_inspection_merge_group");
  const velMerges = computeMergeRanges(allItems, "velocity_inspection_merge_group");
  // Purchase entity: merge first-to-last row per (site_name, group_id) — not just consecutive
  const purchaseMerges: { startRow: number; endRow: number }[] = [];
  {
    console.group("[CalGasExport] 구매주체(J열) 병합 디버그");

    // 1. 각 row의 기본 정보 로그
    console.log("=== Row별 purchase_entity_merge_group 목록 ===");
    for (let idx = 0; idx < allItems.length; idx++) {
      const item = allItems[idx];
      const gid = (item as any).purchase_entity_merge_group ?? 0;
      const excelRow = DATA_START + idx;
      console.log(`  dataIdx=${idx}, excelRow=${excelRow}, site="${item.site_name}", gid=${gid}, purchase_entity="${item.purchase_entity}"`);
    }

    // 2. 그룹 계산 — gid>0 행 기준으로 범위 산출
    const seen = new Map<string, { startRow: number; endRow: number; lastDataIdx: number }>();
    for (let idx = 0; idx < allItems.length; idx++) {
      const gid = (allItems[idx] as any).purchase_entity_merge_group ?? 0;
      if (gid === 0) continue;
      const key = `${allItems[idx].site_name}::${gid}`;
      const entry = seen.get(key);
      if (!entry) {
        seen.set(key, { startRow: DATA_START + idx, endRow: DATA_START + idx, lastDataIdx: idx });
      } else {
        entry.endRow = DATA_START + idx;
        entry.lastDataIdx = idx;
      }
    }

    // 2-1. 종료 row 보정: 각 그룹의 마지막 gid행 이후,
    //      같은 site_name이면서 gid=0인 연속 행을 병합 범위에 포함
    for (const [key, range] of seen.entries()) {
      const siteName = key.split("::")[0];
      let ext = range.lastDataIdx + 1;
      while (ext < allItems.length
        && allItems[ext].site_name === siteName
        && ((allItems[ext] as any).purchase_entity_merge_group ?? 0) === 0) {
        ext++;
      }
      if (ext - 1 > range.lastDataIdx) {
        range.endRow = DATA_START + (ext - 1);
        console.log(`  [보정] key="${key}", endRow 확장 → ${range.endRow} (gid=0 trailing ${ext - 1 - range.lastDataIdx}행 포함)`);
      }
    }

    // 3. 비연속 row 감지
    console.log("=== 비연속 row 감지 ===");
    for (const [key, range] of seen.entries()) {
      const rowCount = range.endRow - range.startRow + 1;
      // 해당 key에 속하는 실제 row 수
      const [sitePart, gidPart] = key.split("::");
      const actualCount = allItems.filter((it, idx) =>
        it.site_name === sitePart && ((it as any).purchase_entity_merge_group ?? 0) === Number(gidPart)
      ).length;
      if (actualCount !== rowCount) {
        console.warn(`  ⚠ 비연속 감지: key="${key}", excelRange=${range.startRow}~${range.endRow} (span=${rowCount}), 실제rows=${actualCount}`);
      }
    }

    // 4. 병합 대상 로그
    console.log("=== 계산된 병합 범위 ===");
    for (const [key, range] of seen.entries()) {
      if (range.endRow > range.startRow) {
        purchaseMerges.push(range);
        console.log(`  key="${key}", mergeCells(${range.startRow}, 10, ${range.endRow}, 10)`);
      } else {
        console.log(`  key="${key}", 단일행(${range.startRow}) — 병합 안 함`);
      }
    }

    console.groupEnd();
  }
  const branchMerges = computeMergeRanges(allItems, "branch_merge_group");

  for (const { startRow, endRow } of gasMerges) {
    for (let col = 14; col <= 19; col++) {
      try { ws.mergeCells(startRow, col, endRow, col); } catch { /* skip */ }
    }
  }
  for (const { startRow, endRow } of velMerges) {
    for (let col = 20; col <= 24; col++) {
      try { ws.mergeCells(startRow, col, endRow, col); } catch { /* skip */ }
    }
  }
  for (const { startRow, endRow } of purchaseMerges) {
    try {
      ws.mergeCells(startRow, 10, endRow, 10);
      console.log(`[CalGasExport] J열 mergeCells 성공: row ${startRow}~${endRow}`);
    } catch (err) {
      console.error(`[CalGasExport] J열 mergeCells 실패: row ${startRow}~${endRow}`, err);
    }
  }
  for (const { startRow, endRow } of branchMerges) {
    try { ws.mergeCells(startRow, 13, endRow, 13); } catch { /* skip */ }
  }

  for (const { startRow, endRow } of contractMerges) {
    if (endRow > startRow) {
      try { ws.mergeCells(startRow, 1, endRow, 1); } catch { /* skip */ }
    }
  }

  const outBuf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outBuf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `교정가스_현황_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
