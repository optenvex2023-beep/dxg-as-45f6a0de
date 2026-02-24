import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import type { OutboundInspection, StatusType, DateMode, ReinstallConfirmStatus, RequestType } from "@/types";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const allStatuses: StatusType[] = [
  "확인필요", "반출예정", "반출완료", "입고완료",
  "1차 점검완료", "최종 점검완료", "설치 완료", "납기유의",
];

function emptyInspection(): Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at"> {
  return {
    manage_no: "",
    project_name: "",
    equipment: "",
    qty_set: 0,
    serial_no: "",
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
    sales_order_no: "",
    support_request_file: null,
  };
}

export default function StatusTable() {
  const { inspections, currentUser, addInspection, updateInspection } = useApp();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const isAdmin = currentUser?.role_category === "관리자" && currentUser.department === "환경영업팀";
  const isCS = currentUser?.department === "CS팀";
  const isManufacturing = currentUser?.department === "제조본부";

  const filtered = useMemo(() => {
    if (!statusFilter) return inspections;
    if (statusFilter === "납기유의") {
      return inspections.filter((i) => i.status === "납기유의" || i.due_warning);
    }
    return inspections.filter((i) => i.status === statusFilter);
  }, [inspections, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          현황표
          {statusFilter && <span className="text-sm text-muted-foreground ml-2">({statusFilter})</span>}
        </h1>
        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">새 레코드</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>반출점검 등록</DialogTitle>
              </DialogHeader>
              <CreateForm
                onSubmit={(data) => {
                  addInspection(data);
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">현황</TableHead>
              <TableHead className="min-w-[100px]">관리번호</TableHead>
              <TableHead className="min-w-[160px]">건명</TableHead>
              <TableHead className="min-w-[100px]">반출장비</TableHead>
              <TableHead className="min-w-[60px]">수량</TableHead>
              <TableHead className="min-w-[100px]">Serial No</TableHead>
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
              <TableHead className="min-w-[60px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rec) => (
              <TableRow
                key={rec.id}
                className={cn(
                  (rec.status === "납기유의" || rec.due_warning) &&
                    "border-l-4 border-l-accent bg-accent/5"
                )}
              >
                <TableCell>
                  <StatusBadge status={rec.status} />
                </TableCell>
                <TableCell className="text-xs">{rec.manage_no}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{rec.project_name}</TableCell>
                <TableCell className="text-xs">{rec.equipment}</TableCell>
                <TableCell className="text-xs">{rec.qty_set}</TableCell>
                <TableCell className="text-xs">{rec.serial_no}</TableCell>
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
                <TableCell>
                  {(isAdmin || isCS || isManufacturing) && (
                    <Dialog open={editId === rec.id} onOpenChange={(open) => setEditId(open ? rec.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-6 text-xs px-2">편집</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>레코드 편집</DialogTitle>
                        </DialogHeader>
                        <EditForm
                          record={rec}
                          isAdmin={isAdmin}
                          isCS={isCS}
                          isManufacturing={isManufacturing}
                          onSave={(updates) => {
                            updateInspection(rec.id, updates);
                            setEditId(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={20} className="text-center text-muted-foreground py-8">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const colors: Record<StatusType, string> = {
    "확인필요": "bg-muted text-muted-foreground",
    "반출예정": "bg-primary/10 text-primary",
    "반출완료": "bg-primary/15 text-primary",
    "입고완료": "bg-accent/10 text-accent",
    "1차 점검완료": "bg-accent/15 text-accent",
    "최종 점검완료": "bg-accent/20 text-accent",
    "설치 완료": "bg-primary/20 text-primary",
    "납기유의": "bg-accent/10 text-accent font-semibold",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", colors[status])}>
      {status}
    </span>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-8 text-xs"
      />
    </div>
  );
}

function CreateForm({ onSubmit }: { onSubmit: (data: ReturnType<typeof emptyInspection>) => void }) {
  const [form, setForm] = useState(emptyInspection());
  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">관리번호</label>
          <Input className="h-8 text-xs" value={form.manage_no} onChange={(e) => set("manage_no", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">반출장비</label>
          <Input className="h-8 text-xs" value={form.equipment} onChange={(e) => set("equipment", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">건명</label>
        <Input className="h-8 text-xs" value={form.project_name} onChange={(e) => set("project_name", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">수량(set)</label>
          <Input type="number" className="h-8 text-xs" value={form.qty_set} onChange={(e) => set("qty_set", Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Serial No</label>
          <Input className="h-8 text-xs" value={form.serial_no} onChange={(e) => set("serial_no", e.target.value)} />
        </div>
      </div>

      {/* 반출요청일자 */}
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

      {/* 재설치 요청일자 */}
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
        {form.request_type === "세일즈오더" && (
          <div className="mt-2">
            <label className="text-xs text-muted-foreground">세일즈오더 번호</label>
            <Input className="h-8 text-xs" value={form.sales_order_no} onChange={(e) => set("sales_order_no", e.target.value)} />
          </div>
        )}
      </div>

      <Button onClick={() => onSubmit(form)} className="w-full">등록</Button>
    </div>
  );
}

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
  const set = <K extends keyof OutboundInspection>(key: K, val: OutboundInspection[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Admin fields */}
      {isAdmin && (
        <>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">반출장비</label>
              <Input className="h-8 text-xs" value={form.equipment} onChange={(e) => set("equipment", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">수량(set)</label>
              <Input type="number" className="h-8 text-xs" value={form.qty_set} onChange={(e) => set("qty_set", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Serial No</label>
            <Input className="h-8 text-xs" value={form.serial_no} onChange={(e) => set("serial_no", e.target.value)} />
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
            {form.request_type === "세일즈오더" && (
              <div className="mt-2">
                <label className="text-xs text-muted-foreground">세일즈오더 번호</label>
                <Input className="h-8 text-xs" value={form.sales_order_no} onChange={(e) => set("sales_order_no", e.target.value)} />
              </div>
            )}
          </div>
        </>
      )}

      {/* CS팀 fields */}
      {isCS && (
        <div className="space-y-3">
          <DateField label="반출예정일자" value={form.planned_outbound_date} onChange={(v) => set("planned_outbound_date", v)} />
          <DateField label="반출일자" value={form.outbound_date} onChange={(v) => set("outbound_date", v)} />
          <DateField label="재설치 일자" value={form.reinstall_date} onChange={(v) => set("reinstall_date", v)} />
          <div>
            <label className="text-xs text-muted-foreground">예정/확정</label>
            <Select value={form.reinstall_confirm_status} onValueChange={(v) => set("reinstall_confirm_status", v as ReinstallConfirmStatus)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="예정">예정</SelectItem>
                <SelectItem value="확정">확정</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 제조본부 fields */}
      {isManufacturing && (
        <div className="space-y-3">
          <DateField label="입고일자" value={form.inbound_date} onChange={(v) => set("inbound_date", v)} />
          <DateField label="1차 점검 완료일자" value={form.first_inspection_done_date} onChange={(v) => set("first_inspection_done_date", v)} />
          <DateField label="최종 점검 완료일자" value={form.final_inspection_done_date} onChange={(v) => set("final_inspection_done_date", v)} />
        </div>
      )}

      <Button onClick={() => onSave(form)} className="w-full">저장</Button>
    </div>
  );
}
