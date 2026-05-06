import { describe, expect, it } from "vitest";
import {
    mapToInternalUserSearchFilter,
    mapToBackendCreateUserSearchFilter,
    mapToBackendPatchUserSearchFilter,
    mapProductSearchDataToSearchFilterArguments,
    mapSearchFilterArgumentsToProductSearchData,
} from "../UserSearchFilter.ts";
import type { UserSearchFilterData } from "@/client";
import { AUTHENTICITIES } from "@/data/internal/quality-indicators/Authenticity.ts";

const baseFilterData: UserSearchFilterData = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    name: "Barock Test",
    notifications: true,
    state: "ACTIVE",
    search: {
        productQuery: "Tisch",
        price: { min: 1000, max: 5000 },
        state: ["AVAILABLE"],
        shopType: ["AUCTION_HOUSE"],
    },
    created: "2024-01-15T10:00:00Z",
    updated: "2024-03-20T12:00:00Z",
};

describe("mapToInternalUserSearchFilter", () => {
    it("maps userId and id correctly", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.userId).toBe("user-1");
        expect(result.id).toBe("filter-1");
    });

    it("maps name and notifications", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.name).toBe("Barock Test");
        expect(result.notifications).toBe(true);
    });

    it("converts created/updated strings to Date objects", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.created).toBeInstanceOf(Date);
        expect(result.updated).toBeInstanceOf(Date);
        expect(result.created.toISOString()).toBe("2024-01-15T10:00:00.000Z");
    });

    it("converts price from cents to euros", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.search.priceFrom).toBe(10);
        expect(result.search.priceTo).toBe(50);
    });

    it("maps productQuery to q", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.search.q).toBe("Tisch");
    });

    it("maps optional enhancedSearchDescription", () => {
        const data = { ...baseFilterData, enhancedSearchDescription: "Barocke Möbel" };
        const result = mapToInternalUserSearchFilter(data);
        expect(result.enhancedSearchDescription).toBe("Barocke Möbel");
    });

    it("maps undefined enhancedSearchDescription to undefined", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.enhancedSearchDescription).toBeUndefined();
    });
});

describe("mapProductSearchDataToSearchFilterArguments", () => {
    it("maps empty search data to args with empty q", () => {
        const result = mapProductSearchDataToSearchFilterArguments({});
        expect(result.q).toBe("");
    });

    it("maps price min/max from cents to euros", () => {
        const result = mapProductSearchDataToSearchFilterArguments({
            price: { min: 2000, max: 10000 },
        });
        expect(result.priceFrom).toBe(20);
        expect(result.priceTo).toBe(100);
    });

    it("maps date strings to Date objects", () => {
        const result = mapProductSearchDataToSearchFilterArguments({
            created: { min: "2024-01-01T00:00:00Z", max: "2024-12-31T00:00:00Z" },
        });
        expect(result.creationDateFrom).toBeInstanceOf(Date);
        expect(result.creationDateTo).toBeInstanceOf(Date);
    });

    it("leaves price undefined when not provided", () => {
        const result = mapProductSearchDataToSearchFilterArguments({ productQuery: "Tisch" });
        expect(result.priceFrom).toBeUndefined();
        expect(result.priceTo).toBeUndefined();
    });
});

describe("mapSearchFilterArgumentsToProductSearchData", () => {
    it("converts empty q to undefined productQuery", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "" });
        expect(result.productQuery).toBeUndefined();
    });

    it("converts non-empty q to productQuery", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "Tisch" });
        expect(result.productQuery).toBe("Tisch");
    });

    it("converts price from euros to cents", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({
            q: "",
            priceFrom: 20,
            priceTo: 100,
        });
        expect(result.price?.min).toBe(2000);
        expect(result.price?.max).toBe(10000);
    });

    it("omits price when neither priceFrom nor priceTo is set", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "" });
        expect(result.price).toBeUndefined();
    });

    it("sets only min when only priceFrom is provided", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "", priceFrom: 50 });
        expect(result.price?.min).toBe(5000);
        expect(result.price?.max).toBeUndefined();
    });
});

describe("mapToBackendCreateUserSearchFilter", () => {
    it("maps name and search correctly", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            search: { q: "Sofa" },
        });
        expect(result.name).toBe("Test");
        expect(result.search.productQuery).toBe("Sofa");
    });

    it("omits authenticity when set to full defaults", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            search: { q: "", authenticity: [...AUTHENTICITIES] },
        });
        expect(result.search.authenticity).toBeUndefined();
    });

    it("omits authenticity when empty array", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            search: { q: "", authenticity: [] },
        });
        expect(result.search.authenticity).toBeUndefined();
    });

    it("includes authenticity when subset is set", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            search: { q: "", authenticity: ["ORIGINAL"] },
        });
        expect(result.search.authenticity).toBeDefined();
    });

    it("maps optional enhancedSearchDescription", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            enhancedSearchDescription: "KI-Beschreibung",
            search: { q: "" },
        });
        expect(result.enhancedSearchDescription).toBe("KI-Beschreibung");
    });
});

describe("mapToBackendPatchUserSearchFilter", () => {
    it("maps name", () => {
        const result = mapToBackendPatchUserSearchFilter({ name: "Neuer Name" });
        expect(result.name).toBe("Neuer Name");
    });

    it("maps notifications", () => {
        const result = mapToBackendPatchUserSearchFilter({ notifications: false });
        expect(result.notifications).toBe(false);
    });

    it("omits search when not provided", () => {
        const result = mapToBackendPatchUserSearchFilter({ name: "Test" });
        expect(result.search).toBeUndefined();
    });

    it("maps search when provided", () => {
        const result = mapToBackendPatchUserSearchFilter({ search: { q: "Lampe" } });
        expect(result.search?.productQuery).toBe("Lampe");
    });
});
