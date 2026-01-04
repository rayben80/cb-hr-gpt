# 테스트 규칙

## 테스트 프레임워크

- **단위 테스트**: Vitest + React Testing Library
- **E2E 테스트**: Playwright

## 파일 위치

```
src/
├── test/
│   ├── components/    # 컴포넌트 테스트
│   ├── hooks/         # 훅 테스트
│   ├── utils/         # 유틸리티 테스트
│   └── integration/   # 통합 테스트
e2e/
└── *.spec.ts          # E2E 테스트
```

## 네이밍 규칙

- 단위 테스트: `ComponentName.test.tsx`
- 통합 테스트: `FeatureName.integration.test.tsx`
- E2E 테스트: `feature-name.spec.ts`

## 테스트 구조

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 렌더링 테스트
  describe('rendering', () => {
    it('should render correctly', () => {
      render(<Component />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // 인터랙션 테스트
  describe('interactions', () => {
    it('should handle click', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Component onClick={onClick} />);
      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
```

## 테스트 우선순위

1. **비즈니스 로직** - 훅, 서비스
2. **사용자 인터랙션** - 폼, 버튼
3. **조건부 렌더링** - 상태에 따른 UI

## 모킹

```tsx
// 모듈 모킹
vi.mock('@/services/api', () => ({
  fetchData: vi.fn(),
}));

// 함수 모킹
const mockFn = vi.fn().mockResolvedValue({ data: [] });
```
