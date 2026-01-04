import { expect, test } from '@playwright/test';

test.describe('Headquarter Management Permissions', () => {
    test.beforeEach(async ({ page }) => {
        // Assuming the app defaults to SUPER_ADMIN or handles auth automatically in dev
        await page.goto('/');
        await page.getByRole('link', { name: '조직 관리' }).click();
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();
    });

    test('should display SUPER_ADMIN role in sidebar', async ({ page }) => {
        // Verify sidebar footer role text
        // Looks for "슈퍼 관리자" text which is rendered for SUPER_ADMIN role
        await expect(page.getByText('슈퍼 관리자')).toBeVisible();
    });

    test('should display "..." options menu for Headquarter', async ({ page }) => {
        // Find Cloud Business Headquarter section
        // We use a locator that finds a section containing the text "클라우드사업본부"
        const hqSection = page.locator('section').filter({ hasText: '클라우드사업본부' });
        await expect(hqSection).toBeVisible();

        // Check for the options button using aria-label
        const optionsButton = hqSection.getByLabel('본부 옵션');

        // If this fails, it means the permission logic or rendering is broken
        await expect(optionsButton).toBeVisible();

        // Click to verify dropdown content
        await optionsButton.click();

        // Verify "본부 및 본부장 정보 수정" option exists
        await expect(page.getByText('본부 및 본부장 정보 수정')).toBeVisible();

        // Take a screenshot for evidence
        await page.screenshot({ path: 'test-results/hq-menu-verified.png', fullPage: true });
    });
});
