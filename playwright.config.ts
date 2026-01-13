import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5178',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 60000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5178',
        env: {
            ...process.env,
            VITE_GOOGLE_CHAT_WEBHOOK_URL:
                'https://chat.googleapis.com/v1/spaces/AAA/messages?key=example&token=example',
            VITE_E2E_BYPASS_AUTH: 'true',
            VITE_E2E_ROLE: 'SUPER_ADMIN',
            VITE_E2E_MOCK_DATA: 'true',
        },
        reuseExistingServer: false,
        timeout: 120 * 1000,
    },
});
