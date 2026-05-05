import { describe, expect, it } from "vitest";
import { mapToInternalUserSearchFilterCollection } from "../UserSearchFilterCollection.ts";
import type { UserSearchFilterCollectionData } from "@/client";

const baseItem = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    name: "Test Filter",
    notifications: true,
    state: "ACTIVE" as const,
    search: { productQuery: "Tisch" },
    created: "2024-01-01T00:00:00Z",
    updated: "2024-03-01T00:00:00Z",
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

    it("maps total to undefined when null", () => {
        const data = { ...baseCollection, total: null };
        const result = mapToInternalUserSearchFilterCollection(data);
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
