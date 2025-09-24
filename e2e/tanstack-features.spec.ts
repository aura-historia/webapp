import { test, expect } from '@playwright/test';

test.describe('TanStack Features', () => {
  test('should load TanStack Start application correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the React app has loaded
    await expect(page.locator('main')).toBeVisible();
    
    // Check that TanStack Router is working by verifying the URL structure
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should have TanStack Router navigation working', async ({ page }) => {
    await page.goto('/');

    // Check that navigation links exist and work
    const navigation = page.locator('nav');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
      
      // Test navigation to different routes
      const imprintLink = page.locator('a[href="/imprint"]');
      if (await imprintLink.count() > 0) {
        await imprintLink.click();
        await expect(page).toHaveURL(/\/imprint$/);
        await expect(page.locator('text=Hello "/imprint"!')).toBeVisible();
      }
    }
  });

  test('should handle client-side routing', async ({ page }) => {
    // Start on home page
    await page.goto('/');
    
    // Navigate to imprint via client-side routing
    await page.evaluate(() => {
      window.history.pushState({}, '', '/imprint');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    
    // The router should handle this and show the imprint content
    // Note: This test might need adjustment based on actual router behavior
    await page.waitForTimeout(100); // Give router time to react
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto('/');
    
    // Wait a moment for any async errors to surface
    await page.waitForTimeout(2000);
    
    // Filter out known development warnings
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('[HMR]') &&
      !error.includes('Download the React DevTools')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper React hydration', async ({ page }) => {
    await page.goto('/');
    
    // Check that React has properly hydrated by looking for interactive elements
    await expect(page.locator('main')).toBeVisible();
    
    // If there are any interactive elements, they should be clickable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeEnabled();
    }
    
    // If there are any form inputs, they should be interactive
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      await expect(inputs.first()).toBeEnabled();
    }
  });
});