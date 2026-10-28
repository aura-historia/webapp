import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";

const llmsTxt = readFileSync(resolve(process.cwd(), "public/llms.txt"), "utf8");
const lines = llmsTxt.split("\n");
const firstSectionIndex = lines.findIndex((line) => line.startsWith("## "));
const sectionLines = lines.slice(firstSectionIndex);
const linkPattern = /\[[^\]]+\]\(([^)\s]+)\)/g;

describe("public/llms.txt", () => {
    it("opens with an H1 title followed by a blockquote summary", () => {
        const [title, , summary] = lines;

        expect(title).toBe("# Aura Historia");
        expect(summary).toMatch(/^> \S/);
    });

    it("uses only H1 and H2 headings, with H2 sections after the details", () => {
        const headings = lines.filter((line) => line.startsWith("#"));

        expect(headings.filter((line) => line.startsWith("# "))).toHaveLength(1);
        expect(headings.every((line) => /^#{1,2} /.test(line))).toBe(true);
        expect(firstSectionIndex).toBeGreaterThan(0);
    });

    it("keeps every H2 section a list of links with optional notes", () => {
        const contentLines = sectionLines.filter(
            (line) => line.trim() !== "" && !line.startsWith("## "),
        );

        for (const line of contentLines) {
            expect(line).toMatch(/^- \[[^\]]+\]\([^)\s]+\)(: \S.*)?$/);
        }
    });

    it("puts secondary links in a final Optional section", () => {
        const sections = sectionLines.filter((line) => line.startsWith("## "));

        expect(sections.at(-1)).toBe("## Optional");
    });

    it("links only to absolute HTTPS URLs", () => {
        const urls = [...llmsTxt.matchAll(linkPattern)].map(([, url]) => url);

        expect(urls.length).toBeGreaterThan(0);
        for (const url of urls) {
            expect(new URL(url).protocol).toBe("https:");
        }
    });

    it("documents the API and MCP entry points", () => {
        expect(llmsTxt).toContain("https://api.aura-historia.com/v1");
        expect(llmsTxt).toContain("(https://docs.api.aura-historia.com/)");
        expect(llmsTxt).toContain("(https://mcp.aura-historia.com/v1)");
        expect(llmsTxt).toContain("(https://docs.api.aura-historia.com/mcp.md)");
    });

    it("links the same partner integration listings as the partner program", () => {
        expect(llmsTxt).toContain(`(${WORDPRESS_PLUGIN_DIRECTORY_URL})`);
        expect(llmsTxt).toContain(`(${SHOPIFY_APP_STORE_URL})`);
    });

    it("is served as UTF-8 plain text", () => {
        const cloudflareHeaders = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

        expect(cloudflareHeaders).toMatch(
            /\/llms\.txt\n\s+Content-Type: text\/plain; charset=utf-8/,
        );
    });
});
