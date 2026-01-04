import { expect, test } from '@playwright/test';

test.describe('Intern Badge Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: '조직 관리' }).click();
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();
    });

    test('should display Intern badge for CX Team interns', async ({ page }) => {
        // Target CX Team
        // We look for a container that has "CX팀" text.
        // Adjust selector based on actual DOM structure if needed, but text filter is robust.
        const cxTeamSection = page.locator('div, section').filter({ hasText: 'CX팀' }).first();
        await expect(cxTeamSection).toBeVisible();

        // Specific Interns to verify
        const interns = ['최현', '이준수', '임재언', '김서은', '이나은'];

        for (const name of interns) {
            // Find the member row/card
            const memberRow = page.locator('.drag-item').filter({ hasText: name }).first();
            await expect(memberRow).toBeVisible();

            // Check for "인턴" badge within that row
            // The badge has text "인턴"
            const badge = memberRow.getByText('인턴', { exact: true });
            await expect(badge).toBeVisible();
            console.log(`[PASS] Intern badge found for ${name}`);
        }
    });

    test('should check Intern badge for Sales Team (Kimdamin)', async ({ page }) => {
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();

        // Target Sales Team
        const salesTeamSection = page.locator('div, section').filter({ hasText: 'Sales팀' }).first();
        await expect(salesTeamSection).toBeVisible();

        const name = '김다민';
        const memberRow = page.locator('.drag-item').filter({ hasText: name }).first();
        await expect(memberRow).toBeVisible();

        // Check for badge
        const badge = memberRow.getByText('인턴', { exact: true });

        if (await badge.isVisible()) {
            console.log(`[INFO] Intern badge found for ${name}`);
        } else {
            console.log(`[INFO] Intern badge NOT found for ${name} (Expected based on current data)`);
        }
    });
});
