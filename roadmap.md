# DXG 사내 이관 자료 패키지 (요청 2026-10-16)

## 작업 목록
- [x] 1. 소스 코드 전체 zip (최신, 201개 파일) → dxg-source-20261016.zip
- [x] 2. DB 서버 정의 덤프: public DDL+GRANT+RLS 34정책, 함수 1개, 트리거, 스토리지 버킷/정책. cron·Edge Functions 없음 확인
- [x] 3. 권한·알림 규칙 문서 (MIGRATION-GUIDE.md 3번 절)
- [x] 4. 표 10개 전량 JSON (원본 UUID 유지, 행수 README에 기록)
- [x] 5. Storage report-files 파일 목록 2,273건 CSV + download-storage-files.py (기존 파일 존재)
- [x] 6. 패키지 묶음 dxg-migration-20261016.zip → /mnt/documents 전달 완료

## 비고
- 실제 버킷명은 report-files (요청서의 report-photos와 동일 대상)
- 컷오버 시 증분 재축출 요청 예정 (updated_at 기준)
