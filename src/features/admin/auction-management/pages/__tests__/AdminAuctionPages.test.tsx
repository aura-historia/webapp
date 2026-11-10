import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { AdminAuction } from "@/data/internal/auction/AdminAuction.ts";
import { AdminAuctionRequestError } from "../../api/useAdminAuctions.ts";
import { AdminAuctionCreatePage } from "../AdminAuctionCreatePage.tsx";
import { AdminAuctionDetailPage } from "../AdminAuctionDetailPage.tsx";
import { AdminAuctionsPage } from "../AdminAuctionsPage.tsx";

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    toastSuccess: vi.fn(),
    useAdminAuction: vi.fn(),
    useAdminAuctions: vi.fn(),
    useAdminAuctionListingSources: vi.fn(),
    useCreateAdminAuction: vi.fn(),
    useUpdateAdminAuction: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        params,
        search,
        className,
        "aria-label": ariaLabel,
    }: {
        children: ReactNode;
        to: string;
        params?: Record<string, string>;
        search?: Record<string, string>;
        className?: string;
        "aria-label"?: string;
    }) => {
        const path = to.replace("$auctionId", params?.auctionId ?? "$auctionId");
        const query = search ? `?${new URLSearchParams(search)}` : "";
        return (
            <a href={`${path}${query}`} className={className} aria-label={ariaLabel}>
                {children}
            </a>
        );
    },
    useNavigate: () => mocks.navigate,
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: vi.fn() } }));
vi.mock("../../api/useAdminAuctions.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../api/useAdminAuctions.ts")>()),
    useAdminAuction: mocks.useAdminAuction,
    useAdminAuctions: mocks.useAdminAuctions,
    useAdminAuctionListingSources: mocks.useAdminAuctionListingSources,
    useCreateAdminAuction: mocks.useCreateAdminAuction,
    useUpdateAdminAuction: mocks.useUpdateAdminAuction,
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const auction: AdminAuction = {
    auctionId: "auc_01",
    listingSourceId: "ls_01",
    sourceAuctionId: "sale-2026",
    name: { text: "Autumn Sale", language: "en" },
    catalogueUrl: null,
    format: null,
    schedule: { biddingOpens: null, liveStarts: null, lotsBeginClosing: null, scheduledEnd: null },
    reportedStatus: null,
    reportedLotCount: null,
    expectedVersion: 4,
    created: new Date("2026-10-01T00:00:00Z"),
    updated: new Date("2026-10-02T00:00:00Z"),
};

function mutation(overrides: Record<string, unknown> = {}) {
    return {
        mutateAsync: vi.fn(),
        reset: vi.fn(),
        isPending: false,
        error: null,
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

function auctionsQuery(overrides: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items: [auction] }] },
        isPending: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isFetchNextPageError: false,
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
        ...overrides,
    };
}

