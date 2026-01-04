# Performance Evaluation Portal

성과 평가 관리 시스템 - 조직 관리, 평가 진행, 결과 분석을 위한 통합 웹 애플리케이션

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Testing**: Vitest + Playwright

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트 (common, dashboard, evaluation, organization)
├── hooks/          # 커스텀 훅 (dashboard, evaluation, organization)
├── services/       # 비즈니스 로직 서비스
├── features/       # 기능별 모듈 (evaluation, template)
├── pages/          # 페이지 컴포넌트
├── contexts/       # React Context
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
└── test/           # 테스트 코드
```

## 주요 명령어

```bash
npm run dev          # 개발 서버 (Vite)
npm run build        # 프로덕션 빌드
npm test             # Vitest 단위 테스트
npx playwright test  # E2E 테스트
npm run lint         # ESLint 검사
```

## 코드 스타일 규칙

1. **경로 별칭**: `@/` 사용 (예: `@/components/common/Button`)
2. **파일 크기**: 단일 파일 500줄 이내
3. **타입 안전성**: `any` 타입 사용 금지
4. **테스트**: 새 기능 추가 시 반드시 테스트 작성
5. **컴포넌트**: memo, displayName 활용

## 컴포넌트 패턴

```tsx
import { memo } from 'react';

interface Props {
  // props 정의
}

export const ComponentName = memo(({ prop }: Props) => {
  return <div>...</div>;
});

ComponentName.displayName = 'ComponentName';
```

## 훅 패턴

```tsx
/**
 * @description 훅 설명
 * @param param - 파라미터 설명
 * @returns 반환값 설명
 */
export function useHookName(param: Type) {
  // 구현
  return { /* ... */ };
}
```

## 테스트 패턴

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

## 주의사항

- ARIA 속성은 불리언 값 사용 (`aria-pressed={true}` not `"true"`)
- 인라인 스타일 최소화, CSS 클래스 사용 권장
- 한국어 UI, 영어 코드/변수명
