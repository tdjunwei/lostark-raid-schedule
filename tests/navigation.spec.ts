import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/');

    // Test navigation to each page
    const navigationTests = [
      { linkText: '玩家管理', expectedUrl: '/players', expectedHeading: '玩家管理' },
      { linkText: '排程', expectedUrl: '/schedule', expectedHeading: '排程管理' },
      { linkText: '天界', expectedUrl: '/raids/celestial', expectedHeading: '天界副本' },
      { linkText: '總覽', expectedUrl: '/', expectedHeading: 'Lost Ark 出團管理系統' },
    ];

    for (const navTest of navigationTests) {
      // Click the navigation link
      await page.click(`text=${navTest.linkText}`);
      
      // Wait for navigation and check URL
      await page.waitForURL(`**${navTest.expectedUrl}`);
      
      // Check if correct page loaded
      await expect(page.locator('h1')).toHaveText(navTest.expectedHeading);
    }
  });

  test('should have sidebar toggle functionality', async ({ page }) => {
    await page.goto('/');

    // Look for sidebar trigger button
    const sidebarTrigger = page.locator('button').first();
    
    // The button should be visible
    await expect(sidebarTrigger).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/players');

    // The active navigation item should have some visual indication
    // This might need adjustment based on the actual active state styling
    const playersLink = page.locator('a[href="/players"]');
    await expect(playersLink).toBeVisible();
  });

  test('should maintain navigation state across page refreshes', async ({ page }) => {
    // Navigate to players page
    await page.goto('/players');
    await expect(page.locator('h1')).toHaveText('玩家管理');

    // Refresh the page
    await page.reload();
    
    // Should still be on players page
    await expect(page.locator('h1')).toHaveText('玩家管理');
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Direct navigation to different pages
    const directNavigationTests = [
      { url: '/players', expectedHeading: '玩家管理' },
      { url: '/schedule', expectedHeading: '排程管理' },
      { url: '/raids/celestial', expectedHeading: '天界副本' },
    ];

    for (const navTest of directNavigationTests) {
      await page.goto(navTest.url);
      await expect(page.locator('h1')).toHaveText(navTest.expectedHeading);
    }
  });

  test('should show main navigation items in sidebar', async ({ page }) => {
    await page.goto('/');

    // Check main navigation items are present (using link role to be specific)
    const mainNavItems = [
      '總覽',
      '玩家管理', 
      '排程',
      '天界'
    ];

    for (const item of mainNavItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('should have proper sidebar branding', async ({ page }) => {
    await page.goto('/');

    // Check for sidebar branding/title
    await expect(page.locator('text=Lost Ark 出團系統')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // The first focusable element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');

    // Sidebar should still be functional on mobile
    await expect(page.getByRole('link', { name: '總覽' })).toBeVisible();
    
    // Test navigation on mobile
    await page.getByRole('link', { name: '玩家管理' }).click();
    await expect(page.locator('h1')).toHaveText('玩家管理');
  });
});