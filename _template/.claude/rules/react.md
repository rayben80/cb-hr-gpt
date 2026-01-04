# React 컴포넌트 규칙

## 컴포넌트 구조

1. **함수형 컴포넌트만 사용** - 클래스 컴포넌트 금지
2. **memo 활용** - 성능 최적화를 위해 적극 사용
3. **displayName 필수** - 디버깅 용이성

## 파일 구조

```
components/
├── common/          # 재사용 가능한 공통 컴포넌트
├── [feature]/       # 기능별 컴포넌트
│   ├── FeatureName.tsx
│   └── FeatureNameParts.tsx  # 하위 컴포넌트
```

## 컴포넌트 템플릿

```tsx
import { memo } from 'react';

interface ComponentNameProps {
  /** prop 설명 */
  propName: string;
}

/**
 * 컴포넌트 설명
 */
export const ComponentName = memo(({ propName }: ComponentNameProps) => {
  return (
    <div className="...">
      {propName}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

## Props 규칙

1. **Props 인터페이스**: `ComponentNameProps` 네이밍
2. **JSDoc**: 각 prop에 설명 추가
3. **기본값**: 구조분해 할당에서 설정

## 이벤트 핸들러

```tsx
// ✅ Good - handle 접두사
const handleClick = () => { ... };
const handleSubmit = (e: FormEvent) => { ... };

// ❌ Bad
const onClick = () => { ... };
const submit = () => { ... };
```

## 조건부 렌더링

```tsx
// ✅ Good - 간결한 표현
{isLoading && <Spinner />}
{error ? <ErrorMessage error={error} /> : <Content />}

// ❌ Bad - 불필요한 삼항
{isLoading ? <Spinner /> : null}
```
