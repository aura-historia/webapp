import { describe, expect, it } from "vitest";

import { PRERENDER_PAGES, STATIC_PAGES } from "@/lib/seo/staticPages.ts";

describe("AI agents page registration", () => {
    it("is prerendered and in the sitemap for every language", () => {
        expect(STATIC_PAGES).toContainEqual({ path: "/ai-agents", indexable: true });
        const pages = PRERENDER_PAGES.filter((page) => page.path.endsWith("/ai-agents"));
        expect(pages.map((page) => page.path).sort()).toEqual([
            "/de/ai-agents",
            "/en/ai-agents",
            "/es/ai-agents",
            "/fr/ai-agents",
            "/it/ai-agents",
        ]);
        expect(pages.every((page) => page.sitemap.exclude === false)).toBe(true);
    });
});
