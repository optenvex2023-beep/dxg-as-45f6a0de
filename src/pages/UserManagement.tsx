import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import type { AppUser, RoleCategory, Department } from "@/types";
import { classifyRole } from "@/lib/roleClassification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs: { label: string; filter: RoleCategory }[] = [
  { label: "관리자", filter: "관리자" },
  { label: "담당자", filter: "담당자" },
  { label: "미배정", filter: "미배정" },
];

const DAMDDANGJA_DEPTS: Department[] = ["제조본부", "CS팀", "품질본부"];
const MIBAE_DEPTS: Department[] = ["제조본부", "CS팀", "품질본부", "환경영업팀", "없음"];

export default function UserManagement() {
  const { users, currentUser, addUser, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState<RoleCategory>("관리자");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; user: AppUser | null }>({ open: false, user: null });
  const [newEmpNo, setNewEmpNo] = useState("");
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState<Department>("제조본부");
  const [assignDept, setAssignDept] = useState<Department>("제조본부");

  const isAdmin = currentUser?.role_category === "관리자";
  const filtered = users.filter((u) => u.role_category === activeTab);

  const handleAddDamddangja = () => {
    if (!newEmpNo.trim() || !newName.trim()) return;
    if (users.some((u) => u.emp_no === newEmpNo.trim())) {
      toast.error("이미 등록된 사번입니다.");
      return;
    }
    addUser(newName.trim(), newEmpNo.trim(), "담당자", newDept);
    toast.success("담당자가 추가되었습니다.");
    setNewEmpNo("");
    setNewName("");
    setNewDept("제조본부");
    setAddDialogOpen(false);
  };

  const handleAssign = () => {
    if (!assignDialog.user) return;
    const role = classifyRole(assignDialog.user.name, assignDept);
    updateUser(assignDialog.user.id, { department: assignDept, role_category: role });
    toast.success("담당자로 배정되었습니다.");
    setAssignDialog({ open: false, user: null });
    setAssignDept("제조본부");
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">담당자관리</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {tabs.map((t) => (
          <button
            key={t.filter}
            onClick={() => setActiveTab(t.filter)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors",
              activeTab === t.filter
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({users.filter((u) => u.role_category === t.filter).length})
          </button>
        ))}
      </div>

      {/* Tab action buttons */}
      <div className="flex justify-end mb-3">
        {activeTab === "담당자" && (
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>+ 담당자 추가</Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-32">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                tab={activeTab}
                updateUser={updateUser}
                onAssign={(u) => setAssignDialog({ open: true, user: u })}
              />
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  해당 분류의 사용자가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add 담당자 Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>담당자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="사번" value={newEmpNo} onChange={(e) => setNewEmpNo(e.target.value)} />
            <Input placeholder="이름" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Select value={newDept} onValueChange={(v) => setNewDept(v as Department)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAMDDANGJA_DEPTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddDamddangja} className="w-full">추가</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign 미배정→담당자 Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => { if (!open) setAssignDialog({ open: false, user: null }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>담당자로 배정 — {assignDialog.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Select value={assignDept} onValueChange={(v) => setAssignDept(v as Department)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAMDDANGJA_DEPTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} className="w-full">배정</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Row component ── */

function UserRow({
  user,
  tab,
  updateUser,
  onAssign,
}: {
  user: AppUser;
  tab: RoleCategory;
  updateUser: (id: string, u: Partial<AppUser>) => void;
  onAssign: (u: AppUser) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dept, setDept] = useState(user.department);

  const deptOptions: Department[] =
    tab === "관리자" ? ["환경영업팀"] :
    tab === "담당자" ? DAMDDANGJA_DEPTS : MIBAE_DEPTS;

  const save = () => {
    const role = classifyRole(user.name, dept);
    updateUser(user.id, { department: dept, role_category: role });
    setEditing(false);
  };

  return (
    <TableRow className={cn(!user.is_active && "opacity-50")}>
      <TableCell className="text-xs">{user.emp_no}</TableCell>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>
        {editing ? (
          <Select value={dept} onValueChange={(v) => setDept(v as Department)}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {deptOptions.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          user.department
        )}
      </TableCell>
      <TableCell>{user.is_active ? "활성" : "비활성"}</TableCell>
      <TableCell>
        {editing ? (
          <div className="flex gap-1">
            <Button size="sm" variant="default" className="h-6 text-xs px-2" onClick={save}>저장</Button>
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => { setEditing(false); setDept(user.department); }}>취소</Button>
          </div>
        ) : (
          <div className="flex gap-1">
            {tab !== "관리자" && (
              <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setEditing(true)}>수정</Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
              onClick={() => updateUser(user.id, { is_active: !user.is_active })}
            >
              {user.is_active ? "비활성" : "활성"}
            </Button>
            {tab === "미배정" && (
              <Button size="sm" variant="default" className="h-6 text-xs px-2" onClick={() => onAssign(user)}>
                담당자 배정
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
