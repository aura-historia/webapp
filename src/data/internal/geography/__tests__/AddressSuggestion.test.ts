import { describe, expect, it } from "vitest";
import {
    isAddressSuggestionQuery,
    mapToAddressSuggestionList,
} from "@/data/internal/geography/AddressSuggestion.ts";
import {
    mapToBackendCreateUserAddress,
    mapToBackendUpdateUserAddress,
} from "@/data/internal/geography/UserAddress.ts";

describe("address suggestions", () => {
    it("asks only for 3 to 200 characters without control characters", () => {
        expect(isAddressSuggestionQuery("  To ")).toBe(false);
        expect(isAddressSuggestionQuery("Tor")).toBe(true);
        expect(isAddressSuggestionQuery("x".repeat(201))).toBe(false);
        expect(isAddressSuggestionQuery("Tor\nstraße")).toBe(false);
    });

    it("maps suggestions, keeps unknown kinds as places and validates the attribution", () => {
        const list = mapToAddressSuggestionList({
            suggestions: [
                { placeId: "pl_1", label: "Torstraße 12, Berlin", kind: "ADDRESS" },
                { placeId: "pl_2", label: "Torstraße", kind: "MOUNTAIN" as "OTHER" },
                { placeId: "pl_3", label: "  ", kind: "STREET" },
            ],
            attribution: { provider: "Amazon Location Service", attributionUrl: "http://insecure" },
        });
        expect(list).toEqual({
            suggestions: [
                { placeId: "pl_1", label: "Torstraße 12, Berlin", kind: "ADDRESS" },
                { placeId: "pl_2", label: "Torstraße", kind: "OTHER" },
            ],
        });
    });

    it("sends a picked place with creates and replaces, and nothing otherwise", () => {
        const input = { label: "Home", geography: { addressText: "Torstraße 12" } };
        expect(mapToBackendCreateUserAddress(input)).not.toHaveProperty("placeId");
        expect(mapToBackendCreateUserAddress({ ...input, placeId: "pl_1" })).toMatchObject({
            placeId: "pl_1",
        });
        expect(mapToBackendUpdateUserAddress({ ...input, placeId: "pl_1" }, 4)).toMatchObject({
            expectedVersion: 4,
            placeId: "pl_1",
        });
    });
});