describe("AdminAuctionsPage", () => {
    function renderPage(filters = {}) {
        const onFiltersChange = vi.fn();
        render(
            <AdminAuctionsPage language="en" filters={filters} onFiltersChange={onFiltersChange} />,
        );
        return onFiltersChange;
    }

    it("lists auctions with their source identity and links each to its record", () => {
        mocks.useAdminAuctions.mockReturnValue(
            auctionsQuery({
                data: {
                    pages: [
                        { items: [auction], searchAfter: "cursor-1" },
                        {
                            items: [
                                {
                                    ...auction,
                                    auctionId: "auc_02",
                                    sourceAuctionId: "sale-unnamed",
                                    name: null,
                                    format: "LIVE",
                                    reportedStatus: "ENDED",
                                },
                            ],
                        },
                    ],
                },
            }),
        );
        renderPage({ query: "sale" });

        expect(mocks.useAdminAuctions).toHaveBeenCalledWith({ query: "sale" });
        expect(
            screen.getByRole("heading", { level: 1, name: t("adminNavigation.items.auctions") }),
        ).toBeInTheDocument();
        expect(screen.getByText(t("adminCommon.result.loaded", { loaded: "2" }))).toHaveAttribute(
            "role",
            "status",
        );
        const list = within(
            screen.getByRole("list", { name: t("adminNavigation.items.auctions") }),
        );
        expect(list.getByText(t("adminAuctions.list.noName"))).toBeInTheDocument();
        expect(list.getByText("sale-unnamed")).toBeInTheDocument();
        expect(list.getAllByText("ls_01")).toHaveLength(2);
        expect(list.getByText(t("adminAuctions.formatLabels.LIVE"))).toBeInTheDocument();
        expect(list.getByText(t("adminAuctions.reportedStatuses.ENDED"))).toBeInTheDocument();
        expect(list.getByText(t("adminAuctions.fields.notSet"))).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: t("adminAuctions.list.openLabel", { label: "Autumn Sale" }),
            }),
        ).toHaveAttribute("href", "/$lng/admin/auctions/auc_01");
        expect(
            screen.getByRole("link", {
                name: t("adminAuctions.list.openLabel", { label: "sale-unnamed" }),
            }),
        ).toHaveAttribute("href", "/$lng/admin/auctions/auc_02");
        expect(screen.getByText(t("adminAuctions.list.end"))).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("adminAuctions.list.loadMore") }),
        ).not.toBeInTheDocument();
    });

    it("loads the next page on request", () => {
        const query = auctionsQuery({ hasNextPage: true });
        mocks.useAdminAuctions.mockReturnValue(query);
        renderPage();

        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.list.loadMore") }));

        expect(query.fetchNextPage).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(t("adminAuctions.list.end"))).not.toBeInTheDocument();
    });

    it("applies the search on Enter and the panel filters with trimmed values", async () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        const user = userEvent.setup();
        const onFiltersChange = renderPage({ format: "TIMED" });

        await user.type(
            screen.getByRole("searchbox", { name: t("adminAuctions.filters.query") }),
            "  autumn {Enter}",
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({ format: "TIMED", query: "autumn" });

        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.sourceId")), {
            target: { value: " ls_01 " },
        });
        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.sourceAuctionId")), {
            target: { value: " sale-2026 " },
        });
        fireEvent.change(screen.getByLabelText(t("adminAuctions.filters.pageSize")), {
            target: { value: "50" },
        });
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));

        expect(onFiltersChange).toHaveBeenLastCalledWith({
            format: "TIMED",
            listingSourceId: "ls_01",
            sourceAuctionId: "sale-2026",
            size: 50,
        });
        expect(
            screen.queryByRole("button", { name: t("adminCommon.filters.apply") }),
        ).not.toBeInTheDocument();
    });

    it("sorts, keeping the default ordering out of the filters", () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        const onFiltersChange = renderPage({ sort: "name", order: "asc" });

        const sort = screen.getByRole("combobox", { name: t("adminCommon.sort") });
        expect(sort).toHaveValue("name:asc");
        fireEvent.change(sort, { target: { value: "created:desc" } });
        expect(onFiltersChange).toHaveBeenLastCalledWith({ sort: "created", order: "desc" });

        fireEvent.change(sort, { target: { value: "updated:desc" } });
        expect(onFiltersChange).toHaveBeenLastCalledWith({ sort: undefined, order: undefined });
    });

    it("shows every active filter as a removable chip and clears all but the order", () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        const onFiltersChange = renderPage({
            query: "sale",
            reportedStatus: "POSTPONED",
            listingSourceId: "ls_01",
            sort: "name",
            order: "desc",
        });

        const statusChip = t("adminAuctions.filters.chip", {
            label: t("adminAuctions.fields.status"),
            value: t("adminAuctions.reportedStatuses.POSTPONED"),
        });
        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", { filter: statusChip }),
            }),
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ reportedStatus: undefined, query: "sale" }),
        );

        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearAll") }));
        expect(onFiltersChange).toHaveBeenLastCalledWith({ sort: "name", order: "desc" });
    });

    it("shows loading, empty, no-match and retryable error states", () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery({ isPending: true, data: undefined }));
        const loading = render(
            <AdminAuctionsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );
        expect(screen.getByRole("status", { name: t("adminAuctions.list.loading") })).toBeVisible();
        loading.unmount();

        mocks.useAdminAuctions.mockReturnValue(auctionsQuery({ data: { pages: [{ items: [] }] } }));
        const empty = render(
            <AdminAuctionsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );
        expect(
            screen.getByRole("heading", { name: t("adminAuctions.list.none") }),
        ).toBeInTheDocument();
        empty.unmount();

        const onFiltersChange = vi.fn();
        const noMatch = render(
            <AdminAuctionsPage
                language="en"
                filters={{ format: "LIVE", sort: "name", order: "asc" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        expect(
            screen.getByRole("heading", { name: t("adminAuctions.list.noMatches") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }));
        expect(onFiltersChange).toHaveBeenCalledWith({ sort: "name", order: "asc" });
        noMatch.unmount();

        const failed = auctionsQuery({
            data: undefined,
            error: new AdminAuctionRequestError(
                t("adminAuctions.errors.unavailable"),
                503,
                "search",
            ),
        });
        mocks.useAdminAuctions.mockReturnValue(failed);
        renderPage();
        expect(screen.getByRole("alert")).toHaveTextContent(t("adminAuctions.list.loadFailed"));
        expect(screen.queryByText(t("adminAuctions.errors.unavailable"))).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(failed.refetch).toHaveBeenCalled();
    });

    it("links to the create page", () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        renderPage();

        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.create") }),
        ).toHaveAttribute("href", "/$lng/admin/auctions/new");
    });
});

