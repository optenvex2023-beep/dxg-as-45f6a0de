import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import type { AppUser, RoleCategory, Department } from "@/types";
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

const tabs: { label: string; filter: RoleCategory }[] = [
  { label: "관리자", filter: "관리자" },
  { label: "담당자", filter: "담당자" },
  { label: "미배정", filter: "미배정" },
];

const departments: Department[] = ["환경영업팀", "품질본부", "CS팀", "제조본부", "없음"];

export default function UserManagement() {
  const { users, currentUser, addUser, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState<RoleCategory>("관리자");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<RoleCategory>("미배정");
  const [newDept, setNewDept] = useState<Department>("없음");

  const isAdmin = currentUser?.role_category === "관리자";
  const filtered = users.filter((u) => u.role_category === activeTab);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addUser(newName.trim(), newRole, newDept);
    setNewName("");
    setNewRole("미배정");
    setNewDept("없음");
    setDialogOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">담당자관리</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">사용자 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 사용자 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="이름" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Select value={newRole} onValueChange={(v) => setNewRole(v as RoleCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="관리자">관리자</SelectItem>
                  <SelectItem value="담당자">담당자</SelectItem>
                  <SelectItem value="미배정">미배정</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newDept} onValueChange={(v) => setNewDept(v as Department)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} className="w-full">추가</Button>
            </div>
          </DialogContent>
        </Dialog>
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

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>분류</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>활성</TableHead>
              <TableHead className="w-24">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <UserRow key={user.id} user={user} updateUser={updateUser} />
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
    </div>
  );
}

function UserRow({
  user,
  updateUser,
}: {
  user: AppUser;
  updateUser: (id: string, u: Partial<AppUser>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(user.role_category);
  const [dept, setDept] = useState(user.department);

  const save = () => {
    updateUser(user.id, { role_category: role, department: dept });
    setEditing(false);
  };

  return (
    <TableRow className={cn(!user.is_active && "opacity-50")}>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>
        {editing ? (
          <Select value={role} onValueChange={(v) => setRole(v as RoleCategory)}>
            <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="관리자">관리자</SelectItem>
              <SelectItem value="담당자">담당자</SelectItem>
              <SelectItem value="미배정">미배정</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          user.role_category
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <Select value={dept} onValueChange={(v) => setDept(v as Department)}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["환경영업팀", "품질본부", "CS팀", "제조본부", "없음"] as Department[]).map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          user.department
        )}
      </TableCell>
      <TableCell>{user.is_active ? "✓" : "—"}</TableCell>
      <TableCell>
        {editing ? (
          <div className="flex gap-1">
            <Button size="sm" variant="default" className="h-6 text-xs px-2" onClick={save}>저장</Button>
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setEditing(false)}>취소</Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setEditing(true)}>편집</Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
              onClick={() => updateUser(user.id, { is_active: !user.is_active })}
            >
              {user.is_active ? "비활성" : "활성"}
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
