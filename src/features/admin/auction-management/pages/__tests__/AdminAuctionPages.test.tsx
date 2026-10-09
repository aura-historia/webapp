import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    useAdminAuctionListingSources: vi.fn(),
    useCreateAdminAuction: vi.fn(),
    useUpdateAdminAuction: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        className,
    }: {
        children: ReactNode;
        to: string;
        className?: string;
    }) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
    useNavigate: () => mocks.navigate,
}));
vi.mock("../../api/useAdminAuctions.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../api/useAdminAuctions.ts")>()),
    useAdminAuction: mocks.useAdminAuction,
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

describe("AdminAuctionsPage", () => {
    it("links to the create page and opens a record by trimmed ID", () => {
        render(<AdminAuctionsPage language="en" />);

        expect(
            screen.getByRole("link", { name: t("adminAuctions.actions.create") }),
        ).toHaveAttribute("href", "/$lng/admin/auctions/new");

        const open = screen.getByRole("button", { name: t("adminAuctions.actions.open") });
        expect(open).toBeDisabled();
        fireEvent.change(screen.getByLabelText(t("adminAuctions.fields.auctionId")), {
            target: { value: "  auc_01  " },
        });
        fireEvent.click(open);

        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/admin/auctions/$auctionId",
            params: { lng: "en", auctionId: "auc_01" },
        });
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

    it("shows the duplicate source key conflict", () => {
        mocks.useCreateAdminAuction.mockReturnValue(
            mutation({
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
