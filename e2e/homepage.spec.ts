import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/TanStack Start/);
    
    // Check that main content area is present
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have working TanStack devtools in development', async ({ page }) => {
    await page.goto('/');

    // Look for TanStack devtools indicator (only in development)
    // This helps ensure our development tools are working
    const devtools = page.locator('[data-tanstack-router-devtools]');
    if (await devtools.count() > 0) {
      await expect(devtools).toBeVisible();
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');

    // Check essential meta tags
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'utf-8');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');

    // Check that title is present and meaningful
    await expect(page).toHaveTitle(/TanStack Start/);
  });

  test('should have accessible structure', async ({ page }) => {
    await page.goto('/');

    // Check that page has proper semantic structure
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper heading hierarchy if headings exist
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    if (headingCount > 0) {
      await expect(headings.first()).toBeVisible();
    }

    // Test keyboard navigation basics
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });
});