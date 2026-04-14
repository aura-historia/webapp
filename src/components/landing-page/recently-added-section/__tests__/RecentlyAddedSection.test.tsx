import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RecentlyAddedSection from "../RecentlyAddedSection.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { parseShopType } from "@/data/internal/shop/ShopType.ts";
import { parseProductState } from "@/data/internal/product/ProductState.ts";
import { parseAuthenticity } from "@/data/internal/quality-indicators/Authenticity.ts";
import { parseCondition } from "@/data/internal/quality-indicators/Condition.ts";
import { parseProvenance } from "@/data/internal/quality-indicators/Provenance.ts";
import { parseRestoration } from "@/data/internal/quality-indicators/Restoration.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act } from "react";

// Mock the entire embla carousel to avoid plugin comparison errors in jsdom
vi.mock("embla-carousel-react", () => ({
    default: () => [
        vi.fn(),
        {
            on: vi.fn(),
            off: vi.fn(),
            scrollTo: vi.fn(),
            canScrollNext: vi.fn(() => false),
            canScrollPrev: vi.fn(() => false),
            selectedScrollSnap: vi.fn(() => 0),
            scrollSnapList: vi.fn(() => []),
        },
    ],
}));

vi.mock("@/lib/carousel/reverseAutoplay.ts", () => ({
    ReverseAutoplay: vi.fn(() => ({
        name: "reverseAutoplay",
        options: {},
        init: vi.fn(),
        destroy: vi.fn(),
        play: vi.fn(),
        stop: vi.fn(),
        reset: vi.fn(),
        isPlaying: vi.fn(() => false),
    })),
}));

const createMockProduct = (id: string, title: string): OverviewProduct => ({
    productId: id,
    productSlugId: `slug-${id}`,
    eventId: `event-${id}`,
    shopId: `shop-${id}`,
    shopSlugId: `shop-slug-${id}`,
    shopsProductId: `shops-product-${id}`,
    shopName: `Shop Name ${id}`,
    shopType: parseShopType("UNKNOWN"),
    title,
    state: parseProductState("AVAILABLE"),
    url: new URL("https://example.com"),
    images: [],
    created: new Date(),
    updated: new Date(),
    authenticity: parseAuthenticity("UNKNOWN"),
    condition: parseCondition("UNKNOWN"),
    provenance: parseProvenance("UNKNOWN"),
    restoration: parseRestoration("UNKNOWN"),
});

const mockProducts: OverviewProduct[] = [
    createMockProduct("1", "Product A"),
    createMockProduct("2", "Product B"),
];

describe("RecentlyAddedSection", () => {
    it("renders the section with the recently added title", async () => {
        await act(async () => renderWithRouter(<RecentlyAddedSection products={mockProducts} />));
        expect(screen.getByText("Neueste Zugänge")).toBeInTheDocument();
    });

    it("renders a product grid item for each product", async () => {
        await act(async () => renderWithRouter(<RecentlyAddedSection products={mockProducts} />));
        expect(screen.getByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("Product B")).toBeInTheDocument();
    });

    it("renders the section element with the correct aria-label", async () => {
        await act(async () => renderWithRouter(<RecentlyAddedSection products={mockProducts} />));
        const section = screen.getByRole("region", { name: "Neueste Zugänge" });
        expect(section).toBeInTheDocument();
    });

    it("handles an empty product list without crashing", async () => {
        await act(async () => renderWithRouter(<RecentlyAddedSection products={[]} />));
        expect(screen.getByText("Neueste Zugänge")).toBeInTheDocument();
        // Since there are no products, there should be no links with 'Details'
        // Note: The UI fallback text depends on translation, we just test it doesn't crash
    });
});
