---
description: Vitest 단위 테스트 환경을 설정합니다
---

# Vitest 테스트 환경 설정

// turbo-all

## 단계

1. Vitest 및 Testing Library 설치

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

1. `vitest.config.ts` 생성 (또는 vite.config.ts에 추가):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

1. `src/test/setup.ts` 생성:

```typescript
import '@testing-library/jest-dom';
```

1. `package.json` 스크립트 추가:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

1. 예시 테스트 파일 생성:

```typescript
// src/test/components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Button', () => {
  it('렌더링되어야 한다', () => {
    // 테스트 코드
  });
});
```

## 실행 방법

```bash
npm test              # watch 모드
npm run test:run      # 한 번 실행
npm run test:coverage # 커버리지 리포트
```

## 체크리스트

- [ ] vitest 패키지 설치
- [ ] vitest.config.ts 생성
- [ ] setup.ts 생성
- [ ] package.json 스크립트 추가
- [ ] 예시 테스트 작성
