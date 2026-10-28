import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { PRERENDER_PAGES, STATIC_PAGES } from "@/lib/seo/staticPages.ts";

const routesDir = resolve(process.cwd(), "src/routes");
const robotsTxt = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
const disallowRules = robotsTxt
    .split("\n")
    .map((line) => line.match(/^Disallow:\s*(\S*)/i)?.[1])
    .filter((rule): rule is string => Boolean(rule));

/** Matches a path the way Google and Bing evaluate robots.txt rules: prefix, `*` and `$`. */
function isDisallowed(path: string): boolean {
    return disallowRules.some((rule) => {
        const anchored = rule.endsWith("$");
        const pattern = (anchored ? rule.slice(0, -1) : rule)
            .split("*")
            .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
            .join(".*");
        return new RegExp(`^${pattern}${anchored ? "$" : ""}`).test(path);
    });
}

function readRoute(fileName: string): string {
    return readFileSync(resolve(routesDir, fileName), "utf8");
}

function sendsNoIndex(fileName: string): boolean {
    return (
        fileName.startsWith("$lng._auth.") ||
        /noIndex: true|content: "noindex|"X-Robots-Tag": "noindex/.test(readRoute(fileName))
    );
}

/** Turns a `$lng.*` route file name into a concrete path below the given language prefix. */
function routeFileToPath(fileName: string, lng: string): string {
    const segments = fileName
        .replace(/\.tsx?$/, "")
        .split(".")
        .slice(1)
        .filter((segment) => !segment.startsWith("_") && segment !== "index")
        .map((segment) => (segment.startsWith("$") ? "example" : segment.replace(/_$/, "")));
    return `/${lng}/${segments.join("/")}`;
}

function staticPageRouteFile(path: string): string {
    const name = path === "/" ? "$lng.index" : `$lng${path.replaceAll("/", ".")}`;
    return (
        readdirSync(routesDir).find(
            (file) => file === `${name}.tsx` || file === `${name}.index.tsx`,
        ) ?? name
    );
}

// Page routes only: pathless layouts (`$lng._auth.tsx`) render no page of their own.
const noIndexRouteFiles = readdirSync(routesDir).filter(
    (file) =>
        file.startsWith("$lng.") && !file.split(".").at(-2)?.startsWith("_") && sendsNoIndex(file),
);

describe("public/robots.txt", () => {
    it("does not block any prerendered page", () => {
        for (const { path } of PRERENDER_PAGES) {
            expect(isDisallowed(path), path).toBe(false);
        }
    });

    it("lets crawlers fetch noindex pages so they can read the noindex tag", () => {
        expect(noIndexRouteFiles).toEqual(
            expect.arrayContaining([
                "$lng.imprint.tsx",
                "$lng.privacy.tsx",
                "$lng.terms-and-conditions.tsx",
                "$lng.login.tsx",
                "$lng.consent-settings.tsx",
                "$lng._auth.me.account.tsx",
            ]),
        );

        for (const { code } of SUPPORTED_LANGUAGES) {
            for (const file of noIndexRouteFiles) {
                const path = routeFileToPath(file, code);
                expect(isDisallowed(path), path).toBe(false);
            }
        }
    });

    it("keeps server endpoints out of crawling", () => {
        expect(isDisallowed("/api/oauth/authorize/approve")).toBe(true);
    });

    it("announces the sitemap and llms.txt", () => {
        expect(robotsTxt).toContain("Sitemap: https://aura-historia.com/sitemap.xml");
        expect(robotsTxt).toContain("https://aura-historia.com/llms.txt");
    });
});

describe("static pages", () => {
    it("prerenders every static page in every supported language", () => {
        expect(PRERENDER_PAGES.map(({ path }) => path)).toEqual(
            SUPPORTED_LANGUAGES.flatMap(({ code }) =>
                STATIC_PAGES.map(({ path }) => `/${code}${path}`),
            ),
        );
    });

    it("keeps legal pages out of search results and the sitemap", () => {
        for (const path of ["/imprint", "/privacy", "/terms-and-conditions"]) {
            expect(STATIC_PAGES.find((page) => page.path === path)?.indexable, path).toBe(false);
        }
    });

    it("lists a page in the sitemap exactly when its route allows indexing", () => {
        for (const { path, indexable } of STATIC_PAGES) {
            expect(sendsNoIndex(staticPageRouteFile(path)), path).toBe(!indexable);
        }

        for (const page of PRERENDER_PAGES) {
            const unprefixedPath = page.path.replace(/^\/[a-z]{2}/, "") || "/";
            const { indexable } = STATIC_PAGES.find(({ path }) => path === unprefixedPath) ?? {};
            expect(page.sitemap.exclude, page.path).toBe(!indexable);
        }
    });
});
