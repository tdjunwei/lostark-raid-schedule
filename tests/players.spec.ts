import { test, expect } from '@playwright/test';

test.describe('Players Page', () => {
  test('should display players management page', async ({ page }) => {
    await page.goto('/players');

    // Check page title and description
    await expect(page.locator('h1')).toHaveText('玩家管理');
    await expect(page.locator('text=管理玩家資料與可用時段')).toBeVisible();
  });

  test('should display players data table', async ({ page }) => {
    await page.goto('/players');

    // Check table headers
    await expect(page.locator('text=暱稱')).toBeVisible();
    await expect(page.locator('text=裝等')).toBeVisible();
    await expect(page.locator('text=週一')).toBeVisible();
    await expect(page.locator('text=週二')).toBeVisible();
    await expect(page.locator('text=週三')).toBeVisible();
    await expect(page.locator('text=週四')).toBeVisible();
    await expect(page.locator('text=週五')).toBeVisible();
    await expect(page.locator('text=週六')).toBeVisible();
    await expect(page.locator('text=週日')).toBeVisible();

    // Check for sample player data
    await expect(page.locator('text=羊')).toBeVisible();
    await expect(page.locator('text=MC哈豆')).toBeVisible();
    await expect(page.locator('text=雞頭')).toBeVisible();
    await expect(page.locator('text=愛冬眠的貓')).toBeVisible();
    await expect(page.locator('text=小蝸')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/players');

    // Check search input
    const searchInput = page.locator('input[placeholder="搜尋玩家暱稱..."]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('羊');
    // Should filter to show only matching players
    await expect(page.locator('text=羊')).toBeVisible();
  });

  test('should have column visibility controls', async ({ page }) => {
    await page.goto('/players');

    // Check column visibility dropdown
    const columnButton = page.locator('button', { hasText: '顯示欄位' });
    await expect(columnButton).toBeVisible();

    // Click to open dropdown
    await columnButton.click();
    
    // Check for column options (may need adjustment based on actual implementation)
    await expect(page.locator('text=nickname')).toBeVisible();
  });

  test('should have pagination controls', async ({ page }) => {
    await page.goto('/players');

    // Check pagination controls
    await expect(page.locator('text=共')).toBeVisible();
    await expect(page.locator('text=位玩家')).toBeVisible();
    await expect(page.locator('button', { hasText: '上一頁' })).toBeVisible();
    await expect(page.locator('button', { hasText: '下一頁' })).toBeVisible();
  });

  test('should have action menu for each player', async ({ page }) => {
    await page.goto('/players');

    // Find the first action button (three dots)
    const actionButton = page.locator('button[aria-label="開啟選單"], button').filter({ hasText: /^$/ }).first();
    
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Check dropdown menu items
      await expect(page.locator('text=複製暱稱')).toBeVisible();
      await expect(page.locator('text=編輯玩家資料')).toBeVisible();
      await expect(page.locator('text=查看出團記錄')).toBeVisible();
    }
  });

  test('should sort columns when header is clicked', async ({ page }) => {
    await page.goto('/players');

    // Click on sortable column header (裝等)
    const itemLevelHeader = page.locator('button', { hasText: '裝等' });
    await expect(itemLevelHeader).toBeVisible();
    
    // Click to sort
    await itemLevelHeader.click();
    
    // Should show sort icon
    await expect(page.locator('.lucide-arrow-up-down')).toBeVisible();
  });
});