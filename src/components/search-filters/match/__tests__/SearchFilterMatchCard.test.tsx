import { screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchFilterMatchCard } from "../SearchFilterMatchCard.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";

vi.mock("@/components/product/overview/ProductCard.tsx", () => ({
    ProductCard: ({ product }: { product: OverviewProduct }) => (
        <div data-testid="product-card">{product.title}</div>
    ),
}));

vi.mock("@/components/product/buttons/MatchFeedbackButtons.tsx", () => ({
    MatchFeedbackButtons: (props: {
        filterId: string;
        shopId: string;
        shopsProductId: string;
        currentFeedback?: boolean;
    }) => (
        <div
            data-testid="feedback-buttons"
            data-filter-id={props.filterId}
            data-feedback={String(props.currentFeedback)}
        />
    ),
}));

const baseProduct: OverviewProduct = {
    productId: "product-id-1",
    eventId: "event-1",
    shopId: "shop-1",
    shopsProductId: "prod-1",
    shopSlugId: "shop-slug",
    productSlugId: "prod-slug",
    title: "Barocktisch",
    shopName: "Antik AG",
    shopType: "AUCTION_HOUSE",
    state: "AVAILABLE",
    url: null,
    images: [],
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
    authenticity: "UNKNOWN",
    condition: "UNKNOWN",
    provenance: "UNKNOWN",
    restoration: "UNKNOWN",
};

describe("SearchFilterMatchCard", () => {
    it("renders the ProductCard", async () => {
        await act(() => {
            renderWithQueryClient(<SearchFilterMatchCard product={baseProduct} filterId="f-1" />);
        });
        expect(screen.getByTestId("product-card")).toBeInTheDocument();
        expect(screen.getByText("Barocktisch")).toBeInTheDocument();
    });

    it("renders MatchFeedbackButtons", async () => {
        await act(() => {
            renderWithQueryClient(<SearchFilterMatchCard product={baseProduct} filterId="f-1" />);
        });
        expect(screen.getByTestId("feedback-buttons")).toBeInTheDocument();
    });

    it("passes filterId to MatchFeedbackButtons", async () => {
        await act(() => {
            renderWithQueryClient(
                <SearchFilterMatchCard product={baseProduct} filterId="filter-abc" />,
            );
        });
        expect(screen.getByTestId("feedback-buttons")).toHaveAttribute(
            "data-filter-id",
            "filter-abc",
        );
    });

    it("passes matchFeedback from searchFilterData to MatchFeedbackButtons", async () => {
        const product: OverviewProduct = {
            ...baseProduct,
            userData: {
                watchlistData: { isWatching: false, isNotificationEnabled: false },
                notificationData: { hasUnseenNotification: false },
                restrictedContentData: { consentGiven: true },
                searchFilterData: { matched: true, hidden: false, matchFeedback: true },
            },
        };
        await act(() => {
            renderWithQueryClient(<SearchFilterMatchCard product={product} filterId="f-1" />);
        });
        expect(screen.getByTestId("feedback-buttons")).toHaveAttribute("data-feedback", "true");
    });

    it("passes undefined matchFeedback when no searchFilterData", async () => {
        await act(() => {
            renderWithQueryClient(<SearchFilterMatchCard product={baseProduct} filterId="f-1" />);
        });
        expect(screen.getByTestId("feedback-buttons")).toHaveAttribute(
            "data-feedback",
            "undefined",
        );
    });
});
