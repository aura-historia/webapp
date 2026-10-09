import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import { AuctionListingSourcePicker } from "../AuctionListingSourcePicker.tsx";

const mocks = vi.hoisted(() => ({ useAdminAuctionListingSources: vi.fn() }));
vi.mock("../../api/useAdminAuctions.ts", () => ({
    useAdminAuctionListingSources: mocks.useAdminAuctionListingSources,
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const source: AdminListingSourceSummary = {
    listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate",
    listingSourceSlugId: "spring-sales",
    name: "Spring Sales",
    operator: { partyId: "pty_01", partySlugId: "dorotheum", name: "Dorotheum" },
    ingestionMethods: ["WEB_CRAWL"],
    presentation: {},
    created: new Date("2026-09-01T00:00:00Z"),
    updated: new Date("2026-09-02T00:00:00Z"),
};

function mockResults(items: readonly AdminListingSourceSummary[]) {
    mocks.useAdminAuctionListingSources.mockImplementation((search: string) =>
        search
            ? {
                  data: { pages: [{ items }] },
                  isPending: false,
                  error: null,
                  hasNextPage: false,
              }
            : { data: undefined, isPending: true, error: null, hasNextPage: false },
    );
}

function searchFor(text: string) {
    fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.searchListingSources")), {
        target: { value: text },
    });
}

describe("AuctionListingSourcePicker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults([source]);
    });

    it("keeps the section title separate from the search label", () => {
        render(<AuctionListingSourcePicker value={undefined} onChange={vi.fn()} />);

        const legend = screen.getByText(t("adminAuctions.fields.listingSource"));
        expect(legend.tagName).toBe("LEGEND");
        expect(legend).toHaveClass("mb-3");
    });

    it("shows the operator so operator-name matches are recognisable", async () => {
        const onChange = vi.fn();
        render(<AuctionListingSourcePicker value={undefined} onChange={onChange} />);

        searchFor("Dorotheum");
        expect(screen.getByRole("status")).toHaveTextContent(
            t("adminAuctions.sourceSearch.loading"),
        );

        const result = await screen.findByRole("button", { name: /Spring Sales/ });
        expect(result).toHaveTextContent(
            t("adminAuctions.sourceSearch.operatedBy", { name: "Dorotheum" }),
        );
        expect(mocks.useAdminAuctionListingSources).toHaveBeenLastCalledWith("Dorotheum");

        fireEvent.click(result);
        expect(onChange).toHaveBeenCalledWith(source);
    });

    it("does not offer results for an older search term while typing", async () => {
        render(<AuctionListingSourcePicker value={undefined} onChange={vi.fn()} />);

        searchFor("Dor");
        await screen.findByRole("button", { name: /Spring Sales/ });
        searchFor("Dorotheum Wien");

        expect(screen.queryByRole("button", { name: /Spring Sales/ })).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("clears a selected source and returns focus to the search", async () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <AuctionListingSourcePicker value={source} onChange={onChange} />,
        );

        expect(
            screen.queryByLabelText(t("adminAuctions.fields.searchListingSources")),
        ).not.toBeInTheDocument();
        fireEvent.click(
            screen.getByRole("button", { name: t("adminAuctions.actions.clearSource") }),
        );
        expect(onChange).toHaveBeenCalledWith(undefined);

        rerender(<AuctionListingSourcePicker value={undefined} onChange={onChange} />);
        await waitFor(() =>
            expect(
                screen.getByLabelText(t("adminAuctions.fields.searchListingSources")),
            ).toHaveFocus(),
        );
    });

    it("shows an empty state and the validation error", async () => {
        mockResults([]);
        render(
            <AuctionListingSourcePicker
                value={undefined}
                onChange={vi.fn()}
                error="adminAuctions.validation.sourceRequired"
            />,
        );

        searchFor("unknown");
        expect(
            await screen.findByText(t("adminAuctions.sourceSearch.noResults")),
        ).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminAuctions.validation.sourceRequired"),
        );
    });
});
