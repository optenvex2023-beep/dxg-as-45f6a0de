import { useState, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CalibrationGasExtraction, CalibrationGasExtractionItem, CalibrationGasUploadFile } from "@/types/calibrationGas";
import { isPdfTextBased, extractGasDataFromFile } from "@/lib/gasExtraction";

const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
const ACCEPTED_EXT = [".pdf", ".xlsx"];

type FileEntry = {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "extracting" | "done" | "error";
  errorMsg?: string;
  extractedSite?: string;
  extractedUnit?: string;
  extractedItems?: CalibrationGasExtractionItem[];
};

export default function CalibrationGasUpload() {
  const { addUploadFile, addExtraction, normalizeSiteName, findMatchingInventory, inventory } = useCalGas();
  const { currentUser } = useApp();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [formSite, setFormSite] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formItems, setFormItems] = useState<CalibrationGasExtractionItem[]>([
    { gas_name: "", remaining_percent: "", expiry_date: "" },
  ]);

  const validateAndFilterFiles = async (rawFiles: File[]): Promise<File[]> => {
    const valid: File[] = [];
    for (const f of rawFiles) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXT.includes(ext)) {
        toast.error(`${f.name}: 지원하지 않는 파일 형식입니다. 텍스트 PDF 또는 엑셀(.xlsx) 파일만 업로드 가능합니다.`);
        continue;
      }
      if (ext === ".pdf") {
        const isText = await isPdfTextBased(f);
        if (!isText) {
          toast.error(`${f.name}: 이 파일은 텍스트 추출이 불가능한 스캔 PDF입니다. 텍스트가 선택되는 PDF 또는 엑셀 파일을 업로드해 주세요.`);
          continue;
        }
      }
      valid.push(f);
    }
    return valid;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      const valid = await validateAndFilterFiles(dropped);
      if (valid.length > 0) processFiles(valid);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const valid = await validateAndFilterFiles(Array.from(e.target.files));
      if (valid.length > 0) processFiles(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFiles = (newFiles: File[]) => {
    const entries: FileEntry[] = newFiles.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);

    // Simulate upload then auto-extract
    entries.forEach((entry) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Create upload record
          const ext = entry.file.name.split(".").pop()?.toLowerCase() || "pdf";
          const uploadFile: CalibrationGasUploadFile = {
            id: entry.id,
            file_name: entry.file.name,
            file_type: ext,
            file_size: entry.file.size,
            uploaded_at: new Date().toISOString(),
            uploaded_by: currentUser?.name || "시스템",
            status: "pending",
          };
          addUploadFile(uploadFile);

          // Move to extraction phase
          setFiles((prev) =>
            prev.map((f) => (f.id === entry.id ? { ...f, progress: 100, status: "extracting" } : f))
          );

          // Auto-extract data
          extractGasDataFromFile(entry.file)
            .then((result) => {
              const normalizedSite = result.site_name ? normalizeSiteName(result.site_name) : "";
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id
                    ? {
                        ...f,
                        status: "done",
                        extractedSite: normalizedSite,
                        extractedUnit: result.unit_no,
                        extractedItems: result.items.length > 0
                          ? result.items
                          : [{ gas_name: "", remaining_percent: "", expiry_date: "" }],
                      }
                    : f
                )
              );
              if (result.items.length > 0) {
                toast.success(`${entry.file.name}: ${result.items.length}건의 가스 데이터를 추출했습니다.`);
              } else {
                toast.info(`${entry.file.name}: 자동 추출된 데이터가 없습니다. 수동으로 입력해 주세요.`);
              }
            })
            .catch(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id
                    ? { ...f, status: "error", errorMsg: "데이터 추출에 실패했습니다." }
                    : f
                )
              );
            });
        }
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, progress: Math.min(progress, 100) } : f))
        );
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (editingFileId === id) setEditingFileId(null);
  };

  const startEditing = (fileId: string) => {
    const f = files.find((x) => x.id === fileId);
    if (!f) return;
    setEditingFileId(fileId);
    setFormSite(f.extractedSite || "");
    setFormUnit(f.extractedUnit || "");
    setFormItems(f.extractedItems?.length ? [...f.extractedItems] : [{ gas_name: "", remaining_percent: "", expiry_date: "" }]);
  };

  const addFormItem = () => {
    setFormItems((prev) => [...prev, { gas_name: "", remaining_percent: "", expiry_date: "" }]);
  };

  const removeFormItem = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFormItem = (idx: number, field: keyof CalibrationGasExtractionItem, value: string) => {
    setFormItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const submitExtraction = () => {
    if (!editingFileId || !formSite || !formUnit) return;

    const normalizedSite = normalizeSiteName(formSite);
    const validItems = formItems.filter((i) => i.gas_name);

    let allMatched: string[] = [];
    let matchStatus: "matched" | "review_needed" | "match_failed" = "matched";

    for (const item of validItems) {
      const matches = findMatchingInventory(normalizedSite, formUnit, item.gas_name);
      if (matches.length === 0) {
        matchStatus = "match_failed";
      } else if (matches.length > 1) {
        if (matchStatus !== "match_failed") matchStatus = "review_needed";
      }
      allMatched.push(...matches.map((m) => m.id));
    }

    allMatched = [...new Set(allMatched)];
    if (allMatched.length === 0) matchStatus = "match_failed";

    const file = files.find((f) => f.id === editingFileId);
    const extraction: CalibrationGasExtraction = {
      id: crypto.randomUUID(),
      upload_file_id: editingFileId,
      file_name: file?.file.name || "",
      detected_site: normalizedSite,
      detected_unit: formUnit,
      items: validItems,
      match_status: matchStatus,
      matched_inventory_ids: allMatched,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    addExtraction(extraction);
    setEditingFileId(null);
    toast.success("매칭 검토에 제출되었습니다.");
  };

  const gasNameSuggestions = [...new Set(inventory.map((i) => i.gas_name))].sort();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">점검보고서 업로드</h2>

      {/* Notice - no OCR */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs leading-relaxed">
          ※ 업로드 가능 파일 형식: 텍스트 PDF, 엑셀(.xlsx)
          <br />- 텍스트가 선택되지 않는 스캔 PDF 및 이미지 파일은 지원하지 않습니다.
          <br />- 점검보고서에서 Zero Span Test의 '점검후' 항목 기준으로 표준가스잔량, 유효기간을 추출합니다.
        </AlertDescription>
      </Alert>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("calgas-file-input")?.click()}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">파일을 드래그하거나 클릭하여 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">지원 형식: 텍스트 PDF, 엑셀(.xlsx)</p>
        <p className="text-xs text-muted-foreground">여러 파일 동시 업로드 가능 (파일 1개 = 1호기)</p>
        <input
          id="calgas-file-input"
          type="file"
          multiple
          accept={ACCEPTED_EXT.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">업로드된 파일</h3>
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 border rounded-lg p-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(f.file.size / 1024).toFixed(1)} KB
                </p>
                {f.status === "uploading" && (
                  <Progress value={f.progress} className="mt-1 h-1.5" />
                )}
                {f.status === "extracting" && (
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> 데이터 추출 중...
                  </p>
                )}
                {f.status === "error" && (
                  <p className="text-xs text-destructive mt-1">{f.errorMsg}</p>
                )}
                {f.status === "done" && f.extractedItems && f.extractedItems.some((i) => i.gas_name) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    추출: {f.extractedSite || "미감지"} / {f.extractedUnit || "미감지"}호기 / {f.extractedItems.filter((i) => i.gas_name).length}건 가스
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {f.status === "done" && (
                  <>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> 추출완료
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => startEditing(f.id)}>
                      확인/수정
                    </Button>
                  </>
                )}
                {f.status === "error" && (
                  <Button size="sm" variant="outline" onClick={() => startEditing(f.id)}>
                    수동 입력
                  </Button>
                )}
                <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Review extracted data */}
      {editingFileId && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              추출 데이터 확인/수정 (Zero Span Test 점검후 값)
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setEditingFileId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            자동 추출된 값을 확인하고, 필요시 수정한 후 제출하세요.
            <br />정도검사 기간은 무시하고, 표준가스잔량과 유효기간만 반영됩니다.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">사업장명</label>
              <Input value={formSite} onChange={(e) => setFormSite(e.target.value)} placeholder="예: WTC, LS전선" />
            </div>
            <div>
              <label className="text-xs font-medium">호기</label>
              <Input value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="예: 1, A6, Tar(#2)" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">가스별 데이터 (점검후 값)</label>
              <Button size="sm" variant="outline" onClick={addFormItem}>+ 가스 추가</Button>
            </div>
            {formItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-[10px] text-muted-foreground">가스명</label>
                  <Input
                    value={item.gas_name}
                    onChange={(e) => updateFormItem(idx, "gas_name", e.target.value)}
                    placeholder="NO Zero, O2 25%..."
                    list="gas-names"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">표준가스잔량 (%)</label>
                  <Input
                    value={item.remaining_percent}
                    onChange={(e) => updateFormItem(idx, "remaining_percent", e.target.value)}
                    placeholder="96%"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">유효기간</label>
                  <Input
                    type="date"
                    value={item.expiry_date}
                    onChange={(e) => updateFormItem(idx, "expiry_date", e.target.value)}
                  />
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFormItem(idx)} disabled={formItems.length <= 1}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <datalist id="gas-names">
            {gasNameSuggestions.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingFileId(null)}>취소</Button>
            <Button onClick={submitExtraction} disabled={!formSite || !formUnit || formItems.every((i) => !i.gas_name)}>
              매칭 검토 제출
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
