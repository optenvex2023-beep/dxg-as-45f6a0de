import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadReportPhoto, resolvePhotoUrl } from "@/lib/reportPhotoStorage";
import { useApp } from "@/contexts/AppContext";
import type { OutboundInspection, OutboundEquipmentItem, InspectionReport, InspectionReportData, InspectionCheckItem, ReplacementPart, ReportPhoto, InspectionResultOption } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileDown, Upload, FileText, Check, Send, Plus, Trash2, ImagePlus, X, ShieldCheck, Download, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { exportReportToWord } from "@/lib/wordExport";
import { isSuperAdmin } from "@/lib/permissions";
import { uploadReportVersionFile } from "@/lib/reportVersionUpload";
import {
  createDefaultReportData,
  MODEL_OPTIONS,
  INBOUND_ITEM_OPTIONS,
  GAS_OPTIONS,
  INSTALL_OPTIONS,
} from "@/lib/inspectionDefaults";

const statusOrder = ["확인필요", "반출예정", "반출완료", "입고완료", "1차 점검완료", "최종 점검완료", "설치 완료", "납기유의"];

function isAtLeastInbound(status: string): boolean {
  return statusOrder.indexOf(status) >= statusOrder.indexOf("입고완료");
}

/* Photo page slots matching Word template pages 6-12 */
const PHOTO_SLOTS = [
  { key: "replacement_parts", title: "교체 필요 부품 사진" },
  { key: "body_optics", title: "본체, 광학 (렌즈) 관련 부품 점검 사진" },
  { key: "cpu_smps", title: "Main Control CPU Board, SMPS, 기타 부품 점검 사진" },
  { key: "ao_probe", title: "AO 출력 / 프로브 점검 사진" },
  { key: "probe_detail", title: "프로브 상세 점검 사진" },
  { key: "spectrometer", title: "Spectrometer 얼라인먼트 / 기타 사진" },
  { key: "final_assembly", title: "프로브 결합후 Spectrometer 형상" },
];

const RESULT_OPTIONS: InspectionResultOption[] = ["사용 가능", "교체 필요", "추후 교체 권장", "직접 기입"];

