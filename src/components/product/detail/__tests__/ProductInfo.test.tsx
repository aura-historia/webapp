import type React from "react";

vi.mock("lottie-react", () => ({
    Lottie: () => null,
}));

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");

    return {
        ...actual,
        Link: ({
            to,
            params,
            children,
            ...props
        }: {
            to: string;
            params?:
                | Record<string, string>
                | ((current: Record<string, string>) => Record<string, string>);
            children: React.ReactNode;
            className?: string;
        }) => {
            const resolvedParams =
                typeof params === "function" ? params({ lng: "de" }) : (params ?? { lng: "de" });
            let href = to;
            for (const [key, value] of Object.entries(resolvedParams)) {
                href = href.replace(`$${key}`, value);
            }
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
        useParams: () => ({}),
        useRouteContext: () => ({ timeZone: "UTC" }),
    };
});

import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { screen } from "@testing-library/react";
import { ProductInfo } from "../ProductInfo.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        }),
    });
});

describe("ProductInfo", () => {
    const mockProduct: ProductDetail = {
        productId: "1",
        productSlugId: "test-product-title",
        eventId: "",
        shopId: "",
        shopSlugId: "test-shop",
        shopsProductId: "",
        shopName: "Test Shop",
        sellerName: "Test Shop",
        shopType: "AUCTION_HOUSE",
        title: "Test Product Title",
        price: "99,99 €",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        viewUrl: new URL("https://affiliate.example.com/product"),
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
        created: new Date(),
        updated: new Date(),
    };

    it("should render the product title, shop name, and price correctly", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Test Product Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should link the shop name to the shop page", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);

        expect(screen.getByRole("link", { name: "Test Shop" })).toHaveAttribute(
            "href",
            "/de/shops/test-shop",
        );
    });

    it("should link the shop name when a secondary seller is shown", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{
                    ...mockProduct,
                    shopName: "Main Shop",
                    sellerName: "Secondary Seller",
                    shopSlugId: "main-shop",
                }}
            />,
        );

        expect(screen.getByText("Secondary Seller")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Main Shop" })).toHaveAttribute(
            "href",
            "/de/shops/main-shop",
        );
    });

    it("should render the shop type badge", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
    });

    it("should render the auction window badge when auction start is set", () => {
        const productWithAuction = {
            ...mockProduct,
            auction: { start: new Date("2025-06-15T10:00:00Z") },
        };
        renderWithQueryClient(<ProductInfo product={productWithAuction} />);
        expect(screen.getByText(/^ab /)).toBeInTheDocument();
    });

    it("should not render the auction window badge when no auction is set", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.queryByText(/^ab /)).not.toBeInTheDocument();
        expect(screen.queryByText(/^bis /)).not.toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        renderWithQueryClient(<ProductInfo product={productWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the button to the shop", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });

    it("should add nofollow rel to external merchant link", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);

        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toHaveAttribute(
            "rel",
            "nofollow noopener noreferrer",
        );
    });

    it("should prefer the product viewUrl for the merchant link", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);

        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toHaveAttribute(
            "href",
            "https://affiliate.example.com/product",
        );
    });

    it("should render merchant button as a link when state is not REMOVED", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByRole("link", { name: "Zur Seite des Händlers" })).toBeInTheDocument();
    });

    it("should disable merchant button when state is REMOVED", () => {
        const removedProduct = { ...mockProduct, state: "REMOVED" as const };
        renderWithQueryClient(<ProductInfo product={removedProduct} />);
        expect(
            screen.queryByRole("link", { name: "Zur Seite des Händlers" }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Zur Seite des Händlers" })).toBeDisabled();
    });

    it("should render action buttons without fixed floating positioning", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);

        expect(document.querySelector(".fixed.top-24.right-4")).not.toBeInTheDocument();
        const shareButtons = screen.getAllByRole("button");
        expect(shareButtons.length).toBeGreaterThan(0);
    });

    describe("search filter info", () => {
        const mockProductMatched: ProductDetail = {
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

        it("should render filter name as a link to the search filter", () => {
            renderWithQueryClient(<ProductInfo product={mockProductMatched} />);
            expect(screen.getByRole("link", { name: "Vintage Art Deco" })).toHaveAttribute(
                "href",
                "/de/me/search-filter/filter-123",
            );
        });

        it("should render the match reason immediately visible", () => {
            renderWithQueryClient(<ProductInfo product={mockProductMatched} />);
            expect(
                screen.getByText("Passt zum gesuchten Vintage Art Deco Stil."),
            ).toBeInTheDocument();
        });

        it("should NOT render search filter info when not matched", () => {
            renderWithQueryClient(<ProductInfo product={mockProduct} />);
            expect(screen.queryByText("Suchauftrag")).not.toBeInTheDocument();
        });

        it("should NOT render search filter info when hidden", () => {
            const hiddenProduct: ProductDetail = {
                ...mockProduct,
                userData: {
                    watchlistData: { isWatching: false, isNotificationEnabled: false },
                    notificationData: { hasUnseenNotification: false },
                    restrictedContentData: { consentGiven: false },
                    searchFilterData: { matched: true, hidden: true },
                },
            };
            renderWithQueryClient(<ProductInfo product={hiddenProduct} />);
            expect(screen.queryByText("Suchauftrag")).not.toBeInTheDocument();
        });

        it("should render filter name but NOT match reason when matchReason is absent", () => {
            const productNoReason: ProductDetail = {
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
                    },
                },
            };
            renderWithQueryClient(<ProductInfo product={productNoReason} />);
            expect(screen.getByRole("link", { name: "Vintage Art Deco" })).toBeInTheDocument();
            expect(
                screen.queryByText("Passt zum gesuchten Vintage Art Deco Stil."),
            ).not.toBeInTheDocument();
        });
    });
});
