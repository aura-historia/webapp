import { describe, expect, it } from "vitest";
import {
    mapToInternalUserSearchFilter,
    mapToBackendCreateUserSearchFilter,
    mapToBackendPatchUserSearchFilter,
    mapProductSearchDataToSearchFilterArguments,
    mapSearchFilterArgumentsToProductSearchData,
} from "../UserSearchFilter.ts";
import type { UserSearchFilterData } from "@/client";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

const baseFilterData: UserSearchFilterData = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    name: "Barock Test",
    notifications: true,
    state: "ACTIVE",
    search: {
        productQuery: ["Tisch"],
        price: { min: 1000, max: 5000 },
        state: ["AVAILABLE"],
        shopType: ["AUCTION_HOUSE"],
    },
    createdBy: "SYSTEM",
    updatedBy: "SYSTEM",
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
        const data = {
            ...baseFilterData,
            search: { ...baseFilterData.search, enhancedSearchDescription: "Barocke Möbel" },
        };
        const result = mapToInternalUserSearchFilter(data);
        expect(result.enhancedSearchDescription).toBe("Barocke Möbel");
    });

    it("maps undefined enhancedSearchDescription to undefined", () => {
        const result = mapToInternalUserSearchFilter(baseFilterData);
        expect(result.enhancedSearchDescription).toBeUndefined();
    });

    it("maps state ACTIVE", () => {
        const result = mapToInternalUserSearchFilter({ ...baseFilterData, state: "ACTIVE" });
        expect(result.state).toBe("ACTIVE");
    });

    it("maps state INACTIVE_BY_USER", () => {
        const result = mapToInternalUserSearchFilter({
            ...baseFilterData,
            state: "INACTIVE_BY_USER",
        });
        expect(result.state).toBe("INACTIVE_BY_USER");
    });

    it("maps state INACTIVE_BY_RESTRICTED_PLAN", () => {
        const result = mapToInternalUserSearchFilter({
            ...baseFilterData,
            state: "INACTIVE_BY_RESTRICTED_PLAN",
        });
        expect(result.state).toBe("INACTIVE_BY_RESTRICTED_PLAN");
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
        const result = mapProductSearchDataToSearchFilterArguments({ productQuery: ["Tisch"] });
        expect(result.priceFrom).toBeUndefined();
        expect(result.priceTo).toBeUndefined();
    });
});

describe("mapSearchFilterArgumentsToProductSearchData", () => {
    it("converts empty q to empty productQuery array", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "" });
        expect(result.productQuery).toEqual([]);
    });

    it("converts non-empty q to productQuery", () => {
        const result = mapSearchFilterArgumentsToProductSearchData({ q: "Tisch" });
        expect(result.productQuery).toEqual(["Tisch"]);
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
        expect(result.search.productQuery).toEqual(["Sofa"]);
    });

    it("maps optional enhancedSearchDescription", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            enhancedSearchDescription: "KI-Beschreibung",
            search: { q: "" },
        });
        expect(result.search.enhancedSearchDescription).toBe("KI-Beschreibung");
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
        expect(result.search?.productQuery).toEqual(["Lampe"]);
    });

    it("creates a search object for enhancedSearchDescription alone when no other search criteria change", () => {
        const result = mapToBackendPatchUserSearchFilter({
            enhancedSearchDescription: "Neue Beschreibung",
        });
        expect(result.search?.enhancedSearchDescription).toBe("Neue Beschreibung");
    });

    it("maps state when provided", () => {
        const result = mapToBackendPatchUserSearchFilter({ state: "INACTIVE_BY_USER" });
        expect(result.state).toBe("INACTIVE_BY_USER");
    });

    it("omits state when not provided", () => {
        const result = mapToBackendPatchUserSearchFilter({ name: "Test" });
        expect(result.state).toBeUndefined();
    });
});

describe("isDefaultOrEmpty behaviour in mapToBackendCreateUserSearchFilter", () => {
    it("omits shopType when set to full defaults", () => {
        const result = mapToBackendCreateUserSearchFilter({
            name: "Test",
            search: { q: "", shopType: [...SHOP_TYPES] },
        });
        expect(result.search.shopType).toBeUndefined();
    });
});
