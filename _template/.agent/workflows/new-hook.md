---
description: 새로운 React 커스텀 훅을 생성합니다
---

# 새 커스텀 훅 생성

사용자에게 다음 정보를 확인하세요:

1. 훅 이름 (예: useUserData)
2. 도메인 (organization, evaluation, library, common 중 선택)
3. 훅의 목적

## 훅 템플릿

```typescript
// src/hooks/[도메인]/[useHookName].ts
import { useState, useCallback, useMemo } from 'react';

interface Use[HookName]Options {
    // 옵션 정의
}

interface Use[HookName]Return {
    // 반환값 타입 정의
}

export const use[HookName] = (options: Use[HookName]Options): Use[HookName]Return => {
    // 상태 정의
    const [state, setState] = useState();

    // 핸들러 정의
    const handleAction = useCallback(() => {
        // 로직
    }, []);

    // 파생 데이터
    const derivedData = useMemo(() => {
        // 계산
    }, []);

    return {
        state,
        handleAction,
        derivedData,
    };
};
```

## 테스트 템플릿

```typescript
// src/test/hooks/[useHookName].test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { use[HookName] } from '../../hooks/[도메인]/[useHookName]';

describe('use[HookName]', () => {
    it('초기 상태를 반환해야 한다', () => {
        const { result } = renderHook(() => use[HookName]({}));
        expect(result.current.state).toBeDefined();
    });
});
```

## 체크리스트

- [ ] 훅 파일 생성
- [ ] 타입 정의
- [ ] 도메인 폴더의 index.ts에 export 추가
- [ ] 테스트 파일 생성 (선택)
