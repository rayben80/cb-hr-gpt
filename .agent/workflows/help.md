---
description: 사용 가능한 모든 워크플로우 목록을 보여줍니다
---

# 📋 개발 도구 가이드

## 🚀 새 프로젝트 시작할 때 (이것부터 하세요!)

### 방법 1: 나한테 말하기 (가장 쉬움)
```
"새 프로젝트에 설정 복사해줘"
```
그러면 제가 알아서 해드립니다!

### 방법 2: 배치 파일 실행
1. `d:\cb-hr-gpt\_template\새프로젝트설정.bat` 더블클릭
2. 새 프로젝트 폴더 경로 입력
3. 끝!

---

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

## 🎯 Claude Code Skills (개발 모드)

Claude에게 특정 역할을 부여하는 개발 모드입니다.

### 개발 모드 (Commands)

| 모드 | 설명 | 언제 사용? |
|------|------|-----------|
| **Architect** | 시스템 설계 모드 | 기능 구현 전 아키텍처 설계, ADR 작성 |
| **Mentor** | 교육/학습 모드 | 새 기술 학습, 코드 이해, 개념 설명 |
| **Rapid** | 빠른 개발 모드 | 프로토타입, MVP, 시간 민감 작업 |
| **Review** | 코드 리뷰 모드 | PR 리뷰, 버그/보안/성능 점검 |
| **Security** | 보안 검토 모드 | OWASP 기반 취약점 점검 |
| **Refactor** | 리팩토링 모드 | 코드 품질 개선, 중복 제거 |
| **Debug** | 디버깅 모드 | 버그 원인 분석 및 해결 |
| **Docs** | 문서화 모드 | README, JSDoc, API 문서 작성 |
| **Design** | UI/UX 모드 | 사용자 경험, 접근성, 시각 디자인 |

### 사용법

```plaintext
"Architect 모드로 전환해줘" → 설계 먼저, 트레이드오프 분석
"Mentor 모드로 설명해줘" → 단계별 설명, 왜 이렇게 하는지
"Rapid 모드로 빨리 구현해줘" → TODO 남기고 빠르게
"Review 모드로 검토해줘" → 심각도별 이슈 분류
"Security 모드로 점검해줘" → OWASP 기반 보안 검토
"Design 모드로 개선해줘" → UI/UX, 접근성 개선
```

### 지식 스킬 (Skills)

| 스킬 | 설명 |
|------|------|
| **project-analysis** | 프로젝트 구조, 기술 스택, 패턴 분석 |
| **testing-strategy** | 테스트 피라미드, 커버리지 전략 |
| **performance-optimization** | React/웹 성능 최적화 가이드 |

### 코딩 규칙 (Rules)

| 규칙 | 적용 대상 |
|------|----------|
| **typescript.md** | any 금지, interface 우선, import 순서 |
| **react.md** | memo, displayName, 핸들러 네이밍 |
| **testing.md** | Vitest 구조, 모킹 패턴 |
| **styling.md** | Tailwind 클래스 순서, 인라인 스타일 금지 |

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
| **Gemini Code Assist** | Google AI 코딩 어시스턴트 | AI 기반 코드 제안 및 채팅 |

---

## 🔌 MCP 서버 (Model Context Protocol)

Claude가 외부 서비스와 연동할 수 있는 도구들입니다.

### 개발 도구

| MCP 서버 | 설명 | 사용 예시 |
|----------|------|----------|
| **github** | GitHub 리포지토리 관리 | PR 생성, 이슈 관리, 파일 커밋 |
| **context7** | 라이브러리 문서 검색 | React, Next.js 등 최신 문서 조회 |
| **cloudrun** | Google Cloud Run 배포 | 서비스 배포, 로그 확인 |

### Firebase/Google

| MCP 서버 | 설명 | 사용 예시 |
|----------|------|----------|
| **firebase** | Firebase 프로젝트 관리 | 앱 생성, 보안 규칙, SDK 설정 |

### 생산성 도구

| MCP 서버 | 설명 | 사용 예시 |
|----------|------|----------|
| **notion** | Notion 워크스페이스 | 페이지 생성, 데이터베이스 쿼리 |
| **perplexity-ask** | AI 웹 검색 | 최신 기술 정보 검색 |

### 💡 MCP 사용 팁

```plaintext
"GitHub에 PR 만들어줘"
"React 18 문서에서 useEffect 사용법 찾아줘"
"Firebase 프로젝트 상태 확인해줘"
"Notion에 새 페이지 만들어줘"
"perplexity로 Next.js 15 변경사항 검색해줘"
```

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
