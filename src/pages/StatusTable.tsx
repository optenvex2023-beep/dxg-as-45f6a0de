import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import type {
  OutboundInspection,
  OutboundEquipmentItem,
  StatusType,
  DateMode,
  ReinstallConfirmStatus,
  RequestType,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { isSuperAdmin, canRegister, canEditAdminFields, canEditCSFields, canEditMfgFields } from "@/lib/permissions";

const allStatuses: StatusType[] = [
  "확인필요", "반출예정", "반출완료", "입고완료",
  "1차 점검완료", "최종 점검완료", "설치 완료", "납기유의",
];

interface EquipmentDraft {
  equipment_name: string;
  qty_set: number;
}

type CreateFormData = Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at" | "noti_confirm_needed_sent_at" | "noti_dispatch_plan_sent_at" | "noti_dispatch_done_sent_at" | "noti_first_check_done_sent_at" | "noti_final_check_done_sent_at" | "noti_install_done_sent_at" | "due_alert_sent_at">;

function emptyFormData(): CreateFormData {
  return {
    manage_no: "",
    project_name: "",
    equipment_items: [],
    outbound_request_date_mode: "단일",
    outbound_request_date_single: null,
    outbound_request_date_start: null,
    outbound_request_date_end: null,
    planned_outbound_date: null,
    outbound_date: null,
    inbound_date: null,
    first_inspection_done_date: null,
    final_inspection_done_date: null,
    reinstall_request_date_mode: "단일",
    reinstall_request_date_single: null,
    reinstall_request_date_start: null,
    reinstall_request_date_end: null,
    reinstall_date: null,
    reinstall_confirm_status: "예정",
    contract_due_date: null,
    special_note: "",
    client_pic_name: "",
    client_pic_phone: "",
    request_type: "세일즈오더",
    support_request_file: null,
  };
}

export default function StatusTable() {
  const { inspections, currentUser, addInspection, updateInspection } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status");
  const urlDue = searchParams.get("due");

  // Local filter state — initialized from URL params (dashboard click-through)
  const [localStatusFilter, setLocalStatusFilter] = useState<string>(urlStatus || "전체");
  const [dueToggle, setDueToggle] = useState(urlDue === "7days");
  const [extraFilter, setExtraFilter] = useState<string>("없음");
  const [needOutbound, setNeedOutbound] = useState(false);
  const [needReinstall, setNeedReinstall] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [mfgModalOpen, setMfgModalOpen] = useState(false);

  const superAdmin = isSuperAdmin(currentUser);
  const isAdmin = superAdmin || (currentUser?.role_category === "관리자" && currentUser.department === "환경영업팀");
  const isCS = superAdmin || currentUser?.department === "CS팀";
  const isManufacturing = superAdmin || currentUser?.department === "제조본부";

  const isDueWithin7 = (rec: OutboundInspection) => {
    if (!rec.contract_due_date) return false;
    if (rec.reinstall_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(rec.contract_due_date);
    due.setHours(0, 0, 0, 0);
    const warn = new Date(due);
    warn.setDate(warn.getDate() - 7);
    return today >= warn && today <= due;
  };

  const filtered = useMemo(() => {
    let result = inspections;

    // Status filter
    if (localStatusFilter !== "전체") {
      if (localStatusFilter === "납기유의") {
        result = result.filter((i) => i.status === "납기유의" || i.due_warning);
      } else {
        result = result.filter((i) => i.status === localStatusFilter);
      }
    }

    // Due date toggle
    if (dueToggle) {
      result = result.filter(isDueWithin7);
    }

    // Extra filters
    if (extraFilter === "고객지원요청서") {
      result = result.filter((i) => i.request_type === "고객지원요청서");
    } else if (extraFilter === "세일즈오더") {
      result = result.filter((i) => i.request_type === "세일즈오더");
    }

    // Checkbox filters (can stack)
    if (needOutbound) {
      result = result.filter((i) => {
        const hasRequest = i.outbound_request_date_single || i.outbound_request_date_start;
        return hasRequest && !i.outbound_date;
      });
    }
    if (needReinstall) {
      result = result.filter((i) => i.final_inspection_done_date && !i.reinstall_date);
    }

    return result;
  }, [inspections, localStatusFilter, dueToggle, extraFilter]);

  const selectedRecord = useMemo(() => filtered.find((r) => r.id === selectedId) ?? null, [filtered, selectedId]);

  const showSerialNo = (rec: OutboundInspection) => {
    const idx = allStatuses.indexOf(rec.status);
    const doneIdx = allStatuses.indexOf("1차 점검완료");
    return idx >= doneIdx;
  };

  const handleRowClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const hasActiveFilter = localStatusFilter !== "전체" || dueToggle || extraFilter !== "없음";

  const resetFilters = () => {
    setLocalStatusFilter("전체");
    setDueToggle(false);
    setExtraFilter("없음");
    setSearchParams({});
  };

  const activeFilterLabel = () => {
    const parts: string[] = [];
    if (localStatusFilter !== "전체") parts.push(localStatusFilter);
    if (dueToggle) parts.push("계약납기 7일전");
    if (extraFilter !== "없음") parts.push(extraFilter);
    return parts.join(", ");
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">현황표</h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">상태</label>
          <Select value={localStatusFilter} onValueChange={(v) => setLocalStatusFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[60]">
              <SelectItem value="전체">전체</SelectItem>
              {allStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">추가필터</label>
          <Select value={extraFilter} onValueChange={(val) => { setExtraFilter(val); }}>
            <SelectTrigger className="h-8 text-xs w-[160px] bg-background">
              <SelectValue placeholder="없음" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[9999]">
              <SelectItem value="없음">없음</SelectItem>
              <SelectItem value="고객지원요청서">고객지원요청서</SelectItem>
              <SelectItem value="세일즈오더">세일즈오더</SelectItem>
              <SelectItem value="반출 필요">반출 필요</SelectItem>
              <SelectItem value="재설치 필요">재설치 필요</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="due-toggle"
            checked={dueToggle}
            onCheckedChange={(checked) => setDueToggle(!!checked)}
          />
          <label htmlFor="due-toggle" className="text-xs font-medium text-muted-foreground cursor-pointer whitespace-nowrap">
            계약납기 7일전
          </label>
        </div>

        {hasActiveFilter && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-primary font-medium">현재 필터: {activeFilterLabel()}</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={resetFilters}>
              <X className="h-3 w-3" /> 필터 초기화
            </Button>
          </>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">현황</TableHead>
              <TableHead className="min-w-[100px]">관리번호</TableHead>
              <TableHead className="min-w-[160px]">건명</TableHead>
              <TableHead className="min-w-[180px]">반출장비</TableHead>
              <TableHead className="min-w-[120px]">반출요청일자</TableHead>
              <TableHead className="min-w-[100px]">반출예정일자</TableHead>
              <TableHead className="min-w-[100px]">반출일자</TableHead>
              <TableHead className="min-w-[100px]">입고일자</TableHead>
              <TableHead className="min-w-[100px]">1차 점검완료일자</TableHead>
              <TableHead className="min-w-[100px]">최종 점검완료일자</TableHead>
              <TableHead className="min-w-[120px]">재설치 요청일자</TableHead>
              <TableHead className="min-w-[100px]">재설치 일자</TableHead>
              <TableHead className="min-w-[70px]">예정/확정</TableHead>
              <TableHead className="min-w-[100px]">계약납기</TableHead>
              <TableHead className="min-w-[140px]">특이사항</TableHead>
              <TableHead className="min-w-[90px]">발주처 담당자</TableHead>
              <TableHead className="min-w-[100px]">발주처 연락처</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rec) => (
              <TableRow
                key={rec.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  rec.due_warning && "border-l-4 border-l-accent bg-accent/5",
                  selectedId === rec.id && "bg-primary/10 ring-1 ring-primary/30"
                )}
                onClick={() => handleRowClick(rec.id)}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <StatusBadge status={rec.status} />
                    {rec.due_warning && rec.status !== "납기유의" && rec.status !== "설치 완료" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive text-destructive font-semibold">
                        납기유의
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">{rec.manage_no}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{rec.project_name}</TableCell>
                <TableCell className="text-xs">
                  {rec.equipment_items.length > 0 ? (
                    <div className="space-y-0.5">
                      {rec.equipment_items.map((item) => (
                        <div key={item.id}>
                          {item.equipment_name} ({item.qty_set} set)
                          {showSerialNo(rec) && item.serial_no && (
                            <span className="text-muted-foreground ml-1">/ {item.serial_no}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {rec.outbound_request_date_mode === "단일"
                    ? rec.outbound_request_date_single || "—"
                    : `${rec.outbound_request_date_start || ""} ~ ${rec.outbound_request_date_end || ""}`}
                </TableCell>
                <TableCell className="text-xs">{rec.planned_outbound_date || "—"}</TableCell>
                <TableCell className="text-xs">{rec.outbound_date || "—"}</TableCell>
                <TableCell className="text-xs">{rec.inbound_date || "—"}</TableCell>
                <TableCell className="text-xs">{rec.first_inspection_done_date || "—"}</TableCell>
                <TableCell className="text-xs">{rec.final_inspection_done_date || "—"}</TableCell>
                <TableCell className="text-xs">
                  {rec.reinstall_request_date_mode === "단일"
                    ? rec.reinstall_request_date_single || "—"
                    : `${rec.reinstall_request_date_start || ""} ~ ${rec.reinstall_request_date_end || ""}`}
                </TableCell>
                <TableCell className="text-xs">{rec.reinstall_date || "—"}</TableCell>
                <TableCell className="text-xs">{rec.reinstall_confirm_status}</TableCell>
                <TableCell className="text-xs">{rec.contract_due_date || "—"}</TableCell>
                <TableCell className="text-xs max-w-[160px] truncate">{rec.special_note || "—"}</TableCell>
                <TableCell className="text-xs">{rec.client_pic_name}</TableCell>
                <TableCell className="text-xs">{rec.client_pic_phone}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={17} className="text-center text-muted-foreground py-8">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-end gap-2">
        {isAdmin && (
          <>
            {selectedId && selectedRecord && (
              <Button variant="outline" onClick={() => setEditOpen(true)}>수정</Button>
            )}
            <Button onClick={() => setCreateOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" /> 등록
            </Button>
          </>
        )}
        {isCS && selectedId && selectedRecord && (
          <Button onClick={() => setCsModalOpen(true)}>반출예정/반출일 입력</Button>
        )}
        {isManufacturing && selectedId && selectedRecord && (
          <Button onClick={() => setMfgModalOpen(true)}>입고/점검 입력</Button>
        )}
      </div>

      {/* Registration modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>반출점검 등록</DialogTitle>
          </DialogHeader>
          <CreateForm
            onSubmit={(data) => {
              addInspection(data);
              setCreateOpen(false);
              toast.success("등록이 완료되었습니다.");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Admin edit modal */}
      {selectedRecord && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>레코드 수정</DialogTitle>
            </DialogHeader>
            <EditForm
              record={selectedRecord}
              isAdmin={isAdmin}
              isCS={false}
              isManufacturing={false}
              onSave={(updates) => {
                updateInspection(selectedRecord.id, updates);
                setEditOpen(false);
                toast.success("저장되었습니다.");
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* CS팀 modal */}
      {selectedRecord && (
        <Dialog open={csModalOpen} onOpenChange={setCsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>반출예정/반출일 입력</DialogTitle>
            </DialogHeader>
            <CSForm
              record={selectedRecord}
              onSave={(updates) => {
                updateInspection(selectedRecord.id, updates);
                setCsModalOpen(false);
                toast.success("저장되었습니다.");
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 제조본부 modal */}
      {selectedRecord && (
        <Dialog open={mfgModalOpen} onOpenChange={setMfgModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>입고/점검 입력</DialogTitle>
            </DialogHeader>
            <MfgForm
              record={selectedRecord}
              onSave={(updates) => {
                updateInspection(selectedRecord.id, updates);
                setMfgModalOpen(false);
                toast.success("저장되었습니다.");
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── CS팀 Form ─── */
function CSForm({ record, onSave }: { record: OutboundInspection; onSave: (updates: Partial<OutboundInspection>) => void }) {
  const [planned, setPlanned] = useState(record.planned_outbound_date);
  const [outbound, setOutbound] = useState(record.outbound_date);
  const [reinstall, setReinstall] = useState(record.reinstall_date);
  const [confirmStatus, setConfirmStatus] = useState(record.reinstall_confirm_status);

  return (
    <div className="space-y-4">
      <DateField label="반출예정일자" value={planned} onChange={setPlanned} />
      <DateField label="반출일자" value={outbound} onChange={setOutbound} />
      <DateField label="설치일자" value={reinstall} onChange={setReinstall} />
      <div>
        <label className="text-xs text-muted-foreground block mb-1">예정/확정</label>
        <Select value={confirmStatus} onValueChange={(v) => setConfirmStatus(v as ReinstallConfirmStatus)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="예정">예정</SelectItem>
            <SelectItem value="확정">확정</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={() => onSave({ planned_outbound_date: planned, outbound_date: outbound, reinstall_date: reinstall, reinstall_confirm_status: confirmStatus })}>
        저장
      </Button>
    </div>
  );
}

/* ─── 제조본부 Form ─── */
function MfgForm({ record, onSave }: { record: OutboundInspection; onSave: (updates: Partial<OutboundInspection>) => void }) {
  const [inbound, setInbound] = useState(record.inbound_date);
  const [first, setFirst] = useState(record.first_inspection_done_date);
  const [final_, setFinal] = useState(record.final_inspection_done_date);

  return (
    <div className="space-y-4">
      <DateField label="입고일자" value={inbound} onChange={setInbound} />
      <DateField label="1차 점검 완료일자" value={first} onChange={setFirst} />
      <DateField label="최종 점검 완료일자" value={final_} onChange={setFinal} />
      <Button className="w-full" onClick={() => onSave({ inbound_date: inbound, first_inspection_done_date: first, final_inspection_done_date: final_ })}>
        저장
      </Button>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: StatusType }) {
  const colors: Record<StatusType, string> = {
    "확인필요": "bg-muted text-muted-foreground",
    "반출예정": "bg-primary/10 text-primary",
    "반출완료": "bg-primary/15 text-primary",
    "입고완료": "bg-accent/10 text-accent",
    "1차 점검완료": "bg-accent/15 text-accent",
    "최종 점검완료": "bg-accent/20 text-accent",
    "설치 완료": "bg-primary/20 text-primary",
    "납기유의": "border-destructive text-destructive font-semibold bg-destructive/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", colors[status])}>
      {status}
    </span>
  );
}

/* ─── Date Field ─── */
function DateField({ label, value, onChange, disabled }: { label: string; value: string | null; onChange: (v: string | null) => void; disabled?: boolean }) {
  return (
    <div>
      {label && <label className="text-xs text-muted-foreground block mb-1">{label}</label>}
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-8 text-xs"
        disabled={disabled}
      />
    </div>
  );
}

/* ─── Repeatable Equipment Input Group ─── */
function EquipmentInputGroup({
  items,
  onChange,
}: {
  items: EquipmentDraft[];
  onChange: (items: EquipmentDraft[]) => void;
}) {
  const addItem = () => onChange([...items, { equipment_name: "", qty_set: 1 }]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof EquipmentDraft, val: string | number) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">반출 장비 목록</label>
        <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> 장비 추가
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">장비를 추가해주세요. (최소 1개 필수)</p>
      )}
      {items.map((item, idx) => (
        <div key={idx} className="rounded-md border p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">장비 #{idx + 1}</span>
            {items.length > 1 && (
              <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(idx)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">반출장비(모델명)</label>
              <Input className="h-8 text-xs" value={item.equipment_name} onChange={(e) => updateItem(idx, "equipment_name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">수량(set)</label>
              <Input type="number" min={1} className="h-8 text-xs" value={item.qty_set} onChange={(e) => updateItem(idx, "qty_set", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Serial No</label>
            <Input className="h-8 text-xs bg-muted" value="—" disabled />
            <p className="text-[10px] text-muted-foreground mt-0.5">1차 점검 완료 시 입력됩니다.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Create Form ─── */
function CreateForm({ onSubmit }: { onSubmit: (data: CreateFormData) => void }) {
  const [form, setForm] = useState(emptyFormData());
  const [equipmentDrafts, setEquipmentDrafts] = useState<EquipmentDraft[]>([{ equipment_name: "", qty_set: 1 }]);
  const [errors, setErrors] = useState<string[]>([]);
  const set = <K extends keyof CreateFormData>(key: K, val: CreateFormData[K]) => {
    setForm((p) => {
      const next = { ...p, [key]: val };
      // Auto-prefill manage_no when switching to 고객지원요청서
      if (key === "request_type" && val === "고객지원요청서" && !p.manage_no.trim()) {
        next.manage_no = "고객지원요청서";
      }
      return next;
    });
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.manage_no.trim()) errs.push("관리번호를 입력해주세요.");
    if (!form.project_name.trim()) errs.push("건명을 입력해주세요.");
    if (equipmentDrafts.length === 0) errs.push("장비를 최소 1개 추가해주세요.");
    else if (equipmentDrafts.some(d => !d.equipment_name.trim())) errs.push("모든 장비의 모델명을 입력해주세요.");
    else if (equipmentDrafts.some(d => d.qty_set < 1)) errs.push("장비 수량은 1 이상이어야 합니다.");

    if (form.outbound_request_date_mode === "단일") {
      if (!form.outbound_request_date_single) errs.push("반출요청일자를 입력해주세요.");
    } else {
      if (!form.outbound_request_date_start || !form.outbound_request_date_end) errs.push("반출요청일자(기간)를 입력해주세요.");
    }
    if (form.reinstall_request_date_mode === "단일") {
      if (!form.reinstall_request_date_single) errs.push("재설치 요청일자를 입력해주세요.");
    } else {
      if (!form.reinstall_request_date_start || !form.reinstall_request_date_end) errs.push("재설치 요청일자(기간)를 입력해주세요.");
    }
    // contract_due_date is optional
    if (!form.client_pic_name.trim()) errs.push("발주처 담당자를 입력해주세요.");
    if (!form.client_pic_phone.trim()) errs.push("발주처 연락처를 입력해주세요.");
    if (form.request_type === "고객지원요청서" && !form.support_request_file) errs.push("고객지원요청서 파일을 업로드해주세요.");
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const now = new Date().toISOString();
    const items: OutboundEquipmentItem[] = equipmentDrafts.map((d) => ({
      id: crypto.randomUUID(),
      outbound_inspection_id: "",
      equipment_name: d.equipment_name,
      qty_set: d.qty_set,
      serial_no: null,
      created_at: now,
      updated_at: now,
    }));
    onSubmit({ ...form, equipment_items: items });
  };

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-destructive">{e}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">관리번호 *</label>
          <Input className="h-8 text-xs" value={form.manage_no} onChange={(e) => set("manage_no", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">건명 *</label>
          <Input className="h-8 text-xs" value={form.project_name} onChange={(e) => set("project_name", e.target.value)} />
        </div>
      </div>

      <EquipmentInputGroup items={equipmentDrafts} onChange={setEquipmentDrafts} />

      {/* 반출요청일자 */}
      <div>
        <label className="text-xs text-muted-foreground">반출요청일자 *</label>
        <Select value={form.outbound_request_date_mode} onValueChange={(v) => set("outbound_request_date_mode", v as DateMode)}>
          <SelectTrigger className="h-8 text-xs w-24 mb-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="단일">단일</SelectItem>
            <SelectItem value="기간">기간</SelectItem>
          </SelectContent>
        </Select>
        {form.outbound_request_date_mode === "단일" ? (
          <DateField label="" value={form.outbound_request_date_single} onChange={(v) => set("outbound_request_date_single", v)} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <DateField label="시작" value={form.outbound_request_date_start} onChange={(v) => set("outbound_request_date_start", v)} />
            <DateField label="종료" value={form.outbound_request_date_end} onChange={(v) => set("outbound_request_date_end", v)} />
          </div>
        )}
      </div>

      {/* 재설치 요청일자 */}
      <div>
        <label className="text-xs text-muted-foreground">재설치 요청일자 *</label>
        <Select value={form.reinstall_request_date_mode} onValueChange={(v) => set("reinstall_request_date_mode", v as DateMode)}>
          <SelectTrigger className="h-8 text-xs w-24 mb-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="단일">단일</SelectItem>
            <SelectItem value="기간">기간</SelectItem>
          </SelectContent>
        </Select>
        {form.reinstall_request_date_mode === "단일" ? (
          <DateField label="" value={form.reinstall_request_date_single} onChange={(v) => set("reinstall_request_date_single", v)} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <DateField label="시작" value={form.reinstall_request_date_start} onChange={(v) => set("reinstall_request_date_start", v)} />
            <DateField label="종료" value={form.reinstall_request_date_end} onChange={(v) => set("reinstall_request_date_end", v)} />
          </div>
        )}
      </div>

      <DateField label="계약납기" value={form.contract_due_date} onChange={(v) => set("contract_due_date", v)} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">발주처 담당자 *</label>
          <Input className="h-8 text-xs" value={form.client_pic_name} onChange={(e) => set("client_pic_name", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">발주처 연락처 *</label>
          <Input className="h-8 text-xs" value={form.client_pic_phone} onChange={(e) => set("client_pic_phone", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">특이사항</label>
        <Textarea className="text-xs" value={form.special_note} onChange={(e) => set("special_note", e.target.value)} />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">요청 유형 *</label>
        <Select value={form.request_type} onValueChange={(v) => set("request_type", v as RequestType)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="세일즈오더">세일즈오더</SelectItem>
            <SelectItem value="고객지원요청서">고객지원요청서</SelectItem>
          </SelectContent>
        </Select>
        {form.request_type === "고객지원요청서" && (
          <div className="mt-2">
            <label className="text-xs text-muted-foreground">고객지원요청서 파일 *</label>
            <Input
              type="file"
              className="h-8 text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                set("support_request_file", file ? file.name : null);
              }}
            />
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} className="w-full">완료</Button>
    </div>
  );
}

/* ─── Edit Form (Admin full edit) ─── */
function EditForm({
  record,
  isAdmin,
  isCS,
  isManufacturing,
  onSave,
}: {
  record: OutboundInspection;
  isAdmin: boolean;
  isCS: boolean;
  isManufacturing: boolean;
  onSave: (updates: Partial<OutboundInspection>) => void;
}) {
  const [form, setForm] = useState({ ...record });
  const [equipmentDrafts, setEquipmentDrafts] = useState<EquipmentDraft[]>(
    record.equipment_items.map(i => ({ equipment_name: i.equipment_name, qty_set: i.qty_set }))
  );
  const set = <K extends keyof OutboundInspection>(key: K, val: OutboundInspection[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (isAdmin) {
      const now = new Date().toISOString();
      const items: OutboundEquipmentItem[] = equipmentDrafts.map((d, idx) => ({
        id: record.equipment_items[idx]?.id || crypto.randomUUID(),
        outbound_inspection_id: record.id,
        equipment_name: d.equipment_name,
        qty_set: d.qty_set,
        serial_no: record.equipment_items[idx]?.serial_no || null,
        created_at: record.equipment_items[idx]?.created_at || now,
        updated_at: now,
      }));
      onSave({ ...form, equipment_items: items });
    } else {
      onSave(form);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <>
          <EquipmentInputGroup items={equipmentDrafts} onChange={setEquipmentDrafts} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">관리번호</label>
              <Input className="h-8 text-xs" value={form.manage_no} onChange={(e) => set("manage_no", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">건명</label>
              <Input className="h-8 text-xs" value={form.project_name} onChange={(e) => set("project_name", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">반출요청일자</label>
            <Select value={form.outbound_request_date_mode} onValueChange={(v) => set("outbound_request_date_mode", v as DateMode)}>
              <SelectTrigger className="h-8 text-xs w-24 mb-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="단일">단일</SelectItem>
                <SelectItem value="기간">기간</SelectItem>
              </SelectContent>
            </Select>
            {form.outbound_request_date_mode === "단일" ? (
              <DateField label="" value={form.outbound_request_date_single} onChange={(v) => set("outbound_request_date_single", v)} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <DateField label="시작" value={form.outbound_request_date_start} onChange={(v) => set("outbound_request_date_start", v)} />
                <DateField label="종료" value={form.outbound_request_date_end} onChange={(v) => set("outbound_request_date_end", v)} />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">재설치 요청일자</label>
            <Select value={form.reinstall_request_date_mode} onValueChange={(v) => set("reinstall_request_date_mode", v as DateMode)}>
              <SelectTrigger className="h-8 text-xs w-24 mb-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="단일">단일</SelectItem>
                <SelectItem value="기간">기간</SelectItem>
              </SelectContent>
            </Select>
            {form.reinstall_request_date_mode === "단일" ? (
              <DateField label="" value={form.reinstall_request_date_single} onChange={(v) => set("reinstall_request_date_single", v)} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <DateField label="시작" value={form.reinstall_request_date_start} onChange={(v) => set("reinstall_request_date_start", v)} />
                <DateField label="종료" value={form.reinstall_request_date_end} onChange={(v) => set("reinstall_request_date_end", v)} />
              </div>
            )}
          </div>
          <DateField label="계약납기" value={form.contract_due_date} onChange={(v) => set("contract_due_date", v)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">발주처 담당자</label>
              <Input className="h-8 text-xs" value={form.client_pic_name} onChange={(e) => set("client_pic_name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">발주처 연락처</label>
              <Input className="h-8 text-xs" value={form.client_pic_phone} onChange={(e) => set("client_pic_phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">특이사항</label>
            <Textarea className="text-xs" value={form.special_note} onChange={(e) => set("special_note", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">요청 유형</label>
            <Select value={form.request_type} onValueChange={(v) => set("request_type", v as RequestType)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="세일즈오더">세일즈오더</SelectItem>
                <SelectItem value="고객지원요청서">고객지원요청서</SelectItem>
              </SelectContent>
            </Select>
            {form.request_type === "고객지원요청서" && (
              <div className="mt-2">
                <label className="text-xs text-muted-foreground">고객지원요청서 파일</label>
                <Input type="file" className="h-8 text-xs" />
              </div>
            )}
          </div>
          {/* Read-only fields for admin */}
          <div className="space-y-3 opacity-60">
            <p className="text-xs font-medium text-muted-foreground">아래 항목은 담당 부서에서 입력합니다</p>
            <DateField label="반출예정일자 (CS팀)" value={form.planned_outbound_date} onChange={() => {}} disabled />
            <DateField label="반출일자 (CS팀)" value={form.outbound_date} onChange={() => {}} disabled />
            <DateField label="입고일자 (제조본부)" value={form.inbound_date} onChange={() => {}} disabled />
            <DateField label="1차 점검 완료일자 (제조본부)" value={form.first_inspection_done_date} onChange={() => {}} disabled />
            <DateField label="최종 점검 완료일자 (제조본부)" value={form.final_inspection_done_date} onChange={() => {}} disabled />
            <DateField label="재설치 일자 (CS팀)" value={form.reinstall_date} onChange={() => {}} disabled />
            <div>
              <label className="text-xs text-muted-foreground">예정/확정 (CS팀)</label>
              <Input className="h-8 text-xs" value={form.reinstall_confirm_status} disabled />
            </div>
          </div>
        </>
      )}

      <Button onClick={handleSave} className="w-full">저장</Button>
    </div>
  );
}
