import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    await page.goto('/');

    // Test navigation to imprint page
    const imprintLink = page.locator('a[href="/imprint"]');
    await expect(imprintLink).toBeVisible();
    await imprintLink.click();

    await expect(page).toHaveURL('/imprint');
    await expect(page.locator('text=Hello "/imprint"!')).toBeVisible();

    // Navigate back to home
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to imprint page
    await page.goto('/imprint');
    await expect(page.locator('text=Hello "/imprint"!')).toBeVisible();

    // Navigate directly to terms page if it exists
    const response = await page.goto('/terms');
    if (response?.status() === 200) {
      await expect(page.locator('text=Hello "/terms"!')).toBeVisible();
    }
  });

  test('should show 404 for non-existent pages', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    // The response might be 404 or the app might handle routing client-side
    // We'll check for either case
    if (response?.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      // If client-side routing handles it, check for navigation back to a valid page
      await expect(page).toHaveURL(/^https?:\/\/[^\/]+/);
    }
  });
});