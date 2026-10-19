import { makeProductListingDetail, makeProductListingUserState } from "@/test/fixtures.ts";
import type React from "react";
vi.mock("@/env", () => ({
    env: { VITE_APP_URL: "https://aura-historia.com", VITE_FEATURE_LOGIN_ENABLED: false },
}));

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
        useLocation: () => "/de/products/antique-chair",
    };
});

import { screen } from "@testing-library/react";
import { ProductInfo } from "../ProductInfo.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { mapToProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { generateProductJsonLd } from "@/features/product/detail/lib/seo/productJsonLd.ts";

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
    const product = makeProductListingDetail({
        title: "Test Product Title",
        displayPrice: "99,99 €",
        viewUrl: new URL("https://affiliate.example.com/product"),
    });

    it("renders the title, public source and display price", () => {
        renderWithQueryClient(<ProductInfo product={product} />);
        expect(screen.getByRole("heading", { name: "Test Product Title" })).toBeInTheDocument();
        expect(screen.getByTestId("product-price")).toHaveTextContent("99,99 €");
        expect(screen.getByRole("link", { name: "Antique Store" })).toHaveAttribute(
            "href",
            "/de/shops/antique-store",
        );
    });
    it("uses the referral URL with a nofollow relationship", () => {
        renderWithQueryClient(<ProductInfo product={product} />);
        const link = screen.getByRole("link", { name: /Zur Seite des Anbieters/ });
        expect(link).toHaveAttribute("href", product.viewUrl?.href);
        expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
    });
    it("falls back to the source URL", () => {
        renderWithQueryClient(<ProductInfo product={{ ...product, viewUrl: undefined }} />);
        expect(screen.getAllByRole("link", { name: /Zur Seite des Anbieters/ })[0]).toHaveAttribute(
            "href",
            product.url?.href,
        );
    });
    it("disables the merchant action for a withdrawn listing", () => {
        renderWithQueryClient(<ProductInfo product={{ ...product, lifecycle: "WITHDRAWN" }} />);
        expect(
            screen.queryByRole("link", { name: /Zur Seite des Anbieters/ }),
        ).not.toBeInTheDocument();
        for (const action of screen.getAllByText("Zur Seite des Anbieters")) {
            expect(action.closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
        }
        expect(
            screen.getByText("Dieses Angebot wurde von seiner Quelle zurückgezogen."),
        ).toBeInTheDocument();
    });
    it("disables the merchant action for a redacted URL", () => {
        renderWithQueryClient(
            <ProductInfo product={{ ...product, url: undefined, viewUrl: undefined }} />,
        );
        expect(
            screen.queryByRole("link", { name: /Zur Seite des Anbieters/ }),
        ).not.toBeInTheDocument();
    });
    it("renders on-request prices", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{ ...product, price: { type: "ON_REQUEST" }, displayPrice: undefined }}
            />,
        );
        expect(screen.getByTestId("product-price")).toHaveTextContent("Preis auf Anfrage");
    });
    it("renders missing prices", () => {
        renderWithQueryClient(
            <ProductInfo product={{ ...product, price: undefined, displayPrice: undefined }} />,
        );
        expect(screen.getByTestId("product-price")).toHaveTextContent("Preis unbekannt");
    });
    it("renders an unavailable historical SEK conversion as unknown, not as 0, EUR or the source amount", () => {
        const sold = mapToProductListingDetail(
            {
                item: {
                    productListingId: "listing-sold",
                    eventId: "evt-1",
                    source: {
                        listingSourceId: "source-1",
                        name: "Antique Store",
                        slugId: "antique-store",
                    },
                    sourceListingId: "item-1",
                    title: { text: "Sold Chair", language: "de" },
                    pricing: {
                        source: { price: { type: "MONETARY", amount: 250000, currency: "EUR" } },
                        display: {},
                        valuation: {
                            type: "SALE_OBSERVATION",
                            fxRateId: "fx_sale",
                            capturedAt: "2026-08-31T00:00:00Z",
                            observedAt: "2026-08-30T00:00:00Z",
                        },
                    },
                    availability: "SOLD_OUT",
                    lifecycle: "ACTIVE",
                    url: "https://example.com/chair",
                    viewUrl: "https://example.com/chair",
                    images: [],
                    auction: null,
                    lot: null,
                    created: "2026-08-01T00:00:00Z",
                    updated: "2026-09-01T00:00:00Z",
                },
            },
            "de",
        );

        const { container } = renderWithQueryClient(<ProductInfo product={sold} />);
        expect(screen.getByTestId("product-price")).toHaveTextContent("Preis unbekannt");
        const content = container.textContent ?? "";
        expect(content).not.toMatch(/€|EUR|SEK|2\.500|0,00/);
        expect(content).not.toContain("undefined");
        expect(generateProductJsonLd(sold).offers).toBeUndefined();
    });

    it("renders authoritative auction and lot names", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{
                    ...product,
                    auction: {
                        auctionId: "auction-1",
                        name: { text: "Winter Sale", language: "en" },
                        schedule: {
                            biddingOpens: null,
                            liveStarts: null,
                            lotsBeginClosing: null,
                            scheduledEnd: null,
                        },
                    },
                    lot: {
                        lotNumber: "42",
                        cataloguePosition: null,
                        biddingOpens: null,
                        scheduledCloses: null,
                        reportedClosedAt: null,
                    },
                }}
            />,
        );
        expect(screen.getByText("Winter Sale")).toBeInTheDocument();
        expect(screen.getByText(/42/)).toBeInTheDocument();
    });
    it("shows the matched search filter", () => {
        const userState = makeProductListingUserState({
            searchFilter: {
                matched: true,
                hidden: false,
                userSearchFilterId: "filter-1",
                userSearchFilterName: "My filter",
            },
        });
        renderWithQueryClient(<ProductInfo product={{ ...product, userState }} />);
        expect(screen.getByRole("link", { name: /My filter/ })).toHaveAttribute(
            "href",
            "/de/me/search-filter/filter-1",
        );
    });
    it("does not show hidden filter details", () => {
        const userState = makeProductListingUserState({
            searchFilter: {
                matched: true,
                hidden: true,
                userSearchFilterId: "filter-1",
                userSearchFilterName: "My filter",
            },
        });
        renderWithQueryClient(<ProductInfo product={{ ...product, userState }} />);
        expect(screen.queryByText("My filter")).not.toBeInTheDocument();
    });
    it("shows the estimate under the price", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{
                    ...product,
                    pricing: {
                        ...product.pricing,
                        display: {
                            ...product.pricing.display,
                            priceEstimateMin: { amount: 260000, currency: "EUR" },
                            priceEstimateMax: { amount: 320000, currency: "EUR" },
                        },
                    },
                }}
            />,
        );
        expect(screen.getByTestId("product-price")).toHaveTextContent("99,99 €");
        expect(screen.getByText("Schätzung")).toBeInTheDocument();
        expect(screen.getByText(/2\.600.*3\.200/)).toBeInTheDocument();
    });
    it("shows the estimate as the figure when there is no price", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{
                    ...product,
                    price: undefined,
                    displayPrice: undefined,
                    pricing: {
                        ...product.pricing,
                        display: { priceEstimateMin: { amount: 400000, currency: "EUR" } },
                    },
                }}
            />,
        );
        expect(screen.getByTestId("product-price")).toHaveTextContent(/^Ab 4\.000/);
        expect(screen.getByText("Schätzung")).toBeInTheDocument();
    });
    it("renders the description when present", () => {
        renderWithQueryClient(
            <ProductInfo product={{ ...product, description: "Walnut with a marble top." }} />,
        );
        expect(screen.getByRole("heading", { name: "Beschreibung" })).toBeInTheDocument();
        expect(screen.getByText("Walnut with a marble top.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Mehr anzeigen/ })).not.toBeInTheDocument();
    });
    it("omits the description section when there is none", () => {
        renderWithQueryClient(<ProductInfo product={{ ...product, description: undefined }} />);
        expect(screen.queryByRole("heading", { name: "Beschreibung" })).not.toBeInTheDocument();
    });
});