export default function FirstReport() {
  const {
    inspections, currentUser, reports,
    getReportsForInspection, addReport, updateReport, completeReport,
    requestApproval, approveReport, addReportVersion, getReportVersions, deleteReportVersion,
  } = useApp();

  const [selectedInspectionId, setSelectedInspectionId] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailReportId, setDetailReportId] = useState<string | null>(null);
  const [reportSearchKeyword, setReportSearchKeyword] = useState("");
  const [qaFilter, setQaFilter] = useState<"all" | "미검토" | "검토완료">("all");

  const superAdmin = isSuperAdmin(currentUser);
  const isManufacturing = superAdmin || currentUser?.department === "제조본부";
  const isQC = superAdmin || currentUser?.department === "품질본부";
  const isSales = superAdmin || currentUser?.department === "환경영업팀";
  const isAdmin = superAdmin || (currentUser?.role_category === "관리자" && currentUser?.department === "환경영업팀");
  const canApprove = isQC || isAdmin;

  const eligibleInspections = useMemo(() =>
    inspections.filter(i => {
      if (!(isAtLeastInbound(i.status) || i.due_warning)) return false;
      // Exclude inspections where ALL equipment items already have a completed first report
      const completedEquipIds = new Set(
        reports
          .filter(r => r.inspection_id === i.id && r.report_type === "first" && r.status !== "draft")
          .map(r => r.equipment_item_id)
      );
      return i.equipment_items.some(eq => !completedEquipIds.has(eq.id));
    }),
    [inspections, reports]
  );

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId) ?? null;
  const selectedEquipment = selectedInspection?.equipment_items.find(e => e.id === selectedEquipmentId) ?? null;

  const existingReport = useMemo(() => {
    if (!selectedEquipmentId) return null;
    return reports.find(r =>
      r.inspection_id === selectedInspectionId &&
      r.equipment_item_id === selectedEquipmentId &&
      r.report_type === "first"
    ) ?? null;
  }, [reports, selectedInspectionId, selectedEquipmentId]);

  const equipmentWithReports = useMemo(() => {
    if (!selectedInspectionId) return new Set<string>();
    return new Set(
      reports
        .filter(r => r.inspection_id === selectedInspectionId && r.report_type === "first")
        .map(r => r.equipment_item_id)
    );
  }, [reports, selectedInspectionId]);

  // Completed first reports for the list section
  const completedFirstReports = useMemo(() => {
    return reports
      .filter(r => r.report_type === "first" && r.status !== "draft")
      .sort((a, b) => b.created_date.localeCompare(a.created_date));
  }, [reports]);

  const filteredCompletedReports = useMemo(() => {
    let list = completedFirstReports;
    if (qaFilter !== "all") {
      list = list.filter(r => r.qa_review_status === qaFilter);
    }
    const kw = reportSearchKeyword.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(r => {
      const insp = inspections.find(i => i.id === r.inspection_id);
      const equip = insp?.equipment_items.find(e => e.id === r.equipment_item_id);
      const serial = r.serial_numbers?.[r.equipment_item_id] || equip?.serial_no || "";
      const targets = [
        insp?.manage_no || "",
        insp?.project_name || "",
        equip?.equipment_name || "",
        serial,
        r.inspector_name || "",
        r.created_date || "",
      ];
      return targets.some(t => t.toLowerCase().includes(kw));
    });
  }, [completedFirstReports, reportSearchKeyword, qaFilter, inspections]);

  const detailReport = detailReportId ? reports.find(r => r.id === detailReportId) ?? null : null;
  const detailInspection = detailReport ? inspections.find(i => i.id === detailReport.inspection_id) ?? null : null;
  const detailEquipment = detailInspection?.equipment_items.find(e => e.id === detailReport?.equipment_item_id) ?? null;

  const handleDetailQAReview = () => {
    if (!detailReport) return;
    const qaName = resolveUserName();
    approveReport(detailReport.id, qaName);
    toast.success("품질본부 검토가 완료되었습니다. 환경영업팀에 알림이 전송됩니다.");
  };

  const handleInspectionChange = (id: string) => {
    setSelectedInspectionId(id);
    setSelectedEquipmentId("");
  };

  const resolveUserName = (): string => {
    return currentUser?.name || "";
  };

  const handleComplete = () => {
    if (!existingReport) return;
    const inspectorName = existingReport.inspector_name || resolveUserName();
    const deptHead = existingReport.inspection_data.department_head || "김영기";
    updateReport(existingReport.id, {
      inspector_name: inspectorName,
      inspection_data: { ...existingReport.inspection_data, department_head: deptHead },
    });
    completeReport(existingReport.id);
    toast.success("1차 점검보고서가 완료되었습니다. 품질본부에 알림이 전송됩니다.");
  };

  const handleQAReviewComplete = () => {
    if (!existingReport) return;
    const qaName = resolveUserName();
    approveReport(existingReport.id, qaName);
    toast.success("품질본부 검토가 완료되었습니다. 환경영업팀에 알림이 전송됩니다.");
  };

  return (
    <div className="pb-20 space-y-4">
      <h1 className="text-xl font-semibold">1차 점검보고서</h1>

      {/* Step 1: Select inspection */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <label className="text-xs font-medium text-muted-foreground">대상 건 선택</label>
        <Select value={selectedInspectionId} onValueChange={handleInspectionChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="점검 대상 건을 선택하세요" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[60]">
            {eligibleInspections.map(insp => (
              <SelectItem key={insp.id} value={insp.id} className="text-xs">
                [{insp.status}] {insp.manage_no} - {insp.project_name}
              </SelectItem>
            ))}
            {eligibleInspections.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">입고완료 이상인 건이 없습니다.</div>
            )}
          </SelectContent>
        </Select>

        {selectedInspection && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">장비 선택 (1 Serial No = 1 보고서)</label>
            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="장비를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {selectedInspection.equipment_items.map(item => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.equipment_name} ({item.qty_set} set)
                    {equipmentWithReports.has(item.id) && " ✓ 보고서 있음"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Show existing report or create button */}
      {selectedInspection && selectedEquipment && (
        <>
          {existingReport ? (
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-1" onClick={() => { setSelectedEquipmentId(""); setSelectedInspectionId(""); }}>
                <ArrowLeft className="h-4 w-4" /> 뒤로가기
              </Button>
              <DocumentView
                inspection={selectedInspection}
                equipment={selectedEquipment}
                report={existingReport}
                canEdit={isManufacturing && existingReport.status === "draft"}
                canApprove={canApprove}
                isManufacturing={isManufacturing}
                isQC={isQC}
                isSales={isSales}
                onUpdate={updateReport}
                onComplete={handleComplete}
                onRequestApproval={() => { requestApproval(existingReport.id); toast.success("승인요청이 전송되었습니다."); }}
                onQAReviewComplete={handleQAReviewComplete}
                onAddVersion={addReportVersion}
                getVersions={getReportVersions}
                onDeleteVersion={deleteReportVersion}
                currentUserName={currentUser?.name || ""}
              />
            </div>
          ) : (
            isManufacturing ? (
              <div className="flex justify-center py-12">
                <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
                  <FileText className="h-4 w-4" /> 1차 점검보고서 작성
                </Button>
              </div>
            ) : (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
                아직 1차 점검보고서가 작성되지 않았습니다.
              </CardContent></Card>
            )
          )}
        </>
      )}

      {/* Create modal */}
      {selectedInspection && selectedEquipment && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0 shrink-0">
              <DialogTitle>1차 점검보고서 작성</DialogTitle>
            </DialogHeader>
            <DocumentForm
              inspection={selectedInspection}
              equipment={selectedEquipment}
              inspectorName={currentUser?.name || ""}
              onSubmit={(data) => {
                addReport(data);
                setCreateModalOpen(false);
                toast.success("보고서가 임시저장되었습니다.");
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ═══ Completed Reports List ═══ */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold shrink-0">작성완료된 보고서 리스트</h2>
          <div className="flex items-center gap-2">
            <Select value={qaFilter} onValueChange={(v) => setQaFilter(v as "all" | "미검토" | "검토완료")}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="all" className="text-xs">전체</SelectItem>
                <SelectItem value="미검토" className="text-xs">품질 미검토</SelectItem>
                <SelectItem value="검토완료" className="text-xs">품질 검토완료</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="건명 / 관리번호 / Serial No 검색"
                value={reportSearchKeyword}
                onChange={e => setReportSearchKeyword(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </div>
        {filteredCompletedReports.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {reportSearchKeyword.trim() ? "검색 결과가 없습니다." : "완료된 1차 점검보고서가 없습니다."}
          </p>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">관리번호</TableHead>
                  <TableHead className="text-xs">건명</TableHead>
                  <TableHead className="text-xs">모델/장비</TableHead>
                  <TableHead className="text-xs">Serial No</TableHead>
                  <TableHead className="text-xs">작성일</TableHead>
                  <TableHead className="text-xs">작성자(점검자)</TableHead>
                  <TableHead className="text-xs">품질검토상태</TableHead>
                  <TableHead className="text-xs">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompletedReports.map(r => {
                  const insp = inspections.find(i => i.id === r.inspection_id);
                  const equip = insp?.equipment_items.find(e => e.id === r.equipment_item_id);
                  const serial = r.serial_numbers[r.equipment_item_id] || equip?.serial_no || "";
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{insp?.manage_no || ""}</TableCell>
                      <TableCell className="text-xs">{insp?.project_name || ""}</TableCell>
                      <TableCell className="text-xs">{equip?.equipment_name || ""}</TableCell>
                      <TableCell className="text-xs">{serial}</TableCell>
                      <TableCell className="text-xs">{r.created_date}</TableCell>
                      <TableCell className="text-xs">{r.inspector_name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge className={cn("text-[10px]",
                          r.qa_review_status === "검토완료" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {r.qa_review_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setDetailReportId(r.id)}>
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail modal for completed report */}
      {detailReport && detailInspection && detailEquipment && (
        <Dialog open={!!detailReportId} onOpenChange={(open) => { if (!open) setDetailReportId(null); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0 shrink-0 flex flex-row items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground h-7 px-2" onClick={() => setDetailReportId(null)}>
                <ArrowLeft className="h-4 w-4" /> 뒤로가기
              </Button>
              <DialogTitle className="!mt-0">1차 점검보고서 상세</DialogTitle>
            </DialogHeader>
            <DocumentView
              inspection={detailInspection}
              equipment={detailEquipment}
              report={detailReport}
              canEdit={false}
              canApprove={canApprove}
              isManufacturing={isManufacturing}
              isQC={isQC}
              isSales={isSales}
              onUpdate={updateReport}
              onComplete={() => {}}
              onRequestApproval={() => {}}
              onQAReviewComplete={handleDetailQAReview}
              onAddVersion={addReportVersion}
              getVersions={getReportVersions}
              onDeleteVersion={deleteReportVersion}
              currentUserName={currentUser?.name || ""}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── Checkbox group helper ─── */
function CheckGroup({ options, selected, onChange, disabled }: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
          <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} disabled={disabled} />
          {opt}
        </label>
      ))}
    </div>
  );
}

/* ─── Document-style table cell ─── */
const thCls = "border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground";
const tdCls = "border border-border px-3 py-2 text-xs";

/* ══════════════════════════════════════════════════════════════
   Document Form (create new report)
   ══════════════════════════════════════════════════════════════ */
function DocumentForm({
  inspection, equipment, inspectorName, onSubmit,
}: {
  inspection: OutboundInspection;
  equipment: OutboundEquipmentItem;
  inspectorName: string;
  onSubmit: (data: Omit<InspectionReport, "id" | "created_at" | "updated_at" | "completed_at" | "approved_at" | "approved_by">) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [serialNo, setSerialNo] = useState(equipment.serial_no || "");
  const [data, setData] = useState<InspectionReportData>(() => {
    const d = createDefaultReportData();
    d.inbound_date = inspection.inbound_date || "";
    return d;
  });

  const upd = (patch: Partial<InspectionReportData>) => setData(prev => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    onSubmit({
      inspection_id: inspection.id,
      equipment_item_id: equipment.id,
      report_type: "first",
      status: "draft",
      serial_numbers: { [equipment.id]: serialNo },
      inspection_data: { ...data, serial_no: serialNo },
      inspection_result: "",
      special_notes: "",
      inspector_name: inspectorName,
      created_date: today,
      qa_review_status: "미검토",
      qa_reviewer_name: null,
      qa_reviewed_at: null,
      qa_signature_applied: false,
      qa_notification_sent_to_sales: false,
      manufacturing_review_completed: false,
      manufacturing_reviewed_at: null,
    });
  };

  return (
    <div className="p-6 pt-2 space-y-6 overflow-y-auto flex-1">
      <TemplateBody
        inspection={inspection}
        equipment={equipment}
        serialNo={serialNo}
        onSerialChange={setSerialNo}
        data={data}
        onDataChange={upd}
        inspectorName={inspectorName}
        createdDate={today}
        disabled={false}
        reportStatus="draft"
        qaReviewerName=""
        qaSignatureApplied={false}
      />
      <Button onClick={handleSubmit} className="w-full">임시저장</Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Document View (existing report)
   ══════════════════════════════════════════════════════════════ */
function DocumentView({
  inspection, equipment, report, canEdit, canApprove, isManufacturing, isQC, isSales,
  onUpdate, onComplete, onRequestApproval, onQAReviewComplete,
  onAddVersion, getVersions, onDeleteVersion, currentUserName,
}: {
  inspection: OutboundInspection;
  equipment: OutboundEquipmentItem;
  report: InspectionReport;
  canEdit: boolean;
  canApprove: boolean;
  isManufacturing: boolean;
  isQC: boolean;
  isSales: boolean;
  onUpdate: (id: string, updates: Partial<InspectionReport>) => void;
  onComplete: () => void;
  onRequestApproval: () => void;
  onQAReviewComplete: () => void;
  onAddVersion: (reportId: string, fileName: string, filePath: string, fileUrl: string, uploadedBy: string) => Promise<{ id: string; report_id: string; version_number: number; file_name: string; file_path: string; file_url: string; uploaded_by: string; uploaded_at: string }>;
  getVersions: (reportId: string) => { id: string; version_number: number; file_name: string; file_path: string; file_url: string; uploaded_at: string; uploaded_by: string }[];
  onDeleteVersion: (versionId: string) => Promise<void>;
  currentUserName: string;
}) {
  const isDraft = report.status === "draft";
  const draftEditable = canEdit && isDraft;

  // Edit mode for completed reports (수정)
  const [isEditing, setIsEditing] = useState(false);
  // QA review editing mode
  const [isQAReviewing, setIsQAReviewing] = useState(false);

  const canModify = isSales || isManufacturing || isQC;
  const editable = draftEditable || isEditing || isQAReviewing;

  const [serialNo, setSerialNo] = useState(report.serial_numbers[equipment.id] || "");
  const [data, setData] = useState<InspectionReportData>(() => {
    const d = report.inspection_data || createDefaultReportData();
    if (!d.inbound_date && inspection.inbound_date) {
      d.inbound_date = inspection.inbound_date;
    }
    return d;
  });
  const versions = getVersions(report.id);

  const upd = (patch: Partial<InspectionReportData>) => setData(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    const inspectorName = report.inspector_name || currentUserName;
    onUpdate(report.id, {
      inspector_name: inspectorName,
      serial_numbers: { [equipment.id]: serialNo },
      inspection_data: { ...data, serial_no: serialNo },
    });
    if (isEditing) setIsEditing(false);
    toast.success("저장되었습니다.");
  };

  const handleQAReviewFinalize = () => {
    // Save any QA edits first
    const inspectorName = report.inspector_name || currentUserName;
    onUpdate(report.id, {
      inspector_name: inspectorName,
      serial_numbers: { [equipment.id]: serialNo },
      inspection_data: { ...data, serial_no: serialNo },
    });
    // Then perform QA completion
    onQAReviewComplete();
    setIsQAReviewing(false);
  };

  const handleManufacturingReview = () => {
    onUpdate(report.id, {
      manufacturing_review_completed: true,
      manufacturing_reviewed_at: new Date().toISOString(),
    });
    toast.success("제조 검토가 완료되었습니다.");
  };

  const handleWordDownload = async () => {
    try {
      const updatedReport = { ...report, serial_numbers: { [equipment.id]: serialNo }, inspection_data: data };
      await exportReportToWord(inspection, updatedReport, "1차 점검보고서");
      toast.success("Word 파일이 다운로드되었습니다.");
    } catch (error) {
      console.error("Word export failed:", error);
      toast.error("Word 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { fileUrl, filePath } = await uploadReportVersionFile({
        file,
        reportId: report.id,
        reportType: "first",
      });
      const savedVersion = await onAddVersion(report.id, file.name, filePath, fileUrl, currentUserName || "알 수 없음");
      console.log("[ReportVersionUpload] 업로드 완료:", { filePath, savedVersion });
      toast.success(`수정본 v${savedVersion.version_number}이 업로드되었습니다.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      console.error("File upload failed:", err);
      toast.error(`파일 업로드 실패: ${message}`);
    }
    e.target.value = "";
  };

  const statusLabel: Record<string, string> = { draft: "작성중", completed: "완료", approval_requested: "승인대기", approved: "승인완료" };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20 space-y-4 p-6 pt-2">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <span className="text-sm font-medium">1차 점검보고서</span>
          <Badge className={cn("text-[10px]",
            report.status === "draft" ? "bg-muted text-muted-foreground" :
            report.status === "approved" ? "bg-primary/20 text-primary" :
            "bg-accent/15 text-accent"
          )}>
            {statusLabel[report.status]}
          </Badge>
        </div>

        {/* Document body */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <TemplateBody
            inspection={inspection}
            equipment={equipment}
            serialNo={serialNo}
            onSerialChange={editable ? setSerialNo : undefined}
            data={data}
            onDataChange={editable ? upd : undefined}
            inspectorName={report.inspector_name}
            createdDate={report.created_date}
            disabled={!editable}
            reportStatus={report.status}
            qaReviewerName={report.qa_signature_applied ? (report.approved_by || report.qa_reviewer_name || "") : ""}
            qaSignatureApplied={report.qa_signature_applied}
          />
        </div>

        {/* Document management */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">문서 관리</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleWordDownload}>
              <FileDown className="h-3.5 w-3.5" /> Word 다운로드
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
              <label className="cursor-pointer">
                <Upload className="h-3.5 w-3.5" /> 수정본 업로드
                <input type="file" accept=".docx,.doc,.pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </Button>
          </div>
          {versions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">업로드된 수정본 파일</p>
              {[...versions].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)).map((v, idx) => (
                <div key={v.id} className="flex items-center justify-between gap-2 text-xs border rounded px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{v.file_name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">({v.uploaded_by} / {v.uploaded_at.split("T")[0]})</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={v.file_url} download={v.file_name} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2">
                        <Download className="h-3 w-3" /> 다운로드
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        if (!window.confirm(`"${v.file_name}" 파일을 삭제하시겠습니까?\n삭제된 파일은 복구할 수 없습니다.`)) return;
                        try {
                          await onDeleteVersion(v.id);
                          toast.success("파일이 삭제되었습니다.");
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : String(err);
                          toast.error(`삭제 실패: ${msg}`);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> 삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-50 border-t bg-background px-6 py-3 flex items-center justify-end gap-2 shrink-0">
        {draftEditable && !isEditing && !isQAReviewing && (
          <>
            <Button variant="outline" onClick={handleSave}>임시저장</Button>
            <Button onClick={onComplete} className="gap-1"><Check className="h-4 w-4" /> 완료</Button>
          </>
        )}

        {!isDraft && !isEditing && !isQAReviewing && canModify && (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-1">
            수정
          </Button>
        )}

        {isEditing && (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
            <Button onClick={handleSave} className="gap-1"><Check className="h-4 w-4" /> 저장</Button>
          </>
        )}

        {isManufacturing && !isDraft && !isEditing && !isQAReviewing && !report.manufacturing_review_completed && (
          <Button onClick={handleManufacturingReview} className="gap-1 bg-orange-600 text-white hover:bg-orange-700">
            <ShieldCheck className="h-4 w-4" /> 제조 검토 완료
          </Button>
        )}

        {isQC && !isDraft && !isEditing && !isQAReviewing && report.qa_review_status === "미검토" && (
          <Button onClick={() => setIsQAReviewing(true)} className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <ShieldCheck className="h-4 w-4" /> 품질 검토
          </Button>
        )}

        {isQAReviewing && (
          <>
            <Button variant="outline" onClick={() => setIsQAReviewing(false)}>취소</Button>
            <Button onClick={handleQAReviewFinalize} className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
              <ShieldCheck className="h-4 w-4" /> 품질본부 검토 완료
            </Button>
          </>
        )}

        {!editable && !canModify && (
          <Button variant="outline" onClick={handleWordDownload} className="gap-1">
            <FileDown className="h-4 w-4" /> Word 다운로드
          </Button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Template Body — Document-style layout matching Word template
   ══════════════════════════════════════════════════════════════ */
function TemplateBody({
  inspection, equipment, serialNo, onSerialChange,
  data, onDataChange, inspectorName, createdDate, disabled,
  reportStatus, qaReviewerName, qaSignatureApplied,
}: {
  inspection: OutboundInspection;
  equipment: OutboundEquipmentItem;
  serialNo: string;
  onSerialChange?: (v: string) => void;
  data: InspectionReportData;
  onDataChange?: (patch: Partial<InspectionReportData>) => void;
  inspectorName: string;
  createdDate: string;
  disabled: boolean;
  reportStatus: string;
  qaReviewerName: string;
  qaSignatureApplied?: boolean;
}) {
  const upd = onDataChange || (() => {});
  const ro = disabled || !onDataChange;

  const updateCheckItem = (idx: number, field: keyof InspectionCheckItem, value: string) => {
    if (ro) return;
    const items = [...data.check_items];
    items[idx] = { ...items[idx], [field]: value };
    upd({ check_items: items });
  };

  const addReplacementPart = () => {
    if (ro) return;
    upd({ replacement_parts: [...data.replacement_parts, { name: "", qty: "", status: "", note: "" }] });
  };

  const updatePart = (idx: number, field: keyof ReplacementPart, value: string) => {
    if (ro) return;
    const parts = [...data.replacement_parts];
    parts[idx] = { ...parts[idx], [field]: value };
    upd({ replacement_parts: parts });
  };

  const removePart = (idx: number) => {
    if (ro) return;
    upd({ replacement_parts: data.replacement_parts.filter((_, i) => i !== idx) });
  };

  const updateSummary = (idx: number, value: string) => {
    if (ro) return;
    const items = [...data.summary_items];
    items[idx] = value;
    upd({ summary_items: items });
  };

  const handlePhotoUpload = async (slotKey: string, files: FileList | null) => {
    if (ro || !files) return;
    const photos = [...(data.photos || [])];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = crypto.randomUUID();
      // Immediate blob preview
      const blobUrl = URL.createObjectURL(file);
      const newPhoto: ReportPhoto = {
        id: photoId,
        report_id: "",
        file_url: blobUrl,
        caption: "",
        page_slot: slotKey,
        order_index: photos.filter(p => p.page_slot === slotKey).length,
        uploaded_by: inspectorName,
        uploaded_at: new Date().toISOString(),
      };
      photos.push(newPhoto);
      // Upload to storage in background
      try {
        const storagePath = await uploadReportPhoto(file, "first", photoId);
        // Replace blob URL with storage path
        const idx = photos.findIndex(p => p.id === photoId);
        if (idx !== -1) photos[idx] = { ...photos[idx], file_url: storagePath };
      } catch (err) {
        console.error("[FirstReport] photo upload failed, keeping blob URL:", err);
      }
    }
    upd({ photos });
  };

  const removePhoto = (photoId: string) => {
    if (ro) return;
    upd({ photos: (data.photos || []).filter(p => p.id !== photoId) });
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    if (ro) return;
    upd({ photos: (data.photos || []).map(p => p.id === photoId ? { ...p, caption } : p) });
  };

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* ═══ PAGE 1: Cover ═══ */}
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold tracking-widest text-primary">DXG</p>
        <h2 className="text-xl font-bold tracking-[0.5em]">점 검 보 고 서</h2>
        <p className="text-lg font-bold">[1차 점검 보고서]</p>
      </div>

      {/* Report type checkbox */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <span>■ 입고</span>
        <span>□ 중간</span>
        <span>□ 완료</span>
        <span>□ 기타 (긴급)</span>
      </div>

      {/* Inspector table — 4 columns matching Word template */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={thCls} style={{ width: "25%" }}>점검자</td>
            <td className={thCls} style={{ width: "25%" }}>부서장</td>
            <td className={thCls} style={{ width: "25%" }}>품질본부 확인</td>
            <td className={thCls} style={{ width: "25%" }}>품질 서명</td>
          </tr>
          <tr>
            <td className={tdCls}>{inspectorName}</td>
            <td className={tdCls}>{data.department_head || ""}</td>
            <td className={tdCls}>{qaReviewerName || ""}</td>
            <td className={cn(tdCls, "text-center")}>
              {qaSignatureApplied ? (
                <img
                  src="/images/qa-signature.png"
                  alt="품질 서명"
                  className="inline-block h-12 w-auto"
                />
              ) : (
                <span className="text-muted-foreground text-[10px]">—</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Basic info table */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={thCls} style={{ width: "20%" }}>Client</td>
            <td className={tdCls}>
              <EditableText value={data.client_name} onChange={v => upd({ client_name: v })} disabled={ro} placeholder="고객명" />
            </td>
          </tr>
          <tr>
            <td className={thCls}>Serial No</td>
            <td className={tdCls}>
              <EditableText value={serialNo} onChange={onSerialChange} disabled={ro || !onSerialChange} placeholder="Serial No 입력" />
            </td>
          </tr>
          <tr>
            <td className={thCls}>입고일</td>
            <td className={tdCls}>
              <EditableText value={data.inbound_date} onChange={v => upd({ inbound_date: v })} disabled={ro} placeholder="YYYY-MM-DD" type="date" />
            </td>
          </tr>
          <tr>
            <td className={thCls}>작성일</td>
            <td className={cn(tdCls, "bg-muted")}>{createdDate}</td>
          </tr>
          <tr>
            <td className={thCls}>관련문서</td>
            <td className={tdCls}>
              <EditableText value={data.related_doc} onChange={v => upd({ related_doc: v })} disabled={ro} placeholder="관련문서" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Client / Model / Serial No / 입고 품목 */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Client</th>
            <th className={thCls}>Model</th>
            <th className={thCls}>Serial No.</th>
            <th className={thCls}>입고 품목</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={tdCls} rowSpan={2}>
              <span className="text-xs">{data.client_name || "—"}</span>
            </td>
            <td className={tdCls}>
              <CheckGroup options={MODEL_OPTIONS} selected={data.model_checks} onChange={v => upd({ model_checks: v })} disabled={ro} />
            </td>
            <td className={tdCls} rowSpan={2}>
              <span className="text-xs">{serialNo || "—"}</span>
            </td>
            <td className={tdCls}>
              <CheckGroup options={INBOUND_ITEM_OPTIONS} selected={data.inbound_items} onChange={v => upd({ inbound_items: v })} disabled={ro} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══ PAGE 2: Context ═══ */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>입고 내용</th>
            <th className={thCls}>현장 상황</th>
            <th className={thCls}>고객 요청사항</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={cn(tdCls, "align-top")} style={{ width: "25%" }}>
              <CheckGroup
                options={["정기 반출 점검", "긴급 점검", "입고 점검"]}
                selected={data.inbound_type}
                onChange={v => upd({ inbound_type: v })}
                disabled={ro}
              />
            </td>
            <td className={cn(tdCls, "align-top")} style={{ width: "37.5%" }}>
              <EditableTextarea value={data.site_situation} onChange={v => upd({ site_situation: v })} disabled={ro} rows={3} />
            </td>
            <td className={cn(tdCls, "align-top")} style={{ width: "37.5%" }}>
              <EditableTextarea value={data.client_request} onChange={v => upd({ client_request: v })} disabled={ro} rows={3} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Ⅰ. 기본 Check 항목 */}
      <div>
        <h3 className="text-sm font-bold mb-2">Ⅰ. 기본 Check 항목</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thCls}>전압</th>
              <th className={thCls}>측정항목</th>
              <th className={thCls}>설치 구분</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cn(tdCls, "align-top space-y-2")}>
                <div className="text-xs font-medium mb-1">Main Unit</div>
                <CheckGroup options={["110V", "220V"]} selected={data.voltage_main} onChange={v => upd({ voltage_main: v })} disabled={ro} />
                <div className="text-xs font-medium mb-1 mt-2">Purge Air Unit</div>
                <CheckGroup options={["220V", "380-480V"]} selected={data.voltage_purge} onChange={v => upd({ voltage_purge: v })} disabled={ro} />
              </td>
              <td className={cn(tdCls, "align-top")}>
                <CheckGroup options={GAS_OPTIONS} selected={data.measure_gas} onChange={v => upd({ measure_gas: v })} disabled={ro} />
              </td>
              <td className={cn(tdCls, "align-top")}>
                <CheckGroup options={INSTALL_OPTIONS} selected={data.install_type} onChange={v => upd({ install_type: v })} disabled={ro} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ⅱ. 점검 내용 및 조치 사항 */}
      <div>
        <h3 className="text-sm font-bold mb-2">Ⅱ. 점검 내용 및 조치 사항</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thCls} style={{ width: "13%" }}>구분</th>
              <th className={thCls} style={{ width: "17%" }}>점검 항목</th>
              <th className={thCls} style={{ width: "20%" }}>점검 결과</th>
              <th className={thCls} style={{ width: "25%" }}>점검 내용</th>
              <th className={thCls} style={{ width: "25%" }}>점검 결과</th>
              {!ro && <th className={thCls} style={{ width: "40px" }}></th>}
            </tr>
          </thead>
          <tbody>
            {data.check_items.map((item, idx) => (
              <tr key={idx}>
                <td className={cn(tdCls, "font-medium")}>
                  <EditableText value={item.category} onChange={v => updateCheckItem(idx, "category", v)} disabled={ro} />
                </td>
                <td className={tdCls}>
                  <EditableText value={item.item} onChange={v => updateCheckItem(idx, "item", v)} disabled={ro} />
                </td>
                <td className={tdCls}>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <Checkbox
                        checked={item.result === "양호"}
                        onCheckedChange={() => updateCheckItem(idx, "result", item.result === "양호" ? "" : "양호")}
                        disabled={ro}
                      />
                      양호
                    </label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <Checkbox
                        checked={item.result === "추가점검 필요"}
                        onCheckedChange={() => updateCheckItem(idx, "result", item.result === "추가점검 필요" ? "" : "추가점검 필요")}
                        disabled={ro}
                      />
                      추가점검 필요
                    </label>
                  </div>
                </td>
                <td className={tdCls}>
                  <EditableText value={item.action} onChange={v => updateCheckItem(idx, "action", v)} disabled={ro} />
                </td>
                <td className={tdCls}>
                  {ro ? (
                    <span className="text-xs">
                      {item.inspection_result_option || "사용 가능"}
                      {item.inspection_result_option === "직접 기입" && item.inspection_result_detail ? ` - ${item.inspection_result_detail}` : ""}
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <Select
                        value={item.inspection_result_option || "사용 가능"}
                        onValueChange={v => {
                          const items = [...data.check_items];
                          items[idx] = { ...items[idx], inspection_result_option: v as InspectionResultOption, inspection_result_detail: v === "직접 기입" ? items[idx].inspection_result_detail : "" };
                          upd({ check_items: items });
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-[60]">
                          {RESULT_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.inspection_result_option === "직접 기입" && (
                        <Input
                          className="h-7 text-xs"
                          placeholder="상세 내용 입력"
                          value={item.inspection_result_detail || ""}
                          onChange={e => {
                            const items = [...data.check_items];
                            items[idx] = { ...items[idx], inspection_result_detail: e.target.value };
                            upd({ check_items: items });
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                {!ro && (
                  <td className={cn(tdCls, "text-center")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        const items = data.check_items.filter((_, i) => i !== idx);
                        upd({ check_items: items });
                      }}
                      aria-label="행 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!ro && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 gap-1"
            onClick={() => upd({ check_items: [...data.check_items, { category: "", item: "", result: "", action: "", action_result: "", inspection_result_option: "사용 가능", inspection_result_detail: "" }] })}
          >
            <Plus className="h-3 w-3" /> 행 추가
          </Button>
        )}
      </div>

      {/* Ⅲ. 교체 (필요) 품목 List */}
      <div>
        <h3 className="text-sm font-bold mb-2">Ⅲ. 교체 (필요) 품목 List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thCls}>품목</th>
              <th className={thCls} style={{ width: "10%" }}>수량</th>
              <th className={thCls} style={{ width: "20%" }}>Status</th>
              <th className={thCls}>점검내용</th>
              {!ro && <th className={thCls} style={{ width: "40px" }}></th>}
            </tr>
          </thead>
          <tbody>
            {data.replacement_parts.map((part, idx) => (
              <tr key={idx}>
                <td className={tdCls}><EditableText value={part.name} onChange={v => updatePart(idx, "name", v)} disabled={ro} /></td>
                <td className={tdCls}><EditableText value={part.qty} onChange={v => updatePart(idx, "qty", v)} disabled={ro} /></td>
                <td className={tdCls}><EditableText value={part.status} onChange={v => updatePart(idx, "status", v)} disabled={ro} /></td>
                <td className={tdCls}><EditableText value={part.note} onChange={v => updatePart(idx, "note", v)} disabled={ro} /></td>
                {!ro && (
                  <td className={tdCls}>
                    <button onClick={() => removePart(idx)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {data.replacement_parts.length === 0 && (
              <tr><td colSpan={ro ? 4 : 5} className={cn(tdCls, "text-center text-muted-foreground")}>항목 없음</td></tr>
            )}
          </tbody>
        </table>
        {!ro && (
          <Button variant="ghost" size="sm" className="mt-1 text-xs gap-1" onClick={addReplacementPart}>
            <Plus className="h-3 w-3" /> 품목 추가
          </Button>
        )}
      </div>

      {/* Ⅳ. 기타 특이사항 (세부 설명) */}
      <div>
        <h3 className="text-sm font-bold mb-2">Ⅳ. 기타 특이사항 (세부 설명)</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr><th className={thCls} colSpan={ro ? 2 : 3}>기타 특이사항 (세부 설명)</th></tr>
          </thead>
          <tbody>
            <tr>
              <LabelCell fieldKey="main_control_cpu" defaultLabel="Main Control CPU Board" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), main_control_cpu: v } })} ro={ro} className="w-1/3" />
              <td className={tdCls}>
                <EditableTextarea value={data.main_control_cpu} onChange={v => upd({ main_control_cpu: v })} disabled={ro} rows={2} />
              </td>
              {!ro && <td className={cn(tdCls, "w-10")}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="optics_window_lens" defaultLabel="광학부품 (윈도우, 볼록렌즈)" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), optics_window_lens: v } })} ro={ro} />
              <td className={tdCls}>
                <EditableTextarea value={data.optics_window_lens} onChange={v => upd({ optics_window_lens: v })} disabled={ro} rows={2} />
              </td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="beam_splitter" defaultLabel="광학부품 (Beam Splitter)" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), beam_splitter: v } })} ro={ro} />
              <td className={tdCls}>
                <div className="text-xs mb-1">오염 상태:</div>
                <EditableText value={data.beam_splitter_contamination} onChange={v => upd({ beam_splitter_contamination: v })} disabled={ro} />
                <div className="text-xs mt-1 mb-1">점검결과:</div>
                <EditableTextarea value={data.beam_splitter_result} onChange={v => upd({ beam_splitter_result: v })} disabled={ro} rows={2} />
              </td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="spectrometer" defaultLabel="Spectrometer 형상/신호 상태" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), spectrometer: v } })} ro={ro} />
              <td className={tdCls}>
                <div className="text-xs mb-1">상태:</div>
                <EditableText value={data.spectrometer_status} onChange={v => upd({ spectrometer_status: v })} disabled={ro} />
                <div className="text-xs mt-1 mb-1">점검결과:</div>
                <EditableTextarea value={data.spectrometer_result} onChange={v => upd({ spectrometer_result: v })} disabled={ro} rows={2} />
              </td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="uv_lamp" defaultLabel="UV Lamp" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), uv_lamp: v } })} ro={ro} />
              <td className={tdCls}><EditableTextarea value={data.uv_lamp_note} onChange={v => upd({ uv_lamp_note: v })} disabled={ro} rows={2} /></td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="cooling_fan" defaultLabel="냉각 팬" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), cooling_fan: v } })} ro={ro} />
              <td className={tdCls}>
                <span className="text-xs">동작 상태: </span>
                <EditableText value={data.cooling_fan_status} onChange={v => upd({ cooling_fan_status: v })} disabled={ro} />
              </td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="smps" defaultLabel="5V, 12V, 24V SMPS" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), smps: v } })} ro={ro} />
              <td className={tdCls}><EditableTextarea value={data.smps_note} onChange={v => upd({ smps_note: v })} disabled={ro} rows={2} /></td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            <tr>
              <LabelCell fieldKey="wiring" defaultLabel="배선 결선 상태" overrides={data.detail_label_overrides} onChange={(v) => upd({ detail_label_overrides: { ...(data.detail_label_overrides || {}), wiring: v } })} ro={ro} />
              <td className={tdCls}>
                <span className="text-xs">단락, 단선, 연결상태: </span>
                <EditableText value={data.wiring_status} onChange={v => upd({ wiring_status: v })} disabled={ro} />
              </td>
              {!ro && <td className={tdCls}></td>}
            </tr>
            {(data.detail_extra_rows || []).map((row, idx) => (
              <tr key={row.id}>
                <td className={cn(thCls, "w-1/3")}>
                  {ro ? (
                    <span className="text-xs">{row.label || "—"}</span>
                  ) : (
                    <Input className="h-7 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent font-semibold" value={row.label} placeholder="항목명" onChange={(e) => {
                      const rows = [...(data.detail_extra_rows || [])];
                      rows[idx] = { ...rows[idx], label: e.target.value };
                      upd({ detail_extra_rows: rows });
                    }} />
                  )}
                </td>
                <td className={tdCls}>
                  <EditableTextarea value={row.value} onChange={(v) => {
                    const rows = [...(data.detail_extra_rows || [])];
                    rows[idx] = { ...rows[idx], value: v };
                    upd({ detail_extra_rows: rows });
                  }} disabled={ro} rows={2} />
                </td>
                {!ro && (
                  <td className={cn(tdCls, "w-10 text-center")}>
                    <button onClick={() => upd({ detail_extra_rows: (data.detail_extra_rows || []).filter((_, i) => i !== idx) })} className="text-destructive hover:text-destructive/80" aria-label="행 삭제">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!ro && (
          <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => upd({ detail_extra_rows: [...(data.detail_extra_rows || []), { id: crypto.randomUUID(), label: "", value: "" }] })}>
            <Plus className="h-3 w-3" /> 행 추가
          </Button>
        )}
      </div>

      {/* Probe section */}
      <div>
        <h3 className="text-sm font-bold mb-2">프로브 점검</h3>
        <table className="w-full border-collapse">
          <tbody>
            {[
              { fieldKey: "probe_exterior", defaultLabel: "외관 상태", value: data.probe_exterior, set: (v: string) => upd({ probe_exterior: v }) },
              { fieldKey: "probe_temp_sensor", defaultLabel: "온도센서", value: data.probe_temp_sensor, set: (v: string) => upd({ probe_temp_sensor: v }) },
              { fieldKey: "probe_corner_mirror", defaultLabel: "코너 큐브 미러", value: data.probe_corner_mirror, set: (v: string) => upd({ probe_corner_mirror: v }) },
              { fieldKey: "probe_length", defaultLabel: "프로브 길이", value: data.probe_length, set: (v: string) => upd({ probe_length: v }), placeholder: "mm" },
              { fieldKey: "probe_measure_section", defaultLabel: "측정구간", value: data.probe_measure_section, set: (v: string) => upd({ probe_measure_section: v }) },
              { fieldKey: "probe_gas_direction", defaultLabel: "가스방향", value: data.probe_gas_direction, set: (v: string) => upd({ probe_gas_direction: v }) },
            ].map((r) => (
              <tr key={r.fieldKey}>
                <LabelCell fieldKey={r.fieldKey} defaultLabel={r.defaultLabel} overrides={data.probe_label_overrides} onChange={(v) => upd({ probe_label_overrides: { ...(data.probe_label_overrides || {}), [r.fieldKey]: v } })} ro={ro} className="w-[30%]" />
                <td className={tdCls}><EditableText value={r.value} onChange={r.set} disabled={ro} placeholder={(r as any).placeholder} /></td>
                {!ro && <td className={cn(tdCls, "w-10")}></td>}
              </tr>
            ))}
            {(data.probe_extra_rows || []).map((row, idx) => (
              <tr key={row.id}>
                <td className={cn(thCls, "w-[30%]")}>
                  {ro ? (
                    <span className="text-xs">{row.label || "—"}</span>
                  ) : (
                    <Input className="h-7 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent font-semibold" value={row.label} placeholder="항목명" onChange={(e) => {
                      const rows = [...(data.probe_extra_rows || [])];
                      rows[idx] = { ...rows[idx], label: e.target.value };
                      upd({ probe_extra_rows: rows });
                    }} />
                  )}
                </td>
                <td className={tdCls}>
                  <EditableText value={row.value} onChange={(v) => {
                    const rows = [...(data.probe_extra_rows || [])];
                    rows[idx] = { ...rows[idx], value: v };
                    upd({ probe_extra_rows: rows });
                  }} disabled={ro} />
                </td>
                {!ro && (
                  <td className={cn(tdCls, "w-10 text-center")}>
                    <button onClick={() => upd({ probe_extra_rows: (data.probe_extra_rows || []).filter((_, i) => i !== idx) })} className="text-destructive hover:text-destructive/80" aria-label="행 삭제">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!ro && (
          <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => upd({ probe_extra_rows: [...(data.probe_extra_rows || []), { id: crypto.randomUUID(), label: "", value: "" }] })}>
            <Plus className="h-3 w-3" /> 행 추가
          </Button>
        )}
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-sm font-bold mb-2">점검 사항 요약</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr><th className={thCls} colSpan={ro ? 3 : 4}>점검 사항 요약</th></tr>
          </thead>
          <tbody>
            {(() => {
              const defaults = ["1차 점검 결과 요약", "분광기 얼라인 확인", "프로브 얼라인먼트 확인", "표준가스 교정"];
              const labels = data.summary_labels && data.summary_labels.length >= defaults.length
                ? data.summary_labels
                : [...defaults, ...((data.summary_labels || []).slice(defaults.length))];
              const total = Math.max(labels.length, data.summary_items.length, defaults.length);
              const rows = [];
              for (let idx = 0; idx < total; idx++) {
                const labelDefault = idx < defaults.length ? defaults[idx] : "";
                const currentLabel = data.summary_labels?.[idx] ?? labelDefault;
                rows.push(
                  <tr key={idx}>
                    <td className={cn(thCls, "w-8 text-center")}>{idx + 1}</td>
                    <td className={cn(thCls, "w-1/3")}>
                      {ro ? (
                        <span className="text-xs">{currentLabel || "—"}</span>
                      ) : (
                        <Input className="h-7 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent font-semibold" value={currentLabel} placeholder="항목명" onChange={(e) => {
                          const arr = [...(data.summary_labels || defaults.slice())];
                          while (arr.length <= idx) arr.push(idx < defaults.length ? defaults[arr.length] : "");
                          arr[idx] = e.target.value;
                          upd({ summary_labels: arr });
                        }} />
                      )}
                    </td>
                    <td className={tdCls}>
                      <EditableTextarea value={data.summary_items[idx] || ""} onChange={v => updateSummary(idx, v)} disabled={ro} rows={2} />
                    </td>
                    {!ro && (
                      <td className={cn(tdCls, "w-10 text-center")}>
                        {idx >= defaults.length && (
                          <button onClick={() => {
                            const items = data.summary_items.filter((_, i) => i !== idx);
                            const lbls = (data.summary_labels || defaults.slice()).filter((_, i) => i !== idx);
                            upd({ summary_items: items, summary_labels: lbls });
                          }} className="text-destructive hover:text-destructive/80" aria-label="행 삭제">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
        {!ro && (
          <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => {
            const defaults = ["1차 점검 결과 요약", "분광기 얼라인 확인", "프로브 얼라인먼트 확인", "표준가스 교정"];
            const lbls = [...(data.summary_labels && data.summary_labels.length ? data.summary_labels : defaults.slice()), ""];
            const items = [...data.summary_items, ""];
            upd({ summary_labels: lbls, summary_items: items });
          }}>
            <Plus className="h-3 w-3" /> 행 추가
          </Button>
        )}
      </div>

      {/* ═══ PAGES 6-12: Photo Sections (2-column layout) ═══ */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">사진 첨부</h3>
          {!ro && (
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => upd({ photo_extra_slots: [...(data.photo_extra_slots || []), { key: `extra_${crypto.randomUUID()}`, title: "" }] })}>
              <Plus className="h-3 w-3" /> 사진 항목 추가
            </Button>
          )}
        </div>
        {[...PHOTO_SLOTS, ...((data.photo_extra_slots || []).map(s => ({ key: s.key, title: s.title })))].map((slot, slotIdx) => {
          const isExtra = slotIdx >= PHOTO_SLOTS.length;
          const overrideTitle = data.photo_slot_label_overrides?.[slot.key];
          const displayTitle = isExtra ? slot.title : (overrideTitle ?? slot.title);
          const slotPhotos = (data.photos || []).filter(p => p.page_slot === slot.key);
          // Group photos into rows of 2
          const photoRows: Array<[ReportPhoto | null, ReportPhoto | null]> = [];
          for (let i = 0; i < slotPhotos.length; i += 2) {
            photoRows.push([slotPhotos[i] || null, slotPhotos[i + 1] || null]);
          }
          return (
            <div key={slot.key} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                {ro ? (
                  <p className="text-xs font-semibold flex-1">{displayTitle}</p>
                ) : (
                  <Input
                    className="h-7 text-xs font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent flex-1"
                    value={displayTitle}
                    placeholder="제목"
                    onChange={(e) => {
                      if (isExtra) {
                        const slots = (data.photo_extra_slots || []).map(s => s.key === slot.key ? { ...s, title: e.target.value } : s);
                        upd({ photo_extra_slots: slots });
                      } else {
                        upd({ photo_slot_label_overrides: { ...(data.photo_slot_label_overrides || {}), [slot.key]: e.target.value } });
                      }
                    }}
                  />
                )}
                {!ro && isExtra && (
                  <button onClick={() => {
                    const slots = (data.photo_extra_slots || []).filter(s => s.key !== slot.key);
                    const photos = (data.photos || []).filter(p => p.page_slot !== slot.key);
                    upd({ photo_extra_slots: slots, photos });
                  }} className="text-destructive hover:text-destructive/80" aria-label="항목 삭제">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {/* 2-column grid rows */}
              {photoRows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-2 gap-3">
                  {row.map((photo, colIdx) => (
                    <div key={photo?.id || `empty-${rowIdx}-${colIdx}`}>
                      {photo ? (
                        <div className="relative group border rounded overflow-hidden">
                          <img src={resolvePhotoUrl(photo.file_url)} alt={photo.caption || displayTitle} className="w-full h-40 object-contain bg-muted/30 cursor-zoom-in" onClick={() => setLightboxUrl(resolvePhotoUrl(photo.file_url))} />
                          {!ro && (
                            <button
                              onClick={() => removePhoto(photo.id)}
                              className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <div className="p-2">
                            <p className="text-[10px] font-medium text-muted-foreground mb-1">설명</p>
                            {!ro ? (
                              <Textarea
                                className="text-xs min-h-[40px] resize-none"
                                placeholder="사진 설명을 입력하세요"
                                value={photo.caption}
                                onChange={e => updatePhotoCaption(photo.id, e.target.value)}
                                rows={2}
                              />
                            ) : (
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{photo.caption || "—"}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 border-2 border-dashed rounded flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">빈 칸</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {/* Upload area */}
              {!ro && (
                <label
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add("bg-muted/50"); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("bg-muted/50"); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("bg-muted/50");
                    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                    if (dropped.length === 0) return;
                    const dt = new DataTransfer();
                    dropped.forEach(f => dt.items.add(f));
                    handlePhotoUpload(slot.key, dt.files);
                  }}
                >
                  <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">드래그 또는 클릭하여 사진 추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handlePhotoUpload(slot.key, e.target.files)}
                  />
                </label>
              )}
              {slotPhotos.length === 0 && ro && (
                <p className="text-xs text-muted-foreground text-center py-4">첨부된 사진 없음</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-filled info footer */}
      <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
        <p>관리번호: {inspection.manage_no} | 건명: {inspection.project_name}</p>
        <p>반출장비: {equipment.equipment_name} | 수량: {equipment.qty_set} set</p>
        <p>점검자: {inspectorName} | 작성일: {createdDate}</p>
      </div>
    </div>
  );
}

/* ─── Editable inline text ─── */
function EditableText({ value, onChange, disabled, placeholder, type }: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  if (disabled || !onChange) {
    return <span className="text-xs">{value || "—"}</span>;
  }
  return (
    <Input
      type={type || "text"}
      className="h-7 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function EditableTextarea({ value, onChange, disabled, rows }: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  rows?: number;
}) {
  if (disabled || !onChange) {
    return <p className="text-xs whitespace-pre-wrap min-h-[40px]">{value || "—"}</p>;
  }
  return (
    <Textarea
      className="text-xs border-0 rounded-none px-0 focus-visible:ring-0 bg-transparent resize-none"
      rows={rows || 3}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

/* ─── Editable label cell (for section headers) ─── */
function LabelCell({ fieldKey, defaultLabel, overrides, onChange, ro, className }: {
  fieldKey: string;
  defaultLabel: string;
  overrides?: Record<string, string>;
  onChange: (v: string) => void;
  ro: boolean;
  className?: string;
}) {
  const current = overrides?.[fieldKey] ?? defaultLabel;
  return (
    <td className={cn(thCls, className)}>
      {ro ? (
        <span className="text-xs">{current}</span>
      ) : (
        <Input
          className="h-7 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent font-semibold"
          value={current}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </td>
  );
}

