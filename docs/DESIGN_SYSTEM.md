# 디자인 시스템 (cb-hr-gpt)

이 문서는 `cb-hr-gpt` 프로젝트의 디자인 시스템을 설명합니다.

## 목차

- [컴포넌트](#컴포넌트)
- [Button](#button)
- [Modal](#modal)
- [Icon](#icon)
- [Tooltip](#tooltip)
- [애니메이션](#애니메이션)
- [테마](#테마)

---

## 컴포넌트

### Button

경로: `src/components/common/Button.tsx`

#### Variants

| Variant | 용도 | 예시 |
| --------- | ------ | ------ |
| `primary` | 주요 액션 | 저장, 확인 |
| `secondary` | 보조 액션 | 취소 |
| `danger` | 위험한 액션 | 삭제 |
| `success` | 성공 액션 | 완료 |
| `warning` | 경고 액션 | 주의 |
| `ghost` | 투명 배경 | 메뉴 항목 |
| `outline` | 테두리만 | 닫기 |
| `soft` | 연한 배경 | 멤버 추가 |
| `link` | 링크 스타일 | 더보기 |
| `purple` | 보라색 강조 | 특수 액션 |
| `amber` | 주황색 강조 | 알림 |

#### 사용법

```tsx
import { Button } from '@/components/common/Button';

<Button variant="primary" size="md" loading={false}>
  저장
</Button>

<Button variant="outline" onClick={handleClose}>
  닫기
</Button>
```

#### Props

| Prop | Type | Default | 설명 |
| ------ | ------ | --------- | ------ |
| `variant` | `ButtonVariant` | `'primary'` | 버튼 스타일 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `loading` | `boolean` | `false` | 로딩 상태 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |

---

### Modal

경로: `src/components/common/Modal.tsx`

접근성을 고려한 모달 컴포넌트입니다.

#### 특징

- ✅ `aria-modal="true"`, `aria-labelledby` 지원
- ✅ ESC 키로 닫기
- ✅ 배경 클릭으로 닫기 (옵션)
- ✅ Focus trap
- ✅ 다크모드 지원

#### Modal 사용법

```tsx
import { Modal } from '@/components/common';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="모달 제목"
  subtitle="부제목 (옵션)"
  size="md"
  footer={<Button onClick={handleSave}>저장</Button>}
>
  <p>모달 콘텐츠</p>
</Modal>
```

#### Modal Props

| Prop | Type | Default | 설명 |
| ------ | ------ | --------- | ------ |
| `isOpen` | `boolean` | - | 열림 상태 |
| `onClose` | `() => void` | - | 닫기 핸들러 |
| `title` | `string` | - | 제목 |
| `subtitle` | `string` | - | 부제목 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 크기 |
| `closeOnBackdrop` | `boolean` | `true` | 배경 클릭 닫기 |
| `closeOnEscape` | `boolean` | `true` | ESC 키 닫기 |

---

### IconButton / CloseButton

경로: `src/components/common/IconButton.tsx`

아이콘 전용 버튼 컴포넌트입니다.

```tsx
import { IconButton, CloseButton } from '@/components/common';

// 커스텀 아이콘
<IconButton onClick={handleClick} variant="ghost">
  <Settings className="w-5 h-5" />
</IconButton>

// 닫기 버튼 (X 아이콘 포함)
<CloseButton onClick={handleClose} />
```

---

### Icon

경로: `src/components/common/Icon.tsx`

lucide-react 아이콘 래퍼입니다.

```tsx
import { Icon } from '@/components/common';

<Icon name="User" size="md" color="primary" />
```

---

### Tooltip

경로: `src/components/common/Tooltip.tsx`

Radix UI 기반 툴팁입니다.

```tsx
import { Tooltip } from '@/components/common';

<Tooltip content="도움말 텍스트">
  <button>호버하세요</button>
</Tooltip>
```

---

## 애니메이션

경로: `src/utils/animations.ts`

Framer Motion 기반 애니메이션 프리셋입니다.

### 사용 가능한 프리셋

| 프리셋 | 용도 |
| -------- | ------ |
| `fadeIn` | 페이드 인 |
| `slideDown` | 위에서 아래로 슬라이드 |
| `slideRight` | 왼쪽에서 오른쪽으로 슬라이드 |
| `hoverScale` | 호버 시 확대 |
| `hoverLift` | 호버 시 위로 이동 |
| `staggerItem` | 순차적 등장 |
| `pageTransition` | 페이지 전환 |

### AnimatedList

리스트 아이템에 순차적 등장 애니메이션을 적용합니다.

```tsx
import { AnimatedList } from '@/components/animation';

<AnimatedList>
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</AnimatedList>
```

---

## 테마

### CSS 변수

경로: `src/index.css`

```css
:root {
  --bg-primary: 250 250 249;
  --text-primary: 28 25 23;
  --accent-primary: 124 58 237;
}

.dark {
  --bg-primary: 30 27 75;
  --text-primary: 250 250 249;
  --accent-primary: 167 139 250;
}
```

### 다크모드 사용

```tsx
// 자동 지원되는 컴포넌트들:
// - Button (모든 variant)
// - Modal
// - IconButton
```

---

## 파일 구조

```text
src/components/
├── common/
│   ├── index.ts          # 배럴 파일
│   ├── Button.tsx        # 버튼 컴포넌트
│   ├── Modal.tsx         # 모달 컴포넌트
│   ├── Icon.tsx          # 아이콘 래퍼
│   ├── IconButton.tsx    # 아이콘 버튼
│   └── Tooltip.tsx       # 툴팁
├── animation/
│   ├── index.ts
│   └── AnimatedList.tsx
└── ...
```

---

## 테스트

```bash
# 컴포넌트 테스트 실행
npm test -- --run src/test/components/
```

테스트 파일:

- `Modal.test.tsx` (8개 테스트)
- `IconButton.test.tsx` (7개 테스트)
