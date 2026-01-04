---
description: GitHub Actions CI/CD 파이프라인을 설정합니다
---

# GitHub Actions CI/CD 설정

// turbo-all

## 단계

1. `.github/workflows/` 폴더 생성

```bash
mkdir -p .github/workflows
```

1. `.github/workflows/ci.yml` 파일 생성:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint --if-present
      - run: npm test -- --run

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

## 선택 사항

### E2E 테스트 추가

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: npx playwright test
```

### 자동 배포 (Vercel/Netlify)

Vercel이나 Netlify는 GitHub 연동 시 자동으로 배포됩니다.

## 체크리스트

- [ ] .github/workflows/ci.yml 생성
- [ ] 브랜치 보호 규칙 설정 (선택)
- [ ] E2E 테스트 추가 (선택)