describe("AdminAuctionCreatePage", () => {
    const source = {
        listingSourceId: "ls_01",
        listingSourceSlugId: "antique-house",
        name: "Antique House",
        operator: {
            partyId: "pty_01",
            partySlugId: "antique-house-ltd",
            name: "Antique House Ltd",
        },
    };

    beforeEach(() => {
        mocks.useAdminAuctionListingSources.mockReturnValue({
            data: { pages: [{ items: [source] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
    });

    it("requires a listing source and a source auction ID before creating", async () => {
        const create = mutation();
        mocks.useCreateAdminAuction.mockReturnValue(create);
        render(<AdminAuctionCreatePage language="en" />);

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminAuctions.create.heading") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.actions.create") }));

        expect(
            await screen.findByText(t("adminAuctions.validation.sourceRequired")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminAuctions.validation.sourceAuctionIdRequired")),
        ).toBeInTheDocument();
        expect(create.mutateAsync).not.toHaveBeenCalled();
    });

    it("creates the auction for the selected source and opens its record", async () => {
        const create = mutation({ mutateAsync: vi.fn().mockResolvedValue(auction) });
        mocks.useCreateAdminAuction.mockReturnValue(create);
        render(<AdminAuctionCreatePage language="en" />);

        fireEvent.change(screen.getByLabelText(t("adminAuctions.sourceSearch.label")), {
            target: { value: "antique" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /Antique House/ }));
        expect(
            screen.getByRole("button", { name: t("adminAuctions.actions.clearSource") }),
        ).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.sourceAuctionId")), {
            target: { value: " sale-2026 " },
        });
        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.actions.create") }));

        await waitFor(() =>
            expect(create.mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    listingSourceId: "ls_01",
                    sourceAuctionId: "sale-2026",
                }),
            ),
        );
        await waitFor(() =>
            expect(mocks.navigate).toHaveBeenCalledWith({
                to: "/$lng/admin/auctions/$auctionId",
                params: { lng: "en", auctionId: "auc_01" },
            }),
        );
        expect(mocks.toastSuccess).toHaveBeenCalledWith(t("adminAuctions.toasts.created"));
    });

    it("shows the duplicate source key conflict with a link to the prefiltered directory", () => {
        mocks.useCreateAdminAuction.mockReturnValue(
            mutation({
                variables: { listingSourceId: "ls_01", sourceAuctionId: "sale-2026" },
                error: new AdminAuctionRequestError(
                    t("adminAuctions.errors.duplicateSourceKey"),
                    409,
                    "create",
                ),
            }),
        );
        render(<AdminAuctionCreatePage language="en" />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminAuctions.errors.duplicateShort"),
        );
        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.openExisting") }),
        ).toHaveAttribute(
            "href",
            "/$lng/admin/auctions?listingSource=ls_01&sourceAuctionId=sale-2026",
        );
    });

    it("shows other create errors without a lookup link", () => {
        mocks.useCreateAdminAuction.mockReturnValue(
            mutation({
                variables: { listingSourceId: "ls_01", sourceAuctionId: "sale-2026" },
                error: new AdminAuctionRequestError(
                    t("adminAuctions.errors.invalid"),
                    400,
                    "create",
                ),
            }),
        );
        render(<AdminAuctionCreatePage language="en" />);

        expect(screen.getByRole("alert")).toHaveTextContent(t("adminAuctions.errors.invalid"));
        expect(
            screen.queryByRole("link", { name: t("adminAuctions.actions.openExisting") }),
        ).not.toBeInTheDocument();
    });
});

