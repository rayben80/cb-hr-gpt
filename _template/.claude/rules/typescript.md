# TypeScript 규칙

## 필수 규칙

1. **`any` 타입 사용 금지** - 명시적 타입 또는 `unknown` 사용
2. **인터페이스 우선** - `type` 대신 `interface` 사용 (확장성)
3. **Null 체크** - optional chaining (`?.`) 활용

## 타입 정의

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email?: string;
}

// ❌ Bad
type User = {
  id: any;
  name: string;
}
```

## 제네릭 활용

```typescript
// ✅ 재사용 가능한 타입
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

## Import 순서

1. React/외부 라이브러리
2. @ 경로 별칭 imports
3. 상대 경로 imports
4. 타입 imports (type-only)
