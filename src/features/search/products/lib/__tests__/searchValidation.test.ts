import { describe, expect, it } from "vitest";
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    defaultParseSearch,
    defaultStringifySearch,
} from "@tanstack/react-router";

import {
    serializeSearchParams,
    validateSearchParams,
    validateSearchUrlParams,
    type RawSearchParams,
} from "@/features/search/products/lib/searchValidation.ts";

describe("validateSearchParams", () => {
    it("parses supported listing search filters and normalizes repeated source IDs", () => {
        const result = validateSearchParams({
            q: "antique vase",
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_1", "pl_1"],
            listingSourceId: ["ls_1", "ls_2"],
            listingSourceLabels: ["Source One", "Source Two"],
            excludeListingSourceId: "ls_3",
            excludeListingSourceLabels: "Excluded Source",
            availability: ["IN_STOCK", "SOLD_OUT", "IN_STOCK", "NOT_A_VALUE"],
            priceFrom: "100" as unknown as number,
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            auctionDateTo: "2026-03-01T00:00:00.000Z",
            sortField: "CREATION_DATE",
            sortOrder: "ASC",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({
            q: "antique vase",
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_1"],
            listingSourceId: ["ls_1", "ls_2"],
            listingSourceLabels: ["Source One", "Source Two"],
            excludeListingSourceId: ["ls_3"],
            excludeListingSourceLabels: ["Excluded Source"],
            availability: ["IN_STOCK", "SOLD_OUT"],
            priceFrom: 100,
            creationDateFrom: new Date("2026-01-01T00:00:00.000Z"),
            auctionDateTo: new Date("2026-03-01T00:00:00.000Z"),
            sortField: "CREATION_DATE",
            sortOrder: "ASC",
        });
    });

    it("falls back to the default sort for unsupported sort fields", () => {
        const result = validateSearchParams({
            q: "vase",
            sortField: "PRICE",
            sortOrder: "ASC",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({ q: "vase", sortField: "RELEVANCE", sortOrder: "ASC" });
    });

    it("uses safe defaults for invalid dates, sort, and array parameters", () => {
        const result = validateSearchParams({
            priceFrom: "not-a-number" as unknown as number,
            availability: "IN_STOCK" as unknown as [],
            creationDateFrom: "not-a-date",
            sortField: "INVALID",
            sortOrder: "sideways",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({ q: "", sortField: "RELEVANCE", sortOrder: "DESC" });
        expect(result.priceFrom).toBeUndefined();
        expect(result.availability).toBeUndefined();
        expect(result.creationDateFrom).toBeUndefined();
    });
});

describe("validateSearchUrlParams", () => {
    it("keeps every date range URL-safe and stable after serialization and parsing", () => {
        const raw = {
            q: "chair",
            creationDateFrom: "1900-01-01",
            creationDateTo: "1950-12-31",
            updateDateFrom: "2026-01-01T12:30:00.000Z",
            updateDateTo: "2026-02-01",
            auctionDateFrom: "2026-03-01",
            auctionDateTo: "2026-04-01",
            listingSourceId: ["ls_1"],
            availability: ["IN_STOCK"],
            priceFrom: 100,
        } as RawSearchParams;
        const validated = validateSearchUrlParams(raw);
        const search = defaultStringifySearch(validated);
        const roundTrip = validateSearchUrlParams(defaultParseSearch(search) as RawSearchParams);

        expect(validated.creationDateFrom).toBe("1900-01-01T00:00:00.000Z");
        expect(roundTrip).toEqual(validated);
        expect(defaultStringifySearch(roundTrip)).toBe(search);
        expect(validateSearchParams(roundTrip).creationDateFrom).toEqual(
            new Date("1900-01-01T00:00:00.000Z"),
        );
    });

    it.each([
        "/de/search?q=chair&creationDateFrom=1900-01-01",
        "/de/search?q=chair&auctionDateTo=%222026-04-01T00%3A00%3A00.000Z%22",
        "/de/search?q=chair&priceFrom=invalid&updateDateFrom=invalid",
    ])("stops server canonical redirects after normalizing %s", async (href) => {
        const createSearchRouter = (entry: string) => {
            const root = createRootRoute();
            const search = createRoute({
                getParentRoute: () => root,
                path: "/$lng/search",
                validateSearch: validateSearchUrlParams,
            });
            return createRouter({
                routeTree: root.addChildren([search]),
                history: createMemoryHistory({ initialEntries: [entry] }),
                isServer: true,
            });
        };

        const initial = createSearchRouter(href);
        await initial.load();
        const result = initial._serverResult;
        expect(result?.type).toBe("redirect");
        if (result?.type !== "redirect") throw new Error("Expected a canonical redirect");

        const normalized = createSearchRouter(result.redirect.options.href as string);
        await normalized.load();
        expect(normalized._serverResult?.type).toBe("render");
        expect(normalized.state.matches.every((match) => match.status === "success")).toBe(true);
    });
});

describe("serializeSearchParams", () => {
    it("preserves supported arrays and ranges for filter and sort navigation", () => {
        const validated = validateSearchParams({
            q: "chair",
            listingSourceId: ["ls_1", "ls_2"],
            listingSourceLabels: ["Source One", "Source Two"],
            excludeListingSourceId: ["ls_3"],
            excludeListingSourceLabels: ["Excluded Source"],
            availability: ["AVAILABLE", "IN_STOCK"],
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            sortField: "UPDATE_DATE",
        } as RawSearchParams);

        const serialized = serializeSearchParams(validated);
        expect(serialized).toMatchObject({
            q: "chair",
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            availability: ["AVAILABLE", "IN_STOCK"],
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            sortField: "UPDATE_DATE",
        });
    });
});
