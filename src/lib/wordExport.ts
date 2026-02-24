import { Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import type { OutboundInspection, InspectionReport } from "@/types";

function border() {
  return { style: BorderStyle.SINGLE, size: 1, color: "000000" };
}
function cellBorders() {
  return { top: border(), bottom: border(), left: border(), right: border() };
}

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    borders: cellBorders(),
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: "F2F2F2" },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] })],
  });
}

function textCell(text: string, width?: number): TableCell {
  return new TableCell({
    borders: cellBorders(),
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
  });
}

export async function exportReportToWord(
  inspection: OutboundInspection,
  report: InspectionReport,
  reportTitle: string,
) {
  const data = report.inspection_data;
  const equipItem = inspection.equipment_items.find(e => e.id === report.equipment_item_id);
  const serialNo = report.serial_numbers[report.equipment_item_id] || equipItem?.serial_no || "";

  // Build check items rows
  const checkRows = (data?.check_items || []).map(item =>
    new TableRow({
      children: [
        textCell(item.category, 1500),
        textCell(item.item, 2000),
        textCell(item.result, 1800),
        textCell(item.action, 1800),
        textCell(item.action_result, 1800),
      ],
    })
  );

  // Build replacement parts rows
  const partRows = (data?.replacement_parts || []).map(part =>
    new TableRow({
      children: [
        textCell(part.name, 2500),
        textCell(part.qty, 1000),
        textCell(part.status, 2500),
        textCell(part.note, 3000),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "DXG", bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            children: [new TextRun({ text: "점 검 보 고 서", bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `[${reportTitle}]`, bold: true, size: 28 })],
          }),

          // Report type
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({
              text: report.report_type === "first"
                ? "■ 입고  □ 중간  □ 완료  □ 기타 (긴급)"
                : "□ 입고  □ 중간  ■ 완료  □ 기타 (긴급)",
              size: 20,
            })],
          }),

          // Inspector info
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `점검자: ${report.inspector_name}`, size: 20 })] }),
          new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: `작성일: ${report.created_date}`, size: 20 })] }),

          // Basic info table
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({ children: [headerCell("Client", 2000), textCell(data?.client_name || "", 2500), headerCell("Serial No", 1500), textCell(serialNo, 3000)] }),
              new TableRow({ children: [headerCell("관리번호", 2000), textCell(inspection.manage_no, 2500), headerCell("건명", 1500), textCell(inspection.project_name, 3000)] }),
              new TableRow({ children: [headerCell("입고일", 2000), textCell(data?.inbound_date || "", 2500), headerCell("작성일", 1500), textCell(report.created_date, 3000)] }),
              new TableRow({ children: [headerCell("반출장비", 2000), textCell(equipItem?.equipment_name || "", 2500), headerCell("수량", 1500), textCell(String(equipItem?.qty_set || ""), 3000)] }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Ⅰ. 기본 Check
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 100 }, children: [new TextRun({ text: "Ⅰ. 기본 Check 항목", bold: true, size: 24 })] }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({ children: [headerCell("전압", 3000), headerCell("측정가스", 3000), headerCell("설치 구분", 3000)] }),
              new TableRow({
                children: [
                  textCell(`Main Unit: ${(data?.voltage_main || []).join(", ")}\nPurge Air: ${(data?.voltage_purge || []).join(", ")}`, 3000),
                  textCell((data?.measure_gas || []).join(", "), 3000),
                  textCell((data?.install_type || []).join(", "), 3000),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Ⅱ. Inspection checklist
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 100 }, children: [new TextRun({ text: "Ⅱ. 점검 내용 및 조치 사항", bold: true, size: 24 })] }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  headerCell("구분", 1500), headerCell("점검 항목", 2000),
                  headerCell("점검 결과", 1800), headerCell("조치 사항", 1800), headerCell("조치 결과", 1800),
                ],
              }),
              ...checkRows,
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Ⅲ. Replacement parts
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 100 }, children: [new TextRun({ text: "Ⅲ. 교체 (필요) 품목 List", bold: true, size: 24 })] }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({ children: [headerCell("품목", 2500), headerCell("수량", 1000), headerCell("Status", 2500), headerCell("점검내용", 3000)] }),
              ...(partRows.length > 0 ? partRows : [new TableRow({ children: [textCell("—", 2500), textCell("", 1000), textCell("", 2500), textCell("", 3000)] })]),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Ⅳ. Special notes
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 100 }, children: [new TextRun({ text: "Ⅳ. 기타 특이사항 (세부 설명)", bold: true, size: 24 })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data?.detail_notes || "(내용 없음)", size: 20 })] }),

          // Summary
          new Paragraph({ spacing: { before: 300 }, heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "점검 사항 요약", bold: true, size: 24 })] }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({ children: [headerCell("No", 800), headerCell("항목", 3000), headerCell("내용", 5200)] }),
              ...["1차 점검 결과 요약", "분광기 얼라인 확인", "프로브 얼라인먼트 확인", "표준가스 교정"].map((label, i) =>
                new TableRow({ children: [textCell(String(i + 1), 800), textCell(label, 3000), textCell(data?.summary_items?.[i] || "", 5200)] })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${reportTitle}_${inspection.manage_no}_${report.created_date}.docx`;
  saveAs(blob, fileName);
}
