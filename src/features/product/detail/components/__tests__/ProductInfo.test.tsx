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
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
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
        expect(screen.getByRole("link", { name: /Zur Seite des Anbieters/ })).toHaveAttribute(
            "href",
            product.url?.href,
        );
    });
    it("disables the merchant action for a withdrawn listing", () => {
        renderWithQueryClient(<ProductInfo product={{ ...product, lifecycle: "WITHDRAWN" }} />);
        expect(screen.getByRole("button", { name: /Zur Seite des Anbieters/ })).toBeDisabled();
    });
    it("disables the merchant action for a redacted URL", () => {
        renderWithQueryClient(
            <ProductInfo product={{ ...product, url: undefined, viewUrl: undefined }} />,
        );
        expect(screen.getByRole("button", { name: /Zur Seite des Anbieters/ })).toBeDisabled();
    });
    it("renders on-request prices", () => {
        renderWithQueryClient(
            <ProductInfo
                product={{ ...product, price: { type: "ON_REQUEST" }, displayPrice: undefined }}
            />,
        );
        expect(screen.getByText("Preis auf Anfrage")).toBeInTheDocument();
    });
    it("renders missing prices", () => {
        renderWithQueryClient(
            <ProductInfo product={{ ...product, price: undefined, displayPrice: undefined }} />,
        );
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
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
    it("shows a matched search filter and reason", () => {
        const userState = makeProductListingUserState({
            searchFilter: {
                matched: true,
                hidden: false,
                userSearchFilterId: "filter-1",
                userSearchFilterName: "My filter",
                matchReason: "Matching period",
            },
        });
        renderWithQueryClient(<ProductInfo product={{ ...product, userState }} />);
        expect(screen.getByRole("link", { name: "My filter" })).toHaveAttribute(
            "href",
            "/de/me/search-filter/filter-1",
        );
        expect(screen.getByText("Matching period")).toBeInTheDocument();
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
});
