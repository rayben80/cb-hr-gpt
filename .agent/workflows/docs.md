---
description: 문서화 모드. README, JSDoc, API 문서 작성.
---

# Docs Mode (문서화 모드)

코드, API, 프로젝트 문서를 작성하는 모드입니다.

## 문서 유형

### 1. README.md
```markdown
# 프로젝트명

프로젝트 설명 (1-2문장)

## 설치
npm install

## 사용법
npm run dev

## 주요 기능
- 기능 1
- 기능 2

## 기술 스택
- React, TypeScript, Tailwind
```

### 2. JSDoc
```typescript
/**
 * 사용자 데이터를 가져옵니다.
 *
 * @param userId - 사용자 ID
 * @returns 사용자 정보 객체
 * @throws {NotFoundError} 사용자를 찾을 수 없을 때
 * @example
 * const user = await getUser('123');
 */
async function getUser(userId: string): Promise<User> {
  // ...
}
```

### 3. API 문서
```markdown
## GET /api/users/:id

사용자 정보를 조회합니다.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | 사용자 ID |

### Response
```json
{
  "id": "123",
  "name": "홍길동",
  "email": "hong@example.com"
}
```

### Error Codes
| Code | Description |
|------|-------------|
| 404 | 사용자 없음 |
| 401 | 인증 필요 |
```

## 원칙

- **간결하게** - 필요한 정보만
- **예제 포함** - 사용법 보여주기
- **최신 유지** - 코드와 일치
