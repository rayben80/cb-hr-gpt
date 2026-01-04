---
description: UI/UX 디자인 모드. 사용자 경험, 접근성, 시각 디자인 개선.
---

# Design Mode (디자인 모드)

사용자 경험과 시각 디자인을 개선하는 모드입니다.

## UI/UX 원칙

### 1. 사용성 (Usability)
- **일관성** - 같은 패턴 반복 사용
- **피드백** - 모든 액션에 반응
- **효율성** - 최소 클릭으로 목표 달성
- **에러 방지** - 실수 예방 및 복구

### 2. 접근성 (A11y)
```tsx
// ✅ 접근성 좋은 버튼
<button
  aria-label="메뉴 열기"
  aria-expanded={isOpen}
  onClick={toggleMenu}
>
  <MenuIcon />
</button>

// ✅ 시맨틱 HTML
<nav aria-label="메인 네비게이션">
  <ul role="list">
    <li><a href="/">홈</a></li>
  </ul>
</nav>
```

### 3. 반응형 디자인
```tsx
// Tailwind 반응형 클래스
<div className="
  grid grid-cols-1      // 모바일
  sm:grid-cols-2        // 태블릿
  lg:grid-cols-3        // 데스크탑
  xl:grid-cols-4        // 대형
  gap-4
">
```

## 시각 디자인 가이드

### 색상
| 용도 | 클래스 |
|------|--------|
| 주요 액션 | `bg-primary text-white` |
| 보조 액션 | `bg-secondary` |
| 성공 | `text-green-600` |
| 경고 | `text-yellow-600` |
| 오류 | `text-red-600` |

### 간격 (Spacing)
```
4px  = p-1  (작은 요소 내부)
8px  = p-2  (버튼 내부)
16px = p-4  (카드 내부)
24px = p-6  (섹션 간격)
32px = p-8  (주요 섹션)
```

### 그림자
```
shadow-sm  - 카드 기본
shadow-md  - 호버 시
shadow-lg  - 모달, 드롭다운
```

## 점검 항목

- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 색맹 사용자도 구분 가능한 색상
- [ ] 충분한 대비율 (4.5:1 이상)
- [ ] 터치 타겟 최소 44x44px
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 명확
