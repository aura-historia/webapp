import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopProfilePage } from "../ShopProfilePage.tsx";

vi.mock("@/features/shop/profile/components/ShopHeader.tsx", () => ({
    ShopHeader: ({ shop }: { shop: PublicListingSource }) => (
        <div data-testid="shop-header">{shop.name}</div>
    ),
}));

vi.mock("@/features/shop/profile/components/ShopListings.tsx", () => ({
    ShopListings: ({
        source,
        query,
        onQueryChange,
    }: {
        source: PublicListingSource;
        query: string;
        onQueryChange: (query: string) => void;
    }) => (
        <div data-testid="shop-listings">
            <span>{`${source.listingSourceId}:${query}`}</span>
            <button type="button" onClick={() => onQueryChange("lamp")}>
                search
            </button>
        </div>
    ),
}));

describe("ShopProfilePage", () => {
    it("composes the header and the source-scoped listings", () => {
        render(
            <ShopProfilePage
                shop={makePublicListingSource()}
                query="vase"
                onQueryChange={vi.fn()}
            />,
        );

        expect(screen.getByTestId("shop-header")).toHaveTextContent("Antique Store");
        expect(screen.getByTestId("shop-listings")).toHaveTextContent("ls_01TESTSOURCE:vase");
    });

    it("forwards query changes from the listings", () => {
        const onQueryChange = vi.fn();
        render(
            <ShopProfilePage
                shop={makePublicListingSource()}
                query=""
                onQueryChange={onQueryChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "search" }));

        expect(onQueryChange).toHaveBeenCalledWith("lamp");
    });
});
