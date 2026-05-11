import { ShopSearchFilters } from "@/components/search/ShopSearchFilters.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";

describe("ShopSearchFilters", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it("renders the shop-type and partner-status filter sections", async () => {
        await act(async () => {
            renderWithRouter(<ShopSearchFilters searchFilters={{ q: "shop" }} />, {
                initialEntries: ["/search/shops?q=shop"],
            });
        });

        expect(screen.getByText("Shop-Typ")).toBeInTheDocument();
        expect(screen.getByText("Partnerstatus")).toBeInTheDocument();
    });

    it("renders the reset-all-filters button", async () => {
        await act(async () => {
            renderWithRouter(<ShopSearchFilters searchFilters={{ q: "shop" }} />, {
                initialEntries: ["/search/shops?q=shop"],
            });
        });
        expect(
            screen.getByRole("button", { name: "Alle Filter zurücksetzen" }),
        ).toBeInTheDocument();
    });

    it("allows resetting all filters without crashing", async () => {
        await act(async () => {
            renderWithRouter(
                <ShopSearchFilters
                    searchFilters={{
                        q: "shop",
                        shopType: ["AUCTION_HOUSE"],
                        partnerStatus: ["PARTNERED"],
                    }}
                />,
                {
                    initialEntries: [
                        "/search/shops?q=shop&shopType=AUCTION_HOUSE&partnerStatus=PARTNERED",
                    ],
                },
            );
        });
        const resetBtn = screen.getByRole("button", { name: "Alle Filter zurücksetzen" });
        await act(async () => {
            await user.click(resetBtn);
        });
        // After reset, the filter controls should still be present
        expect(screen.getByText("Shop-Typ")).toBeInTheDocument();
        expect(screen.getByText("Partnerstatus")).toBeInTheDocument();
    });

    it("pre-populates the shop-type filter from search params", async () => {
        await act(async () => {
            renderWithRouter(
                <ShopSearchFilters searchFilters={{ q: "shop", shopType: ["AUCTION_HOUSE"] }} />,
                { initialEntries: ["/search/shops?q=shop&shopType=AUCTION_HOUSE"] },
            );
        });
        expect(screen.getAllByText(/Auktionshaus/).length).toBeGreaterThan(0);
    });
});
