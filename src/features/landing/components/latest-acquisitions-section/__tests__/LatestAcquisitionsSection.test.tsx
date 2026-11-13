import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeProductListing } from "@/test/fixtures.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { LatestAcquisitionsSection } from "../LatestAcquisitionsSection.tsx";

const mockUseRecentlyAddedProducts = vi.hoisted(() => vi.fn());

vi.mock("@/features/landing/hooks/useRecentlyAddedProducts.ts", () => ({
    RECENTLY_ADDED_COUNT: 12,
    useRecentlyAddedProducts: mockUseRecentlyAddedProducts,
}));

const products = [
    makeProductListing({ productListingId: "1", title: "Meissen coffee service" }),
    makeProductListing({
        productListingId: "2",
        title: "Empire mantel clock",
        auctionId: "auction-1",
    }),
];

async function renderSection() {
    await act(async () => {
        renderWithRouter(<LatestAcquisitionsSection />, { initialEntries: ["/"] });
    });
}

describe("LatestAcquisitionsSection", () => {
    beforeEach(() => {
        mockUseRecentlyAddedProducts.mockReset();
    });

    it("renders the newest listings in a keyboard-reachable rail", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: products, isPending: false });
        await renderSection();

        const rail = screen.getByRole("region", { name: "Neueste Zugänge, 2 Objekte" });
        expect(rail).toHaveAttribute("tabindex", "0");
        expect(screen.getByText("Meissen coffee service")).toBeInTheDocument();
        expect(screen.getByText("Empire mantel clock")).toBeInTheDocument();
    });

    it("marks auction lots only", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: products, isPending: false });
        await renderSection();

        expect(screen.getAllByText("Auktion")).toHaveLength(1);
    });

    it("shows the partner badge for partners only", async () => {
        const base = makeProductListing();
        mockUseRecentlyAddedProducts.mockReturnValue({
            data: [
                ...products,
                makeProductListing({
                    productListingId: "3",
                    title: "Biedermeier secretary",
                    source: { ...base.source, partner: true },
                }),
            ],
            isPending: false,
        });
        await renderSection();

        const badges = screen.getAllByTestId("partner-badge");
        expect(badges).toHaveLength(1);
        expect(badges[0].closest("article")).toHaveTextContent("Biedermeier secretary");
        expect(badges[0]).toHaveTextContent("Partner von Aura Historia");
    });

    it("links to all recently added objects, newest first", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: products, isPending: false });
        await renderSection();

        const [link] = screen.getAllByRole("link", { name: /Alle neuen Objekte ansehen/ });
        expect(link.getAttribute("href")).toContain("/de/search");
        expect(link.getAttribute("href")).toContain("sortField=CREATION_DATE");
        expect(link.getAttribute("href")).toContain("sortOrder=DESC");
    });

    it("keeps the paging buttons at the start disabled", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: products, isPending: false });
        await renderSection();

        expect(screen.getByRole("button", { name: "Vorherige Objekte" })).toBeDisabled();
    });

    it("reserves the rail while loading", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: undefined, isPending: true });
        await renderSection();

        expect(screen.getByRole("heading", { name: "Neueste Zugänge." })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: /Objekte/ })).not.toBeInTheDocument();
    });

    it("renders nothing when the index has no new listings", async () => {
        mockUseRecentlyAddedProducts.mockReturnValue({ data: [], isPending: false });
        await renderSection();

        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
});
