import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerListingSourcesSection } from "../PartnerListingSourcesSection.tsx";

const state = vi.hoisted(() => ({
    sources: [
        { listingSourceId: "ls_dealer", listingSourceSlugId: "dealer", name: "Aurora Antiques" },
    ],
    isPending: false,
    isError: false,
    hasMore: false,
    canLoadMore: false,
    isLoadingMore: false,
    isLoadMoreError: false,
    loadMore: vi.fn(),
    retry: vi.fn(),
}));
const auth = vi.hoisted(() => ({ isAuthenticated: true, isResolved: true }));
const useSources = vi.hoisted(() => vi.fn());
vi.mock("@/features/partner/common/api/useOwnListingSources.ts", () => ({
    useOwnListingSources: useSources,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => auth,
}));

const emptyMessage =
    "Sie haben derzeit keinen Zugriff auf Anbieter. Eine frühere Freigabe wurde möglicherweise widerrufen.";

describe("granted-source portfolio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        auth.isAuthenticated = true;
        auth.isResolved = true;
        state.sources = [
            {
                listingSourceId: "ls_dealer",
                listingSourceSlugId: "dealer",
                name: "Aurora Antiques",
            },
        ];
        state.isPending = false;
        state.isError = false;
        state.hasMore = false;
        state.canLoadMore = false;
        state.isLoadingMore = false;
        state.isLoadMoreError = false;
        useSources.mockImplementation(() => ({ ...state }));
    });

    it("renders only minimal references with no edit controls or detail links", () => {
        render(<PartnerListingSourcesSection />);
        expect(screen.getByRole("heading", { name: "Freigegebene Anbieter" })).toBeInTheDocument();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        expect(screen.getByText("ls_dealer")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenCalledWith(true);
    });

    it("renders a loading state while authentication resolves", () => {
        auth.isAuthenticated = false;
        auth.isResolved = false;
        render(<PartnerListingSourcesSection />);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenCalledWith(false);
    });

    it("renders a loading state during the first request", () => {
        state.isPending = true;
        render(<PartnerListingSourcesSection />);
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("explains empty or revoked access", () => {
        state.sources = [];
        render(<PartnerListingSourcesSection />);
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it("removes references when a refresh returns an empty grant list", () => {
        const { rerender } = render(<PartnerListingSourcesSection />);
        state.sources = [];
        rerender(<PartnerListingSourcesSection />);
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it("hides cached grants on a failed refresh and offers retry", async () => {
        state.isError = true;
        render(<PartnerListingSourcesSection />);
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(state.retry).toHaveBeenCalledOnce();
    });

    it("says an unfinished list is incomplete and reaches the last page on demand", async () => {
        state.hasMore = true;
        state.canLoadMore = true;
        const { rerender } = render(<PartnerListingSourcesSection />);
        expect(
            screen.getByText(
                "Weitere Anbieter sind verfügbar. Diese Liste ist noch nicht vollständig.",
            ),
        ).toBeInTheDocument();
        await userEvent
            .setup()
            .click(screen.getByRole("button", { name: "Weitere Anbieter anzeigen" }));
        expect(state.loadMore).toHaveBeenCalledOnce();

        state.sources = [
            ...state.sources,
            {
                listingSourceId: "ls_namesake",
                listingSourceSlugId: "namesake",
                name: "Aurora Antiques",
            },
        ];
        state.hasMore = false;
        state.canLoadMore = false;
        rerender(<PartnerListingSourcesSection />);
        const items = within(screen.getByRole("list")).getAllByRole("listitem");
        expect(items.map((item) => item.textContent)).toEqual([
            "Aurora Antiquesls_dealer",
            "Aurora Antiquesls_namesake",
        ]);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByText(/Diese Liste ist/)).not.toBeInTheDocument();
    });

    it("disables the request while the next page loads", () => {
        state.hasMore = true;
        state.isLoadingMore = true;
        render(<PartnerListingSourcesSection />);
        expect(
            screen.getByRole("button", { name: "Weitere Anbieter werden geladen…" }),
        ).toBeDisabled();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
    });

    it("keeps loaded grants when the next page fails and offers to request it again", async () => {
        state.hasMore = true;
        state.canLoadMore = true;
        state.isLoadMoreError = true;
        render(<PartnerListingSourcesSection />);
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Weitere Anbieter konnten nicht geladen werden. Diese Liste ist nicht vollständig.",
        );
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(state.loadMore).toHaveBeenCalledOnce();
        expect(state.retry).not.toHaveBeenCalled();
    });

    it("hides prior grants after sign-out", () => {
        const { rerender } = render(<PartnerListingSourcesSection />);
        auth.isAuthenticated = false;
        rerender(<PartnerListingSourcesSection />);
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
        expect(useSources).toHaveBeenLastCalledWith(false);
    });
});
