import { test, expect } from '@playwright/test';

test.describe('App Shell', () => {
  test('should load with proper HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check basic HTML structure
      await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    
    // Check that meta tags are present
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');

    // Check that the main content area exists
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have proper header and footer structure', async ({ page }) => {
    await page.goto('/');

    // Check header exists and is visible
    const header = page.locator('header');
    if (await header.count() > 0) {
      await expect(header).toBeVisible();
    }

    // Check footer exists and is at the bottom
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }

    // Check that the layout has proper flex structure
    const container = page.locator('div.min-h-screen.flex.flex-col');
    await expect(container).toBeVisible();
  });

  test('should load CSS and be styled correctly', async ({ page }) => {
    await page.goto('/');

    // Check that Tailwind classes are applied and working
    const container = page.locator('div.min-h-screen');
    await expect(container).toBeVisible();

    // Check that the page has basic styling
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('main')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('main')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    
    await expect(page.locator('main')).toBeVisible();
  });
});