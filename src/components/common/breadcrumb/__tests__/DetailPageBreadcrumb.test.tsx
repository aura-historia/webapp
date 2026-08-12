import { act, createEvent, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { DetailPageBreadcrumb } from "../DetailPageBreadcrumb.tsx";

describe("DetailPageBreadcrumb", () => {
    it("should render only Home and the current title when no origin is given", async () => {
        await act(() => renderWithRouter(<DetailPageBreadcrumb title="Antique Vase" />));

        expect(screen.getByRole("link", { name: "Start" })).toBeInTheDocument();
        expect(screen.getByText("Antique Vase")).toBeInTheDocument();
    });

    it("should render the origin crumb with a translated label and correct href", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Antique Vase"
                    origin={{ from: "/search?q=vase", fromKind: "search" }}
                />,
            ),
        );

        const originLink = screen.getByRole("link", { name: "Suche" });
        expect(originLink).toHaveAttribute("href", "/search?q=vase");
        expect(screen.getByText("Antique Vase")).toBeInTheDocument();
    });

    it("should label a shop origin correctly", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Antique Vase"
                    origin={{ from: "/shops/my-shop", fromKind: "shop" }}
                />,
            ),
        );

        expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute(
            "href",
            "/shops/my-shop",
        );
    });

    it("should label a product origin correctly", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Antique Vase"
                    origin={{ from: "/shops/other-shop/products/other-item", fromKind: "product" }}
                />,
            ),
        );

        expect(screen.getByRole("link", { name: "Vorheriger Artikel" })).toBeInTheDocument();
    });

    it("should label a shopSearch origin correctly", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Nicholas Wells Auctioneers"
                    origin={{ from: "/search/shops?q=auction", fromKind: "shopSearch" }}
                />,
            ),
        );

        expect(screen.getByRole("link", { name: "Shops" })).toHaveAttribute(
            "href",
            "/search/shops?q=auction",
        );
    });

    it("should label a watchlist origin correctly", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Antique Vase"
                    origin={{ from: "/me/watchlist", fromKind: "watchlist" }}
                />,
            ),
        );

        expect(screen.getByRole("link", { name: "Merkliste" })).toHaveAttribute(
            "href",
            "/me/watchlist",
        );
    });

    it("should label a searchFilter origin correctly", async () => {
        await act(() =>
            renderWithRouter(
                <DetailPageBreadcrumb
                    title="Antique Vase"
                    origin={{ from: "/me/search-filter/abc", fromKind: "searchFilter" }}
                />,
            ),
        );

        expect(screen.getByRole("link", { name: "Suchauftrag" })).toHaveAttribute(
            "href",
            "/me/search-filter/abc",
        );
    });

    it("should render the current title as non-interactive (aria-disabled, no href)", async () => {
        await act(() => renderWithRouter(<DetailPageBreadcrumb title="Antique Vase" />));

        const currentCrumb = screen.getByText("Antique Vase");
        expect(currentCrumb).toHaveAttribute("aria-disabled", "true");
        expect(currentCrumb).not.toHaveAttribute("href");
    });

    describe("origin crumb click interception", () => {
        async function renderOriginLink() {
            await act(() =>
                renderWithRouter(
                    <DetailPageBreadcrumb
                        title="Antique Vase"
                        origin={{ from: "/search?q=vase", fromKind: "search" }}
                    />,
                ),
            );
            return screen.getByRole("link", { name: "Suche" });
        }

        it("intercepts a plain left-click (SPA navigation)", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 0 });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(true);
        });

        it("does not intercept ctrl-click (browser opens a new tab)", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 0, ctrlKey: true });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(false);
        });

        it("does not intercept cmd/meta-click", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 0, metaKey: true });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(false);
        });

        it("does not intercept shift-click (browser opens a new window)", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 0, shiftKey: true });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(false);
        });

        it("does not intercept alt-click (browser triggers a download/save)", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 0, altKey: true });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(false);
        });

        it("does not intercept middle-click (browser opens a new background tab)", async () => {
            const link = await renderOriginLink();

            const event = createEvent.click(link, { button: 1 });
            fireEvent(link, event);

            expect(event.defaultPrevented).toBe(false);
        });

        it("keeps a real, native href regardless of interception (right-click 'copy link', no-JS fallback)", async () => {
            const link = await renderOriginLink();

            expect(link).toHaveAttribute("href", "/search?q=vase");
        });
    });
});
