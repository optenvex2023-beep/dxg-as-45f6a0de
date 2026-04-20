import { Link } from "react-router-dom";
import { ClipboardCheck, FlaskConical, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function ManualIndex() {
  return (
    <div className="manual-page p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 매뉴얼</h1>
        <p className="text-sm text-muted-foreground mt-1">
          현재 화면에 구현된 기능 기준의 시각 가이드입니다. 모듈을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/manuals/outbound" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">반출점검 사용자 매뉴얼</CardTitle>
                <CardDescription className="mt-1">
                  로그인 · 대시보드 · 현황표 · 1차/완료 점검보고서 · 알림센터
                </CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/manuals/calibration-gas" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">교정가스 사용자 매뉴얼</CardTitle>
                <CardDescription className="mt-1">
                  현황표 · 인라인 편집 · 셀 메모 · 업로드/검토 · 이력 · 엑셀 다운로드
                </CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
