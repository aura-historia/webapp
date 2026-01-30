import { test, expect } from "@playwright/test";

test.describe("Product Detail Page - API Integration", () => {
    test("should load product details using new API endpoints", async ({ page }) => {
        // Mock the API responses for the new endpoints
        await page.route("**/api/v1/shops/*/products/*", async (route) => {
            const url = route.request().url();

            // Handle product history endpoint
            if (url.includes("/history")) {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify([
                        {
                            eventType: "CREATED",
                            productId: "test-product-id",
                            eventId: "test-event-id",
                            shopId: "test-shop-id",
                            shopsProductId: "test-shops-product-id",
                            payload: {
                                price: {
                                    currency: "EUR",
                                    amount: 1000,
                                },
                                state: "AVAILABLE",
                            },
                            timestamp: "2024-01-01T00:00:00Z",
                        },
                    ]),
                });
            } else {
                // Handle main product endpoint
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        item: {
                            productId: "test-product-id",
                            productSlugId: "test-product-slug",
                            shopSlugId: "test-shop-slug",
                            eventId: "test-event-id",
                            shopId: "test-shop-id",
                            shopsProductId: "test-shops-product-id",
                            shopName: "Test Shop",
                            shopType: "COMMERCIAL_DEALER",
                            title: {
                                text: "Test Product",
                                language: "en",
                            },
                            price: {
                                amount: 1000,
                                currency: "EUR",
                            },
                            state: "AVAILABLE",
                            url: "https://example.com/product",
                            images: [],
                            created: "2024-01-01T00:00:00Z",
                            updated: "2024-01-01T00:00:00Z",
                        },
                    }),
                });
            }
        });

        // Navigate to a product detail page
        await page.goto("/product/test-shop-id/test-shops-product-id");

        // Verify the page loads successfully
        await expect(page).toHaveTitle(/Test Product/i);

        // Verify product details are displayed
        await expect(page.locator("text=Test Product")).toBeVisible();
        await expect(page.locator("text=Test Shop")).toBeVisible();
    });

    test("should handle product not found error", async ({ page }) => {
        // Mock 404 response
        await page.route("**/api/v1/shops/*/products/*", async (route) => {
            await route.fulfill({
                status: 404,
                contentType: "application/json",
                body: JSON.stringify({
                    error: "PRODUCT_NOT_FOUND",
                    message: "Product not found",
                }),
            });
        });

        await page.goto("/product/invalid-shop/invalid-product");

        // Should show error component or 404 page
        await expect(page.locator("text=/not found/i")).toBeVisible();
    });

    test("should use correct API path structure", async ({ page }) => {
        const productRequests: string[] = [];
        const historyRequests: string[] = [];

        // Intercept API calls to verify correct paths
        await page.route("**/api/v1/**", async (route) => {
            const url = route.request().url();

            // Track which endpoints are being called
            if (url.includes("/history")) {
                historyRequests.push(url);
            } else if (url.includes("/products/")) {
                productRequests.push(url);
            }

            // Mock response
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(
                    url.includes("/history")
                        ? []
                        : {
                              item: {
                                  productId: "test-id",
                                  productSlugId: "test-slug",
                                  shopSlugId: "test-shop",
                                  eventId: "event-id",
                                  shopId: "shop-id",
                                  shopsProductId: "product-id",
                                  shopName: "Shop",
                                  shopType: "COMMERCIAL_DEALER",
                                  title: { text: "Product", language: "en" },
                                  state: "AVAILABLE",
                                  url: "https://example.com",
                                  images: [],
                                  created: "2024-01-01T00:00:00Z",
                                  updated: "2024-01-01T00:00:00Z",
                              },
                          },
                ),
            });
        });

        await page.goto("/product/test-shop/test-product");

        // Wait for API calls
        await page.waitForTimeout(1000);

        // Verify correct endpoint paths are used
        expect(productRequests.length).toBeGreaterThan(0);
        expect(productRequests[0]).toContain("/api/v1/shops/");
        expect(productRequests[0]).toContain("/products/");

        expect(historyRequests.length).toBeGreaterThan(0);
        expect(historyRequests[0]).toContain("/api/v1/shops/");
        expect(historyRequests[0]).toContain("/products/");
        expect(historyRequests[0]).toContain("/history");
    });

    test("should fetch product and history separately", async ({ page }) => {
        let productCalled = false;
        let historyCalled = false;

        await page.route("**/api/v1/shops/*/products/*", async (route) => {
            const url = route.request().url();

            if (url.includes("/history")) {
                historyCalled = true;
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify([]),
                });
            } else {
                productCalled = true;
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        item: {
                            productId: "test-id",
                            productSlugId: "test-slug",
                            shopSlugId: "test-shop",
                            eventId: "event-id",
                            shopId: "shop-id",
                            shopsProductId: "product-id",
                            shopName: "Shop",
                            shopType: "COMMERCIAL_DEALER",
                            title: { text: "Product", language: "en" },
                            state: "AVAILABLE",
                            url: "https://example.com",
                            images: [],
                            created: "2024-01-01T00:00:00Z",
                            updated: "2024-01-01T00:00:00Z",
                        },
                    }),
                });
            }
        });

        await page.goto("/product/test-shop/test-product");

        // Wait for both API calls
        await page.waitForTimeout(1000);

        // Verify both endpoints were called
        expect(productCalled).toBe(true);
        expect(historyCalled).toBe(true);
    });
});
