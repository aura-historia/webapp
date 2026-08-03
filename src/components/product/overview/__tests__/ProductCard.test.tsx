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
        viewUrl: new URL("https://affiliate.example.com/product"),
        title: "Sample Product",
        shopName: "Sample Shop",
        sellerName: "Sample Shop",
        shopType: "AUCTION_HOUSE",
        state: "AVAILABLE",
        price: "100€",
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
    };

    it("should render the product title, shop name, and price correctly", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Sample Product")).toBeInTheDocument();
        expect(screen.getByText("Sample Shop")).toBeInTheDocument();
        expect(screen.getByText("100€")).toBeInTheDocument();
    });

    it("should not render the legacy reference label", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });

        expect(screen.queryByText(/^REF:/)).not.toBeInTheDocument();
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

    it("should render the seller in the detail-page style without its type", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Sample Shop").closest("p")).toHaveClass(
            "uppercase",
            "tracking-[0.08em]",
            "text-muted-foreground/80",
        );
        expect(screen.queryByText("Auktionshaus")).not.toBeInTheDocument();
    });

    it("should show the selling source and linked shop when they differ", async () => {
        await act(() => {
            renderWithRouter(
                <ProductCard
                    product={{
                        ...mockProduct,
                        sellerName: "Secondary Seller",
                    }}
                />,
            );
        });

        expect(screen.getByText("Secondary Seller")).toBeInTheDocument();
        expect(screen.getByText("auf")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Sample Shop" })).toHaveAttribute(
            "href",
            "/shops/sample-shop",
        );
    });

    it("should render the auction window badge when auction start is set", async () => {
        const productWithAuction = {
            ...mockProduct,
            auction: { start: new Date("2025-06-15T10:00:00Z") },
        };
        await act(() => {
            renderWithRouter(<ProductCard product={productWithAuction} />);
        });
        expect(screen.getByText(/^ab /)).toBeInTheDocument();
    });

    it("should not render the auction window badge when no auction is set", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.queryByText(/^ab /)).not.toBeInTheDocument();
        expect(screen.queryByText(/^bis /)).not.toBeInTheDocument();
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

    it("should prefer the product viewUrl for the merchant link", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });

        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toHaveAttribute(
            "href",
            "https://affiliate.example.com/product",
        );
    });

    it("should render merchant button as a link when state is not REMOVED", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toBeInTheDocument();
    });

    it("should disable merchant button when state is REMOVED", async () => {
        const removedProduct = { ...mockProduct, state: "REMOVED" as const };
        await act(() => {
            renderWithRouter(<ProductCard product={removedProduct} />);
        });
        expect(
            screen.queryByRole("link", { name: "Zur Seite des Händlers" }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Zur Seite des Händlers" })).toBeDisabled();
    });

    describe("search filter highlight", () => {
        const mockProductMatched: OverviewProduct = {
            ...mockProduct,
            userData: {
                watchlistData: { isWatching: false, isNotificationEnabled: false },
                notificationData: { hasUnseenNotification: false },
                restrictedContentData: { consentGiven: false },
                searchFilterData: {
                    matched: true,
                    hidden: false,
                    userSearchFilterId: "filter-123",
                    userSearchFilterName: "Vintage Art Deco",
                    matchReason: "Passt zum gesuchten Vintage Art Deco Stil.",
                },
            },
        };

        it("should render border-tertiary when matched and not hidden", async () => {
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={mockProductMatched} />),
            );
            expect(container.querySelector(".border-tertiary")).toBeInTheDocument();
        });

        it("should render the search filter match badge", async () => {
            await act(() => {
                renderWithRouter(<ProductCard product={mockProductMatched} />);
            });
            expect(screen.getByText("Treffer")).toBeInTheDocument();
        });

        it("should NOT render border-tertiary when not matched", async () => {
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={mockProduct} />),
            );
            expect(container.querySelector(".border-tertiary")).not.toBeInTheDocument();
        });

        it("should NOT render match badge when notification badge is shown", async () => {
            const productWithBoth: OverviewProduct = {
                ...mockProductMatched,
                userData: {
                    ...mockProductMatched.userData!,
                    notificationData: { hasUnseenNotification: true, originEventId: "event-123" },
                },
            };
            await act(() => {
                renderWithRouter(<ProductCard product={productWithBoth} />);
            });
            expect(screen.queryByText("Treffer")).not.toBeInTheDocument();
            expect(screen.getByText("Aktualisiert")).toBeInTheDocument();
        });

        it("should prefer border-primary over border-tertiary when notification is present", async () => {
            const productWithBoth: OverviewProduct = {
                ...mockProductMatched,
                userData: {
                    ...mockProductMatched.userData!,
                    notificationData: { hasUnseenNotification: true, originEventId: "event-123" },
                },
            };
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={productWithBoth} />),
            );
            expect(container.querySelector(".border-primary")).toBeInTheDocument();
            expect(container.querySelector(".border-tertiary")).not.toBeInTheDocument();
        });

        it("should NOT render match badge or border-tertiary when hidden=true", async () => {
            const hiddenProduct: OverviewProduct = {
                ...mockProduct,
                userData: {
                    watchlistData: { isWatching: false, isNotificationEnabled: false },
                    notificationData: { hasUnseenNotification: false },
                    restrictedContentData: { consentGiven: false },
                    searchFilterData: { matched: true, hidden: true },
                },
            };
            const { container } = await act(() =>
                renderWithRouter(<ProductCard product={hiddenProduct} />),
            );
            expect(screen.queryByText("Treffer")).not.toBeInTheDocument();
            expect(container.querySelector(".border-tertiary")).not.toBeInTheDocument();
        });
    });

    describe("unseen notification highlight", () => {
        const mockProductWithUnseenNotification: OverviewProduct = {
            ...mockProduct,
            userData: {
                watchlistData: { isWatching: true, isNotificationEnabled: true },
                notificationData: { hasUnseenNotification: true, originEventId: "event-123" },
                restrictedContentData: { consentGiven: false },
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