describe("AdminAuctionDetailPage", () => {
    it("shows a missing record with a way back and Try again", () => {
        const refetch = vi.fn();
        mocks.useAdminAuction.mockReturnValue({
            isPending: false,
            data: undefined,
            error: new AdminAuctionRequestError(t("adminAuctions.errors.missing"), 404, "read"),
            refetch,
        });
        mocks.useUpdateAdminAuction.mockReturnValue(mutation());
        render(<AdminAuctionDetailPage auctionId="auc_missing" language="en" />);

        expect(
            screen.getByRole("heading", { name: t("adminAuctions.detail.notFound") }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.allAuctions") }),
        ).toHaveAttribute("href", "/$lng/admin/auctions");
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("hides the record and Try again when access is denied", () => {
        mocks.useAdminAuction.mockReturnValue({
            isPending: false,
            data: auction,
            error: new AdminAuctionRequestError(t("adminAuctions.errors.forbidden"), 403, "read"),
            refetch: vi.fn(),
        });
        mocks.useUpdateAdminAuction.mockReturnValue(mutation());
        render(<AdminAuctionDetailPage auctionId="auc_01" language="en" />);

        expect(
            screen.getByRole("heading", { name: t("adminAuctions.errors.forbidden") }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Autumn Sale")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("adminCommon.retry") }),
        ).not.toBeInTheDocument();
    });

    it("shows the fixed identity and saves with the loaded expectedVersion", async () => {
        const update = mutation({
            mutateAsync: vi.fn().mockResolvedValue({ ...auction, expectedVersion: 5 }),
        });
        mocks.useAdminAuction.mockReturnValue({ isPending: false, data: auction, error: null });
        mocks.useUpdateAdminAuction.mockReturnValue(update);
        render(<AdminAuctionDetailPage auctionId="auc_01" language="en" />);

        expect(screen.getByRole("heading", { level: 1, name: "Autumn Sale" })).toBeInTheDocument();
        const identity = within(
            screen.getByRole("region", { name: new RegExp(t("adminAuctions.sections.identity")) }),
        );
        expect(identity.getByText("sale-2026")).toBeInTheDocument();
        expect(identity.getByText(t("adminAuctions.detail.fixed"))).toBeInTheDocument();
        expect(
            screen.queryByRole("textbox", { name: t("adminAuctions.fields.sourceAuctionId") }),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("radio", { name: t("adminAuctions.formatLabels.LIVE") }));
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.save") }));

        await waitFor(() =>
            expect(update.mutateAsync).toHaveBeenCalledWith({
                values: expect.objectContaining({ name: "Autumn Sale", format: "LIVE" }),
                expectedVersion: 4,
            }),
        );
        await waitFor(() =>
            expect(mocks.toastSuccess).toHaveBeenCalledWith(t("adminAuctions.toasts.saved")),
        );
    });

    it("clears a schedule time on its own", async () => {
        const update = mutation({ mutateAsync: vi.fn().mockResolvedValue(auction) });
        mocks.useAdminAuction.mockReturnValue({
            isPending: false,
            data: {
                ...auction,
                schedule: {
                    ...auction.schedule,
                    biddingOpens: new Date("2026-11-14T09:00:00Z"),
                    scheduledEnd: new Date("2026-11-21T20:00:00Z"),
                },
            },
            error: null,
        });
        mocks.useUpdateAdminAuction.mockReturnValue(update);
        render(<AdminAuctionDetailPage auctionId="auc_01" language="en" />);

        const label = t("adminAuctions.schedule.biddingOpens");
        expect(screen.getByLabelText(label)).toHaveValue("2026-11-14T09:00");
        fireEvent.click(
            screen.getByRole("button", { name: t("adminAuctions.actions.clearTime", { label }) }),
        );
        expect(screen.getByLabelText(label)).toHaveValue("");
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.save") }));

        await waitFor(() =>
            expect(update.mutateAsync).toHaveBeenCalledWith({
                values: expect.objectContaining({
                    biddingOpens: "",
                    scheduledEnd: "2026-11-21T20:00",
                }),
                expectedVersion: 4,
            }),
        );
    });

    it("offers to load the latest record after a stale version conflict", async () => {
        const refetch = vi
            .fn()
            .mockResolvedValue({ data: { ...auction, name: null, expectedVersion: 6 } });
        const update = mutation({
            error: new AdminAuctionRequestError(
                t("adminAuctions.errors.staleVersion"),
                409,
                "update",
            ),
        });
        mocks.useAdminAuction.mockReturnValue({
            isPending: false,
            data: auction,
            error: null,
            refetch,
        });
        mocks.useUpdateAdminAuction.mockReturnValue(update);
        render(<AdminAuctionDetailPage auctionId="auc_01" language="en" />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminAuctions.errors.changedElsewhere"),
        );
        fireEvent.click(
            screen.getByRole("button", { name: t("adminAuctions.actions.loadLatest") }),
        );

        await waitFor(() => expect(update.reset).toHaveBeenCalled());
        expect(screen.getByLabelText(t("adminAuctions.fields.name"))).toHaveValue("");
    });
});
