---
description: 디버깅 모드. 버그 원인 분석 및 해결.
---

# Debug Mode (디버깅 모드)

버그의 근본 원인을 찾고 해결하는 모드입니다.

## 디버깅 프로세스

### 1단계: 재현
- 버그 재현 단계 확인
- 에러 메시지/스택 트레이스 수집
- 환경 정보 파악

### 2단계: 격리
- 문제 범위 좁히기
- 관련 코드 식별
- 가설 수립

### 3단계: 분석
```typescript
// 디버그 로그 추가
console.log('[DEBUG] Input:', input);
console.log('[DEBUG] State:', state);
console.log('[DEBUG] Output:', output);
```

### 4단계: 수정
- 근본 원인 해결
- 엣지 케이스 처리
- 회귀 테스트 추가

## 일반적인 버그 패턴

| 증상 | 가능한 원인 |
|------|------------|
| undefined is not a function | 잘못된 import, this 바인딩 |
| Cannot read property of undefined | null 체크 누락 |
| Maximum call stack exceeded | 무한 재귀, 순환 참조 |
| State not updating | 불변성 위반, 비동기 이슈 |
| Component not re-rendering | key 누락, 메모이제이션 |

## 출력 형식

```markdown
## 🐛 디버그: [버그 설명]

### 증상
[관찰된 동작]

### 원인
[근본 원인 분석]

### 해결
[수정 코드]

### 예방
[재발 방지책]
```
