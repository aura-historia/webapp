import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applySecurityHeaders, SECURITY_HEADERS } from "../securityHeaders.ts";

describe("applySecurityHeaders", () => {
    it("sets a CSP frame-ancestors policy that blocks arbitrary iframes", () => {
        const headers = applySecurityHeaders(new Headers());

        expect(headers.get("Content-Security-Policy")).toBe(SECURITY_HEADERS.contentSecurityPolicy);
    });

    it("allows Shopify Admin to frame the embedded app", () => {
        const headers = applySecurityHeaders(new Headers());
        const csp = headers.get("Content-Security-Policy");

        expect(csp).toContain("frame-ancestors");
        expect(csp).toContain("'self'");
        expect(csp).toContain("https://admin.shopify.com");
        expect(csp).toContain("https://*.myshopify.com");
    });

    it("does not set X-Frame-Options because it would block Shopify Admin embedding", () => {
        const headers = applySecurityHeaders(
            new Headers({
                "X-Frame-Options": "DENY",
            }),
        );

        expect(headers.has("X-Frame-Options")).toBe(false);
    });

    it("appends frame-ancestors to an existing CSP that has no frame policy", () => {
        const headers = applySecurityHeaders(
            new Headers({
                "Content-Security-Policy": "default-src 'self'",
            }),
        );

        expect(headers.get("Content-Security-Policy")).toBe(
            `default-src 'self'; ${SECURITY_HEADERS.contentSecurityPolicy}`,
        );
    });

    it("preserves an existing frame-ancestors directive", () => {
        const existingPolicy = "default-src 'self'; frame-ancestors 'none'";
        const headers = applySecurityHeaders(
            new Headers({
                "Content-Security-Policy": existingPolicy,
            }),
        );

        expect(headers.get("Content-Security-Policy")).toBe(existingPolicy);
    });

    it("keeps Cloudflare static asset headers in sync", () => {
        const cloudflareHeaders = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

        expect(cloudflareHeaders).toContain(
            `Content-Security-Policy: ${SECURITY_HEADERS.contentSecurityPolicy}`,
        );
    });
});
