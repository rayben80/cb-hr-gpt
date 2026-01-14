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
            VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'e2e-api-key',
            VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'e2e.local',
            VITE_FIREBASE_DATABASE_URL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://e2e.local',
            VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'e2e-project',
            VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'e2e.local',
            VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
            VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:e2e',
            VITE_FIREBASE_MEASUREMENT_ID: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0000000000',
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
