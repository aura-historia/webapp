import { test, expect } from '@playwright/test';

test('homepage loads and displays main content', async ({ page }) => {
  await page.goto('/');

  // Expect a title containing "TanStack Start"
  await expect(page).toHaveTitle(/TanStack Start/);

  // Expect the page to have working navigation
  await expect(page.locator('nav')).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');

  // Navigate to imprint page
  await page.click('a[href="/imprint"]');

  // Check that we're on the imprint page
  await expect(page).toHaveURL('/imprint');
  await expect(page.locator('text=Hello "/imprint"!')).toBeVisible();
});

test('app has basic accessibility features', async ({ page }) => {
  await page.goto('/');

  // Check that the page has a proper heading structure
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  await expect(headings.first()).toBeVisible();

  // Check that interactive elements are keyboard accessible
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});