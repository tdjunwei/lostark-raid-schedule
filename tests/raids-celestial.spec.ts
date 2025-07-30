import { test, expect } from '@playwright/test';

test.describe('Celestial Raids Page', () => {
  test('should display celestial raids page', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check page title and description
    await expect(page.locator('h1')).toHaveText('天界副本');
    await expect(page.locator('text=管理天界副本團隊')).toBeVisible();
  });

  test('should display add team button', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check for add team button
    const addButton = page.locator('button', { hasText: '新增團隊' });
    await expect(addButton).toBeVisible();
    
    // Check button has plus icon
    await expect(page.locator('.lucide-plus')).toBeVisible();
  });

  test('should display raids table', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check table headers
    await expect(page.locator('text=日期')).toBeVisible();
    await expect(page.locator('text=時間')).toBeVisible();
    await expect(page.locator('text=人數')).toBeVisible();
    await expect(page.locator('text=狀態')).toBeVisible();
    await expect(page.locator('text=金幣獎勵')).toBeVisible();
    await expect(page.locator('text=操作')).toBeVisible();
  });

  test('should display sample raid data', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check for sample raid entries
    await expect(page.locator('text=2024-01-29')).toBeVisible();
    await expect(page.locator('text=22:00').first()).toBeVisible();
    await expect(page.locator('text=8/8')).toBeVisible();
    await expect(page.locator('text=4/8')).toBeVisible();
    await expect(page.locator('text=5200').first()).toBeVisible();
  });

  test('should display raid status badges', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check for status badges
    await expect(page.locator('text=已完成')).toBeVisible();
    await expect(page.locator('text=組隊中')).toBeVisible();
    
    // Check badge styling
    const completedBadge = page.locator('.bg-green-100');
    const formingBadge = page.locator('.bg-yellow-100');
    
    await expect(completedBadge).toBeVisible();
    await expect(formingBadge).toBeVisible();
  });

  test('should show raid details when clicking on a raid', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Click on the first raid row
    const firstRaid = page.locator('tbody tr').first();
    await firstRaid.click();

    // Check if detail panel appears
    await expect(page.locator('text=團隊詳情')).toBeVisible();
    await expect(page.locator('text=參與成員')).toBeVisible();
  });

  test('should display team members in detail view', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Click on the first raid (completed one with 8 members)
    const firstRaid = page.locator('tbody tr').first();
    await firstRaid.click();

    // Check for team members
    await expect(page.locator('text=羊')).toBeVisible();
    await expect(page.locator('text=MC哈豆')).toBeVisible();
    await expect(page.locator('text=雞頭')).toBeVisible();
    await expect(page.locator('text=愛冬眠的貓')).toBeVisible();
  });

  test('should show gold distribution calculation', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Click on the first raid
    const firstRaid = page.locator('tbody tr').first();
    await firstRaid.click();

    // Check gold calculation
    await expect(page.locator('text=總金幣獎勵')).toBeVisible();
    await expect(page.locator('text=每人獲得')).toBeVisible();
    
    // Should show calculated amount (5200 / 8 = 650)
    await expect(page.locator('text=650')).toBeVisible();
  });

  test('should show add player input for incomplete teams', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Click on the second raid (forming, 4/8 members)
    const secondRaid = page.locator('tbody tr').nth(1);
    await secondRaid.click();

    // Check for add player functionality
    await expect(page.locator('input[placeholder="新增玩家"]')).toBeVisible();
    
    // Check for add button
    const addPlayerButton = page.locator('button:has(.lucide-plus)').last();
    await expect(addPlayerButton).toBeVisible();
  });

  test('should have action buttons for each raid', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check for edit and delete buttons
    const editButtons = page.locator('button:has(.lucide-edit-2)');
    const deleteButtons = page.locator('button:has(.lucide-trash-2)');
    
    await expect(editButtons.first()).toBeVisible();
    await expect(deleteButtons.first()).toBeVisible();
  });

  test('should display default state when no raid is selected', async ({ page }) => {
    await page.goto('/raids/celestial');

    // Check default state
    await expect(page.locator('text=選擇團隊')).toBeVisible();
    await expect(page.locator('text=點擊左側列表查看團隊詳情')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/raids/celestial');

    // Check if page loads properly on mobile
    await expect(page.locator('h1')).toHaveText('天界副本');
    
    // Check if grid layout adapts
    const gridContainer = page.locator('.grid');
    await expect(gridContainer).toBeVisible();
  });
});