import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the main dashboard', async ({ page }) => {
    await page.goto('/');

    // Check for the main title
    await expect(page.locator('h1')).toHaveText('Lost Ark 出團管理系統');

    // Check for the sidebar brand
    await expect(page.locator('text=Lost Ark 出團系統')).toBeVisible();

    // Check key navigation links are present
    await expect(page.getByRole('link', { name: '總覽' })).toBeVisible();
    await expect(page.getByRole('link', { name: '玩家管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '排程' })).toBeVisible();
  });

  test('should display dashboard cards', async ({ page }) => {
    await page.goto('/');

    // Check for dashboard metric cards
    await expect(page.locator('text=活躍玩家')).toBeVisible();
    await expect(page.locator('text=本週副本')).toBeVisible();
    await expect(page.locator('text=總收益')).toBeVisible();
    await expect(page.locator('text=平均裝等')).toBeVisible();

    // Check for metric values
    await expect(page.locator('text=24').first()).toBeVisible();
    await expect(page.locator('text=12').first()).toBeVisible();
    await expect(page.locator('text=48,320')).toBeVisible();
    await expect(page.locator('text=1,580')).toBeVisible();
  });

  test('should display tabs correctly', async ({ page }) => {
    await page.goto('/');

    // Check for tabs (using tab role to be specific)
    await expect(page.getByRole('tab', { name: '總覽' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '本週排程' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '玩家時段' })).toBeVisible();

    // Test tab switching
    await page.getByRole('tab', { name: '本週排程' }).click();
    await expect(page.locator('text=本週副本排程')).toBeVisible();

    await page.getByRole('tab', { name: '玩家時段' }).click();
    await expect(page.locator('text=玩家可用時段')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle('Lost Ark 出團管理系統');
  });
});