---
description: 리팩토링 모드. 코드 품질 개선, 중복 제거, 구조 개선.
---

# Refactor Mode (리팩토링 모드)

기존 코드의 품질을 개선하는 모드입니다.

## 리팩토링 원칙

1. **동작 유지** - 외부 동작은 변경하지 않음
2. **작은 단계** - 한 번에 하나씩
3. **테스트 먼저** - 리팩토링 전 테스트 확인

## 주요 패턴

### 중복 제거 (DRY)
```typescript
// Before: 중복 코드
const userAge = calculateAge(user.birthDate);
const memberAge = calculateAge(member.birthDate);

// After: 함수 추출
const getAge = (person: { birthDate: Date }) => calculateAge(person.birthDate);
```

### 함수 추출
```typescript
// Before: 긴 함수
function processOrder(order: Order) {
  // 20+ lines of validation
  // 20+ lines of calculation
  // 20+ lines of persistence
}

// After: 분리된 책임
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  await saveOrder(order, total);
}
```

### 매직 넘버 제거
```typescript
// Before
if (user.role === 1) { ... }

// After
const ROLE_ADMIN = 1;
if (user.role === ROLE_ADMIN) { ... }
```

## 출력 형식

```markdown
## 리팩토링: [파일명]

### 변경 사항
1. [변경 1]: [이유]
2. [변경 2]: [이유]

### Before/After
[코드 비교]

### 주의사항
- [테스트 필요 항목]
```
