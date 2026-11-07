import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useShopProducts } from "@/features/shop/profile/hooks/useShopProducts.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopListings } from "../ShopListings.tsx";

// The search feature flag is read once at module load, so it needs its own test file.
vi.mock("@/env.ts", () => ({ env: { VITE_FEATURE_SEARCH_ENABLED: false } }));

vi.mock("@/features/shop/profile/hooks/useShopProducts.ts", () => ({
    useShopProducts: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
    };
});

const mockUseShopProducts = vi.mocked(useShopProducts);

describe("ShopListings without the search feature", () => {
    beforeEach(() => {
        mockUseShopProducts.mockReturnValue({
            data: { pages: [{ products: [], total: 0, searchAfter: undefined }], pageParams: [] },
            isPending: false,
            error: null,
            refetch: vi.fn(),
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        } as unknown as ReturnType<typeof useShopProducts>);
    });

    it("omits the search-all-objects link from the empty state", () => {
        render(
            <ShopListings source={makePublicListingSource()} query="" onQueryChange={vi.fn()} />,
        );

        expect(
            screen.getByRole("heading", { name: "Zurzeit keine Angebote." }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("omits the search-all-providers link but keeps show-all in the no-matches state", () => {
        render(
            <ShopListings
                source={makePublicListingSource()}
                query="vase"
                onQueryChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("heading", { name: "Hier keine Treffer." })).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Alle Angebote anzeigen" })).toBeInTheDocument();
    });
});
