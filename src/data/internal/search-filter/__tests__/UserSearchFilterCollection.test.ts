import { describe, expect, it } from "vitest";
import {
    countActiveSearchFilters,
    mapToInternalUserSearchFilterCollection,
} from "../UserSearchFilterCollection.ts";
import type { UserSearchFilterCollectionData } from "@/client";

const baseItem = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    name: "Test Filter",
    notifications: true,
    state: "ACTIVE" as const,
    search: { productQuery: ["Tisch"] },
    created: "2024-01-01T00:00:00Z",
    updated: "2024-03-01T00:00:00Z",
    listingSources: [],
};

const baseCollection: UserSearchFilterCollectionData = {
    items: [baseItem],
    from: 0,
    size: 1,
};

describe("mapToInternalUserSearchFilterCollection", () => {
    it("maps from and size correctly", () => {
        const result = mapToInternalUserSearchFilterCollection(baseCollection);
        expect(result.from).toBe(0);
        expect(result.size).toBe(1);
    });

    it("maps items array", () => {
        const result = mapToInternalUserSearchFilterCollection(baseCollection);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].id).toBe("filter-1");
        expect(result.items[0].name).toBe("Test Filter");
    });

    it("maps total when present", () => {
        const data = { ...baseCollection, total: 5 };
        const result = mapToInternalUserSearchFilterCollection(data);
        expect(result.total).toBe(5);
    });

    it("keeps an omitted total undefined", () => {
        const result = mapToInternalUserSearchFilterCollection(baseCollection);
        expect(result.total).toBeUndefined();
    });

    it("maps multiple items", () => {
        const data = {
            ...baseCollection,
            items: [baseItem, { ...baseItem, userSearchFilterId: "filter-2", name: "Filter 2" }],
            size: 2,
        };
        const result = mapToInternalUserSearchFilterCollection(data);
        expect(result.items).toHaveLength(2);
        expect(result.items[1].id).toBe("filter-2");
    });

    it("maps empty items array", () => {
        const data = { ...baseCollection, items: [], size: 0 };
        const result = mapToInternalUserSearchFilterCollection(data);
        expect(result.items).toHaveLength(0);
    });
});

describe("countActiveSearchFilters", () => {
    const collectionWithStates = (
        ...states: UserSearchFilterCollectionData["items"][number]["state"][]
    ) =>
        mapToInternalUserSearchFilterCollection({
            ...baseCollection,
            items: states.map((state, index) => ({
                ...baseItem,
                userSearchFilterId: `filter-${index}`,
                state,
            })),
            size: states.length,
        });

    it("counts only active filters", () => {
        const collection = collectionWithStates(
            "ACTIVE",
            "INACTIVE_BY_USER",
            "ACTIVE",
            "INACTIVE_BY_RESTRICTED_PLAN",
        );
        expect(countActiveSearchFilters(collection)).toBe(2);
    });

    it("ignores the reported total, which counts paused filters too", () => {
        const collection = {
            ...collectionWithStates("ACTIVE", "INACTIVE_BY_USER"),
            total: 2,
        };
        expect(countActiveSearchFilters(collection)).toBe(1);
    });

    it("is zero without filters or data", () => {
        expect(countActiveSearchFilters(collectionWithStates())).toBe(0);
        expect(countActiveSearchFilters(undefined)).toBe(0);
    });
});
