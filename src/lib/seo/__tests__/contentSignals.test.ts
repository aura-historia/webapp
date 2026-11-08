import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import {
    applyContentSignalHeader,
    CONTENT_SIGNAL,
    CONTENT_SIGNAL_HEADER,
} from "@/lib/seo/contentSignals.ts";

/** The header lines Cloudflare's `_headers` file attaches to one path pattern. */
function staticAssetHeaders(pathPattern: string): string[] {
    const lines = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8").split("\n");
    const start = lines.indexOf(pathPattern);
    if (start === -1) {
        return [];
    }
    const end = lines.findIndex((line, index) => index > start && !/^\s+\S/.test(line));
    return lines.slice(start + 1, end === -1 ? undefined : end).map((line) => line.trim());
}

describe("applyContentSignalHeader", () => {
    it("states the site's content signals on HTML pages", () => {
        const headers = applyContentSignalHeader(
            new Headers({ "Content-Type": "text/html; charset=utf-8" }),
        );

        expect(headers.get(CONTENT_SIGNAL_HEADER)).toBe("search=yes, ai-input=yes, ai-train=no");
    });

    it("keeps a value the page already set", () => {
        const headers = applyContentSignalHeader(
            new Headers({ "Content-Type": "text/html", [CONTENT_SIGNAL_HEADER]: "search=yes" }),
        );

        expect(headers.get(CONTENT_SIGNAL_HEADER)).toBe("search=yes");
    });

    it.each([
        ["JSON", new Headers({ "Content-Type": "application/json" })],
        ["a redirect without a body", new Headers({ Location: "/de/" })],
    ])("leaves %s alone", (_, headers) => {
        expect(applyContentSignalHeader(headers).has(CONTENT_SIGNAL_HEADER)).toBe(false);
    });

    it("is served on every prerendered page from Cloudflare static asset headers", () => {
        for (const { code } of SUPPORTED_LANGUAGES) {
            expect(staticAssetHeaders(`/${code}/*`), code).toContain(
                `${CONTENT_SIGNAL_HEADER}: ${CONTENT_SIGNAL}`,
            );
        }
    });
});
