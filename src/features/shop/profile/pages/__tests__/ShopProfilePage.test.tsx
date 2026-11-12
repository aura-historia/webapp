import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopProfilePage } from "../ShopProfilePage.tsx";

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
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

        expect(
            screen.getByRole("heading", { level: 1, name: "Antique Store" }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("shop-listings")).toHaveTextContent("ls_01TESTSOURCE:vase");
    });

    it("sends visitors to the source's viewUrl", () => {
        render(
            <ShopProfilePage shop={makePublicListingSource()} query="" onQueryChange={vi.fn()} />,
        );

        expect(screen.getByRole("link", { name: /Website besuchen/ })).toHaveAttribute(
            "href",
            "https://example.com/?utm_source=aura_historia&utm_medium=referral",
        );
    });

    it("falls back to the raw url when the source has no viewUrl", () => {
        render(
            <ShopProfilePage
                shop={makePublicListingSource({ viewUrl: undefined })}
                query=""
                onQueryChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("link", { name: /Website besuchen/ })).toHaveAttribute(
            "href",
            "https://example.com",
        );
    });

    it("offers no website link for a source without a url", () => {
        render(
            <ShopProfilePage
                shop={makePublicListingSource({ url: undefined, viewUrl: undefined })}
                query=""
                onQueryChange={vi.fn()}
            />,
        );

        expect(screen.queryByRole("link", { name: /Website besuchen/ })).not.toBeInTheDocument();
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
