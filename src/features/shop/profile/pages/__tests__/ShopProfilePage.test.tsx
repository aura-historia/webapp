import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopProfilePage } from "../ShopProfilePage.tsx";
vi.mock("@/features/shop/profile/components/ShopHeader.tsx", () => ({
    ShopHeader: ({ shop }: { shop: PublicListingSource }) => (
        <div data-testid="shop-header">{shop.name}</div>
    ),
}));
vi.mock("@/features/shop/profile/components/ShopProductGrid.tsx", () => ({
    ShopProductGrid: ({ source }: { source: PublicListingSource }) => (
        <div data-testid="shop-product-grid">{source.listingSourceId}</div>
    ),
}));
describe("ShopProfilePage", () => {
    it("composes the public header and source-scoped listing grid", () => {
        render(<ShopProfilePage shop={makePublicListingSource()} />);
        expect(screen.getByTestId("shop-header")).toHaveTextContent("Antique Store");
        expect(screen.getByTestId("shop-product-grid")).toHaveTextContent("ls_01TESTSOURCE");
    });
});
