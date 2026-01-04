@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   새 프로젝트 설정 마법사
echo ========================================
echo.

set /p PROJECT_PATH="새 프로젝트 폴더 경로를 입력하세요: "

if "%PROJECT_PATH%"=="" (
    echo 경로를 입력해주세요!
    pause
    exit /b
)

echo.
echo 설정 파일들을 복사하는 중...

xcopy /E /I /Y "%~dp0\.agent" "%PROJECT_PATH%\.agent"
xcopy /E /I /Y "%~dp0\.github" "%PROJECT_PATH%\.github"
xcopy /E /I /Y "%~dp0\.vscode" "%PROJECT_PATH%\.vscode"
copy /Y "%~dp0\.editorconfig" "%PROJECT_PATH%\.editorconfig"

echo.
echo ========================================
echo   완료!
echo ========================================
echo.
echo 다음 항목들이 복사되었습니다:
echo   - .agent/workflows/  (Claude 워크플로우)
echo   - .github/workflows/ (CI/CD)
echo   - .vscode/           (VS Code 설정)
echo   - .editorconfig      (코드 스타일)
echo.
echo 이제 VS Code로 "%PROJECT_PATH%" 폴더를 열어보세요!
echo.
pause
