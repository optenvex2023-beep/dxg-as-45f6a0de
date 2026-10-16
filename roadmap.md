# DXG 사내 이관 자료 패키지 (요청 2026-10-16)

## 작업 목록
- [ ] 1. 소스 코드 전체 zip (최신, node_modules/dist/.git 제외)
- [ ] 2. DB 서버 정의 덤프: public 스키마 DDL, enum, RLS, 함수/트리거, storage 정책, cron 확인
- [ ] 3. 권한·알림 규칙 문서 (코드 기반 + noti_*SentAt 컬럼 채워지는 조건)
- [ ] 4. 표 10개 전량 JSON 내보내기 (원본 UUID 유지)
- [ ] 5. Storage 파일 목록 + 다운로드 스크립트 재전달 (버킷: report-files)
- [ ] 6. 패키지 zip 묶음 + 전달

## 비고
- Edge Functions 없음 (이전 조사 확인) — 다시 확인
- 사용자 요청의 "report-photos" 버킷은 실제 "report-files" 버킷
- 스토리지 파일 다운로드는 사용자 측에서 직접 수행 중 → 목록/스크립트만 제공
