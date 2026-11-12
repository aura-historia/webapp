import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { ShopSearchPage } from "../ShopSearchPage.tsx";

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            search,
            params: _params,
            from: _from,
            ...props
        }: {
            children: React.ReactNode;
            to?: string;
            search?: { q?: string };
            params?: unknown;
            from?: string;
        }) => (
            <a href={`${to}?q=${search?.q ?? ""}`} {...props}>
                {children}
            </a>
        ),
    };
});

vi.mock("@/features/app-shell/components/navigation/MobileAppBar.tsx", () => ({
    MobileAppBar: () => <div data-testid="mobile-app-bar" />,
}));

vi.mock("@/features/search/shops/components/ShopSearchResults.tsx", () => ({
    ShopSearchResults: () => <div data-testid="shop-results" />,
}));

vi.mock("@/features/search/common/components/ScrollToTopButton.tsx", () => ({
    ScrollToTopButton: () => null,
}));

describe("ShopSearchPage", () => {
    it("shows the Providers tab as current, the query heading and the object search link", () => {
        render(<ShopSearchPage searchArgs={{ q: "galerie" }} />);

        const tabs = screen.getByRole("navigation", { name: "Suchart" });
        expect(tabs.querySelector('[aria-current="page"]')).toHaveTextContent("Anbieter");
        expect(screen.getByRole("link", { name: "Objekte" })).toHaveAttribute(
            "href",
            "/$lng/search?q=galerie",
        );
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Ergebnisse für „galerie“",
        );
        expect(screen.getByRole("link", { name: "Objekte zu „galerie“ suchen" })).toHaveAttribute(
            "href",
            "/$lng/search?q=galerie",
        );
        expect(screen.getByTestId("shop-results")).toBeInTheDocument();
        expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("titles a browse without a query and links to all objects", () => {
        render(<ShopSearchPage searchArgs={{ q: "" }} />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Alle Anbieter");
        expect(screen.getByRole("link", { name: "Alle Objekte ansehen" })).toBeInTheDocument();
    });
});
