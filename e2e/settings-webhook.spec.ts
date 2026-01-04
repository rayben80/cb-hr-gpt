import { expect, test } from '@playwright/test';

test.describe('Webhook Settings', () => {
    test('should be read-only when webhook is provided by env', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: '설정' }).click();
        await expect(page.getByRole('heading', { name: '설정' })).toBeVisible();

        await page.getByRole('button', { name: '알림 및 일정' }).click();

        const webhookInput = page.getByLabel('Webhook URL');
        await expect(webhookInput).toBeDisabled();
        await expect(page.getByText('환경변수로 관리 중이라 수정할 수 없습니다.')).toBeVisible();
    });
});
