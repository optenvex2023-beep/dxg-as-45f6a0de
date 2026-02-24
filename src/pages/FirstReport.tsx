import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import type { OutboundInspection, OutboundEquipmentItem, InspectionReport, InspectionReportData, InspectionCheckItem, ReplacementPart, ReportPhoto, InspectionResultOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileDown, Upload, FileText, Check, Send, Plus, Trash2, ImagePlus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { exportReportToWord } from "@/lib/wordExport";
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

const RESULT_OPTIONS: InspectionResultOption[] = ["사용 가능", "추후 교체 권장", "직접 기입"];

export default function FirstReport() {
  const {
    inspections, currentUser, reports,
    getReportsForInspection, addReport, updateReport, completeReport,
    requestApproval, approveReport, addReportVersion, getReportVersions,
  } = useApp();

  const [selectedInspectionId, setSelectedInspectionId] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isManufacturing = currentUser?.department === "제조본부";
  const isQC = currentUser?.department === "품질본부";
  const isAdmin = currentUser?.role_category === "관리자" && currentUser.department === "환경영업팀";
  const canApprove = isQC || isAdmin;

  const eligibleInspections = useMemo(() =>
    inspections.filter(i => isAtLeastInbound(i.status) || i.due_warning),
    [inspections]
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

  const handleInspectionChange = (id: string) => {
    setSelectedInspectionId(id);
    setSelectedEquipmentId("");
  };

  const handleComplete = () => {
    if (!existingReport) return;
    if (isManufacturing) {
      updateReport(existingReport.id, {
        inspection_data: { ...existingReport.inspection_data, department_head: "김영기" },
      });
    }
    completeReport(existingReport.id);
    toast.success("1차 점검보고서가 완료되었습니다.");
  };

  const handleApprove = () => {
    if (!existingReport) return;
    approveReport(existingReport.id, currentUser?.name || "");
    toast.success("보고서가 승인되었습니다.");
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
            <label className="text-xs font-medium text-muted-foreground">장비 선택 (1 장비 = 1 보고서)</label>
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
            <DocumentView
              inspection={selectedInspection}
              equipment={selectedEquipment}
              report={existingReport}
              canEdit={isManufacturing && existingReport.status === "draft"}
              canApprove={canApprove && existingReport.status === "approval_requested"}
              isManufacturing={isManufacturing}
              onUpdate={updateReport}
              onComplete={handleComplete}
              onRequestApproval={() => { requestApproval(existingReport.id); toast.success("승인요청이 전송되었습니다."); }}
              onApprove={handleApprove}
              onAddVersion={addReportVersion}
              getVersions={getReportVersions}
              currentUserName={currentUser?.name || ""}
            />
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-0">
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
    // Auto-fill inbound_date from inspection
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
    });
  };

  return (
    <div className="p-6 pt-2 space-y-6">
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
      />
      <Button onClick={handleSubmit} className="w-full">임시저장</Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Document View (existing report)
   ══════════════════════════════════════════════════════════════ */
function DocumentView({
  inspection, equipment, report, canEdit, canApprove, isManufacturing,
  onUpdate, onComplete, onRequestApproval, onApprove,
  onAddVersion, getVersions, currentUserName,
}: {
  inspection: OutboundInspection;
  equipment: OutboundEquipmentItem;
  report: InspectionReport;
  canEdit: boolean;
  canApprove: boolean;
  isManufacturing: boolean;
  onUpdate: (id: string, updates: Partial<InspectionReport>) => void;
  onComplete: () => void;
  onRequestApproval: () => void;
  onApprove: () => void;
  onAddVersion: (reportId: string, fileName: string, fileUrl: string, uploadedBy: string) => void;
  getVersions: (reportId: string) => { id: string; version_number: number; file_name: string; uploaded_at: string; uploaded_by: string }[];
  currentUserName: string;
}) {
  const isLocked = report.status !== "draft";
  const editable = canEdit && !isLocked;

  const [serialNo, setSerialNo] = useState(report.serial_numbers[equipment.id] || "");
  const [data, setData] = useState<InspectionReportData>(() => {
    const d = report.inspection_data || createDefaultReportData();
    // Ensure inbound_date is populated from inspection if not overridden
    if (!d.inbound_date && inspection.inbound_date) {
      d.inbound_date = inspection.inbound_date;
    }
    return d;
  });
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiOriginal, setAiOriginal] = useState<Record<string, string>>({});
  const [aiCorrected, setAiCorrected] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEditMode, setAiEditMode] = useState(false);
  const versions = getVersions(report.id);

  const upd = (patch: Partial<InspectionReportData>) => setData(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    onUpdate(report.id, {
      serial_numbers: { [equipment.id]: serialNo },
      inspection_data: { ...data, serial_no: serialNo },
    });
    toast.success("임시저장되었습니다.");
  };

  const handleWordDownload = async () => {
    const updatedReport = { ...report, serial_numbers: { [equipment.id]: serialNo }, inspection_data: data };
    await exportReportToWord(inspection, updatedReport, "1차 점검보고서");
    toast.success("Word 파일이 다운로드되었습니다.");
  };

  const handlePdfDownload = async () => {
    // Generate Word first, then inform user to convert
    const updatedReport = { ...report, serial_numbers: { [equipment.id]: serialNo }, inspection_data: data };
    await exportReportToWord(inspection, updatedReport, "1차 점검보고서");
    toast.info("Word 파일이 다운로드되었습니다. Word에서 열어 PDF로 저장해 주세요.", { duration: 5000 });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAddVersion(report.id, file.name, url, currentUserName);
      toast.success(`수정본 v${versions.length + 1}이 업로드되었습니다.`);
    }
  };

  /* ─── AI Proofreading ─── */
  const collectTextFields = (): Record<string, string> => {
    const fields: Record<string, string> = {};
    data.check_items.forEach((item, idx) => {
      if (item.action) fields[`check_action_${idx}`] = item.action;
      if (item.action_result) fields[`check_result_${idx}`] = item.action_result;
      if (item.inspection_result_option === "직접 기입" && item.inspection_result_detail) {
        fields[`check_detail_${idx}`] = item.inspection_result_detail;
      }
    });
    if (data.detail_notes) fields.detail_notes = data.detail_notes;
    if (data.main_control_cpu) fields.main_control_cpu = data.main_control_cpu;
    if (data.optics_window_lens) fields.optics_window_lens = data.optics_window_lens;
    if (data.beam_splitter_contamination) fields.beam_splitter_contamination = data.beam_splitter_contamination;
    if (data.beam_splitter_result) fields.beam_splitter_result = data.beam_splitter_result;
    if (data.spectrometer_status) fields.spectrometer_status = data.spectrometer_status;
    if (data.spectrometer_result) fields.spectrometer_result = data.spectrometer_result;
    if (data.site_situation) fields.site_situation = data.site_situation;
    if (data.client_request) fields.client_request = data.client_request;
    data.summary_items.forEach((s, i) => { if (s) fields[`summary_${i}`] = s; });
    return fields;
  };

  const handleAiReview = async () => {
    const fields = collectTextFields();
    if (Object.keys(fields).length === 0) {
      toast.error("교정할 텍스트가 없습니다.");
      return;
    }
    setAiOriginal(fields);
    setAiLoading(true);
    setAiModalOpen(true);

    // MVP simulation - in production this would call an edge function
    toast.info("AI 기능을 사용하려면 관리자 API 설정이 필요합니다.", { duration: 4000 });
    setTimeout(() => {
      const corrected: Record<string, string> = {};
      for (const [key, val] of Object.entries(fields)) {
        corrected[key] = val
          .replace(/\s{2,}/g, " ")
          .replace(/\s+:/g, " :")
          .replace(/\s+\./g, ".")
          .trim();
      }
      setAiCorrected(corrected);
      setAiLoading(false);
    }, 1500);
  };

  const applyAiCorrections = (corrected: Record<string, string>) => {
    const newData = { ...data };
    const newItems = [...newData.check_items];
    const newSummary = [...newData.summary_items];

    for (const [key, val] of Object.entries(corrected)) {
      if (key.startsWith("check_action_")) {
        const idx = parseInt(key.replace("check_action_", ""));
        newItems[idx] = { ...newItems[idx], action: val };
      } else if (key.startsWith("check_result_")) {
        const idx = parseInt(key.replace("check_result_", ""));
        newItems[idx] = { ...newItems[idx], action_result: val };
      } else if (key.startsWith("check_detail_")) {
        const idx = parseInt(key.replace("check_detail_", ""));
        newItems[idx] = { ...newItems[idx], inspection_result_detail: val };
      } else if (key.startsWith("summary_")) {
        const idx = parseInt(key.replace("summary_", ""));
        newSummary[idx] = val;
      } else if (key === "detail_notes") newData.detail_notes = val;
      else if (key === "main_control_cpu") newData.main_control_cpu = val;
      else if (key === "optics_window_lens") newData.optics_window_lens = val;
      else if (key === "beam_splitter_contamination") newData.beam_splitter_contamination = val;
      else if (key === "beam_splitter_result") newData.beam_splitter_result = val;
      else if (key === "spectrometer_status") newData.spectrometer_status = val;
      else if (key === "spectrometer_result") newData.spectrometer_result = val;
      else if (key === "site_situation") newData.site_situation = val;
      else if (key === "client_request") newData.client_request = val;
    }

    newData.check_items = newItems;
    newData.summary_items = newSummary;
    setData(newData);
    setAiModalOpen(false);
    setAiEditMode(false);
    toast.success("AI 교정이 적용되었습니다.");
  };

  const statusLabel: Record<string, string> = { draft: "작성중", completed: "완료", approval_requested: "승인대기", approved: "승인완료" };

  return (
    <div className="space-y-4">
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
        />
      </div>

      {/* Document management */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-sm font-medium">문서 관리</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleWordDownload}>
            <FileDown className="h-3.5 w-3.5" /> Word 다운로드
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handlePdfDownload}>
            <FileDown className="h-3.5 w-3.5" /> PDF 다운로드
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
            <label className="cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> 수정본 업로드
              <input type="file" accept=".docx,.doc" className="hidden" onChange={handleFileUpload} />
            </label>
          </Button>
          {isManufacturing && editable && (
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleAiReview}>
              <Sparkles className="h-3.5 w-3.5" /> AI 검토
            </Button>
          )}
        </div>
        {versions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">업로드 이력</p>
            {versions.map(v => (
              <div key={v.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>v{v.version_number}: {v.file_name}</span>
                <span className="text-[10px]">({v.uploaded_by}, {v.uploaded_at.split("T")[0]})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-end gap-2">
        {editable && (
          <>
            <Button variant="outline" onClick={handleSave}>임시저장</Button>
            <Button onClick={onComplete} className="gap-1"><Check className="h-4 w-4" /> 완료</Button>
          </>
        )}
        {canEdit && report.status === "completed" && (
          <Button onClick={onRequestApproval} className="gap-1"><Send className="h-4 w-4" /> 승인요청</Button>
        )}
        {canApprove && report.status === "approval_requested" && (
          <Button onClick={onApprove} className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4" /> 승인
          </Button>
        )}
        {!editable && !canApprove && (
          <Button variant="outline" onClick={handleWordDownload} className="gap-1">
            <FileDown className="h-4 w-4" /> Word 다운로드
          </Button>
        )}
      </div>

      {/* AI Review Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> AI 문장 교정
            </DialogTitle>
          </DialogHeader>
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-sm text-muted-foreground">AI가 검토 중입니다...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="font-semibold text-center py-2 bg-muted rounded">기존 작성본</div>
                <div className="font-semibold text-center py-2 bg-primary/10 rounded">AI 교정본</div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto space-y-3">
                {Object.entries(aiOriginal).map(([key, original]) => {
                  const corrected = aiCorrected[key] || original;
                  const changed = original !== corrected;
                  return (
                    <div key={key} className="grid grid-cols-2 gap-4">
                      <div className={cn("text-xs p-2 rounded border", changed ? "bg-destructive/5 border-destructive/20" : "border-border")}>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">{key}</p>
                        {original}
                      </div>
                      <div className={cn("text-xs p-2 rounded border", changed ? "bg-primary/5 border-primary/20" : "border-border")}>
                        {aiEditMode ? (
                          <textarea
                            className="w-full text-xs bg-transparent border-0 resize-none focus:outline-none min-h-[40px]"
                            value={corrected}
                            onChange={e => setAiCorrected(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        ) : (
                          <>
                            <p className="text-[10px] font-medium text-muted-foreground mb-1">{key}</p>
                            {corrected}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => { setAiModalOpen(false); setAiEditMode(false); }}>
                  취소
                </Button>
                {!aiEditMode && (
                  <Button variant="outline" size="sm" onClick={() => setAiEditMode(true)}>
                    수정 후 적용
                  </Button>
                )}
                <Button size="sm" onClick={() => applyAiCorrections(aiCorrected)}>
                  {aiEditMode ? "완료" : "AI 수정안 적용"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Template Body — Document-style layout matching Word template
   ══════════════════════════════════════════════════════════════ */
function TemplateBody({
  inspection, equipment, serialNo, onSerialChange,
  data, onDataChange, inspectorName, createdDate, disabled,
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

  const handlePhotoUpload = (slotKey: string, files: FileList | null) => {
    if (ro || !files) return;
    const photos = [...(data.photos || [])];
    Array.from(files).forEach((file, i) => {
      const url = URL.createObjectURL(file);
      photos.push({
        id: crypto.randomUUID(),
        report_id: "",
        file_url: url,
        caption: "",
        page_slot: slotKey,
        order_index: photos.filter(p => p.page_slot === slotKey).length + i,
        uploaded_by: inspectorName,
        uploaded_at: new Date().toISOString(),
      });
    });
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

      {/* Inspector table */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={thCls} style={{ width: "33%" }}>점검자</td>
            <td className={thCls} style={{ width: "33%" }}>부서장</td>
            <td className={thCls}>품질본부 확인</td>
          </tr>
          <tr>
            <td className={tdCls}>{inspectorName}</td>
            <td className={tdCls}>{data.department_head || ""}</td>
            <td className={tdCls}></td>
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
              <th className={thCls}>측정가스</th>
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
            </tr>
          </thead>
          <tbody>
            {data.check_items.map((item, idx) => (
              <tr key={idx}>
                <td className={cn(tdCls, "font-medium")}>{item.category}</td>
                <td className={tdCls}>{item.item}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
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
            <tr><th className={thCls} colSpan={2}>기타 특이사항 (세부 설명)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className={cn(thCls, "w-1/3")}>Main Control CPU Board</td>
              <td className={tdCls}>
                <EditableTextarea value={data.main_control_cpu} onChange={v => upd({ main_control_cpu: v })} disabled={ro} rows={2} />
              </td>
            </tr>
            <tr>
              <td className={thCls}>광학부품 (윈도우, 볼록렌즈)</td>
              <td className={tdCls}>
                <EditableTextarea value={data.optics_window_lens} onChange={v => upd({ optics_window_lens: v })} disabled={ro} rows={2} />
              </td>
            </tr>
            <tr>
              <td className={thCls}>광학부품 (Beam Splitter)</td>
              <td className={tdCls}>
                <div className="text-xs mb-1">오염 상태:</div>
                <EditableText value={data.beam_splitter_contamination} onChange={v => upd({ beam_splitter_contamination: v })} disabled={ro} />
                <div className="text-xs mt-1 mb-1">점검결과:</div>
                <EditableText value={data.beam_splitter_result} onChange={v => upd({ beam_splitter_result: v })} disabled={ro} />
              </td>
            </tr>
            <tr>
              <td className={thCls}>Spectrometer 형상/신호 상태</td>
              <td className={tdCls}>
                <div className="text-xs mb-1">상태:</div>
                <EditableText value={data.spectrometer_status} onChange={v => upd({ spectrometer_status: v })} disabled={ro} />
                <div className="text-xs mt-1 mb-1">점검결과:</div>
                <EditableText value={data.spectrometer_result} onChange={v => upd({ spectrometer_result: v })} disabled={ro} />
              </td>
            </tr>
            <tr>
              <td className={thCls}>UV Lamp</td>
              <td className={tdCls}><EditableText value={data.uv_lamp_note} onChange={v => upd({ uv_lamp_note: v })} disabled={ro} /></td>
            </tr>
            <tr>
              <td className={thCls}>냉각 팬</td>
              <td className={tdCls}>
                <span className="text-xs">동작 상태: </span>
                <EditableText value={data.cooling_fan_status} onChange={v => upd({ cooling_fan_status: v })} disabled={ro} />
              </td>
            </tr>
            <tr>
              <td className={thCls}>5V, 12V, 24V SMPS</td>
              <td className={tdCls}><EditableText value={data.smps_note} onChange={v => upd({ smps_note: v })} disabled={ro} /></td>
            </tr>
            <tr>
              <td className={thCls}>배선 결선 상태</td>
              <td className={tdCls}>
                <span className="text-xs">단락, 단선, 연결상태: </span>
                <EditableText value={data.wiring_status} onChange={v => upd({ wiring_status: v })} disabled={ro} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Probe section */}
      <div>
        <h3 className="text-sm font-bold mb-2">프로브 점검</h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr><td className={thCls} style={{ width: "30%" }}>외관 상태</td><td className={tdCls}><EditableText value={data.probe_exterior} onChange={v => upd({ probe_exterior: v })} disabled={ro} /></td></tr>
            <tr><td className={thCls}>온도센서</td><td className={tdCls}><EditableText value={data.probe_temp_sensor} onChange={v => upd({ probe_temp_sensor: v })} disabled={ro} /></td></tr>
            <tr><td className={thCls}>코너 큐브 미러</td><td className={tdCls}><EditableText value={data.probe_corner_mirror} onChange={v => upd({ probe_corner_mirror: v })} disabled={ro} /></td></tr>
            <tr><td className={thCls}>프로브 길이</td><td className={tdCls}><EditableText value={data.probe_length} onChange={v => upd({ probe_length: v })} disabled={ro} /></td></tr>
            <tr><td className={thCls}>측정구간</td><td className={tdCls}><EditableText value={data.probe_measure_section} onChange={v => upd({ probe_measure_section: v })} disabled={ro} /></td></tr>
            <tr><td className={thCls}>가스방향</td><td className={tdCls}><EditableText value={data.probe_gas_direction} onChange={v => upd({ probe_gas_direction: v })} disabled={ro} /></td></tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-sm font-bold mb-2">점검 사항 요약</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr><th className={thCls} colSpan={3}>점검 사항 요약</th></tr>
          </thead>
          <tbody>
            {["1차 점검 결과 요약", "분광기 얼라인 확인", "프로브 얼라인먼트 확인", "표준가스 교정"].map((label, idx) => (
              <tr key={idx}>
                <td className={cn(thCls, "w-8 text-center")}>{idx + 1}</td>
                <td className={cn(thCls, "w-1/3")}>{label}</td>
                <td className={tdCls}>
                  <EditableText value={data.summary_items[idx] || ""} onChange={v => updateSummary(idx, v)} disabled={ro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ PAGES 6-12: Photo Sections ═══ */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold">사진 첨부</h3>
        {PHOTO_SLOTS.map(slot => {
          const slotPhotos = (data.photos || []).filter(p => p.page_slot === slot.key);
          return (
            <div key={slot.key} className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold">{slot.title}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {slotPhotos.map(photo => (
                  <div key={photo.id} className="relative group border rounded overflow-hidden">
                    <img src={photo.file_url} alt={photo.caption || slot.title} className="w-full h-32 object-cover" />
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
                ))}
                {!ro && (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 transition-colors">
                    <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">드래그 또는 클릭</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handlePhotoUpload(slot.key, e.target.files)}
                    />
                  </label>
                )}
              </div>
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
