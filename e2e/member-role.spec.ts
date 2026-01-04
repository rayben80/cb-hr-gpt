import { expect, test } from '@playwright/test';

test.describe('Member Role Select', () => {
    test('should restrict role choices to 팀장/파트장/팀원', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: '조직 관리' }).click();
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();

        await page.getByRole('button', { name: '팀 옵션' }).first().click();
        await page.getByRole('button', { name: /멤버 추가/ }).click();

        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('새 멤버 추가')).toBeVisible();

        const roleSelect = page.getByLabel('직책');
        await expect(roleSelect).toBeVisible();

        const options = roleSelect.locator('option');
        await expect(options).toHaveCount(3);
        await expect(options.nth(0)).toHaveText('팀장');
        await expect(options.nth(1)).toHaveText('파트장');
        await expect(options.nth(2)).toHaveText('팀원');
    });
});
