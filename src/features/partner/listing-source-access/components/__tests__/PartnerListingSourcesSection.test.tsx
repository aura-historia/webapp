import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
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
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const EMPTY_HEADING = "Noch keine Anbieter.";
const EMPTY_MESSAGE =
    "Sie haben noch keinen Zugriff auf einen Anbieter. Eine frühere Freigabe wurde möglicherweise widerrufen.";
const LOAD_ERROR =
    "Der Zugriff auf Anbieter konnte nicht geprüft werden. Die Zugriffsrechte können sich geändert haben. Bitte versuchen Sie es erneut.";

let rerenderSection: () => void = () => {};

/** Re-renders the section inside the test router, as a refetch or an auth change would. */
function Harness() {
    const [, setRenderCount] = useState(0);
    rerenderSection = () => setRenderCount((count) => count + 1);
    return <PartnerListingSourcesSection />;
}

async function renderSection() {
    renderWithRouter(<Harness />);
    await screen.findByRole("heading", { level: 1, name: "Ihre Anbieter." });
}

function rerender() {
    act(() => rerenderSection());
}

function providerCards() {
    const section = screen.getByRole("region", { name: "Mit Zugriff" });
    return within(section).getAllByRole("listitem");
}

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

    it("renders the page header with a link to apply for another provider", async () => {
        await renderSection();

        expect(
            screen.getByText(/Die Anbieter, für die Ihr Konto Angebote senden kann/),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Weiteren Anbieter beantragen" })).toHaveAttribute(
            "href",
            "/de/partners/applications?create=true",
        );
        expect(useSources).toHaveBeenCalledWith(true);
    });

    it("renders granted providers as minimal cards without edit controls", async () => {
        await renderSection();

        const section = screen.getByRole("region", { name: "Mit Zugriff" });
        expect(section).toHaveTextContent("1 Anbieter");
        const [card] = providerCards();
        expect(
            within(card).getByRole("heading", { level: 3, name: "Aurora Antiques" }),
        ).toBeVisible();
        expect(within(card).getByText("Zugriff")).toBeInTheDocument();
        expect(within(card).getByText("ls_dealer").tagName).toBe("CODE");
        expect(within(card).getAllByRole("button")).toHaveLength(1);
        expect(within(card).getAllByRole("link")).toHaveLength(1);
        expect(within(card).getByRole("link", { name: "Öffentliche Seite" })).toHaveAttribute(
            "href",
            "/de/shops/dealer",
        );
        expect(within(card).queryByRole("img")).not.toBeInTheDocument();
        expect(screen.getByText(/Zugriff ist kein Eigentum/)).toBeInTheDocument();
        expect(screen.queryByText(/Diese Liste ist/)).not.toBeInTheDocument();
    });

    it("copies a provider ID", async () => {
        const user = userEvent.setup();
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        await renderSection();

        await user.click(screen.getByRole("button", { name: "ID von Aurora Antiques kopieren" }));

        expect(writeText).toHaveBeenCalledWith("ls_dealer");
        expect(toast.success).toHaveBeenCalledWith("Anbieter-ID kopiert.");
    });

    it("says so when a provider ID cannot be copied", async () => {
        const user = userEvent.setup();
        const writeText = vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        await renderSection();

        await user.click(screen.getByRole("button", { name: "ID von Aurora Antiques kopieren" }));

        expect(toast.error).toHaveBeenCalledWith(
            "Die Anbieter-ID konnte nicht kopiert werden. Markieren und kopieren Sie sie manuell.",
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    it("renders a loading state while authentication resolves", async () => {
        auth.isAuthenticated = false;
        auth.isResolved = false;
        await renderSection();
        expect(screen.getByRole("status")).toHaveTextContent(
            "Freigegebene Anbieter werden geladen.",
        );
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenCalledWith(false);
    });

    it("renders a loading state during the first request", async () => {
        state.isPending = true;
        await renderSection();
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
    });

    it("explains empty or revoked access and links to the applications", async () => {
        state.sources = [];
        await renderSection();
        expect(screen.getByRole("heading", { name: EMPTY_HEADING })).toBeInTheDocument();
        expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Anträge ansehen" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
    });

    it("removes references when a refresh returns an empty grant list", async () => {
        await renderSection();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();

        state.sources = [];
        rerender();

        expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
    });

    it("hides cached grants on a failed refresh and offers retry", async () => {
        state.isError = true;
        await renderSection();
        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(LOAD_ERROR);
        expect(
            within(alert).getByRole("heading", { name: "Zugriff konnte nicht geprüft werden." }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(screen.queryByText("ls_dealer")).not.toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(state.retry).toHaveBeenCalledOnce();
    });

    it("says an unfinished list is incomplete and reaches the last page on demand", async () => {
        state.hasMore = true;
        state.canLoadMore = true;
        await renderSection();
        expect(screen.getByRole("region", { name: "Mit Zugriff" })).toHaveTextContent(
            "1 geladen · weitere verfügbar",
        );
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
        rerender();

        await screen.findByText("ls_namesake");
        expect(providerCards().map((card) => within(card).getByRole("code").textContent)).toEqual([
            "ls_dealer",
            "ls_namesake",
        ]);
        expect(screen.getByRole("region", { name: "Mit Zugriff" })).toHaveTextContent("2 Anbieter");
        expect(
            screen.queryByRole("button", { name: "Weitere Anbieter anzeigen" }),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/Diese Liste ist/)).not.toBeInTheDocument();
    });

    it("lists an incomplete account whose loaded page is empty instead of calling it empty", async () => {
        state.sources = [];
        state.hasMore = true;
        state.canLoadMore = true;
        await renderSection();

        expect(screen.queryByRole("heading", { name: EMPTY_HEADING })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Weitere Anbieter anzeigen" })).toBeEnabled();
    });

    it("disables the request while the next page loads", async () => {
        state.hasMore = true;
        state.isLoadingMore = true;
        await renderSection();
        expect(
            screen.getByRole("button", { name: "Weitere Anbieter werden geladen…" }),
        ).toBeDisabled();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
    });

    it("keeps loaded grants when the next page fails and offers to request it again", async () => {
        state.hasMore = true;
        state.canLoadMore = true;
        state.isLoadMoreError = true;
        await renderSection();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Weitere Anbieter konnten nicht geladen werden. Diese Liste ist nicht vollständig.",
        );
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(state.loadMore).toHaveBeenCalledOnce();
        expect(state.retry).not.toHaveBeenCalled();
    });

    it("hides prior grants after sign-out", async () => {
        await renderSection();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();

        auth.isAuthenticated = false;
        rerender();

        expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenLastCalledWith(false);
    });

    it("hides grants after sign-out even while the cached list still reports an error", async () => {
        await renderSection();
        auth.isAuthenticated = false;
        state.isError = true;
        rerender();

        expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
    });
});
