---
description: 새로운 React 컴포넌트를 생성합니다 (TypeScript + 테스트 포함)
---

# 새 React 컴포넌트 생성

사용자에게 다음 정보를 확인하세요:

1. 컴포넌트 이름 (예: UserCard)
2. 컴포넌트 위치 (예: src/components/common/ 또는 src/features/xxx/)
3. 테스트 파일 필요 여부

## 컴포넌트 템플릿

```tsx
// src/components/[폴더]/[ComponentName].tsx
import { memo } from 'react';

interface [ComponentName]Props {
    // props 정의
}

export const [ComponentName] = memo(({}: [ComponentName]Props) => {
    return (
        <div>
            {/* 컴포넌트 내용 */}
        </div>
    );
});

[ComponentName].displayName = '[ComponentName]';
```

## 테스트 템플릿

```tsx
// src/test/components/[ComponentName].test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { [ComponentName] } from '../../components/[폴더]/[ComponentName]';

describe('[ComponentName]', () => {
    it('렌더링되어야 한다', () => {
        render(<[ComponentName] />);
        // expect something
    });
});
```

## 체크리스트

- [ ] 컴포넌트 파일 생성
- [ ] Props 인터페이스 정의
- [ ] 테스트 파일 생성 (선택)
- [ ] 배럴 파일(index.ts)에 export 추가
