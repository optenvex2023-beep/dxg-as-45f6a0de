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
import completeCheckBtn from "@/assets/manual-complete-check-button.png";
import gasAddModeImg from "@/assets/manual-gas-add-mode.png";
import gasCycleUpdateImg from "@/assets/manual-gas-cycle-update.png";
import gasCompleteDialogImg from "@/assets/manual-gas-complete-dialog.png";

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
          <>현재 사용중인 엑셀파일을 그대로 반영하도록 하였으나, 오류가 있을 수 있으니 현황표에 기입된 항목이 기존 엑셀자료와 동일한지 <b>필히 확인 후 사용</b> 바랍니다.</>,
          <>정도검사 예정일의 경우 <img src={completeCheckBtn} alt="완료 체크" className="inline-block align-middle h-5 mx-0.5" />에 기입한 최종 검사일 기준으로 자동 카운팅 되나, 초기 사용시에는 반영된 일자가 2년/2년/1년 주기에 맞는지 확인하는 작업을 <b>필히 병행</b> 바랍니다.</>,
          <>셀 메모는 <b>행 단위가 아닌 셀 단위로 저장</b>됩니다. (우클릭 → 메모삽입)</>,
        ]}
      />

      {/* 1. 현황표 */}
      <SectionCard num={1} title="현황표">
        <ol className="list-decimal pl-5 space-y-4">
          <li>
            좌측 메뉴 <b>교정가스 → 현황표</b>를 클릭하면 유지보수 사업장 교정가스 현황과
            가스상, 유속계 정도검사 현황 확인이 가능합니다.
          </li>

          <li>
            우상단{" "}
            <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              등록
            </span>{" "}
            버튼을 클릭하면 현황표에 기입된 모든 내용을 수정 가능합니다.
          </li>

          <li>
            새로운 사업장을 추가할 경우{" "}
            <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md border border-input bg-background text-xs font-medium shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              행 추가
            </span>{" "}
            버튼을 클릭하여 추가합니다.
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                동일 사업장에 새로운 호기 또는 분석기 Range 추가를 원하는 경우{" "}
                <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md border border-input bg-background text-xs font-medium shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  행 추가
                </span>{" "}
                버튼 클릭 시 활성화되는{" "}
                <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-primary text-primary-foreground text-[10px] font-bold align-middle">+</span>{" "}
                버튼을 통해 추가합니다.
              </li>
              <li>
                <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  추가모드 해제
                </span>{" "}
                버튼을 클릭하면 편집모드가 해제됩니다.
                <div className="mt-3">
                  <img
                    src={gasAddModeImg}
                    alt="행 추가 모드 활성화 화면 - 호기 및 분석기 Range 옆에 + 버튼이 표시됨"
                    className="rounded-lg border shadow-sm max-w-full sm:max-w-md"
                  />
                </div>
              </li>
            </ul>
          </li>

          <li>
            정도검사 예정/완료 체크 기능
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                예정일자 전후 30일로 수검 필요.{" "}
                <img src={completeCheckBtn} alt="완료 체크" className="inline-block align-middle h-5 mx-0.5" />{" "}
                버튼 클릭 후 최근 완료일자 기입 시 해당일자가 <b>‘최종’</b> 칸에 기입되며,{" "}
                <b>‘예정’</b>일에는 차수에 따라 다음 예정일이 자동 기입됩니다.
                <div className="mt-3">
                  <img
                    src={gasCycleUpdateImg}
                    alt="정도검사 예정/완료 자동 갱신 예시"
                    className="rounded-lg border shadow-sm max-w-full sm:max-w-md"
                  />
                </div>
              </li>
              <li>
                <img src={completeCheckBtn} alt="완료 체크" className="inline-block align-middle h-5 mx-0.5" />{" "}
                버튼 클릭 시 최근 완료된 정도검사 일자를 기입 가능
                <div className="mt-3">
                  <img
                    src={gasCompleteDialogImg}
                    alt="가스상 정도검사 완료 입력 다이얼로그"
                    className="rounded-lg border shadow-sm max-w-full sm:max-w-xs"
                  />
                </div>
              </li>
            </ul>
          </li>

          <li>
            알림기능
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                교정가스 유효기간이 60일 전으로 도래한 경우 해당 칸에{" "}
                <span className="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded bg-destructive/15 text-destructive text-[11px] font-medium">
                  붉은색 음영 및 [임박]
                </span>{" "}
                표기
              </li>
              <li>
                교정가스 잔량이 30% 이하인 경우 해당 칸에{" "}
                <span className="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded bg-destructive/15 text-destructive text-[11px] font-medium">
                  붉은색 음영 및 [부족]
                </span>{" "}
                표기
              </li>
              <li>
                정도검사 예정일이 60일 전으로 도래한 경우 해당 칸에{" "}
                <span className="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: "hsl(90 70% 85%)", color: "hsl(90 60% 25%)" }}>
                  연두색
                </span>{" "}
                표기
              </li>
            </ul>
          </li>
        </ol>
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
