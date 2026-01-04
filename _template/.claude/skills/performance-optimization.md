---
name: performance-optimization
description: 웹 애플리케이션 성능 최적화 가이드. React 최적화, 번들 크기 축소, 렌더링 성능 개선 시 사용.
---

# Performance Optimization Skill (성능 최적화)

## React 성능 최적화

### 1. 컴포넌트 최적화

```typescript
// ✅ memo로 불필요한 리렌더링 방지
export const ExpensiveComponent = memo(({ data }: Props) => {
  return <div>{/* 복잡한 렌더링 */}</div>;
});

// ✅ useMemo로 비싼 계산 캐시
const processedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ useCallback으로 함수 참조 안정화
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

### 2. 리스트 최적화

```typescript
// ✅ 가상화로 대용량 리스트 처리
import { useVirtualizer } from '@tanstack/react-virtual';

// ✅ key prop 올바르게 사용
{items.map(item => (
  <ListItem key={item.id} data={item} />
))}
```

### 3. 지연 로딩

```typescript
// ✅ 코드 스플리팅
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ✅ Suspense와 함께 사용
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

## 번들 최적화

### 분석

```bash
# 번들 분석
npx vite-bundle-visualizer
```

### Tree Shaking

```typescript
// ✅ 명명된 임포트 사용
import { Button } from '@/components';

// ❌ 전체 라이브러리 임포트 피하기
import * as _ from 'lodash';
// ✅ 대신
import debounce from 'lodash/debounce';
```

### 동적 임포트

```typescript
// 필요할 때만 로드
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## 렌더링 성능

### CSS 최적화

```css
/* ✅ GPU 가속 사용 */
.animated {
  transform: translateZ(0);
  will-change: transform;
}

/* ✅ contain으로 렌더링 범위 제한 */
.container {
  contain: layout style;
}
```

### 이미지 최적화

```tsx
// ✅ lazy loading
<img loading="lazy" src="image.jpg" alt="..." />

// ✅ 적절한 크기와 포맷
// WebP, AVIF 사용, srcset 제공
```

## 측정 도구

| 도구 | 용도 |
|------|------|
| React DevTools Profiler | 컴포넌트 렌더링 분석 |
| Chrome DevTools Performance | 전체 성능 프로파일링 |
| Lighthouse | 종합 성능 점수 |
| Bundle Analyzer | 번들 크기 분석 |

## 성능 체크리스트

- [ ] `memo`, `useMemo`, `useCallback` 적절히 사용
- [ ] 큰 리스트는 가상화 적용
- [ ] 라우트 기반 코드 스플리팅
- [ ] 이미지 lazy loading
- [ ] 불필요한 리렌더링 제거
- [ ] 번들 크기 최적화 (tree shaking)
