# cb-hr-gpt 컴포넌트 라이브러리

이 문서는 재사용 가능한 공통 컴포넌트들을 설명합니다.

## 빠른 시작

```tsx
// 모든 공통 컴포넌트 import
import {
  Button,
  Modal,
  Icon,
  IconButton,
  CloseButton,
  Tooltip
} from '@/components/common';

// 애니메이션 컴포넌트
import { AnimatedList } from '@/components/animation';
```

## 컴포넌트 목록

| 컴포넌트 | 설명 | 문서 |
| ---------- | ------ | ------ |
| `Button` | 버튼 (11개 variant) | [상세](./DESIGN_SYSTEM.md#button) |
| `Modal` | 접근성 모달 | [상세](./DESIGN_SYSTEM.md#modal) |
| `IconButton` | 아이콘 전용 버튼 | [상세](./DESIGN_SYSTEM.md#iconbutton--closebutton) |
| `CloseButton` | 닫기 버튼 (X 포함) | [상세](./DESIGN_SYSTEM.md#iconbutton--closebutton) |
| `Icon` | 아이콘 래퍼 | [상세](./DESIGN_SYSTEM.md#icon) |
| `Tooltip` | Radix UI 툴팁 | [상세](./DESIGN_SYSTEM.md#tooltip) |
| `AnimatedList` | 순차 애니메이션 리스트 | [상세](./DESIGN_SYSTEM.md#animatedlist) |

## 추가 정보

- [디자인 시스템 상세 문서](./DESIGN_SYSTEM.md)
- [애니메이션 프리셋](./DESIGN_SYSTEM.md#애니메이션)
- [테마 및 다크모드](./DESIGN_SYSTEM.md#테마)
