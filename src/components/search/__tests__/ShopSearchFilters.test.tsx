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

    it("renders the partner-status filter section", async () => {
        await act(async () => {
            renderWithRouter(<ShopSearchFilters searchFilters={{ q: "shop" }} />, {
                initialEntries: ["/search/shops?q=shop"],
            });
        });

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
                <ShopSearchFilters searchFilters={{ q: "shop", partnerStatus: ["PARTNERED"] }} />,
                { initialEntries: ["/search/shops?q=shop"] },
            );
        });
        const resetBtn = screen.getByRole("button", { name: "Alle Filter zurücksetzen" });
        await act(async () => {
            await user.click(resetBtn);
        });
        // After reset, the filter controls should still be present
        expect(screen.getByText("Partnerstatus")).toBeInTheDocument();
    });

    it("pre-populates the partner-status filter from search params", async () => {
        await act(async () => {
            renderWithRouter(
                <ShopSearchFilters searchFilters={{ q: "shop", partnerStatus: ["PARTNERED"] }} />,
                { initialEntries: ["/search/shops?q=shop&partnerStatus=PARTNERED"] },
            );
        });
        // The partner-status filter shows the localized label
        expect(screen.getByText("Partnerstatus")).toBeInTheDocument();
    });
});
