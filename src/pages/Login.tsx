import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { users, setCurrentUser, isLoading } = useApp();
  const navigate = useNavigate();
  const [empNo, setEmpNo] = useState(() => localStorage.getItem("saved_emp_no") || "");
  const [name, setName] = useState(() => localStorage.getItem("saved_emp_name") || "");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("saved_emp_no"));
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const found = users.find(
      (u) => u.emp_no === empNo.trim() && u.name === name.trim() && u.is_active
    );
    if (!found) {
      setError("사번 또는 이름이 올바르지 않습니다.");
      return;
    }
    if (rememberMe) {
      localStorage.setItem("saved_emp_no", empNo.trim());
      localStorage.setItem("saved_emp_name", name.trim());
    } else {
      localStorage.removeItem("saved_emp_no");
      localStorage.removeItem("saved_emp_name");
    }
    setCurrentUser(found);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img
              src="/images/dxg-logo.png"
              alt="DXG"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">DXG 반출점검·교정가스 관리</CardTitle>
          <CardDescription>사번과 이름으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empNo">사번</Label>
              <Input
                id="empNo"
                placeholder="예: 1189101"
                value={empNo}
                onChange={(e) => setEmpNo(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
              />
              <Label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
                로그인 정보 저장
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로딩 중..." : "로그인"}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center mt-2 animate-in fade-in duration-300">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
