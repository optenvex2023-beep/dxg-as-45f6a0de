import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import type { OutboundInspection, InspectionReport } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FileDown, Upload, FileText, Check, Send } from "lucide-react";
import { toast } from "sonner";
import { exportReportToWord } from "@/lib/wordExport";

const statusOrder = ["확인필요", "반출예정", "반출완료", "입고완료", "1차 점검완료", "최종 점검완료", "설치 완료", "납기유의"];

function isAtLeastInbound(status: string): boolean {
  const idx = statusOrder.indexOf(status);
  const inboundIdx = statusOrder.indexOf("입고완료");
  return idx >= inboundIdx;
}

export default function FirstReport() {
  const { inspections, currentUser, reports, getReportsForInspection, addReport, updateReport, completeReport, requestApproval, approveReport, addReportVersion, getReportVersions } = useApp();
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isManufacturing = currentUser?.department === "제조본부";
  const isQC = currentUser?.department === "품질본부";
  const isAdmin = currentUser?.role_category === "관리자" && currentUser.department === "환경영업팀";
  const canApprove = isQC || isAdmin;

  // Inspections that are at least "입고완료"
  const eligibleInspections = useMemo(() =>
    inspections.filter(i => isAtLeastInbound(i.status) || i.due_warning),
    [inspections]
  );

  const selectedInspection = useMemo(() =>
    inspections.find(i => i.id === selectedInspectionId) ?? null,
    [inspections, selectedInspectionId]
  );

  const existingReports = useMemo(() =>
    selectedInspectionId ? getReportsForInspection(selectedInspectionId, "first") : [],
    [selectedInspectionId, getReportsForInspection]
  );

  const activeReport = existingReports.length > 0 ? existingReports[existingReports.length - 1] : null;

  return (
    <div className="pb-20 space-y-4">
      <h1 className="text-xl font-semibold">1차 점검보고서</h1>

      {/* Inspection selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">대상 건 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedInspectionId} onValueChange={setSelectedInspectionId}>
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
        </CardContent>
      </Card>

      {/* Show report or create button */}
      {selectedInspection && (
        <>
          {activeReport ? (
            <ReportView
              inspection={selectedInspection}
              report={activeReport}
              canEdit={isManufacturing && (activeReport.status === "draft")}
              canApprove={canApprove && activeReport.status === "approval_requested"}
              onUpdate={updateReport}
              onComplete={() => { completeReport(activeReport.id); toast.success("1차 점검보고서가 완료되었습니다."); }}
              onRequestApproval={() => { requestApproval(activeReport.id); toast.success("승인요청이 전송되었습니다."); }}
              onApprove={() => { approveReport(activeReport.id, currentUser?.name || ""); toast.success("보고서가 승인되었습니다."); }}
              onAddVersion={addReportVersion}
              getVersions={getReportVersions}
              currentUserName={currentUser?.name || ""}
              reportTitle="1차 점검보고서"
            />
          ) : (
            isManufacturing && (
              <div className="flex justify-center py-12">
                <Button onClick={() => setReportModalOpen(true)} className="gap-2">
                  <FileText className="h-4 w-4" /> 1차 점검보고서 작성
                </Button>
              </div>
            )
          )}
          {!activeReport && !isManufacturing && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                아직 1차 점검보고서가 작성되지 않았습니다.
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create report modal */}
      {selectedInspection && (
        <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>1차 점검보고서 작성</DialogTitle>
            </DialogHeader>
            <CreateReportForm
              inspection={selectedInspection}
              reportType="first"
              onSubmit={(data) => {
                addReport(data);
                setReportModalOpen(false);
                toast.success("보고서가 임시저장되었습니다.");
              }}
              inspectorName={currentUser?.name || ""}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── Create Report Form ─── */
function CreateReportForm({
  inspection,
  reportType,
  onSubmit,
  inspectorName,
}: {
  inspection: OutboundInspection;
  reportType: "first" | "final";
  onSubmit: (data: Omit<InspectionReport, "id" | "created_at" | "updated_at" | "completed_at" | "approved_at" | "approved_by">) => void;
  inspectorName: string;
}) {
  const [serialNumbers, setSerialNumbers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    inspection.equipment_items.forEach(item => {
      map[item.id] = item.serial_no || "";
    });
    return map;
  });
  const [inspectionResult, setInspectionResult] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = () => {
    onSubmit({
      inspection_id: inspection.id,
      report_type: reportType,
      status: "draft",
      serial_numbers: serialNumbers,
      inspection_result: inspectionResult,
      special_notes: specialNotes,
      inspector_name: inspectorName,
      created_date: today,
    });
  };

  return (
    <div className="space-y-5">
      {/* Section A: Basic info */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-primary">Section A: 기본정보</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-muted-foreground">관리번호</label>
            <Input className="h-8 text-xs bg-muted" value={inspection.manage_no} disabled />
          </div>
          <div>
            <label className="text-muted-foreground">건명</label>
            <Input className="h-8 text-xs bg-muted" value={inspection.project_name} disabled />
          </div>
        </div>
      </div>

      {/* Section B: Serial Numbers */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-primary">Section B: Serial No 입력</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">반출장비</TableHead>
              <TableHead className="text-xs w-20">수량(Set)</TableHead>
              <TableHead className="text-xs">Serial No</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspection.equipment_items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="text-xs">{item.equipment_name}</TableCell>
                <TableCell className="text-xs">{item.qty_set}</TableCell>
                <TableCell>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Serial No 입력"
                    value={serialNumbers[item.id] || ""}
                    onChange={(e) => setSerialNumbers(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Section C: Results */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-primary">Section C: 점검결과 입력</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">점검 결과</label>
            <Textarea className="text-xs" rows={4} value={inspectionResult} onChange={e => setInspectionResult(e.target.value)} placeholder="점검 결과를 입력하세요..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">특이사항</label>
            <Textarea className="text-xs" rows={3} value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} placeholder="특이사항을 입력하세요..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">점검자명</label>
              <Input className="h-8 text-xs bg-muted" value={inspectorName} disabled />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">작성일자</label>
              <Input className="h-8 text-xs bg-muted" value={today} disabled />
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full">임시저장</Button>
    </div>
  );
}

/* ─── Report View ─── */
function ReportView({
  inspection,
  report,
  canEdit,
  canApprove,
  onUpdate,
  onComplete,
  onRequestApproval,
  onApprove,
  onAddVersion,
  getVersions,
  currentUserName,
  reportTitle,
}: {
  inspection: OutboundInspection;
  report: InspectionReport;
  canEdit: boolean;
  canApprove: boolean;
  onUpdate: (id: string, updates: Partial<InspectionReport>) => void;
  onComplete: () => void;
  onRequestApproval: () => void;
  onApprove: () => void;
  onAddVersion: (reportId: string, fileName: string, fileUrl: string, uploadedBy: string) => void;
  getVersions: (reportId: string) => { id: string; version_number: number; file_name: string; uploaded_at: string; uploaded_by: string }[];
  currentUserName: string;
  reportTitle: string;
}) {
  const [serialNumbers, setSerialNumbers] = useState(report.serial_numbers);
  const [inspectionResult, setInspectionResult] = useState(report.inspection_result);
  const [specialNotes, setSpecialNotes] = useState(report.special_notes);
  const isLocked = report.status === "completed" || report.status === "approval_requested" || report.status === "approved";
  const versions = getVersions(report.id);

  const handleSave = () => {
    onUpdate(report.id, { serial_numbers: serialNumbers, inspection_result: inspectionResult, special_notes: specialNotes });
    toast.success("임시저장되었습니다.");
  };

  const handleWordDownload = async () => {
    const updatedReport = { ...report, serial_numbers: serialNumbers, inspection_result: inspectionResult, special_notes: specialNotes };
    await exportReportToWord(inspection, updatedReport, reportTitle);
    toast.success("Word 파일이 다운로드되었습니다.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAddVersion(report.id, file.name, url, currentUserName);
      toast.success(`수정본 v${versions.length + 1}이 업로드되었습니다.`);
    }
  };

  const reportStatusLabel: Record<string, string> = {
    draft: "작성중",
    completed: "완료",
    approval_requested: "승인대기",
    approved: "승인완료",
  };
  const reportStatusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    completed: "bg-primary/15 text-primary",
    approval_requested: "bg-accent/15 text-accent",
    approved: "bg-primary/20 text-primary",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{reportTitle}</CardTitle>
            <Badge className={cn("text-[10px]", reportStatusColor[report.status])}>
              {reportStatusLabel[report.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>관리번호: {inspection.manage_no} | 건명: {inspection.project_name}</p>
          <p>점검자: {report.inspector_name} | 작성일: {report.created_date}</p>
          {report.approved_by && <p>승인자: {report.approved_by} | 승인일: {report.approved_at?.split("T")[0]}</p>}
        </CardContent>
      </Card>

      {/* Serial Numbers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">Serial No</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">반출장비</TableHead>
                <TableHead className="text-xs w-20">수량</TableHead>
                <TableHead className="text-xs">Serial No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspection.equipment_items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs">{item.equipment_name}</TableCell>
                  <TableCell className="text-xs">{item.qty_set}</TableCell>
                  <TableCell>
                    {canEdit && !isLocked ? (
                      <Input className="h-8 text-xs" value={serialNumbers[item.id] || ""} onChange={e => setSerialNumbers(prev => ({ ...prev, [item.id]: e.target.value }))} />
                    ) : (
                      <span className="text-xs">{serialNumbers[item.id] || "—"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inspection Result */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">점검 결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">점검 결과</label>
            {canEdit && !isLocked ? (
              <Textarea className="text-xs" rows={4} value={inspectionResult} onChange={e => setInspectionResult(e.target.value)} />
            ) : (
              <p className="text-xs border rounded-md p-2 bg-muted min-h-[60px]">{inspectionResult || "—"}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">특이사항</label>
            {canEdit && !isLocked ? (
              <Textarea className="text-xs" rows={3} value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} />
            ) : (
              <p className="text-xs border rounded-md p-2 bg-muted min-h-[40px]">{specialNotes || "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Word Export & Version Upload */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">문서 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleWordDownload}>
              <FileDown className="h-3.5 w-3.5" /> Word 다운로드
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-3.5 w-3.5" /> 수정본 업로드
                  <input type="file" accept=".docx,.doc" className="hidden" onChange={handleFileUpload} />
                </label>
              </Button>
            </div>
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
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-end gap-2">
        {canEdit && !isLocked && (
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
        {!canEdit && !canApprove && (
          <Button variant="outline" onClick={handleWordDownload} className="gap-1">
            <FileDown className="h-4 w-4" /> Word 다운로드
          </Button>
        )}
      </div>
    </div>
  );
}
