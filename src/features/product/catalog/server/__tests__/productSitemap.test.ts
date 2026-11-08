import { describe, expect, it, vi } from "vitest";
import type { PersonalizedProductListingSummaryData } from "@/client";
import {
    buildProductSitemapXml,
    fetchRecentProductSitemapEntries,
    PRODUCT_SITEMAP_PATH,
    serveProductSitemapRequest,
    toProductSitemapEntry,
} from "../productSitemap.ts";

vi.mock("@/env.ts", () => ({
    env: { VITE_APP_URL: "https://aura-historia.com", VITE_API_URL: "https://api.example.com" },
}));

function summary(
    overrides: Partial<PersonalizedProductListingSummaryData["item"]> = {},
): PersonalizedProductListingSummaryData {
    return {
        item: {
            productListingId: "pl_01test",
            productListingTitleSlugId: "chair-a1b2c3",
            eventId: "evt_01test",
            source: {
                listingSourceId: "ls_01test",
                name: "Antique Store",
                slugId: "antique-store",
            },
            sourceListingId: "4711",
            priceValuation: {
                type: "CURRENT",
                fxRateId: "fx_01",
                capturedAt: "2026-11-01T00:00:00Z",
            },
            lifecycle: "ACTIVE",
            url: "https://example.com/chair",
            viewUrl: "https://example.com/chair?utm_source=aura_historia",
            images: [{ url: "https://example.com/chair.jpg?w=1&h=2" }],
            contentPolicy: { decision: "ALLOWED" },
            updated: "2026-11-06T13:17:24.700Z",
            ...overrides,
        } as PersonalizedProductListingSummaryData["item"],
    };
}

function page(items: PersonalizedProductListingSummaryData[], searchAfter?: unknown) {
    return new Response(JSON.stringify({ items, size: items.length, searchAfter }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

describe("toProductSitemapEntry", () => {
    it("keeps the slug, the update time and the first public image", () => {
        expect(toProductSitemapEntry(summary())).toEqual({
            slug: "chair-a1b2c3",
            updated: new Date("2026-11-06T13:17:24.700Z"),
            imageUrl: "https://example.com/chair.jpg?w=1&h=2",
        });
    });

    it("leaves out listings without a page or whose content needs consent", () => {
        expect(toProductSitemapEntry(summary({ productListingTitleSlugId: undefined }))).toBe(
            undefined,
        );
        expect(
            toProductSitemapEntry(
                summary({
                    contentPolicy: { decision: "REQUIRES_CONSENT", category: "NAZI_GERMANY" },
                }),
            ),
        ).toBeUndefined();
        expect(toProductSitemapEntry(summary({ contentPolicy: undefined }))).toBeUndefined();
    });
});

describe("buildProductSitemapXml", () => {
    it("lists every language version once, escaped, without redirecting URLs", () => {
        const xml = buildProductSitemapXml(
            [
                {
                    slug: "chair-a1b2c3",
                    updated: new Date("2026-11-06T13:17:24.700Z"),
                    imageUrl: "https://example.com/chair.jpg?w=1&h=2",
                },
            ],
            "https://aura-historia.com/",
        );

        for (const code of ["de", "en", "fr", "es", "it"]) {
            expect(xml).toContain(
                `<loc>https://aura-historia.com/${code}/products/chair-a1b2c3</loc>`,
            );
        }
        expect(xml.match(/<url>/g)).toHaveLength(5);
        expect(xml).toContain("<lastmod>2026-11-06T13:17:24.700Z</lastmod>");
        expect(xml).toContain("<image:loc>https://example.com/chair.jpg?w=1&amp;h=2</image:loc>");
        expect(xml).not.toMatch(/products\/chair-a1b2c3\/</);
    });
});

describe("fetchRecentProductSitemapEntries", () => {
    it("pages anonymously through the newest updates up to the limit", async () => {
        const fullPage = Array.from({ length: 100 }, (_, index) =>
            summary({ productListingTitleSlugId: `item-${index}` }),
        );
        const fetchImpl = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(page(fullPage, { searchAfter: [1, "pl_x"] }))
            .mockResolvedValueOnce(page(fullPage, { searchAfter: [2, "pl_y"] }));

        const entries = await fetchRecentProductSitemapEntries(150, fetchImpl);

        expect(entries).toHaveLength(150);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
        const [firstUrl, firstInit] = fetchImpl.mock.calls[0];
        const first = new URL(String(firstUrl));
        expect(first.origin).toBe("https://api.example.com");
        expect(first.searchParams.get("sort")).toBe("updated");
        expect(first.searchParams.get("order")).toBe("desc");
        expect(first.searchParams.get("size")).toBe("100");
        expect(new Headers(firstInit?.headers).has("Authorization")).toBe(false);
        expect(new URL(String(fetchImpl.mock.calls[1][0])).searchParams.get("searchAfter")).toBe(
            JSON.stringify({ searchAfter: [1, "pl_x"] }),
        );
    });

    it("stops at the last page", async () => {
        const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(page([summary()]));

        expect(await fetchRecentProductSitemapEntries(1_000, fetchImpl)).toHaveLength(1);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it("fails when the search fails", async () => {
        const fetchImpl = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(new Response("nope", { status: 500 }));

        await expect(fetchRecentProductSitemapEntries(100, fetchImpl)).rejects.toThrow();
    });
});

describe("serveProductSitemapRequest", () => {
    it("ignores other paths", async () => {
        expect(
            await serveProductSitemapRequest(new Request("https://aura-historia.com/sitemap.xml")),
        ).toBeUndefined();
    });

    it("answers with XML from the public search", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(page([summary()]));
        try {
            const response = await serveProductSitemapRequest(
                new Request(`https://aura-historia.com${PRODUCT_SITEMAP_PATH}`),
            );

            expect(response?.status).toBe(200);
            expect(response?.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
            expect(await response?.text()).toContain("/en/products/chair-a1b2c3</loc>");
        } finally {
            fetchSpy.mockRestore();
        }
    });

    it("answers 503 without caching when the search is unavailable", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response("down", { status: 503 }));
        try {
            const response = await serveProductSitemapRequest(
                new Request(`https://aura-historia.com${PRODUCT_SITEMAP_PATH}`),
            );

            expect(response?.status).toBe(503);
            expect(response?.headers.get("Cache-Control")).toBe("no-store");
        } finally {
            fetchSpy.mockRestore();
        }
    });

    it("refuses other methods", async () => {
        const response = await serveProductSitemapRequest(
            new Request(`https://aura-historia.com${PRODUCT_SITEMAP_PATH}`, { method: "POST" }),
        );
        expect(response?.status).toBe(405);
    });
});
