import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { getLanguageFromPathname, localizeHref } from "@/i18n/routing.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { Route } from "@/routes/$lng.newsletter.confirm.tsx";

vi.mock("@/features/newsletter/pages/NewsletterConfirmationPage.tsx", () => ({
    NewsletterConfirmationPage: () => null,
}));
vi.mock("@/env", () => ({ env: { VITE_APP_URL: "https://aura-historia.com" } }));

const TOKEN = "AbC123_-xyz0123456789AbC123_-xyz0123456789";

describe("$lng.newsletter.confirm route", () => {
    it("is the public route the confirmation email links to", () => {
        const routeTree = readFileSync(resolve(process.cwd(), "src/routeTree.gen.ts"), "utf8");

        expect(routeTree).toContain("fullPath: '/$lng/newsletter/confirm'");
        expect(routeTree).not.toContain("/$lng/_auth/newsletter");
    });

    it("matches the localized email link for every supported email language", () => {
        expect(SUPPORTED_LANGUAGES.map(({ code }) => code).sort()).toEqual([
            "de",
            "en",
            "es",
            "fr",
            "it",
        ]);

        for (const { code } of SUPPORTED_LANGUAGES) {
            const link = new URL(
                `https://aura-historia.com/${code}/newsletter/confirm#token=${TOKEN}`,
            );
            // A supported prefix is served directly, so the fragment is never part of a redirect.
            expect(getLanguageFromPathname(link.pathname)).toBe(code);
        }
    });

    it("keeps the token in the fragment when an unsupported language is localized", () => {
        const localized = new URL(
            localizeHref(`/xx/newsletter/confirm#token=${TOKEN}`, "en"),
            "https://aura-historia.com",
        );

        expect(localized.search).toBe("");
        expect(localized.hash).toBe(`#token=${TOKEN}`);
    });

    it("reads nothing from the request before render", () => {
        expect(Route.options.loader).toBeUndefined();
        expect(Route.options.beforeLoad).toBeUndefined();
        expect(Route.options.validateSearch).toBeUndefined();
    });

    it("disables caching, referrers and indexing", async () => {
        const headers = Route.options.headers as () => Record<string, string>;
        expect(await headers()).toEqual({
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
            "X-Robots-Tag": "noindex, nofollow",
        });

        const head = Route.options.head as () => { meta: Array<Record<string, string>> };
        expect(head().meta).toEqual(
            expect.arrayContaining([
                { name: "robots", content: "noindex, nofollow" },
                { name: "referrer", content: "no-referrer" },
            ]),
        );
    });

    it("is not statically prerendered", () => {
        const viteConfig = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");

        expect(viteConfig).not.toContain("newsletter");
    });
});
