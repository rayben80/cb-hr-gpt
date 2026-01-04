# 스타일링 규칙

## Tailwind CSS 사용

1. **인라인 스타일 최소화** - Tailwind 클래스 우선
2. **커스텀 클래스** - `@apply` 활용하여 반복 줄이기
3. **반응형** - `sm:`, `md:`, `lg:` 순서로 작성

## 클래스 순서

```tsx
// 레이아웃 → 박스모델 → 타이포그래피 → 비주얼 → 기타
<div className="
  flex items-center justify-between     // 레이아웃
  w-full p-4 gap-2                       // 박스모델
  text-sm font-medium                    // 타이포그래피
  bg-white border rounded-lg shadow      // 비주얼
  hover:bg-gray-50 transition-colors     // 상태/애니메이션
">
```

## 커스텀 CSS 클래스

```css
/* src/styles/components.css */
.btn-primary {
  @apply px-4 py-2 rounded-lg bg-primary text-white;
  @apply hover:bg-primary-dark transition-colors;
  @apply focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100;
  @apply p-6;
}
```

## 다크 모드

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

## 금지 사항

1. **인라인 스타일** - `style={{ }}` 사용 최소화
2. **!important** - 사용 금지
3. **하드코딩 색상** - CSS 변수 또는 Tailwind 색상 사용
