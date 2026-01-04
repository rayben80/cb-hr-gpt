---
name: project-analysis
description: 프로젝트 구조, 기술 스택, 패턴, 컨벤션 분석. 새 코드베이스 작업 시작, 온보딩, "이 프로젝트가 어떻게 동작하나요?" 질문 시 사용.
---

# Project Analysis Skill (프로젝트 분석)

프로젝트 분석 시 다음 순서로 체계적으로 정보 수집 및 제시:

## 1. 빠른 개요 (30초)

```bash
# 일반적인 프로젝트 마커 확인
ls -la
cat README.md 2>/dev/null | head -50
```

## 2. 기술 스택 탐지

### 패키지 매니저 & 의존성
- `package.json` → Node.js/JavaScript/TypeScript
- `requirements.txt` / `pyproject.toml` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` / `build.gradle` → Java

### 프레임워크 (의존성에서)
- React, Vue, Angular, Next.js, Nuxt
- Express, FastAPI, Django, Flask
- Spring Boot, Gin, Echo

### 인프라
- `Dockerfile`, `docker-compose.yml` → 컨테이너화
- `kubernetes/`, `k8s/` → Kubernetes
- `terraform/`, `.tf` 파일 → IaC
- `.github/workflows/` → GitHub Actions

## 3. 프로젝트 구조 분석

주석과 함께 트리로 제시:

```
project/
├── src/              # 소스 코드
│   ├── components/   # UI 컴포넌트 (React/Vue)
│   ├── services/     # 비즈니스 로직
│   ├── models/       # 데이터 모델
│   └── utils/        # 공유 유틸리티
├── tests/            # 테스트 파일
├── docs/             # 문서
└── config/           # 설정
```

## 4. 핵심 패턴 식별

찾아서 보고:
- **아키텍처**: 모놀리스, 마이크로서비스, 서버리스, 모노레포
- **API 스타일**: REST, GraphQL, gRPC, tRPC
- **상태 관리**: Redux, Zustand, MobX, Context
- **데이터베이스**: SQL, NoSQL, 사용된 ORM
- **인증**: JWT, OAuth, Sessions
- **테스팅**: Jest, Vitest, Playwright 등

## 5. 개발 워크플로우

확인:
- `.eslintrc`, `.prettierrc` → 린팅/포맷팅
- `.husky/` → Git 훅
- `Makefile` → 빌드 명령
- `scripts/` in package.json → NPM 스크립트

## 6. 출력 형식

```markdown
# 프로젝트: [이름]

## 개요
[1-2문장 설명]

## 기술 스택
| 카테고리 | 기술 |
|----------|------|
| 언어 | TypeScript |
| 프레임워크 | React + Vite |
| 데이터베이스 | - |
| ... | ... |

## 아키텍처
[도움이 되면 간단한 ASCII 다이어그램과 함께 설명]

## 주요 디렉토리
- `src/` - [목적]
- `lib/` - [목적]

## 진입점
- Main: `src/main.tsx`
- API: `src/api/`
- 테스트: `npm test`

## 컨벤션
- [네이밍 컨벤션]
- [파일 구성 패턴]
- [코드 스타일 선호]

## 빠른 명령어
| 액션 | 명령어 |
|------|--------|
| 설치 | `npm install` |
| 개발 | `npm run dev` |
| 테스트 | `npm test` |
| 빌드 | `npm run build` |
```
