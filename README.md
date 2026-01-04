# Performance Evaluation Portal

성과 평가 관리 시스템 - 조직 관리, 평가 진행, 결과 분석을 위한 통합 웹 애플리케이션

## 🚀 주요 기능

- **조직 관리**: 팀/파트 구조 관리, 멤버 관리, 조직 개편
- **평가 관리**: 평가 진행, 결과 조회, 연년 종합 평가
- **평가 라이브러리**: 평가 템플릿 생성 및 관리
- **에러 로그 관리**: 애플리케이션에서 발생하는 에러를 모달로 확인 및 관리
- **에러 상세 정보**: 에러 메시지, 스택 트레이스, 발생 위치 정보 포함

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite 5

## 📋 필수 요구사항

- Node.js 18+
- npm 또는 yarn

## 🏃‍♂️ 로컬 실행 방법

1. **의존성 설치**:

   ```bash
   npm install
   ```

2. **환경변수 설정** (선택사항):

   ```bash
   # .env.local.template을 참고하여 .env.local 파일 생성
   cp .env.local.template .env.local
   ```

   또는 수동으로 `.env.local` 파일을 생성하고 다음 내용을 추가:

   ```env
   # Gemini API 키 (AI 평가 기능용)
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **개발 서버 시작**:

   ```bash
   npm run dev
   ```

4. **테스트 실행**:

   ```bash
   npm test
   ```

5. **테스트 커버리지 확인**:

   ```bash
   npm test -- --coverage
   ```

6. **프로덕션 빌드**:

   ```bash
   npm run build
   ```

## 🔧 주요 수정사항 (v0.7)

### ✅ 해결된 문제들

- **의존성 충돌 해결**: importmap 제거 및 CDN 방식으로 변경
- **빌드 오류 수정**: 모듈 해석 문제 및 중복 파일 제거
- **확인 모달 시스템**: 브라우저 확인창을 커스텀 모달로 교체
- **동적 평가 가중치**: UI를 통한 연간 종합평가 가중치 설정
- **모달 취소 동작 일관성**: 팀/파트/멤버 추가 및 수정, 조직 개편 마법사에서 변경사항이 있을 경우 취소 시 확인 모달 표시
- **조직 개편 마법사 취소 버튼 추가**: 마지막 단계에 취소 버튼 추가 및 변경사항 확인 기능 구현
- **팀 추가 후 UI 반영 문제 해결**: 실시간 리스너를 활용하여 팀 추가 후 UI에 즉시 반영되도록 수정
- **폼 제출 오류 해결**: TeamActionModal에서 폼 제출 시 이벤트 전파 문제 해결
- **드래그 앤 드롭 기능 개선**: 멤버 이동 시 직접 반영되도록 수정
- **Firebase 의존성 제거**: Firebase 관련 모든 설정 및 코드 제거
- **WizardStep3MemberAssignment 컴포넌트 오류 수정**: undefined 오류 해결 및 테스트 추가

### 🔄 개선사항

- **타입 안전성 강화**: 엄격한 TypeScript 설정 적용
- **빌드 최적화**: Vendor 청킹 및 성능 최적화
- **코드 품질**: ESLint 규칙 강화 및 코드 정리
- **테스트 커버리지**: 전체 컴포넌트 및 훅에 대한 테스트 추가
- **UI/UX 일관성**: 모든 모달에서 단계별 UI 일관성 확보, 표준화된 버튼 디자인 적용

## 📋 개발 작업 가이드

### 📁 프로젝트 구조 관리

```plaintext
src/
├── components/        # React 컴포넌트
│   ├── common/        # 재사용 가능한 공통 컴포넌트 (Button, Modal, etc.)
│   ├── dashboard/     # 대시보드 관련 컴포넌트
│   ├── evaluation/    # 평가 관련 컴포넌트
│   ├── layout/        # 레이아웃 컴포넌트 (Sidebar, Header)
│   ├── organization/  # 조직 관리 컴포넌트
│   └── feedback/      # 피드백/에러 관련 컴포넌트
├── contexts/          # React Context (RoleContext, ErrorContext)
├── hooks/             # 커스텀 훅
│   ├── dashboard/     # 대시보드 훅 (useDashboardStats)
│   ├── evaluation/    # 평가 훅 (useEvaluationLogic)
│   └── organization/  # 조직 훅 (useOrganizationLogic)
├── services/          # 비즈니스 로직 서비스
│   ├── dashboardService.ts    # 대시보드 데이터 계산
│   ├── insightsService.ts     # 인사이트 생성 엔진
│   ├── notificationService.ts # 알림 서비스
│   └── pdfExportService.ts    # PDF 내보내기
├── utils/             # 순수 유틸리티 함수
├── styles/            # CSS 모듈 (variables, base, components, utilities)
├── types/             # TypeScript 타입 정의
├── pages/             # 페이지 컴포넌트
├── features/          # 기능별 모듈 (evaluation, template)
└── test/              # 테스트 코드 (components, hooks, utils)
```

### 🔄 코드 관리 원칙

1. **파일 크기 제한**: 단일 파일은 500줄 이내 유지
2. **컴포넌트 분리**: 복잡한 컴포넌트는 기능별로 분리
3. **훅 활용**: 반복되는 로직은 커스텀 훅으로 분리
4. **타입 안전성**: any 타입 사용 금지, 명확한 인터페이스 정의
5. **테스트 작성**: 새로운 기능 추가 시 반드시 테스트 코드 작성

### 🛠 개발 환경 관리

1. **포트 관리**: 개발 서버는 자동 포트 할당 사용
2. **불필요한 프로세스 종료**: 작업 시작 전 불필요한 Node.js 프로세스 종료
3. **테스트 실행**: 기능 개발 후 반드시 테스트 실행
4. **빌드 확인**: 배포 전 반드시 빌드 확인

## 📝 변경 이력

### 2025-09-13

- **팀 추가 후 UI 반영 문제 해결**
  - `src/hooks/useTeamPartManagement.ts`의 `handleSaveTeam` 함수 수정
  - 실시간 리스너를 활용하여 팀 추가 후 UI에 즉시 반영되도록 변경
  - 팀 수정 시에도 실시간 리스너를 활용하도록 개선
  - 팀 ID 생성 방식을 개선하여 중복 문제 해결 (팀명 + UUID 형식의 랜덤 문자열 사용)

- **폼 제출 오류 해결**
  - `src/components/organization/TeamActionModal.tsx`의 `handleSubmit` 함수 수정
  - 폼 제출 시 `e.stopPropagation()` 추가하여 이벤트 전파 문제 해결

- **드래그 앤 드롭 기능 개선**
  - `src/components/OrganizationManagement.tsx`의 `moveMemberToTeamPart` 함수 수정
  - 멤버 이동 시 직접 반영되도록 변경
  - 실시간 리스너를 활용하여 UI에 즉시 반영되도록 개선

### 2025-09-14

- **변경사항 확인 및 추가 개선**
  - 기존에 기록된 변경사항이 코드에 정상적으로 반영되었는지 확인
  - 팀 ID 생성 방식의 안정성 향상 (UUID 형식의 랜덤 문자열 사용)
  - README.md 파일에 변경사항을 명확하게 기록하여 향후 동일한 작업 반복 방지

### 2025-09-15

- **팀 추가 후 UI 반영 문제 재수정**
  - `src/hooks/useTeamPartManagement.ts`의 `handleSaveTeam` 함수 수정
  - 팀 ID 생성 방식을 사용자의 요청에 따라 팀명만으로 생성하도록 변경
  - 데이터 저장 후 UI 상태를 수동으로 업데이트하여 즉시 반영되도록 변경
  - 실시간 리스너에 의존하지 않고 직접 UI 업데이트 수행

### 2025-09-16

- **팀 추가 후 UI 반영 문제 최종 수정**
  - `src/hooks/useTeamPartManagement.ts`의 `handleSaveTeam` 함수 수정
  - 실시간 리스너에 의존하여 UI 업데이트되도록 변경
  - 팀 ID 생성 방식을 팀명 + 타임스탬프 조합으로 변경하여 충돌 방지
  - 수동으로 UI 상태를 업데이트하는 코드 제거하여 실시간 리스너에 완전히 의존하도록 변경
  - `src/components/organization/TeamActionModal.tsx`의 폼 제출 로직 유지보수

### 2025-09-17

- **팀 추가 후 UI 반영 문제 최종 해결**
  - `src/hooks/useTeamPartManagement.ts`의 `handleSaveTeam` 함수 수정
  - 사용자의 요청에 따라 팀명만으로 팀 ID 생성 (중복 시 타임스탬프 추가)
  - 실시간 리스너에 완전히 의존하여 UI 업데이트
  - 수동 UI 업데이트 코드 완전 제거

### 2025-09-18

- **권한 문제 해결**
  - 포트 충돌 문제 해결하여 개발 서버 정상 실행
  - 보안 규칙 점검 및 수정 필요사항 확인
  - 팀 추가 후 UI 반영 문제 해결을 위한 실시간 리스너 동작 확인
  - 드래그 앤 드롭 기능의 onDrop 핸들러 전달 문제 해결

### 2025-09-19

- **에러 로그 관리 기능 추가**
  - `src/components/ErrorLogModal.tsx` 생성하여 에러 로그를 모달로 확인 및 관리할 수 있도록 구현
  - 헤더에 버그 아이콘 버튼 추가하여 에러 로그 모달을 열 수 있도록 변경
  - 에러 발생 시 헤더의 버그 아이콘에 에러 개수를 표시하여 사용자에게 시각적 피드백 제공
  - 필터링 기능을 통해 에러, 경고, 정보, 성공 메시지를 구분하여 확인 가능
  - 전체 삭제 기능을 통해 에러 로그를 일괄적으로 정리할 수 있도록 개선

### 2025-09-20

- **에러 로그 상세 정보 기능 추가**
  - `src/contexts/ErrorContext.tsx` 수정하여 에러 발생 시 스택 트레이스와 파일 위치 정보를 수집하도록 개선
  - `src/components/ErrorLogModal.tsx` 업데이트하여 에러 상세 정보(스택 트레이스, 파일 위치)를 펼쳐서 확인할 수 있도록 개선
  - `src/components/TestErrorComponent.tsx` 생성하여 에러 로그 기능을 테스트할 수 있는 컴포넌트 추가
  - Dashboard에 테스트 컴포넌트 추가하여 개발 중 에러 로그 기능을 쉽게 테스트할 수 있도록 개선

### 2025-09-25

- **Firebase 의존성 제거**
  - Firebase 관련 모든 설정 및 코드를 제거하여 프로젝트를 완전히 독립적으로 변경
  - `useNetworkStatus` 훅에서 Firebase 연결 상태 관련 코드 제거
  - 테스트 파일에서 Firebase 모킹 코드 제거
  - 환경 변수 파일에서 Firebase 관련 설정 제거
  - README.md 파일에서 Firebase 관련 설명 제거

- **WizardStep3MemberAssignment 컴포넌트 오류 수정**
  - `unassignedMembers` prop에 기본값 설정하여 undefined 오류 해결
  - 파트 멤버 목록에 안전한 접근 방식 적용
  - 관련 테스트 코드 업데이트 및 새로운 테스트 추가

### 2025-09-26

- **팀 삭제 시 확인 모달 표시 문제 해결**
  - `src/components/OrganizationManagement.tsx`에서 `useTeamPartManagement` 훅에서 반환된 `confirmation` 상태를 `ConfirmationModal` 컴포넌트에 올바르게 전달하도록 수정
  - `useOrganizationData` 훅과 `useTeamPartManagement` 훅에서 반환된 `confirmation` 상태 간의 충돌 문제 해결
  - 팀 삭제 시 확인 모달이 정상적으로 표시되도록 변경

- **팀 추가 후 UI 반영 문제 최종 해결**
  - `src/hooks/useTeamPartManagement.ts`의 `handleSaveTeam` 함수에서 팀 추가 후 UI에 즉시 반영되도록 수정
  - 팀 ID 생성 방식을 팀명 기반으로 변경하고, 중복 시 타임스탬프를 추가하여 고유성 확보
  - 실시간 리스너에 완전히 의존하여 UI 업데이트되도록 변경

- **팀이 4개일 때 5개 열이 되는 버그 수정**
  - `src/components/OrganizationManagement.tsx`에서 팀 수에 따라 다른 그리드 클래스를 적용하도록 수정
  - 팀이 4개일 때 2열로 표시되도록 변경하여 UI 개선

- **팀이 4개일 때 팀 카드가 사라지는 문제 수정**
  - `src/components/OrganizationManagement.tsx`에서 팀이 4개일 때 모든 반응형 크기에서 2열로 표시되도록 수정
  - 모바일, 태블릿, 데스크탑 등 모든 화면 크기에서 팀 카드가 정상적으로 표시되도록 변경

- **팀이 4개일 때 세로 스크롤이 길어지는 문제 개선**
  - `src/components/OrganizationManagement.tsx`에서 팀이 4개일 때 3열로 표시되도록 변경
  - 세로 스크롤 길이를 줄여 사용자 경험 개선

- **팀 카드 접기/펼치기 기능 추가**
  - `src/components/organization/TeamCard.tsx`에 팀 카드 접기/펼치기 기능 추가
  - 팀 카드 상단에 접기/펼치기 버튼 추가하여 팀 정보를 필요할 때만 표시

- **팀 검색 및 필터링 기능 강화**
  - `src/components/OrganizationManagement.tsx`에 팀 이름 및 팀 리더로 검색할 수 있는 입력 필드 추가
  - `src/hooks/useOrganizationFilter.ts` 훅을 수정하여 팀 이름과 팀 리더로 필터링 가능하도록 개선
  - 구성원 이름, 팀 이름, 팀 리더로 동시에 검색 가능하도록 기능 강화

- **고급 검색 옵션 개선**
  - `src/components/OrganizationManagement.tsx`에 고급 검색 옵션 토글 기능 추가
  - 기본적으로 구성원 이름 검색만 표시하고, 필요 시 팀 이름 및 팀 리더 검색 옵션 확장 표시
  - 사용자 경험 향상을 위해 검색 영역을 간결하게 유지

- **퇴사 버튼 클릭 시 확인 모달 표시 문제 해결**
  - `src/components/organization/InactiveMemberList.tsx`에 확인 모달 기능 추가
  - 퇴사자 기록 삭제 시 확인 모달이 정상적으로 표시되도록 변경
  - 사용자 실수로 인한 퇴사자 기록 삭제를 방지하기 위한 안전 장치 구현

- **접기 버튼 UI 통일**
  - `src/components/organization/InactiveMemberList.tsx`의 접기 버튼 UI를 팀 카드의 접기 버튼과 동일한 스타일로 통일
  - 모든 접기 버튼을 오른쪽으로 정렬하여 일관된 사용자 경험 제공

- **팀 카드 접기 시 파트 추가 버튼 항상 표시**
  - `src/components/organization/TeamCard.tsx`에서 팀 카드가 접힌 상태에서도 파트 추가 버튼이 항상 표시되도록 수정
  - 사용자가 팀을 접어도 파트 추가 기능을 쉽게 사용할 수 있도록 개선

- **접기 버튼 위치 조정**
  - `src/components/organization/TeamCard.tsx`에서 접기 버튼을 오른쪽으로 이동하여 다른 버튼들과 정렬되도록 수정
  - UI 일관성을 위해 모든 접기 버튼이 오른쪽에 위치하도록 통일
  - 버튼 순서를 명확하게 조정하여 사용자 경험 향상

## ⚠️ 알려진 제한사항

- 일부 npm 패키지에 보안 취약점 존재 (esbuild 관련)
- 실제 설정 필요 (현재는 데모 설정)
