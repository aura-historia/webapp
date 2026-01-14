import { test, expect } from '@playwright/test';

test.describe('Imprint Page', () => {
  test('should load imprint page successfully', async ({ page }) => {
    await page.goto('/imprint');

    // Check that the page loads without errors
    await expect(page).toHaveURL('/imprint');
    
    // Check that main content area is present
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display imprint title', async ({ page }) => {
    await page.goto('/imprint');

    // Check for imprint title in any supported language
    const title = page.locator('h1').filter({ hasText: /Imprint|Impressum|Mentions légales|Aviso legal/i });
    await expect(title).toBeVisible();
  });

  test('should display service provider information', async ({ page }) => {
    await page.goto('/imprint');

    // Check for service provider section
    const serviceProvider = page.locator('text=/Service Provider|Diensteanbieter|Fournisseur du Service|Proveedor del Servicio/i');
    await expect(serviceProvider).toBeVisible();

    // Check for Aura Historia name
    await expect(page.locator('text=Aura Historia')).toBeVisible();
  });

  test('should display contact information with email link', async ({ page }) => {
    await page.goto('/imprint');

    // Check for contact email link
    const emailLink = page.locator('a[href="mailto:contact@aura-historia.com"]');
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveText(/contact@aura-historia\.com/i);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/imprint');

    // Check that h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check that h2 headings exist (section headings)
    const h2Headings = page.locator('h2');
    const h2Count = await h2Headings.count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should render markdown content with proper structure', async ({ page }) => {
    await page.goto('/imprint');

    // Check for presence of lists (ul or ol)
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    expect(listCount).toBeGreaterThan(0);

    // Check for presence of links
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should have accessible structure', async ({ page }) => {
    await page.goto('/imprint');

    // Check that page has proper semantic structure
    await expect(page.locator('main')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should display legal sections', async ({ page }) => {
    await page.goto('/imprint');

    // Check for copyright section in any language
    const copyright = page.locator('text=/Copyright|Urheberrecht|Droit d\'Auteur|Derechos de Autor/i');
    await expect(copyright).toBeVisible();

    // Check for applicable law section in any language
    const applicableLaw = page.locator('text=/Applicable Law|Anwendbares Recht|Droit Applicable|Legislación Aplicable/i');
    await expect(applicableLaw).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/imprint');
    await expect(page.locator('main')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
    
    // Content should still be readable on mobile
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});
