import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProductGridItem } from "../ProductGridItem.tsx";

const mockMutate = vi.fn();

vi.mock("@/hooks/notification/useMarkNotificationSeen.ts", () => ({
    useMarkNotificationSeen: () => ({ mutate: mockMutate }),
}));

describe("ProductGridItem", () => {
    const mockProduct: OverviewProduct = {
        created: new Date(),
        eventId: "",
        shopId: "",
        shopSlugId: "sample-shop",
        shopsProductId: "",
        productId: "1",
        productSlugId: "sample-product",
        updated: new Date(),
        url: new URL("https://example.com"),
        title: "Sample Product",
        shopName: "Sample Shop",
        shopType: "AUCTION_HOUSE",
        state: "AVAILABLE",
        price: "100€",
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
        originYear: undefined,
        originYearMin: undefined,
        originYearMax: undefined,
        authenticity: "UNKNOWN",
        condition: "UNKNOWN",
        provenance: "UNKNOWN",
        restoration: "UNKNOWN",
    };

    const mockProductWithUnseenNotification: OverviewProduct = {
        ...mockProduct,
        userData: {
            watchlistData: { isWatching: true, isNotificationEnabled: true },
            notificationData: { hasUnseenNotification: true, originEventId: "event-123" },
        },
    };

    beforeEach(() => {
        mockMutate.mockClear();
    });

    it("renders a highlighted card when product has unseen notification", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProductWithUnseenNotification} />),
        );

        expect(container.querySelector(".border-primary")).toBeInTheDocument();
        expect(screen.getByTestId("unseen-notification-badge")).toBeInTheDocument();
    });

    it("does not render unseen highlight when product has no unseen notification", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProduct} />),
        );

        expect(container.querySelector(".border-primary")).not.toBeInTheDocument();
        expect(screen.queryByTestId("unseen-notification-badge")).not.toBeInTheDocument();
    });

    it("marks notification as seen when details link is clicked", async () => {
        await act(() => {
            renderWithRouter(<ProductGridItem product={mockProductWithUnseenNotification} />);
        });

        const detailsLink = screen.getByText("Details").closest("a");

        await act(() => {
            detailsLink?.click();
        });

        expect(mockMutate).toHaveBeenCalledWith("event-123");
    });

    it("does not mark notification as seen without unseen notification", async () => {
        await act(() => {
            renderWithRouter(<ProductGridItem product={mockProduct} />);
        });

        const detailsLink = screen.getByText("Details").closest("a");

        await act(() => {
            detailsLink?.click();
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("uses full-height layout classes for consistent card heights", async () => {
        const { container } = await act(() =>
            renderWithRouter(<ProductGridItem product={mockProduct} />),
        );

        const wrapper = container.firstElementChild;
        const card = container.querySelector(".shadow-md");

        expect(wrapper).toHaveClass("h-full");
        expect(card).toHaveClass("h-full");
    });
});
