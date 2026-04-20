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

export default function OutboundManual() {
  return (
    <div className="manual-page p-6 max-w-5xl mx-auto space-y-6">
      <ManualPrintStyles />

      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/manuals">
              <ChevronLeft className="h-4 w-4" />
              매뉴얼 목록
            </Link>
          </Button>
        </div>
        <Button onClick={() => window.print()} size="sm">
          <FileDown className="h-4 w-4" />
          PDF 다운로드
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">반출점검 사용자 매뉴얼</h1>
        <p className="text-sm text-muted-foreground mt-1">
          본 매뉴얼은 화면에 보이는 메뉴/버튼/필터/컬럼/팝업만을 기준으로 작성되었습니다.
        </p>
      </div>

      {/* 필독 안내 */}
      <NoticeBox
        items={[
          <><b>점검 결과는 발생 즉시</b> 시스템에 입력해야 합니다.</>,
          <><b>1차/완료 점검보고서</b>는 화면 안내 절차에 따라 작성·저장하세요.</>,
          <>사진/서명 등 화면에서 요구하는 항목이 누락되면 저장이 제한될 수 있습니다. <NeedsConfirm /></>,
        ]}
      />

      {/* 1. 로그인 / PWA */}
      <SectionCard num={1} title="로그인 / 앱 설치(PWA)">
        <p>
          웹 브라우저로 접속 후 <b>/login</b> 화면에서 사번·이름으로 로그인합니다.
          모바일/데스크탑 앱 설치는 좌측 메뉴 또는 <b>/install</b> 안내 페이지에서 진행합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <MockScreen title="/login">
            <div className="space-y-2">
              <div className="h-7 w-2/3 rounded bg-muted" />
              <div className="h-7 w-2/3 rounded bg-muted" />
              <div className="flex items-center gap-2 pt-1">
                <MockButton>로그인</MockButton>
                <ClickPoint label="1" />
              </div>
            </div>
          </MockScreen>
          <MockScreen title="/install">
            <StepFlow steps={["설치 페이지 진입", "안내에 따라 설치", "홈 화면에서 실행"]} />
          </MockScreen>
        </div>
      </SectionCard>

      {/* 2. 대시보드 */}
      <SectionCard num={2} title="대시보드">
        <p>
          상단에 KPI 카드가 표시됩니다. 각 카드의 정확한 산정 기준은 화면 라벨로만 표기되어 있어
          본 매뉴얼에서는 명칭만 안내합니다. 의미·집계 규칙은 <NeedsConfirm />.
        </p>
        <MockScreen title="/dashboard">
          <div className="grid grid-cols-3 gap-2">
            {["미점검", "점검중", "완료", "예정", "지연", "기타"].map((k) => (
              <div key={k} className="rounded-md border p-3">
                <div className="text-[11px] text-muted-foreground">{k}</div>
                <div className="text-lg font-bold">--</div>
              </div>
            ))}
          </div>
        </MockScreen>
      </SectionCard>

      {/* 3. 현황표 */}
      <SectionCard num={3} title="현황표">
        <p>
          좌측 메뉴 <b>현황표</b>를 클릭하면 반출점검 목록이 표시됩니다.
          상단의 검색·필터·정렬 버튼을 사용해 목록을 좁힐 수 있으며, 행을 클릭하면 상세가 열립니다.
        </p>
        <MockScreen title="/status-table">
          <div className="flex items-center gap-2 mb-2">
            <MockButton variant="outline">검색</MockButton>
            <MockButton variant="outline">필터</MockButton>
            <MockButton variant="outline">정렬</MockButton>
            <ClickPoint label="1" className="ml-1" />
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-6 text-[11px] bg-muted/40 px-2 py-1 font-medium">
              <span>관리번호</span><span>프로젝트</span><span>고객사담당</span><span>상태</span><span>예정일</span><span>비고</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-6 text-[11px] px-2 py-1 border-t">
                <span>--</span><span>--</span><span>--</span><span>--</span><span>--</span><span>--</span>
              </div>
            ))}
          </div>
        </MockScreen>
        <Callout>
          행 클릭 → 상세 패널/팝업 진입. 자동 상태 전환 규칙은 <NeedsConfirm />.
        </Callout>
      </SectionCard>

      {/* 4. 1차 보고서 */}
      <SectionCard num={4} title="1차 점검보고서">
        <p>
          좌측 메뉴 <b>1차 점검보고서</b>에서 점검 항목을 입력하고 사진을 첨부한 뒤 저장합니다.
        </p>
        <StepFlow
          steps={[
            "보고서 진입",
            "점검 항목 입력",
            "사진 첨부",
            "저장",
          ]}
        />
        <MockScreen title="/first-report">
          <div className="space-y-2">
            <div className="h-6 w-1/2 rounded bg-muted" />
            <div className="h-20 w-full rounded bg-muted" />
            <div className="flex items-center gap-2">
              <MockButton variant="outline">사진 첨부</MockButton>
              <MockButton>저장</MockButton>
              <ClickPoint label="1" />
            </div>
          </div>
        </MockScreen>
        <p>서명 적용·검증 규칙 및 필수 항목 정의는 <NeedsConfirm />.</p>
      </SectionCard>

      {/* 5. 완료 보고서 */}
      <SectionCard num={5} title="완료 점검보고서">
        <p>
          좌측 메뉴 <b>완료 점검보고서</b>에서 작성·검토를 진행하고, 화면의 다운로드 버튼으로
          파일을 받습니다. 저장되는 파일 형식은 다운로드 버튼 옆 라벨을 따릅니다.
        </p>
        <MockScreen title="/final-report">
          <div className="flex items-center gap-2 mb-2">
            <MockButton variant="outline">미리보기</MockButton>
            <MockButton>다운로드</MockButton>
            <ClickPoint label="1" />
          </div>
          <div className="h-24 rounded border bg-muted/30" />
        </MockScreen>
        <Callout tone="warning">
          버전 관리·승인 권한 등 내부 규칙은 본 매뉴얼에서 다루지 않습니다. <NeedsConfirm />
        </Callout>
      </SectionCard>

      {/* 6. 알림센터 */}
      <SectionCard num={6} title="알림센터">
        <p>
          상단 종 아이콘 또는 좌측 메뉴 <b>알림센터</b>에서 새 알림을 확인합니다.
          알림 항목을 클릭하면 관련 화면으로 이동합니다.
        </p>
        <MockScreen title="/notifications">
          <ul className="divide-y">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center justify-between py-2 text-xs">
                <span>알림 제목 #{i}</span>
                <MockButton variant="ghost">읽음</MockButton>
              </li>
            ))}
          </ul>
        </MockScreen>
        <p>알림 발송 트리거의 정확한 조건은 <NeedsConfirm />.</p>
      </SectionCard>
    </div>
  );
}
