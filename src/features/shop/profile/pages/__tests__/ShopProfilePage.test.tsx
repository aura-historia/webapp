import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { ShopProfilePage } from "../ShopProfilePage.tsx";

vi.mock("@/features/shop/profile/components/ShopHeader.tsx", () => ({
    ShopHeader: ({ shop }: { readonly shop: ShopDetail }) => (
        <div data-testid="shop-header">{shop.name}</div>
    ),
}));

vi.mock("@/features/shop/profile/components/ShopLocationSection.tsx", () => ({
    ShopLocationSection: ({ shop }: { readonly shop: ShopDetail }) => (
        <div data-testid="shop-location">{shop.name}</div>
    ),
}));

vi.mock("@/features/shop/profile/components/ShopProductGrid.tsx", () => ({
    ShopProductGrid: ({ shopName }: { readonly shopName: string }) => (
        <div data-testid="shop-product-grid">{shopName}</div>
    ),
}));

const shop: ShopDetail = {
    shopId: "shop-1",
    shopSlugId: "example-shop",
    name: "Example Shop",
    shopType: "AUCTION_HOUSE",
    partnerStatus: "PARTNERED",
    domains: ["example.com"],
    created: new Date("2024-01-15T00:00:00.000Z"),
    updated: new Date("2024-06-15T00:00:00.000Z"),
};

describe("ShopProfilePage", () => {
    it("composes the shop header, location section, and product grid", () => {
        render(<ShopProfilePage shop={shop} />);

        expect(screen.getByTestId("shop-header")).toHaveTextContent("Example Shop");
        expect(screen.getByTestId("shop-location")).toHaveTextContent("Example Shop");
        expect(screen.getByTestId("shop-product-grid")).toHaveTextContent("Example Shop");
    });
});
