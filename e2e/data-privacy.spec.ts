import { test, expect } from '@playwright/test';

test.describe('Data Privacy Page', () => {
  test('should load data privacy page successfully', async ({ page }) => {
    await page.goto('/data-privacy');

    // Check that the page loads without errors
    await expect(page).toHaveURL('/data-privacy');
    
    // Check that main content area is present
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display data privacy title', async ({ page }) => {
    await page.goto('/data-privacy');

    // Check for data privacy title in any supported language
    const title = page.locator('h1').filter({ hasText: /Data Privacy|Datenschutz|Protection des données|Privacidad de datos/i });
    await expect(title).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/data-privacy');

    // Check that h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have accessible structure', async ({ page }) => {
    await page.goto('/data-privacy');

    // Check that page has proper semantic structure
    await expect(page.locator('main')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/data-privacy');
    await expect(page.locator('main')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
    
    // Content should still be readable on mobile
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});
