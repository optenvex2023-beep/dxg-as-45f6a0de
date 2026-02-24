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
  const equipRows = inspection.equipment_items.map((item) =>
    new TableRow({
      children: [
        textCell(item.equipment_name, 3000),
        textCell(String(item.qty_set), 1500),
        textCell(report.serial_numbers[item.id] || "—", 3000),
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
            children: [new TextRun({ text: "DXG", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            children: [new TextRun({ text: "점 검 보 고 서", bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `[${reportTitle}]`, bold: true, size: 28 })],
          }),

          // Report type checkbox
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: report.report_type === "first"
                  ? "■ 입고  □ 중간  □ 완료  □ 기타 (긴급)"
                  : "□ 입고  □ 중간  ■ 완료  □ 기타 (긴급)",
                size: 20,
              }),
            ],
          }),

          // Inspector info
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `점검자: ${report.inspector_name}`, size: 20 })],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [new TextRun({ text: `작성일: ${report.created_date}`, size: 20 })],
          }),

          // Basic info table
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  headerCell("관리번호", 2500),
                  textCell(inspection.manage_no, 2500),
                  headerCell("건명", 1500),
                  textCell(inspection.project_name, 2500),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Equipment table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
            children: [new TextRun({ text: "■ 반출 장비 목록", bold: true, size: 24 })],
          }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  headerCell("반출장비(모델명)", 3000),
                  headerCell("수량(Set)", 1500),
                  headerCell("Serial No.", 3000),
                ],
              }),
              ...equipRows,
            ],
          }),

          new Paragraph({ spacing: { before: 300 }, children: [] }),

          // Inspection sections
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
            children: [new TextRun({ text: "Ⅱ. 점검 결과", bold: true, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: report.inspection_result || "(내용 없음)", size: 20 })],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Ⅳ. 기타 특이사항", bold: true, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: report.special_notes || "(내용 없음)", size: 20 })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${reportTitle}_${inspection.manage_no}_${report.created_date}.docx`;
  saveAs(blob, fileName);
}
