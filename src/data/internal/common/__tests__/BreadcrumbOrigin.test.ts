import { describe, expect, it } from "vitest";
import {
    buildBreadcrumbSearch,
    parseBreadcrumbKind,
    toBreadcrumbOrigin,
    validateBreadcrumbSearch,
} from "../BreadcrumbOrigin.ts";

describe("parseBreadcrumbKind", () => {
    it("should return the value for a recognized kind", () => {
        expect(parseBreadcrumbKind("search")).toBe("search");
        expect(parseBreadcrumbKind("shopSearch")).toBe("shopSearch");
        expect(parseBreadcrumbKind("shop")).toBe("shop");
        expect(parseBreadcrumbKind("product")).toBe("product");
        expect(parseBreadcrumbKind("watchlist")).toBe("watchlist");
        expect(parseBreadcrumbKind("searchFilter")).toBe("searchFilter");
    });

    it("should return undefined for an unrecognized kind", () => {
        expect(parseBreadcrumbKind("invalid")).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
        expect(parseBreadcrumbKind(undefined)).toBeUndefined();
    });
});

describe("validateBreadcrumbSearch", () => {
    it("should return from/fromKind when both are valid", () => {
        expect(validateBreadcrumbSearch({ from: "/search?q=vase", fromKind: "search" })).toEqual({
            from: "/search?q=vase",
            fromKind: "search",
        });
    });

    it("should accept the shopSearch kind", () => {
        expect(
            validateBreadcrumbSearch({ from: "/search/shops?q=gallery", fromKind: "shopSearch" }),
        ).toEqual({
            from: "/search/shops?q=gallery",
            fromKind: "shopSearch",
        });
    });

    it("should return an empty object when from is missing", () => {
        expect(validateBreadcrumbSearch({ fromKind: "search" })).toEqual({});
    });

    it("should return an empty object when fromKind is missing", () => {
        expect(validateBreadcrumbSearch({ from: "/search" })).toEqual({});
    });

    it("should return an empty object when fromKind is invalid", () => {
        expect(validateBreadcrumbSearch({ from: "/search", fromKind: "bogus" })).toEqual({});
    });

    it("should reject an absolute/external from value", () => {
        expect(
            validateBreadcrumbSearch({ from: "https://evil.example.com", fromKind: "search" }),
        ).toEqual({});
        expect(
            validateBreadcrumbSearch({ from: "http://evil.example.com", fromKind: "search" }),
        ).toEqual({});
    });

    it("should reject protocol-relative URLs (leading //)", () => {
        // "//evil.example.com".startsWith("/") is true — a naive prefix check
        // alone lets this through; browsers resolve a leading "//" as
        // "same protocol, different host".
        expect(
            validateBreadcrumbSearch({ from: "//evil.example.com", fromKind: "search" }),
        ).toEqual({});
        expect(
            validateBreadcrumbSearch({ from: "///evil.example.com", fromKind: "search" }),
        ).toEqual({});
    });

    it("should reject a backslash-prefixed value", () => {
        // Some browsers normalize a leading backslash like a slash, another
        // known bypass for naive "starts with /" checks.
        expect(
            validateBreadcrumbSearch({ from: "/\\evil.example.com", fromKind: "search" }),
        ).toEqual({});
    });

    it("should reject a non-http(s) scheme", () => {
        expect(
            validateBreadcrumbSearch({ from: "javascript:alert(1)", fromKind: "search" }),
        ).toEqual({});
    });

    it("should return an empty object for an empty search record", () => {
        expect(validateBreadcrumbSearch({})).toEqual({});
    });
});

describe("toBreadcrumbOrigin", () => {
    it("should build an origin when both fields are present", () => {
        expect(toBreadcrumbOrigin({ from: "/shops/my-shop", fromKind: "shop" })).toEqual({
            from: "/shops/my-shop",
            fromKind: "shop",
        });
    });

    it("should return undefined when fields are missing", () => {
        expect(toBreadcrumbOrigin({})).toBeUndefined();
    });
});

describe("buildBreadcrumbSearch", () => {
    it("should return from/fromKind for a given origin", () => {
        expect(buildBreadcrumbSearch({ from: "/search?q=vase", fromKind: "search" })).toEqual({
            from: "/search?q=vase",
            fromKind: "search",
        });
    });

    it("should return an empty object when origin is undefined", () => {
        expect(buildBreadcrumbSearch(undefined)).toEqual({});
    });
});
