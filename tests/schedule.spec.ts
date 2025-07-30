import { test, expect } from '@playwright/test';

test.describe('Schedule Page', () => {
  test('should display schedule management page', async ({ page }) => {
    await page.goto('/schedule');

    // Check page title and description
    await expect(page.locator('h1')).toHaveText('排程管理');
    await expect(page.locator('text=查看玩家可用時段並安排團隊')).toBeVisible();
  });

  test('should display schedule tabs', async ({ page }) => {
    await page.goto('/schedule');

    // Check for tabs
    await expect(page.locator('text=時段總覽')).toBeVisible();
    await expect(page.locator('text=副本排程')).toBeVisible();

    // Test tab switching
    await page.click('text=副本排程');
    await expect(page.locator('text=副本排程')).toBeVisible();
    await expect(page.locator('text=本週已安排的團隊')).toBeVisible();
  });

  test('should display time slot grid', async ({ page }) => {
    await page.goto('/schedule');

    // Check grid headers
    await expect(page.locator('text=時段')).toBeVisible();
    await expect(page.locator('text=週一')).toBeVisible();
    await expect(page.locator('text=週二')).toBeVisible();
    await expect(page.locator('text=週三')).toBeVisible();
    await expect(page.locator('text=週四')).toBeVisible();
    await expect(page.locator('text=週五')).toBeVisible();
    await expect(page.locator('text=週六')).toBeVisible();
    await expect(page.locator('text=週日')).toBeVisible();

    // Check time slots
    await expect(page.locator('text=13:00-15:00')).toBeVisible();
    await expect(page.locator('text=15:00-18:00')).toBeVisible();
    await expect(page.locator('text=18:00-20:00')).toBeVisible();
    await expect(page.locator('text=20:00-22:00')).toBeVisible();
    await expect(page.locator('text=22:00-00:00')).toBeVisible();
    await expect(page.locator('text=00:00-03:00')).toBeVisible();
  });

  test('should show player count in time slots', async ({ page }) => {
    await page.goto('/schedule');

    // Check for player counts in cells
    await expect(page.locator('text=3人').first()).toBeVisible();
    await expect(page.locator('text=可組團').first()).toBeVisible();
  });

  test('should show selected slot details', async ({ page }) => {
    await page.goto('/schedule');

    // Click on a time slot with players
    const timeSlotCell = page.locator('td:has-text("3人")').first();
    await timeSlotCell.click();

    // Check if detail card appears
    await expect(page.locator('text=可參與玩家名單')).toBeVisible();
    
    // Check for player names in the detail view
    const playerTags = page.locator('.bg-primary\\/10');
    await expect(playerTags.first()).toBeVisible();
  });

  test('should handle empty time slots', async ({ page }) => {
    await page.goto('/schedule');

    // Look for empty slots (0人)
    const emptySlots = page.locator('text=0人');
    if (await emptySlots.count() > 0) {
      await expect(emptySlots.first()).toBeVisible();
    }
  });

  test('should display raids tab content', async ({ page }) => {
    await page.goto('/schedule');

    // Switch to raids tab
    await page.click('text=副本排程');

    // Check content
    await expect(page.locator('text=副本排程')).toBeVisible();
    await expect(page.locator('text=本週已安排的團隊')).toBeVisible();
    await expect(page.locator('text=尚未排定團隊...')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/schedule');

    // Check if page loads properly on mobile
    await expect(page.locator('h1')).toHaveText('排程管理');
    
    // Check if table is scrollable horizontally
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check if overflow container exists
    const overflowContainer = page.locator('.overflow-x-auto');
    await expect(overflowContainer).toBeVisible();
  });
});