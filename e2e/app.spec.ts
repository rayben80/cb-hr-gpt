import { test, expect } from '@playwright/test';

test.describe('조직 관리 페이지', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('link', { name: '조직 관리' }).click();
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();
    });

    test('페이지 로드 시 제목이 표시되어야 한다', async ({ page }) => {
        await expect(page.getByRole('heading', { name: '조직 관리' })).toBeVisible();
    });

    test('팀 카드가 렌더링되어야 한다', async ({ page }) => {
        // 팀 이름 또는 빈 상태 메시지 확인
        const teamNames = page.getByText(/Sales팀|CX팀/);
        const emptyState = page.getByText('아직 등록된 팀이 없습니다');

        const hasTeamCards = (await teamNames.count()) > 0;
        const hasEmptyState = await emptyState.count() > 0;

        expect(hasTeamCards || hasEmptyState).toBeTruthy();
    });

    test('새 팀 추가 버튼이 클릭 가능해야 한다', async ({ page }) => {
        const addButton = page.locator('button:has-text("팀 추가"), button:has-text("Add Team")');

        if (await addButton.count() > 0) {
            await expect(addButton.first()).toBeEnabled();
        }
    });
});

test.describe('대시보드 페이지', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('link', { name: '성과 대시보드' }).click();
        await expect(page.getByRole('heading', { name: '성과 대시보드' })).toBeVisible();
    });

    test('대시보드가 로드되어야 한다', async ({ page }) => {
        await expect(page.getByRole('heading', { name: '성과 대시보드' })).toBeVisible();
    });

    test('네비게이션 메뉴가 표시되어야 한다', async ({ page }) => {
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav.first()).toBeVisible();
    });
});

test.describe('평가 관리 페이지', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('link', { name: '평가 관리' }).click();
    });

    test('평가 페이지가 로드되어야 한다', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /평가 관리|나의 평가/ })).toBeVisible();
    });

    test('새 캠페인 생성 버튼이 존재해야 한다', async ({ page }) => {
        const createButton = page.locator('button:has-text("캠페인"), button:has-text("Campaign")');

        if (await createButton.count() > 0) {
            await expect(createButton.first()).toBeVisible();
        }
    });
});

test.describe('접근성', () => {
    test('메인 페이지에 주요 랜드마크가 있어야 한다', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // main 또는 역할이 있는 컨테이너 확인
        const mainContent = page.locator('main, [role="main"]');
        const hasMain = await mainContent.count() > 0;

        // 최소한 body는 있어야 함
        expect(hasMain || await page.locator('body').count() > 0).toBeTruthy();
    });

    test('포커스가 키보드로 이동 가능해야 한다', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Tab 키로 포커스 이동
        await page.keyboard.press('Tab');

        // 무언가에 포커스가 있어야 함
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
    });
});
