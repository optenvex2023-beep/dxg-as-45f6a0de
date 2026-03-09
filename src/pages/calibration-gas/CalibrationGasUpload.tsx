import { useState, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import type { CalibrationGasExtraction, CalibrationGasExtractionItem, CalibrationGasUploadFile } from "@/types/calibrationGas";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
const ACCEPTED_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".xlsx"];

export default function CalibrationGasUpload() {
  const { addUploadFile, addExtraction, normalizeSiteName, findMatchingInventory, inventory } = useCalGas();
  const { currentUser } = useApp();
  const [files, setFiles] = useState<{ file: File; id: string; progress: number; status: "uploading" | "done" | "error" }[]>([]);
  const [showExtractionForm, setShowExtractionForm] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [formSite, setFormSite] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formItems, setFormItems] = useState<CalibrationGasExtractionItem[]>([
    { gas_name: "", remaining_percent: "", expiry_date: "" },
  ]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => {
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        return ACCEPTED_EXT.includes(ext);
      });
      processFiles(droppedFiles);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFiles = (newFiles: File[]) => {
    const processed = newFiles.map((f) => {
      const id = crypto.randomUUID();
      return { file: f, id, progress: 0, status: "uploading" as const };
    });
    setFiles((prev) => [...prev, ...processed]);

    // Simulate upload progress
    processed.forEach((pf) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) => (f.id === pf.id ? { ...f, progress: 100, status: "done" } : f))
          );
          // Create upload record
          const ext = pf.file.name.split(".").pop()?.toLowerCase() || "pdf";
          const uploadFile: CalibrationGasUploadFile = {
            id: pf.id,
            file_name: pf.file.name,
            file_type: ext,
            file_size: pf.file.size,
            uploaded_at: new Date().toISOString(),
            uploaded_by: currentUser?.name || "시스템",
            status: "pending",
          };
          addUploadFile(uploadFile);
        }
        setFiles((prev) =>
          prev.map((f) => (f.id === pf.id ? { ...f, progress: Math.min(progress, 100) } : f))
        );
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const startExtraction = (fileId: string) => {
    setCurrentFileId(fileId);
    const file = files.find((f) => f.id === fileId);
    // Try to guess site name from filename
    if (file) {
      const name = file.file.name;
      // Common patterns: "WTC_점검일지", "LS전선_점검일지"
      const siteGuess = name.split("_")[0]?.replace(/점검일지|최종|첨부|\d+/g, "").trim();
      if (siteGuess) setFormSite(siteGuess);
    }
    setFormUnit("");
    setFormItems([{ gas_name: "", remaining_percent: "", expiry_date: "" }]);
    setShowExtractionForm(true);
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
    if (!currentFileId || !formSite || !formUnit) return;

    const normalizedSite = normalizeSiteName(formSite);
    const validItems = formItems.filter((i) => i.gas_name);

    // Match logic
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

    const file = files.find((f) => f.id === currentFileId);
    const extraction: CalibrationGasExtraction = {
      id: crypto.randomUUID(),
      upload_file_id: currentFileId,
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
    setShowExtractionForm(false);
    setCurrentFileId(null);
  };

  // Get list of unique gas names from inventory for suggestions
  const gasNameSuggestions = [...new Set(inventory.map((i) => i.gas_name))].sort();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">점검보고서 업로드</h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("calgas-file-input")?.click()}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">파일을 드래그하거나 클릭하여 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">지원 형식: PDF, JPG, PNG, XLSX</p>
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
              </div>
              <div className="flex items-center gap-2">
                {f.status === "done" && (
                  <>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> 완료
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => startExtraction(f.id)}>
                      데이터 입력
                    </Button>
                  </>
                )}
                <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extraction form */}
      {showExtractionForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              점검보고서 데이터 입력 (Zero Span Test 점검후 값)
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setShowExtractionForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            점검보고서의 "6. Zero Span Test" 섹션에서 <strong>점검후</strong> 값을 입력해 주세요.
            <br />정도검사 기간은 무시하고, 표준가스잔량과 유효기간만 입력합니다.
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
              <label className="text-xs font-semibold">가스별 데이터 (점검후 값만 입력)</label>
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
            <Button variant="outline" onClick={() => setShowExtractionForm(false)}>취소</Button>
            <Button onClick={submitExtraction} disabled={!formSite || !formUnit || formItems.every((i) => !i.gas_name)}>
              매칭 검토 제출
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
