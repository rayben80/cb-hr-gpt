# 프로젝트 템플릿

이 폴더를 새 프로젝트에 복사하면 모든 워크플로우와 설정이 적용됩니다.

## 사용 방법

### 방법 1: 수동 복사

```bash
# 새 프로젝트 생성 후
cp -r [이_폴더_경로]/.agent 새프로젝트/
cp -r [이_폴더_경로]/.github 새프로젝트/
cp -r [이_폴더_경로]/.vscode 새프로젝트/
cp [이_폴더_경로]/.editorconfig 새프로젝트/
```

### 방법 2: Claude에게 요청

새 프로젝트에서 Claude에게:

```text
워크플로우 설정해줘
```

---

## 포함된 설정

### .agent/workflows/ (Claude Skills)

- `/help` - 도움말
- `/playwright-setup` - E2E 테스트 설정
- `/test-setup` - 단위 테스트 설정
- `/new-component` - 컴포넌트 생성
- `/new-hook` - 커스텀 훅 생성
- `/ci-setup` - CI/CD 설정
- `/dev-guideline` - 개발 가이드라인

### .github/workflows/

- `ci.yml` - GitHub Actions CI/CD

### .vscode/

- `extensions.json` - 권장 확장 프로그램 22개

### .editorconfig

- 코드 스타일 설정

---

## VS Code 확장 프로그램

프로젝트를 열면 자동으로 권장 확장 설치 알림이 나타납니다.

수동 설치:

1. VS Code 열기
2. `Ctrl+Shift+P` → "Show Recommended Extensions"
3. 모두 설치
