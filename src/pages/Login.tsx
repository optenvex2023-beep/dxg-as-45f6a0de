import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { users, setCurrentUser, isLoading } = useApp();
  const navigate = useNavigate();
  const [empNo, setEmpNo] = useState("");
  const [name, setName] = useState("");
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
    setCurrentUser(found);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] border border-border/60 rounded-xl shadow-sm p-8">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img
            src="/images/dxg-logo.png"
            alt="DXG Logo"
            className="w-[160px] h-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-[24px] font-bold text-foreground mb-1">
          DXG 반출점검·교정가스 관리
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          사번과 이름으로 로그인하세요
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="empNo">사번</Label>
            <Input
              id="empNo"
              placeholder="예: 1189101"
              value={empNo}
              onChange={(e) => setEmpNo(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive/80">{error}</p>
          )}

          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? "로딩 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/install"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            📲 앱 설치하기
          </a>
        </div>
      </div>
    </div>
  );
}
