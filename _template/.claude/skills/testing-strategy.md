---
name: testing-strategy
description: 모든 코드베이스에 대한 종합적인 테스트 전략 설계. 테스트 추가, 커버리지 개선, 테스트 인프라 설정 시 사용.
---

# Testing Strategy Skill (테스트 전략)

## 테스트 피라미드 접근

균형 잡힌 커버리지를 위한 테스트 피라미드:

```
        /\
       /  \     E2E 테스트 (10%)
      /----\    - 핵심 사용자 여정
     /      \   - 느리지만 종합적
    /--------\  통합 테스트 (20%)
   /          \ - 컴포넌트 상호작용
  /------------\ - API 계약
 /              \ 단위 테스트 (70%)
/________________\ - 빠르고, 격리됨
                   - 비즈니스 로직 중심
```

## 프레임워크 선택

### JavaScript/TypeScript
| 유형 | 권장 | 대안 |
|------|------|------|
| 단위 | Vitest | Jest |
| 통합 | Vitest + MSW | Jest + SuperTest |
| E2E | Playwright | Cypress |
| 컴포넌트 | Testing Library | Enzyme |

## 테스트 구조 템플릿

### 단위 테스트

```typescript
describe('[Unit] ComponentName', () => {
  describe('methodName', () => {
    it('should [예상 동작] when [조건]', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw error when [잘못된 조건]', () => {
      expect(() => methodName(invalidInput)).toThrow(ExpectedError);
    });
  });
});
```

### 통합 테스트

```typescript
describe('[Integration] API /users', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Test', email: 'test@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### E2E 테스트

```typescript
describe('[E2E] 사용자 등록 플로우', () => {
  it('should complete registration successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid="email"]', 'new@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.click('[data-testid="submit"]');

    await expect(page.locator('.welcome-message')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## 커버리지 전략

### 커버해야 할 것
- ✅ 비즈니스 로직 (100%)
- ✅ 엣지 케이스와 에러 핸들링 (90%+)
- ✅ API 계약 (100%)
- ✅ 핵심 사용자 경로 (E2E)
- ⚠️ UI 컴포넌트 (스냅샷 + 인터랙션)
- ❌ 서드파티 라이브러리 내부
- ❌ 단순 getter/setter

### 커버리지 임계값

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "src/core/": {
      "branches": 95,
      "functions": 95
    }
  }
}
```

## 테스트 데이터 관리

### 팩토리/빌더

```typescript
// factories/user.ts
import { faker } from '@faker-js/faker';

export const userFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: new Date(),
  ...overrides,
});

// 사용
const admin = userFactory({ role: 'admin' });
```

## 모킹 전략

### 언제 모킹할 것
- ✅ 외부 API와 서비스
- ✅ 단위 테스트의 데이터베이스
- ✅ 결정론적 시간/날짜
- ✅ 랜덤 값
- ❌ 내부 모듈 (보통)
- ❌ 테스트 대상 코드

### 모킹 예제

```typescript
// API 모킹 with MSW
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
    ]);
  }),
];

// 시간 모킹
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));
```
