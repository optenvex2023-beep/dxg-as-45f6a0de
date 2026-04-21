import { Link } from "react-router-dom";
import { FileDown, ChevronLeft, LogIn, Bell, BookOpen } from "lucide-react";
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
import dashboardImg from "@/assets/manual-dashboard.png";
import statusFilterImg from "@/assets/manual-status-filter.png";
import statusSearchImg from "@/assets/manual-status-search.png";
import firstReportSelectCaseImg from "@/assets/manual-first-report-select-case.png";
import firstReportSelectEquipmentImg from "@/assets/manual-first-report-select-equipment.png";
import firstReportMfgReviewImg from "@/assets/manual-first-report-mfg-review.png";
import firstReportQaReviewImg from "@/assets/manual-first-report-qa-review.png";
import firstReportQaDoneImg from "@/assets/manual-first-report-qa-done.png";
import firstReportDocMgmtImg from "@/assets/manual-first-report-doc-mgmt.png";
import firstReportCompletedListImg from "@/assets/manual-first-report-completed-list.png";
import notificationPopoverImg from "@/assets/manual-notification-popover.png";
import notificationMenuImg from "@/assets/manual-notification-menu.png";

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

      {/* 표지 */}
      <section className="manual-cover bg-card rounded-lg border px-8 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            DXG 반출점검 사용자 매뉴얼
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            반출점검 담당자용
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
              <span>대시보드</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
              <span>현황표</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">4</span>
              <span>1차 점검보고서</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">5</span>
              <span>완료 점검보고서</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">6</span>
              <span>알림센터</span>
            </li>
          </ol>
        </div>

        <p className="mt-16 text-center text-[11px] text-muted-foreground">
          본 매뉴얼은 화면에 보이는 메뉴/버튼/필터/컬럼/팝업만을 기준으로 작성되었습니다.
        </p>
      </section>

      {/* 필독 안내 */}
      <NoticeBox
        items={[
          <><b>1차/완료 점검보고서</b>는 화면 안내 절차에 따라 작성·저장하세요.</>,
          <>사진/서명 등 화면에서 요구하는 항목이 누락되면 저장이 제한될 수 있습니다.</>,
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
                  {/* 상태바 */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span className="font-medium">9:41</span>
                    <span className="inline-block h-2 w-2 rounded-full bg-foreground/70" />
                  </div>

                  {/* 타이틀 */}
                  <div className="text-center pt-1 pb-2">
                    <h3 className="text-sm font-bold leading-tight">
                      반출점검·교정가스<br />관리
                    </h3>
                  </div>

                  {/* 사번 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">사번</label>
                    <div className="h-9 rounded-md border bg-background flex items-center px-3 text-xs">
                      1189101
                    </div>
                  </div>

                  {/* 이름 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">이름</label>
                    <div className="h-9 rounded-md border bg-background flex items-center px-3 text-xs">
                      홍길동
                    </div>
                  </div>

                  {/* 정보 저장 */}
                  <div className="flex items-center gap-2 relative">
                    <span className="inline-block h-3.5 w-3.5 rounded-sm border bg-background" />
                    <span className="text-[11px]">정보 저장</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/40 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      클릭
                    </span>
                  </div>

                  {/* 로그인 버튼 (빨간 강조) */}
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

      {/* 2. 대시보드 */}
      <SectionCard num={2} title="대시보드">
        <p>
          건별 상태에 따라 현황이 집계되어 표시됩니다. 카드의 숫자를 클릭하면 현황표의 해당 PJT로 이동합니다.
        </p>

        <div className="rounded-md border bg-card p-3">
          <img
            src={dashboardImg}
            alt="대시보드 KPI 카드 예시"
            className="w-full h-auto rounded"
          />
        </div>

        <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
          <li><b>확인필요</b> : 환경영업팀에서 신규 건 등록한 상태</li>
          <li><b>반출예정</b> : FE팀에서 반출 예정일자를 기입한 상태</li>
          <li><b>반출완료</b> : 반출일자가 현재 일자보다 이전인 경우</li>
          <li><b>점검중</b> : 입고일자가 기입된 경우 또는 1차 점검완료일자가 기입된 경우</li>
          <li><b>재설치 대기</b> : 최종 점검 완료된 경우</li>
          <li><b>계약납기 7일전</b> : 계약납기를 입력한 항목에 한해 납기일로부터 7일 이내인 경우</li>
        </ul>
      </SectionCard>

      {/* 3. 현황표 */}
      <SectionCard num={3} title="현황표">
        <p>좌측 메뉴 <b>현황표</b>를 클릭하면 반출점검 목록이 표시됩니다.</p>

        {/* 조회 */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold text-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <span>조회</span>
          </h3>
          <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed">
            <li>
              상단의 필터 기능을 통해 상태별로 조회가 가능합니다. 또한, 세일즈오더 또는 고객지원요청서 구분별로도 조회 가능합니다.
              <figure className="mt-2 rounded-md border bg-muted/30 p-2 inline-block max-w-full">
                <img
                  src={statusFilterImg}
                  alt="현황표 상단 필터 (상태/구분/계약납기 7일전/반출 필요/재설치 필요)"
                  className="block h-9 w-auto max-w-full rounded"
                />
                <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 현황표 상단 필터 영역</figcaption>
              </figure>
            </li>
            <li>
              <p>검색은 우상단의 검색 기능을 통해 가능합니다.</p>
              <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
                <img
                  src={statusSearchImg}
                  alt="현황표 우상단 검색창 (건명 / 관리번호 / Serial No 검색)"
                  className="block h-9 w-auto max-w-full rounded"
                />
                <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 현황표 우상단 검색창</figcaption>
              </figure>
            </li>
            <li>
              해당 행을 클릭 시{" "}
              <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                등록
              </span>,{" "}
              <span className="inline-flex items-center align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                반출예정/반출일 입력
              </span>,{" "}
              <span className="inline-flex items-center align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                입고/점검 입력
              </span>{" "}
              버튼이 활성화됩니다.
              <ul className="list-disc pl-5 mt-1">
                <li>위 액션은 각 부서별로 권한이 부여되어 있으므로 권한 수정이 필요한 경우 관리자에게 연락바랍니다.</li>
              </ul>
            </li>
            <li>해당 행을 더블클릭 시 상세조회가 가능합니다.</li>
            <li>상세조회 화면에서는 발주처에서 승인한 교체부품 리스트 조회가 가능합니다. (환경영업팀 입력)</li>
          </ol>
        </div>

        {/* 등록 */}
        <div className="space-y-2 pt-2">
          <h3 className="flex items-center gap-2 font-semibold text-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <span>등록</span>
          </h3>

          <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed">
            <li>
              <b>공통사항</b>
              <ul className="list-disc pl-5 mt-1">
                <li>각 단계별로 일자가 기입되면 이후 담당 부서에 알림이 전송됩니다.</li>
              </ul>
            </li>
            <li>
              <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                등록
              </span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>고객사로부터 요청받은 반출일자, 재설치 요청일자, 세일즈오더 등 기본 정보를 입력하는 화면입니다. (환경영업팀 또는 QC팀에서 입력합니다)</li>
                <li>요청유형에서 세일즈오더 또는 고객지원요청서 선택이 가능하며, 고객지원요청서는 해당 파일을 첨부 가능합니다.</li>
                <li>등록 단계에서 반출장비 모델명을 입력 후 1차 점검이 완료되면 해당 장비의 S/N가 현황표에서 매칭됩니다.</li>
              </ul>
            </li>
            <li>
              <span className="inline-flex items-center align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                반출예정/반출일 입력
              </span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>고객사의 요청일자를 확인 후 FE팀에서 반출예정일자를 입력합니다.</li>
                <li>일정이 확정된 경우 FE팀에서 반출일자를 입력합니다.</li>
              </ul>
            </li>
            <li>
              <span className="inline-flex items-center align-middle px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                입고/점검 입력
              </span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>제품혁신팀에서 입고일자를 입력합니다.</li>
                <li>제조기술팀에서는 입고된 장비에 대해 1차 점검이 완료되면 '1차 점검 완료일자'를 기입합니다. 이후 [1차 점검보고서] 메뉴에서 점검보고서 작성이 가능합니다.</li>
                <li>제조기술팀에서 최종 점검이 완료되면 '최종 점검 완료일자'를 기입합니다. 이후 [최종 점검보고서] 메뉴에서 점검보고서 작성이 가능합니다.</li>
              </ul>
            </li>
            <li>
              <span className="inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-md border border-accent text-accent bg-background text-xs font-medium shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                종결
              </span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>재설치일자가 확정으로 표시된 건에 한해 종결처리가 가능합니다.</li>
                <li>업무가 완료된 경우 [종결] 버튼 클릭 시 하단의 완료된 건으로 이동됩니다.</li>
              </ul>
            </li>
          </ol>
        </div>
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

        <ol className="list-decimal pl-5 space-y-4 text-sm leading-relaxed">
          <li>
            <p>
              아래 카드에서 1차 점검보고서를 작성할 건명을 선택 가능합니다. 해당 리스트에는 <b>입고완료 이후의 상태 건</b>만 조회됩니다.
            </p>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
              <img
                src={firstReportSelectCaseImg}
                alt="대상 건 선택 카드 (입고완료 이후 건만 조회)"
                className="block w-full max-w-md h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 대상 건 선택</figcaption>
            </figure>
          </li>

          <li>
            <p>
              건명을 선택하면 보고서를 작성할 장비를 선택 가능합니다. 선택 후 <b>[1차 점검보고서 작성]</b>을 클릭합니다.
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>1개의 장비에 1개의 보고서 생성 가능</li>
            </ul>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
              <img
                src={firstReportSelectEquipmentImg}
                alt="장비 선택 후 [1차 점검보고서 작성] 클릭"
                className="block w-full max-w-md h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 장비 선택 및 보고서 작성</figcaption>
            </figure>
          </li>

          <li>
            <p>
              1차 점검보고서 팝업창이 생성되면 내용 입력 후 하단 <b>[임시저장]</b> 버튼을 클릭합니다. 내용 검토 후 <b>[완료]</b> 버튼을 누르면 작성이 완료됩니다.
            </p>
          </li>

          <li>
            <p>
              작성완료된 보고서에 대해 하단의 버튼으로 <b>수정</b> 또는 <b>검토완료</b>를 클릭합니다. <b>[제조 검토 완료]</b> 클릭 시 제조기술팀 서명이 보고서 표지에 삽입됩니다.
            </p>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
              <img
                src={firstReportMfgReviewImg}
                alt="수정 / 제조 검토 완료 버튼"
                className="block w-auto max-w-md h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 제조 검토 완료 버튼</figcaption>
            </figure>
          </li>

          <li>
            <p>
              제조기술팀 검토가 완료되면 품질팀으로 알림이 전송되며, 품질에서는 하기 버튼으로 보고서 검토 역할을 수행합니다.
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><b>품질검토</b> : 검토 내용 저장</li>
              <li><b>품질본부 검토 완료</b> : 검토 승인, 보고서 표지에 품질팀 서명 삽입</li>
            </ul>
            <div className="mt-2 flex flex-wrap gap-3">
              <figure className="rounded-md border bg-muted/30 p-2 block">
                <img
                  src={firstReportQaReviewImg}
                  alt="품질 검토 버튼"
                  className="block w-auto max-w-[220px] h-auto rounded"
                />
                <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 품질 검토</figcaption>
              </figure>
              <figure className="rounded-md border bg-muted/30 p-2 block">
                <img
                  src={firstReportQaDoneImg}
                  alt="품질본부 검토 완료 버튼"
                  className="block w-auto max-w-[260px] h-auto rounded"
                />
                <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 품질본부 검토 완료</figcaption>
              </figure>
            </div>
          </li>

          <li>
            <p>
              모든 보고서는 앱 내에서 작성, 저장 및 다운로드가 가능합니다. 또한, 원활한 버전관리를 위해 다운로드 후 변경한 문서를 업로드 가능합니다.
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                보고서 내 이미지를 삽입한 경우 <b>[Word 다운로드]</b> 시 아래 팝업창이 생성될 수 있으나, ‘확인’ → ‘예’를 클릭하면 정상 다운로드 됩니다.
              </li>
            </ul>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
              <img
                src={firstReportDocMgmtImg}
                alt="문서 관리 - Word 다운로드 / 수정본 업로드"
                className="block w-full max-w-md h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 문서 관리 (Word 다운로드 / 수정본 업로드)</figcaption>
            </figure>
          </li>

          <li>
            <p>
              작성완료된 보고서는 하단의 메뉴에서 건별 검색 및 보고서 조회가 가능합니다.
            </p>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 block max-w-full">
              <img
                src={firstReportCompletedListImg}
                alt="작성완료된 보고서 리스트 - 건별 검색 및 상세보기"
                className="block w-full max-w-3xl h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 작성완료된 보고서 리스트 (검색 / 상세보기)</figcaption>
            </figure>
          </li>
        </ol>
      </SectionCard>

      {/* 5. 완료 보고서 */}
      <SectionCard num={5} title="완료 점검보고서">
        <p className="text-sm leading-relaxed">
          <b>1차 점검보고서</b> 메뉴와 사용방법 동일
        </p>
      </SectionCard>

      {/* 6. 알림센터 */}
      <SectionCard num={6} title="알림센터">
        <ul className="list-disc pl-5 space-y-4 text-sm leading-relaxed">
          <li>
            <p>
              우상단 종 아이콘 또는 좌측 메뉴 <b>알림센터</b>에서 새 알림을 확인합니다.
            </p>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 inline-block">
              <img
                src={notificationMenuImg}
                alt="좌측 메뉴 - 알림센터"
                className="block w-auto max-w-[180px] h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 좌측 메뉴 알림센터</figcaption>
            </figure>
          </li>

          <li>
            <p>
              담당자 별로 해당 업무에 대해 알림이 발송됩니다. <b>전체보기</b> 클릭 또는 좌측 <b>알림센터</b> 메뉴를 통해 알림에 대해 상세확인이 가능합니다.
            </p>
            <figure className="mt-2 rounded-md border bg-muted/30 p-2 inline-block">
              <img
                src={notificationPopoverImg}
                alt="우상단 종 아이콘 알림 팝업 - 전체보기"
                className="block w-auto max-w-[260px] h-auto rounded"
              />
              <figcaption className="mt-1 text-[11px] text-muted-foreground">▲ 종 아이콘 알림 팝업 (전체보기)</figcaption>
            </figure>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
