import { describe, expect, it } from "vitest";
import { normalizeShopDomain, parseShopDomains } from "../adminShopFormUtils.ts";

describe("adminShopFormUtils", () => {
    it("normalizes protocols, www prefixes, paths, and ports from domains", () => {
        expect(normalizeShopDomain("https://www.Example.com:8443/path?q=1#fragment")).toBe(
            "example.com",
        );
    });

    it("parses and deduplicates mixed domain input", () => {
        expect(
            parseShopDomains(
                "https://www.example.com/path\nexample.com  api.example.com;http://api.example.com:8080",
            ),
        ).toEqual(["example.com", "api.example.com"]);
    });
});
