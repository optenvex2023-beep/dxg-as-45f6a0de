import { Link } from "react-router-dom";
import { FileDown, ChevronLeft, BookOpen, LogIn, Bell } from "lucide-react";
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
import historySearchImg from "@/assets/manual-history-search.png";

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

      {/* 표지 */}
      <section className="manual-cover bg-card rounded-lg border px-8 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            DXG 교정가스 사용자 매뉴얼
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            교정가스 담당자용
          </p>
        </div>

        <div className="mt-16 max-w-xs">
          <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-4">목차</h2>
          <ol className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">1</span>
              <span>로그인</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">2</span>
              <span>현황표</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
              <span>이력관리</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">4</span>
              <span>알림센터</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">5</span>
              <span>엑셀 다운로드</span>
            </li>
          </ol>
        </div>

      </section>

      <NoticeBox
        items={[
          <>현재 사용중인 엑셀파일을 그대로 반영하도록 하였으나, 오류가 있을 수 있으니 현황표에 기입된 항목이 기존 엑셀자료와 동일한지 <b>필히 확인 후 사용</b> 바랍니다.</>,
          <>정도검사 예정일의 경우 <img src={completeCheckBtn} alt="완료 체크" className="inline-block align-middle h-5 mx-0.5" />에 기입한 최종 검사일 기준으로 자동 카운팅 되나, 초기 사용시에는 반영된 일자가 2년/2년/1년 주기에 맞는지 확인하는 작업을 <b>필히 병행</b> 바랍니다.</>,
          <>셀 메모는 <b>행 단위가 아닌 셀 단위로 저장</b>됩니다. (우클릭 → 메모삽입)</>,
        ]}
      />

      {/* 1. 로그인 */}
      <SectionCard num={1} title="로그인">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* 좌측: 단계 설명 + 안내 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold">
              <LogIn className="h-5 w-5 text-primary" />
              <span>로그인 절차</span>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
              <li>앱을 열면 로그인 화면이 표시됩니다.</li>
              <li><b>사번</b>을 입력합니다. (예: <code className="px-1 rounded bg-muted">1189101</code>)</li>
              <li><b>이름</b>을 입력합니다. (예: <code className="px-1 rounded bg-muted">홍길동</code>)</li>
              <li><b>로그인</b> 버튼을 누릅니다.</li>
            </ol>

            <div className="rounded-md border bg-muted/40 p-3 flex gap-2 text-sm">
              <Bell className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                사번과 이름은 관리자가 등록한 정보와 정확히 일치해야 합니다.
                로그인이 안 될 경우 관리자에게 문의하세요.
              </p>
            </div>
          </div>

          {/* 우측: 모바일 모형 */}
          <div className="flex justify-center">
            <div className="w-[280px]">
              <MockScreen title="">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span className="font-medium">9:41</span>
                    <span className="inline-block h-2 w-2 rounded-full bg-foreground/70" />
                  </div>

                  <div className="text-center pt-1 pb-2">
                    <h3 className="text-sm font-bold leading-tight">
                      반출점검·교정가스<br />관리
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">사번</label>
                    <div className="h-9 rounded-md border bg-background flex items-center px-3 text-xs">
                      1189101
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">이름</label>
                    <div className="h-9 rounded-md border bg-background flex items-center px-3 text-xs">
                      홍길동
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <span className="inline-block h-3.5 w-3.5 rounded-sm border bg-background" />
                    <span className="text-[11px]">정보 저장</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/40 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      클릭
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold ring-2 ring-destructive ring-offset-2 ring-offset-background"
                  >
                    로그인
                  </button>

                  <p className="text-center text-[10px] italic text-muted-foreground pt-1">
                    로그인 화면
                  </p>
                </div>
              </MockScreen>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 2. 현황표 */}
      <SectionCard num={2} title="현황표">
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

      {/* 3. 이력관리 */}
      <SectionCard num={3} title="이력관리">
        <ul className="list-disc pl-5 space-y-2">
          <li>해당 메뉴에서는 현황표 메뉴에서 수행한 모든 변경사항이 기입됩니다.</li>
          <li>
            상단의 검색창을 통해 검색 기능을 활용할 수 있습니다.
            <div className="mt-3">
              <img
                src={historySearchImg}
                alt="이력관리 검색창 - 사업장, 호기, 작업자, 작업유형 검색"
                className="rounded-lg border shadow-sm max-w-full sm:max-w-md"
              />
            </div>
          </li>
        </ul>
      </SectionCard>

      {/* 4. 알림센터 */}
      <SectionCard num={4} title="알림센터">
        <p>아래 항목에 해당하는 경우 알림이 발생하며, 현황표에 해당 칸에도 표기됩니다.</p>
        <ol className="list-decimal pl-5 space-y-1.5 mt-2">
          <li>교정가스 유효기간이 60일 전으로 도래한 경우</li>
          <li>교정가스 잔량이 30% 이하인 경우</li>
          <li>정도검사 예정일이 60일 전으로 도래한 경우</li>
        </ol>
      </SectionCard>

      {/* 5. 엑셀 다운로드 */}
      <SectionCard num={5} title="엑셀 다운로드">
        <ul className="list-disc pl-5 space-y-2">
          <li>현황표에 기입된 자료를 엑셀 다운로드 가능합니다.</li>
          <li>
            다만, 기능상의 사유로 현황표에 기입된 대로 추출되지 않을 수 있으니
            이점 유의하여 사용하여 주시기 바랍니다.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
