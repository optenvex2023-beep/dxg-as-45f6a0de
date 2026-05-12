## 목표

[교정가스] → [현황표]에서 사용자가 같은 열의 연속된 행을 범위 선택한 뒤 상단 [병합]/[병합해제] 버튼을 눌러 셀을 병합/해제할 수 있도록 한다. 모든 열에서 자유롭게 병합 가능. 병합 상태는 DB에 영구 저장되어 새로고침/엑셀 export에도 반영됨.

## 핵심 동작

1. **편집/추가 모드와 별도**로 항상 존재하는 "병합 모드" 토글 버튼을 헤더 우측에 추가 (기존 [등록]/[행 추가] 옆).
2. 병합 모드 ON일 때:
   - 셀 클릭 → 시작점 선택 (파란 outline)
   - Shift+클릭 또는 같은 열 다른 셀 클릭 → 종료점 선택, 사이의 모든 행이 하늘색으로 강조
   - 같은 열에서만 범위 선택 허용 (다른 열 클릭 시 시작점 갱신)
   - 사업장(site_name) 경계는 넘을 수 없음 (현재 모든 병합 로직과 동일)
3. 범위가 2행 이상이면 우상단에 [병합] 버튼 활성화. 1셀 선택 + 이미 병합된 셀이면 [병합해제] 버튼 활성화.
4. [병합] 클릭 시 → 해당 (열, 행 범위)에 새 merge_group ID를 부여하여 DB 업데이트.
5. [병합해제] 클릭 시 → 해당 셀들의 merge_group을 0으로 리셋.

## 데이터 모델 변경

현재 schema에는 `gas_inspection_merge_group`, `velocity_inspection_merge_group`, `purchase_entity_merge_group`, `branch_merge_group`만 존재. 모든 열을 병합 가능하게 하려면 별도 테이블이 효율적:

```sql
create table public.calibration_gas_cell_merges (
  id uuid primary key default gen_random_uuid(),
  column_key text not null,           -- 예: 'analyzer_range', 'concentration', 'tms_status' 등
  inventory_item_id uuid not null,    -- 병합 그룹에 속한 각 행 id
  merge_group_id uuid not null,       -- 같은 그룹 = 같은 uuid
  created_at timestamptz not null default now(),
  updated_by text not null default '',
  unique (column_key, inventory_item_id)
);
```

- RLS: anon/authenticated SELECT/INSERT/UPDATE/DELETE 모두 허용 (다른 calibration_gas_* 테이블과 동일 정책).
- 기존 `*_merge_group` 컬럼은 그대로 유지 (가스/유속/구매주체/지점 자동 병합 + 엑셀 export 호환). 신규 테이블은 **추가 병합**(TMS/호기/분석기 Range/농도/유효기간 등 나머지 모든 열)을 위한 보강 데이터로 사용.

## 코드 변경

### 1) DB 마이그레이션
- 위 `calibration_gas_cell_merges` 테이블 + RLS 정책 생성.

### 2) Context (`src/contexts/CalibrationGasContext.tsx`)
- `cellMerges: Map<colKey -> Map<itemId -> mergeGroupId>>` 상태와 fetch 로직 추가.
- `mergeCells(colKey, itemIds[])` / `unmergeCells(colKey, itemIds[])` 액션 추가 (insert/delete + 로컬 상태 갱신).

### 3) `CalibrationGasInventory.tsx`
- `mergeMode` 상태 + 병합 모드 토글 버튼 추가.
- `selection: { colKey, startIdx, endIdx } | null` 상태와 셀 클릭 핸들러 추가.
- `rowSpanData` 계산을 확장: 기존 자동 병합(site/tms/unit/gas/vel/purchase/branch)에 더해, **`cellMerges`에서 같은 mergeGroupId를 가진 연속 행**을 모든 열에 적용. 우선순위:
  1. 기존 *_merge_group 컬럼 기반 자동 병합 (호환 유지)
  2. `calibration_gas_cell_merges`에 등록된 수동 병합
- `renderCell` / `renderMergedCell` 호출 시 colKey별 span lookup → 첫 행만 출력, 나머지는 null.
- 병합 모드일 때 `<td>`에 selection 강조 클래스 + onClick 핸들러 부착.

### 4) 엑셀 export (`src/lib/calGasTemplateExport.ts`)
- `cellMerges` 데이터를 받아 해당 열의 추가 `mergeCells` 호출 (기존 gas/vel/purchase/branch 병합과 합쳐서). column_key → Excel column index 매핑 테이블 추가.

## 안전장치 / 비변경 영역

- **반출점검**, FirstReport/FinalReport, 사진 첨부, Word export 등 기타 기능은 일절 건드리지 않음.
- 기존 자동 병합(site_name/tms/unit/gas/vel/purchase/branch) 로직과 DB 컬럼은 유지 → 기존 데이터 호환.
- 권한 제한 없이 모든 사용자가 병합 가능 (필요하면 다음 요청에서 화이트리스트 추가 가능).

## 분량/리스크

- 신규 테이블 1개, Context 약 80줄 추가, 페이지 약 200줄 수정, 엑셀 export 약 30줄 추가.
- 가장 복잡한 부분은 "두 종류 병합(자동 + 수동)을 한 셀에 동시에 적용했을 때의 span 계산". 같은 열에 두 병합이 충돌하면 **수동 병합 우선** 규칙으로 단순화.

진행해도 될까요? 또는 권한 제한(특정 사용자만), 모든 열 대신 일부 열만 등 조정이 필요하면 말씀해주세요.
