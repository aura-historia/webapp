import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopHeader } from "../ShopHeader.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";

const mockShop: ShopDetail = {
    shopId: "shop-uuid-123",
    shopSlugId: "christies",
    name: "Christie's",
    shopType: "AUCTION_HOUSE",
    image: "https://example.com/logo.png",
    domains: ["christies.com"],
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

describe("ShopHeader", () => {
    it("renders the shop name as a heading", () => {
        render(<ShopHeader shop={mockShop} productCount={42} />);
        expect(screen.getByRole("heading", { name: "Christie's" })).toBeInTheDocument();
    });

    it("renders the shop type badge", () => {
        render(<ShopHeader shop={mockShop} productCount={42} />);
        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
    });

    it("renders the added-on date", () => {
        render(<ShopHeader shop={mockShop} productCount={42} />);
        expect(screen.getByText(/15\. Januar 2024/)).toBeInTheDocument();
    });

    it("renders the product count", () => {
        render(<ShopHeader shop={mockShop} productCount={1234} />);
        expect(screen.getByText("1.234")).toBeInTheDocument();
    });

    it("renders the shop logo when image is present", () => {
        render(<ShopHeader shop={mockShop} productCount={42} />);
        const img = screen.getByRole("img", { name: /Christie's/ });
        expect(img).toHaveAttribute("src", "https://example.com/logo.png");
    });

    it("renders a placeholder when image is missing", () => {
        const shopWithoutImage: ShopDetail = { ...mockShop, image: null };
        render(<ShopHeader shop={shopWithoutImage} productCount={42} />);
        expect(screen.getByRole("img", { name: /Kein Logo/ })).toBeInTheDocument();
    });

    it("renders the indexed items label", () => {
        render(<ShopHeader shop={mockShop} productCount={42} />);
        expect(screen.getByText("Erfasste Objekte")).toBeInTheDocument();
    });

    it("renders zero when productCount is undefined", () => {
        render(<ShopHeader shop={mockShop} productCount={undefined} />);
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("renders a different name when given different props", () => {
        const otherShop: ShopDetail = {
            ...mockShop,
            name: "Sotheby's",
            shopType: "AUCTION_HOUSE",
        };
        render(<ShopHeader shop={otherShop} productCount={100} />);
        expect(screen.getByRole("heading", { name: "Sotheby's" })).toBeInTheDocument();
    });
});
