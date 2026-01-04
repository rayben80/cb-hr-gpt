---
description: 사용 가능한 모든 워크플로우 목록을 보여줍니다
---

# 📋 개발 도구 가이드

## 🤖 Claude 워크플로우 명령어

### 테스트 설정

| 명령어 | 설명 | 언제 사용? |
|--------|------|-----------|
| `/playwright-setup` | Playwright E2E 환경 설정 | 새 프로젝트에서 브라우저 자동화 테스트가 필요할 때 |
| `/test-setup` | Vitest 단위 테스트 설정 | 새 프로젝트에서 컴포넌트/함수 테스트가 필요할 때 |

### 코드 생성

| 명령어 | 설명 | 언제 사용? |
|--------|------|-----------|
| `/new-component` | React 컴포넌트 생성 | 새로운 UI 컴포넌트를 만들 때 |
| `/new-hook` | 커스텀 훅 생성 | 재사용 가능한 로직을 훅으로 분리할 때 |

### 프로젝트 설정

| 명령어 | 설명 | 언제 사용? |
|--------|------|-----------|
| `/ci-setup` | GitHub Actions 설정 | GitHub에 푸시할 때 자동 테스트/빌드가 필요할 때 |
| `/dev-guideline` | 개발 가이드라인 | 코드 스타일 규칙을 확인할 때 |

---

## 🔧 설치된 VS Code 확장 프로그램

### 필수 도구

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **ESLint** | 코드 린팅 | 자동으로 동작 - 코드 문제 실시간 표시 |
| **Prettier** | 코드 포맷팅 | 저장 시 자동 정렬 (Ctrl+Shift+F) |
| **EditorConfig** | 에디터 설정 동기화 | 자동으로 동작 - 탭/스페이스 등 통일 |

### 테스트

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **Playwright** | E2E 테스트 실행 | 사이드바에서 테스트 실행/디버깅 |
| **Vitest Explorer** | 단위 테스트 탐색기 | 사이드바에서 테스트 결과 확인 |

### React/TypeScript

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **ES7 React Snippets** | 코드 스니펫 | `rafce` → 함수형 컴포넌트 자동 생성 |
| **Tailwind IntelliSense** | Tailwind 자동완성 | 클래스 입력 시 추천/미리보기 |
| **Auto Rename Tag** | HTML 태그 자동 수정 | 여는 태그 수정하면 닫는 태그도 수정 |
| **Path Intellisense** | 파일 경로 자동완성 | import 시 파일 경로 추천 |

### Git

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **GitLens** | Git 히스토리 | 코드 한 줄이 누가 언제 수정했는지 보기 |
| **Git Graph** | 브랜치 시각화 | Ctrl+Shift+G G → 브랜치 그래프 보기 |

### 생산성

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **Error Lens** | 에러 인라인 표시 | 자동 동작 - 에러가 줄 옆에 바로 표시 |
| **Code Spell Checker** | 맞춤법 검사 | 오타 자동 감지 (영어) |
| **TODO Highlight** | TODO 강조 | TODO, FIXME 주석 색상 강조 |
| **Todo Tree** | TODO 목록 관리 | 사이드바에서 모든 TODO 한눈에 보기 |

### AI 도구

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **GitHub Copilot** | AI 코드 자동완성 | Tab으로 AI 추천 코드 수락 |
| **Copilot Chat** | AI 채팅 | Ctrl+I → AI에게 질문/코드 생성 |

### API/HTTP 테스트

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **REST Client** | HTTP 요청 테스트 | `.http` 파일에서 API 테스트 |
| **Thunder Client** | Postman 대안 | 사이드바에서 GUI로 API 테스트 |

### 시각 도구

| 확장 | 설명 | 언제 사용? |
|------|------|-----------|
| **Material Icon Theme** | 파일 아이콘 | 자동 동작 - 파일 타입별 예쁜 아이콘 |
| **Better Comments** | 주석 색상 구분 | `// TODO`, `// !`, `// ?` 각각 다른 색상 |
| **Import Cost** | 패키지 크기 표시 | import 옆에 번들 크기 표시 |
| **Color Highlight** | CSS 색상 미리보기 | `#fff` 같은 색상 코드 배경색으로 표시 |

---

## 📁 npm 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm test             # 단위 테스트 (watch 모드)
npm test -- --run    # 단위 테스트 (1회)
npx playwright test  # E2E 테스트
```

---

💡 **이 목록을 보려면 `/help` 라고 말하세요!**
