import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/i18n/locales/en/translation.json";
import {
    BRAND_COLOURS,
    BRAND_KIT_URL,
    LOGO_FORMATS,
    PRESS_LOGOS,
    pressLogoUrl,
} from "@/features/press/config/pressPage.data.ts";
import { PRERENDER_PAGES, STATIC_PAGES } from "@/lib/seo/staticPages.ts";

const PUBLIC_DIR = join(process.cwd(), "public");

function publicFile(url: string): string {
    return join(PUBLIC_DIR, url);
}

describe("press kit files", () => {
    it("serves every logo the page offers, in every format", () => {
        for (const logo of PRESS_LOGOS) {
            for (const format of LOGO_FORMATS) {
                expect(existsSync(publicFile(pressLogoUrl(logo, format))), logo.file).toBe(true);
            }
        }
        expect(existsSync(publicFile(BRAND_KIT_URL))).toBe(true);
    });

    it("draws every SVG logo from the site's wordmark", () => {
        const wordmark = readFileSync(
            join(process.cwd(), "src/features/app-shell/components/navigation/Wordmark.tsx"),
            "utf8",
        );
        const letters = wordmark.match(/export const WORDMARK_PATH =\s*"([^"]+)"/)?.[1];
        expect(letters).toBeTruthy();
        for (const logo of PRESS_LOGOS) {
            expect(readFileSync(publicFile(pressLogoUrl(logo, "svg")), "utf8")).toContain(
                letters as string,
            );
        }
    });

    it("publishes the same colour values as the page", () => {
        const colours = readFileSync(publicFile("/press/aura-historia-colours.txt"), "utf8");
        for (const { hex, rgb } of BRAND_COLOURS) {
            expect(colours).toContain(`${hex}   RGB ${rgb}`);
        }
    });

    it("keeps the kit's fact sheet in step with the page's English facts", () => {
        const factSheet = readFileSync(publicFile("/press/aura-historia-fact-sheet.txt"), "utf8");
        const { items } = en.pressPage.facts;
        for (const fact of [
            "whatItIs",
            "founded",
            "team",
            "languages",
            "markets",
            "aiAssistants",
        ] as const) {
            expect(factSheet, fact).toContain(items[fact].value);
        }
        expect(factSheet).toContain(items.basedIn.value);
    });

    it("is prerendered and in the sitemap for every language", () => {
        expect(STATIC_PAGES).toContainEqual({ path: "/press", indexable: true });
        const pages = PRERENDER_PAGES.filter((page) => page.path.endsWith("/press"));
        expect(pages.map((page) => page.path).sort()).toEqual([
            "/de/press",
            "/en/press",
            "/es/press",
            "/fr/press",
            "/it/press",
        ]);
        expect(pages.every((page) => page.sitemap.exclude === false)).toBe(true);
    });
});
