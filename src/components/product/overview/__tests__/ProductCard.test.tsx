import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { act, screen } from "@testing-library/react";
import { ProductCard } from "../ProductCard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { vi } from "vitest";

const mockMutate = vi.fn();

vi.mock("@/hooks/notification/useMarkNotificationSeen.ts", () => ({
    useMarkNotificationSeen: () => ({ mutate: mockMutate }),
}));

describe("ProductCard", () => {
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

    it("should render the product title, shop name, and price correctly", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Sample Product")).toBeInTheDocument();
        expect(screen.getByText("Sample Shop")).toBeInTheDocument();
        expect(screen.getByText("100€")).toBeInTheDocument();
    });

    it("should render a placeholder image when no images are provided", async () => {
        const productWithoutImages = { ...mockProduct, images: [] };
        await act(() => {
            renderWithRouter(<ProductCard product={productWithoutImages} key="2" />);
        });
        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when the price is not provided", async () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        await act(() => {
            renderWithRouter(<ProductCard product={productWithoutPrice} />);
        });
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the buttons for details and external link", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Details")).toBeInTheDocument();
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });

    it("should add nofollow rel to external merchant link", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });

        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toHaveAttribute(
            "rel",
            "nofollow noopener noreferrer",
        );
    });

    describe("unseen notification highlight", () => {
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

        it("should render border-primary class when product has unseen notification", async () => {
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={mockProductWithUnseenNotification} />),
            );

            const card = container.querySelector(".border-primary");
            expect(card).toBeInTheDocument();
        });

        it("should render the unseen notification badge with text 'Aktualisiert'", async () => {
            await act(() => {
                renderWithRouter(<ProductCard product={mockProductWithUnseenNotification} />);
            });

            expect(screen.getByTestId("unseen-notification-badge")).toBeInTheDocument();
            expect(screen.getByText("Aktualisiert")).toBeInTheDocument();
        });

        it("should NOT render border-primary class when product has no unseen notification", async () => {
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={mockProduct} />),
            );

            const card = container.querySelector(".border-primary");
            expect(card).not.toBeInTheDocument();
        });

        it("should NOT render the unseen notification badge when product has no unseen notification", async () => {
            await act(() => {
                renderWithRouter(<ProductCard product={mockProduct} />);
            });

            expect(screen.queryByTestId("unseen-notification-badge")).not.toBeInTheDocument();
        });

        it("should call markSeen mutate when clicking a product link with unseen notification", async () => {
            await act(() => {
                renderWithRouter(<ProductCard product={mockProductWithUnseenNotification} />);
            });

            const detailsLink = screen.getByText("Details").closest("a");
            await act(() => {
                detailsLink?.click();
            });

            expect(mockMutate).toHaveBeenCalledWith("event-123");
        });

        it("should NOT call markSeen mutate when clicking a product link without unseen notification", async () => {
            await act(() => {
                renderWithRouter(<ProductCard product={mockProduct} />);
            });

            const detailsLink = screen.getByText("Details").closest("a");
            await act(() => {
                detailsLink?.click();
            });

            expect(mockMutate).not.toHaveBeenCalled();
        });
    });
});
