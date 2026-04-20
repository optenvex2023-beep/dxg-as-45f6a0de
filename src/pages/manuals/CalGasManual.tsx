import { Link } from "react-router-dom";
import { FileDown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MockScreen,
  ClickPoint,
  StepFlow,
  MockButton,
  NoticeBox,
  SectionCard,
  NeedsConfirm,
  ManualPrintStyles,
  Callout,
} from "@/components/manuals/ManualPrimitives";

export default function CalGasManual() {
  return (
    <div className="manual-page p-6 max-w-5xl mx-auto space-y-6">
      <ManualPrintStyles />

      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 no-print">
        <Button asChild variant="ghost" size="sm">
          <Link to="/manuals">
            <ChevronLeft className="h-4 w-4" />
            매뉴얼 목록
          </Link>
        </Button>
        <Button onClick={() => window.print()} size="sm">
          <FileDown className="h-4 w-4" />
          PDF 다운로드
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">교정가스 사용자 매뉴얼</h1>
        <p className="text-sm text-muted-foreground mt-1">
          본 매뉴얼은 화면에 보이는 메뉴/버튼/필터/컬럼/팝업만을 기준으로 작성되었습니다.
        </p>
      </div>

      <NoticeBox
        items={[
          <>입고/사용이 발생하면 <b>현황표에 즉시 반영</b>하세요.</>,
          <>정도검사 일자/유효기간은 <b>실측 즉시 입력</b>하세요.</>,
          <>셀 메모는 <b>행 단위가 아닌 셀 단위로 저장</b>됩니다 (우클릭 → 메모삽입).</>,
        ]}
      />

      {/* 1. 현황표 */}
      <SectionCard num={1} title="현황표">
        <p>
          좌측 메뉴 <b>교정가스 → 현황표</b>를 클릭하면 인벤토리 표가 표시됩니다.
          컬럼은 크게 <b>분석기 / 가스상 정도검사 / 유속계 정도검사 / 비고사항</b> 그룹으로 묶여 있으며,
          사업장·호기 단위로 셀이 세로 병합되어 표시됩니다.
        </p>
        <MockScreen title="/calibration-gas/inventory">
          <div className="rounded border">
            <div className="grid grid-cols-7 text-[10px] bg-muted/40 px-2 py-1 font-medium">
              <span>사업장</span><span>호기</span><span>가스</span>
              <span>분석기</span><span>가스상 정도검사</span><span>유속계 정도검사</span><span>비고</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-7 text-[10px] px-2 py-1 border-t">
                <span>--</span><span>--</span><span>--</span>
                <span>--</span><span>--</span><span>--</span><span>--</span>
              </div>
            ))}
          </div>
        </MockScreen>
        <p>조건부 색상(예: 만료 임박 강조)의 정확한 기준값은 <NeedsConfirm />.</p>
      </SectionCard>

      {/* 2. 인라인 편집 */}
      <SectionCard num={2} title="인라인 편집">
        <p>
          현황표의 셀을 클릭하면 입력 모드로 전환됩니다. 값을 입력하고 Enter 또는 셀 외부를 클릭하면 저장됩니다.
        </p>
        <StepFlow steps={["셀 클릭", "값 입력", "Enter / 외부 클릭", "저장"]} />
        <Callout>편집 권한 범위는 <NeedsConfirm />.</Callout>
      </SectionCard>

      {/* 3. 셀 메모 */}
      <SectionCard num={3} title="셀 메모">
        <p>
          셀에서 <b>마우스 우클릭 → 메모삽입</b>을 선택해 메모를 입력합니다.
          저장된 셀은 우상단에 빨간 모서리 마커가 표시됩니다.
        </p>
        <MockScreen title="우클릭 컨텍스트 메뉴">
          <div className="inline-flex flex-col rounded-md border bg-popover text-xs shadow">
            <span className="px-3 py-1.5 hover:bg-muted">메모삽입</span>
            <span className="px-3 py-1.5 hover:bg-muted">메모편집</span>
            <span className="px-3 py-1.5 hover:bg-muted">메모삭제</span>
          </div>
          <div className="mt-2 inline-block relative h-10 w-20 border rounded">
            <span className="absolute top-0 right-0 h-0 w-0 border-t-[10px] border-l-[10px] border-t-destructive border-l-transparent" />
          </div>
        </MockScreen>
      </SectionCard>

      {/* 4. 업로드 */}
      <SectionCard num={4} title="업로드">
        <p>
          좌측 메뉴 <b>교정가스 → 업로드</b>(<code>/calibration-gas/upload</code>)에서 PDF/Excel 파일을 선택해 업로드합니다.
          업로드 후 검토 화면으로 이동합니다.
        </p>
        <MockScreen title="/calibration-gas/upload">
          <div className="flex items-center gap-2">
            <MockButton variant="outline">파일 선택</MockButton>
            <MockButton>업로드</MockButton>
            <ClickPoint label="1" />
          </div>
        </MockScreen>
      </SectionCard>

      {/* 5. 검토 */}
      <SectionCard num={5} title="검토 (매칭)">
        <p>
          업로드된 파일에서 추출된 항목을 인벤토리와 매칭합니다. 화면에 표시되는 버튼을 통해
          개별 행을 확정/제외하고, 모두 검토되면 등록을 진행합니다.
        </p>
        <StepFlow steps={["추출 결과 확인", "행별 매칭/확정", "등록"]} />
        <MockScreen title="/calibration-gas/review">
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
                <span>매칭 후보 #{i}</span>
                <div className="flex gap-1">
                  <MockButton variant="outline">제외</MockButton>
                  <MockButton>확정</MockButton>
                </div>
              </div>
            ))}
          </div>
        </MockScreen>
        <p>매칭 알고리즘의 세부 우선순위는 본 매뉴얼에서 다루지 않습니다. <NeedsConfirm /></p>
      </SectionCard>

      {/* 6. 이력 / 알림 / 엑셀 */}
      <SectionCard num={6} title="이력 · 알림 · 엑셀 다운로드">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>이력관리</b> (<code>/calibration-gas/history</code>): 변경 이력이 표 형태로 표시됩니다.
          </li>
          <li>
            <b>알림센터</b> (<code>/calibration-gas/notifications</code>): 교정가스 관련 알림 목록을 확인합니다.
          </li>
          <li>
            <b>엑셀 다운로드</b> (<code>/calibration-gas/export</code>): 화면의 다운로드 버튼을 클릭하면
            엑셀 파일이 저장됩니다. 병합/색상은 화면 표시와 동일하게 출력됩니다.
          </li>
        </ul>
        <MockScreen title="/calibration-gas/export">
          <div className="flex items-center gap-2">
            <MockButton variant="outline">옵션 선택</MockButton>
            <MockButton>엑셀 다운로드</MockButton>
            <ClickPoint label="1" />
          </div>
        </MockScreen>
        <Callout tone="warning">
          정도검사 자동 주기 계산, 알림 발송 조건 등 내부 자동화 규칙은 본 매뉴얼에서 다루지 않습니다. <NeedsConfirm />
        </Callout>
      </SectionCard>
    </div>
  );
}
