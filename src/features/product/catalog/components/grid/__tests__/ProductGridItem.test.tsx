import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProductGridItem } from "../ProductGridItem.tsx";

const mockMutate = vi.fn();

vi.mock("@/features/notification-center/api/useMarkNotificationsSeen.ts", () => ({
    useMarkNotificationsSeen: () => ({ mutate: mockMutate }),
}));

describe("ProductGridItem", () => {
    const mockProduct: ProductListing = {
        productListingId: "listing-1",
        productListingTitleSlugId: "sample-product",
        sourceListingId: "item-1",
        source: { listingSourceId: "source-1", slugId: "sample-shop", name: "Sample Shop" },
        updated: new Date("2026-09-10T10:00:00Z"),
        url: new URL("https://example.com"),
        viewUrl: new URL("https://affiliate.example.com/product"),
        title: "Sample Product",
        availability: "AVAILABLE",
        lifecycle: "ACTIVE",
        price: { type: "MONETARY", amount: 10000, currency: "EUR" },
        formattedPrice: "100€",
        priceValuation: "CURRENT",
        valuation: { type: "CURRENT", fxRateId: "fx-1", capturedAt: new Date("2026-09-10") },
        contentPolicy: { decision: "ALLOWED" },
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
    };

    const mockProductWithUnseenNotification: ProductListing = {
        ...mockProduct,
        userState: {
            watchlist: { watching: true, notifications: true },
            notification: {
                hasUnseenNotification: true,
                unseenNotificationIds: ["notification-1", "notification-2"],
            },
            contentVisibility: { showUnassessedOrSensitiveContent: false },
            searchFilter: { matched: false, hidden: false },
        },
    };

    beforeEach(() => {
        mockMutate.mockClear();
    });

    it("renders a highlighted card when product has unseen notification", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProductWithUnseenNotification} />),
        );

        expect(container.querySelector(".ring-primary")).toBeInTheDocument();
        expect(screen.getByTestId("unseen-notification-badge")).toBeInTheDocument();
    });

    it("does not render unseen highlight when product has no unseen notification", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProduct} />),
        );

        expect(container.querySelector(".ring-primary")).not.toBeInTheDocument();
        expect(screen.queryByTestId("unseen-notification-badge")).not.toBeInTheDocument();
    });

    it("marks notification as seen when details link is clicked", async () => {
        await act(() => {
            renderWithRouter(<ProductGridItem product={mockProductWithUnseenNotification} />);
        });

        const titleLink = screen.getByRole("link", { name: "Sample Product" });

        await act(() => {
            titleLink.click();
        });

        expect(mockMutate).toHaveBeenCalledWith(["notification-1", "notification-2"]);
    });

    it("does not mark notification as seen without unseen notification", async () => {
        await act(() => {
            renderWithRouter(<ProductGridItem product={mockProduct} />);
        });

        const titleLink = screen.getByRole("link", { name: "Sample Product" });

        await act(() => {
            titleLink.click();
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("uses full-height layout classes for consistent card heights", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProduct} />),
        );

        const wrapper = container.firstElementChild;
        const card = container.querySelector('[data-slot="card"]');

        expect(wrapper).toHaveClass("h-full");
        expect(card).toHaveClass("h-full");
    });
});
