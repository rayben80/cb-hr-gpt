---
description: 새 프로젝트에 Playwright E2E 테스트 환경을 설정합니다
---

# Playwright E2E 설정

// turbo-all

## 단계

1. Playwright 패키지 설치

```bash
npm install -D @playwright/test
```

1. Playwright 브라우저 설치

```bash
npx playwright install chromium
```

1. `playwright.config.ts` 파일 생성 (프로젝트 루트):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

1. `e2e/` 폴더 생성 및 기본 테스트 파일 생성:

```typescript
// e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test('페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});
```

1. `package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 실행 방법

```bash
npm run test:e2e      # 헤드리스 실행
npm run test:e2e:ui   # UI 모드로 실행
```
