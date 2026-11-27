import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useDescribeActiveFilter } from "@/features/search/products/hooks/useDescribeActiveFilter.ts";
import type { ActiveFilter } from "@/features/search/products/lib/activeFilters.ts";

function renderDescribe(originLabel?: string, regionNames = false) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserPreferencesProvider locale="de-DE">
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </UserPreferencesProvider>
    );
    return renderHook(() => useDescribeActiveFilter(originLabel, regionNames), { wrapper });
}

const radius = { amount: 50, unit: "KILOMETERS" } as const;

describe("useDescribeActiveFilter (location)", () => {
    it("names countries in the page language", () => {
        const { result } = renderDescribe();
        const place: ActiveFilter = { kind: "place", id: "place:AT", code: "AT", country: true };
        expect(result.current(place)).toEqual({ key: "Ort", value: "Österreich" });
    });

    it("names regions by their official local name once loaded", async () => {
        const { result } = renderDescribe(undefined, true);
        const place: ActiveFilter = {
            kind: "place",
            id: "place:FR-IDF",
            code: "FR-IDF",
            country: false,
        };
        await waitFor(() => expect(result.current(place).value).toBe("Île-de-France"));
    });

    it("names the distance and the starting point, never its coordinates", () => {
        const near = { kind: "ADDRESS", addressId: "uaddr_home" } as const;
        const distance: ActiveFilter = { kind: "distance", id: "distance", radius, near };
        expect(renderDescribe("Zuhause").result.current(distance)).toEqual({
            key: "Umkreis",
            value: "50 km um Zuhause",
        });
    });

    it("falls back to the kind of starting point without a label", () => {
        const describe = renderDescribe().result.current;
        expect(
            describe({ kind: "distance", id: "distance", radius, near: { kind: "CURRENT" } }).value,
        ).toBe("50 km um Aktueller Standort");
        expect(
            describe({
                kind: "distance",
                id: "distance",
                radius,
                near: { kind: "SEARCH_LOCATION" },
            }).value,
        ).toBe("50 km um Suchstandort");
    });
});
