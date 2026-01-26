import { describe, it, expect, beforeAll } from "vitest";
import { ensureURLPolyfills } from "../url";

describe("URL polyfills", () => {
    beforeAll(() => {
        // Ensure polyfills are loaded
        ensureURLPolyfills();
    });

    describe("URL.parse()", () => {
        it("should parse a valid absolute URL", () => {
            const result = URL.parse("https://example.com/path?query=value#hash");
            expect(result).toBeInstanceOf(URL);
            expect(result?.href).toBe("https://example.com/path?query=value#hash");
            expect(result?.hostname).toBe("example.com");
            expect(result?.pathname).toBe("/path");
            expect(result?.search).toBe("?query=value");
            expect(result?.hash).toBe("#hash");
        });

        it("should parse a relative URL with a base URL string", () => {
            const result = URL.parse("/relative/path", "https://example.com");
            expect(result).toBeInstanceOf(URL);
            expect(result?.href).toBe("https://example.com/relative/path");
        });

        it("should parse a relative URL with a base URL object", () => {
            const baseURL = new URL("https://example.com/base/");
            const result = URL.parse("../other", baseURL);
            expect(result).toBeInstanceOf(URL);
            expect(result?.href).toBe("https://example.com/other");
        });

        it("should return null for an invalid URL", () => {
            const result = URL.parse("not a valid url");
            expect(result).toBeNull();
        });

        it("should return null for an invalid base URL", () => {
            const result = URL.parse("/path", "not-a-valid-base");
            expect(result).toBeNull();
        });

        it("should handle empty string", () => {
            const result = URL.parse("");
            expect(result).toBeNull();
        });

        it("should parse URL with special characters", () => {
            const result = URL.parse("https://example.com/path%20with%20spaces");
            expect(result).toBeInstanceOf(URL);
            expect(result?.pathname).toBe("/path%20with%20spaces");
        });

        it("should parse URL with authentication", () => {
            const result = URL.parse("https://user:pass@example.com/path");
            expect(result).toBeInstanceOf(URL);
            expect(result?.username).toBe("user");
            expect(result?.password).toBe("pass");
        });

        it("should parse URL with port", () => {
            const result = URL.parse("https://example.com:8080/path");
            expect(result).toBeInstanceOf(URL);
            expect(result?.port).toBe("8080");
        });
    });

    describe("URL.canParse()", () => {
        it("should return true for a valid absolute URL", () => {
            expect(URL.canParse("https://example.com/path")).toBe(true);
        });

        it("should return true for a valid relative URL with base", () => {
            expect(URL.canParse("/relative/path", "https://example.com")).toBe(true);
        });

        it("should return true for a relative URL with base URL object", () => {
            const baseURL = new URL("https://example.com/");
            expect(URL.canParse("../path", baseURL)).toBe(true);
        });

        it("should return false for an invalid URL", () => {
            expect(URL.canParse("not a valid url")).toBe(false);
        });

        it("should return false for an invalid base URL", () => {
            expect(URL.canParse("/path", "not-a-valid-base")).toBe(false);
        });

        it("should return false for empty string", () => {
            expect(URL.canParse("")).toBe(false);
        });

        it("should return true for various valid protocols", () => {
            expect(URL.canParse("http://example.com")).toBe(true);
            expect(URL.canParse("https://example.com")).toBe(true);
            expect(URL.canParse("ftp://example.com")).toBe(true);
            expect(URL.canParse("file:///path/to/file")).toBe(true);
        });

        it("should return true for URLs with special characters", () => {
            expect(URL.canParse("https://example.com/path%20with%20spaces")).toBe(true);
            expect(URL.canParse("https://example.com/path?query=value&other=123")).toBe(true);
        });

        it("should return true for URLs with authentication", () => {
            expect(URL.canParse("https://user:pass@example.com")).toBe(true);
        });

        it("should return true for URLs with port", () => {
            expect(URL.canParse("https://example.com:8080")).toBe(true);
        });

        it("should return false for malformed URLs", () => {
            expect(URL.canParse("ht!tp://example.com")).toBe(false);
            expect(URL.canParse("//example.com")).toBe(false);
            expect(URL.canParse("example.com")).toBe(false);
        });
    });

    describe("URL.parse() and URL.canParse() consistency", () => {
        const testCases = [
            "https://example.com",
            "https://example.com/path",
            "https://example.com:8080/path?query=value#hash",
            "not a valid url",
            "://invalid",
            "",
            "/relative/path",
        ];

        testCases.forEach((testUrl) => {
            it(`should be consistent for: ${testUrl || "(empty string)"}`, () => {
                const canParse = URL.canParse(testUrl);
                const parsed = URL.parse(testUrl);

                if (canParse) {
                    expect(parsed).toBeInstanceOf(URL);
                } else {
                    expect(parsed).toBeNull();
                }
            });
        });

        const testCasesWithBase: Array<[string, string]> = [
            ["/path", "https://example.com"],
            ["../other", "https://example.com/base/"],
            ["relative", "https://example.com/"],
            ["/path", "not-a-valid-base"],
        ];

        testCasesWithBase.forEach(([testUrl, base]) => {
            it(`should be consistent for: ${testUrl} with base ${base}`, () => {
                const canParse = URL.canParse(testUrl, base);
                const parsed = URL.parse(testUrl, base);

                if (canParse) {
                    expect(parsed).toBeInstanceOf(URL);
                } else {
                    expect(parsed).toBeNull();
                }
            });
        });
    });

    describe("ensureURLPolyfills()", () => {
        it("should be a function", () => {
            expect(typeof ensureURLPolyfills).toBe("function");
        });

        it("should execute without errors", () => {
            expect(() => ensureURLPolyfills()).not.toThrow();
        });

        it("should ensure URL.parse is available", () => {
            ensureURLPolyfills();
            expect(typeof URL.parse).toBe("function");
        });

        it("should ensure URL.canParse is available", () => {
            ensureURLPolyfills();
            expect(typeof URL.canParse).toBe("function");
        });
    });
});
