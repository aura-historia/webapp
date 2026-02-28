import { describe, it, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { PeriodProductSection } from "@/components/period/PeriodProductSection.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { renderWithRouter } from "@/test/utils.tsx";

vi.mock("@/components/product/overview/ProductCardImageCarousel.tsx", () => ({
    ProductCardImageCarousel: () => <div data-testid="image-carousel" />,
}));

const mockProduct: OverviewProduct = {
    productId: "product-1",
    productSlugId: "product-slug-1",
    eventId: "event-1",
    shopId: "shop-1",
    shopSlugId: "shop-slug-1",
    shopsProductId: "shop-product-1",
    shopName: "Test Shop",
    title: "Antique Vase",
    price: "€1,200",
    state: "AVAILABLE",
    url: new URL("https://example.com"),
    images: [],
    created: new Date("2025-01-01"),
    updated: new Date("2025-01-02"),
    shopType: "AUCTION",
    authenticity: "UNKNOWN",
    condition: "UNKNOWN",
    provenance: "UNKNOWN",
    restoration: "UNKNOWN",
};

describe("PeriodProductSection", () => {
    it("renders the section title", async () => {
        await act(async () => {
            renderWithRouter(
                <PeriodProductSection
                    title="Neueste Produkte"
                    products={[mockProduct]}
                    isLoading={false}
                />,
            );
        });

        expect(screen.getByText("Neueste Produkte")).toBeInTheDocument();
    });

    it("renders product cards when products are available", async () => {
        await act(async () => {
            renderWithRouter(
                <PeriodProductSection
                    title="Neueste Produkte"
                    products={[mockProduct]}
                    isLoading={false}
                />,
            );
        });

        expect(screen.getByText("Antique Vase")).toBeInTheDocument();
    });

    it("renders skeleton cards when loading", async () => {
        await act(async () => {
            renderWithRouter(
                <PeriodProductSection title="Neueste Produkte" products={[]} isLoading={true} />,
            );
        });

        const skeletons = screen.getAllByTestId("product-card-skeleton");
        expect(skeletons).toHaveLength(3);
    });

    it("renders empty state when no products and not loading", async () => {
        await act(async () => {
            renderWithRouter(
                <PeriodProductSection title="Neueste Produkte" products={[]} isLoading={false} />,
            );
        });

        expect(
            screen.getByText("Noch keine Produkte für diese Epoche gefunden."),
        ).toBeInTheDocument();
    });
});
