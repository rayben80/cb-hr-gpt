---
description: 코드 작성 시 모듈/컴포넌트/라이브러리 구조를 강제하는 가이드라인
---

# 개발 가이드라인: 모듈화 및 컴포넌트화 원칙

이 워크플로우는 새로운 기능을 개발하거나 기존 코드를 수정할 때 반드시 따라야 하는 구조적 원칙을 정의합니다.

## 1. UI 컴포넌트 규칙

### 1.1 시스템 컴포넌트 사용 필수

- **Button**: `src/components/common.tsx`의 `Button` 컴포넌트를 사용합니다.
  - `variant`: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`, `soft`
  - `size`: `sm`, `md`, `lg`, `icon`
  - 절대로 `<button className="...">` 형태의 하드코딩 금지

- **Card**: 모든 카드 형태의 UI는 `Card` 컴포넌트를 사용합니다.
  - `hoverEffect`: 호버 시 애니메이션 필요 시 true
  - `as`: 폴리모픽 렌더링 (`button`, `a` 등)

- **Badge**: 상태 표시, 태그 등은 `Badge` 컴포넌트를 사용합니다.
  - `variant`: `primary`, `secondary`, `destructive`, `success`, `warning`, `info`

- **Modal**: 모든 모달/다이얼로그는 `Modal` 컴포넌트를 사용합니다.
  - `Dialog`를 직접 import하지 말고, `Modal`을 사용합니다.

- **InputField**: 모든 입력 필드는 `InputField` 컴포넌트를 사용합니다.

### 1.2 새 컴포넌트 추가 시

1. `src/components/common.tsx`에 추가합니다.
2. 테마 변수(`--primary`, `--secondary` 등)를 사용하여 스타일링합니다.
3. 하드코딩된 색상(`#7c3aed`, `bg-indigo-600` 등) 사용을 피합니다.

## 2. 파일 크기 제한

### 2.1 ESLint 경고 기준

- **파일당 최대 400줄** (주석/공백 제외)
- **함수당 최대 100줄**
- **순환 복잡도 15 이하**
- **중첩 4단계 이하**

### 2.2 초과 시 조치

1. 내부 컴포넌트를 별도 파일로 분리합니다.
2. 비즈니스 로직을 커스텀 훅으로 추출합니다.
3. 반복되는 로직을 유틸리티 함수로 분리합니다.

## 3. 비즈니스 로직 분리 (Custom Hooks)

### 3.1 훅으로 분리해야 하는 경우

- 데이터 페칭 및 상태 관리 (예: `useEvaluationData`)
- 복잡한 필터링/검색 로직
- 여러 상태를 조합하여 파생 상태를 만드는 경우
- 재사용 가능한 UI 상호작용 로직

### 3.2 훅 파일 구조

```
src/hooks/
├── common/              # 공통 훅
│   ├── useDebounce.ts
│   └── index.ts         # 배럴 파일
├── organization/        # 도메인별 훅
│   ├── useTeamFilters.ts
│   └── index.ts
├── evaluation/
│   ├── useEvaluationData.ts
│   └── index.ts
└── index.ts             # 메인 배럴 파일
```

## 4. 테마 및 스타일링

### 4.1 색상

- CSS 변수를 사용합니다: `hsl(var(--primary))`, `text-primary`, `bg-card` 등
- 테마 전환 시 자동으로 색상이 변경되도록 합니다.

### 4.2 그라디언트 및 그림자

- `gradient-primary`, `shadow-primary` 등 CSS 유틸리티 클래스를 사용합니다.
- 하드코딩된 RGB 값 사용을 피합니다.

## 5. 체크리스트 (PR 전 확인)

- [ ] 새 버튼은 `Button` 컴포넌트를 사용했는가?
- [ ] 새 카드는 `Card` 컴포넌트를 사용했는가?
- [ ] 새 모달은 `Modal` 컴포넌트를 사용했는가?
- [ ] 파일이 400줄을 초과하지 않는가?
- [ ] 하드코딩된 색상이 없는가?
- [ ] 복잡한 로직은 커스텀 훅으로 분리했는가?
- [ ] TypeScript 빌드가 통과하는가?
