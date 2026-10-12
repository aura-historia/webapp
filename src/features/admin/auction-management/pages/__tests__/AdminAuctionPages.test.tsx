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
vi.mock("../../api/useAdminAuctions.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../api/useAdminAuctions.ts")>()),
    useAdminAuction: mocks.useAdminAuction,
    useAdminAuctions: mocks.useAdminAuctions,
    useAdminAuctionListingSources: mocks.useAdminAuctionListingSources,
    useCreateAdminAuction: mocks.useCreateAdminAuction,
    useUpdateAdminAuction: mocks.useUpdateAdminAuction,
}));

const t = (key: string) => testI18n.t(key);

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
        expect(screen.getByText("Autumn Sale")).toHaveAttribute("lang", "en");
        expect(screen.getByText(t("adminAuctions.list.noName"))).toBeInTheDocument();
        expect(screen.getByText("sale-unnamed")).toBeInTheDocument();
        const list = within(screen.getByRole("list"));
        expect(list.getByText(new RegExp(t("adminAuctions.formats.LIVE")))).toBeInTheDocument();
        expect(
            list.getByText(new RegExp(t("adminAuctions.reportedStatuses.ENDED"))),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: testI18n.t("adminAuctions.list.openLabel", { label: "Autumn Sale" }),
            }),
        ).toHaveAttribute("href", "/$lng/admin/auctions/auc_01");
        expect(
            screen.getByRole("link", {
                name: testI18n.t("adminAuctions.list.openLabel", { label: "sale-unnamed" }),
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

    it("applies trimmed filters, an explicit sort and page size", async () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        const user = userEvent.setup();
        const onFiltersChange = renderPage();

        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.listingSourceId")), {
            target: { value: " ls_01 " },
        });
        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.sourceAuctionId")), {
            target: { value: " sale-2026 " },
        });
        await user.click(screen.getByRole("combobox", { name: t("adminAuctions.filters.sort") }));
        await user.click(screen.getByRole("option", { name: t("adminAuctions.sort.name_asc") }));
        await user.click(
            screen.getByRole("combobox", { name: t("adminAuctions.filters.pageSize") }),
        );
        await user.click(screen.getByRole("option", { name: "50" }));
        await user.click(screen.getByRole("button", { name: t("adminAuctions.filters.apply") }));

        await waitFor(() =>
            expect(onFiltersChange).toHaveBeenCalledWith({
                listingSourceId: "ls_01",
                sourceAuctionId: "sale-2026",
                sort: "name",
                order: "asc",
                size: 50,
            }),
        );
    });

    it("keeps the default ordering and size out of applied filters and resets to defaults", async () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery());
        const onFiltersChange = renderPage({ format: "TIMED", sort: "name", order: "desc" });

        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.filters.reset") }));
        expect(onFiltersChange).toHaveBeenLastCalledWith({});

        fireEvent.change(screen.getByLabelText(t("adminAuctions.filters.query")), {
            target: { value: "  " },
        });
        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.filters.apply") }));
        await waitFor(() => expect(onFiltersChange).toHaveBeenLastCalledWith({}));
    });

    it("shows loading, empty and retryable error states", () => {
        mocks.useAdminAuctions.mockReturnValue(auctionsQuery({ isPending: true, data: undefined }));
        const { unmount } = render(
            <AdminAuctionsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );
        expect(screen.getByText(t("adminAuctions.list.loading"))).toBeInTheDocument();
        unmount();

        mocks.useAdminAuctions.mockReturnValue(auctionsQuery({ data: { pages: [{ items: [] }] } }));
        const empty = render(
            <AdminAuctionsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );
        expect(screen.getByText(t("adminAuctions.list.empty"))).toBeInTheDocument();
        empty.unmount();

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
        expect(screen.getByRole("alert")).toHaveTextContent(t("adminAuctions.errors.unavailable"));
        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.actions.retry") }));
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

    it("requires a listing source before creating", async () => {
        const create = mutation();
        mocks.useCreateAdminAuction.mockReturnValue(create);
        render(<AdminAuctionCreatePage language="en" />);

        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.actions.create") }));

        expect(
            await screen.findByText(t("adminAuctions.validation.sourceRequired")),
        ).toBeInTheDocument();
        expect(create.mutateAsync).not.toHaveBeenCalled();
    });

    it("creates the auction for the selected source and opens its record", async () => {
        const create = mutation({ mutateAsync: vi.fn().mockResolvedValue(auction) });
        mocks.useCreateAdminAuction.mockReturnValue(create);
        render(<AdminAuctionCreatePage language="en" />);

        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.searchListingSources")), {
            target: { value: "antique" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /Antique House/ }));
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
    });

    it("shows the duplicate source key conflict with an exact lookup link", () => {
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
            t("adminAuctions.errors.duplicateSourceKey"),
        );
        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.findExisting") }),
        ).toHaveAttribute(
            "href",
            "/$lng/admin/auctions?listingSource=ls_01&sourceAuctionId=sale-2026",
        );
    });

    it("offers no lookup link for other create errors", () => {
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

        expect(
            screen.queryByRole("link", { name: t("adminAuctions.actions.findExisting") }),
        ).not.toBeInTheDocument();
    });
});

describe("AdminAuctionDetailPage", () => {
    it("shows a missing record with a way back", () => {
        mocks.useAdminAuction.mockReturnValue({
            isPending: false,
            data: undefined,
            error: new AdminAuctionRequestError(t("adminAuctions.errors.missing"), 404, "read"),
        });
        mocks.useUpdateAdminAuction.mockReturnValue(mutation());
        render(<AdminAuctionDetailPage auctionId="auc_missing" language="en" />);

        expect(
            screen.getByRole("heading", { name: t("adminAuctions.errors.missing") }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.backToOverview") }),
        ).toHaveAttribute("href", "/$lng/admin/auctions");
    });

    it("shows immutable identity and saves with the loaded expectedVersion", async () => {
        const update = mutation({
            mutateAsync: vi.fn().mockResolvedValue({ ...auction, expectedVersion: 5 }),
        });
        mocks.useAdminAuction.mockReturnValue({ isPending: false, data: auction, error: null });
        mocks.useUpdateAdminAuction.mockReturnValue(update);
        render(<AdminAuctionDetailPage auctionId="auc_01" language="en" />);

        expect(screen.getByText("sale-2026")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminAuctions.actions.save") }));

        await waitFor(() =>
            expect(update.mutateAsync).toHaveBeenCalledWith({
                values: expect.objectContaining({ name: "Autumn Sale" }),
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

        expect(screen.getByText(t("adminAuctions.errors.staleVersionHelp"))).toBeInTheDocument();
        fireEvent.click(
            screen.getByRole("button", { name: t("adminAuctions.actions.loadLatest") }),
        );

        await waitFor(() => expect(update.reset).toHaveBeenCalled());
        expect(screen.getByLabelText(t("adminAuctions.fields.name"))).toHaveValue("");
    });
});
