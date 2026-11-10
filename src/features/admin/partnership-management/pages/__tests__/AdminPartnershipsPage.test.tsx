import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminPartnershipSummary } from "@/data/internal/partnership/AdminPartnership.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartnershipsPage } from "../AdminPartnershipsPage.tsx";

const mocks = vi.hoisted(() => ({ list: vi.fn(), dialog: vi.fn() }));
vi.mock("../../api/useAdminPartnerships.ts", () => ({ useAdminPartnerships: mocks.list }));
vi.mock("../../components/AdminPartnershipDetailDialog.tsx", () => ({
    AdminPartnershipDetailDialog: (props: { partnershipId?: string; summary?: unknown }) => {
        mocks.dialog(props);
        return null;
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const summary: AdminPartnershipSummary = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
    memberCount: 120,
    listingSourceGrantCount: 101,
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

function listResult(overrides: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items: [summary], pageSize: 21 }] },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        ...overrides,
    };
}

describe("AdminPartnershipsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockReturnValue(listResult());
    });

    it("shows the loaded count, never the page size, beside complete member and grant counts", () => {
        render(<AdminPartnershipsPage search={{}} onSearchChange={vi.fn()} />);
        expect(
            screen.getByRole("heading", { level: 1, name: t("adminPartnerships.pageTitle") }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminCommon.result.loaded", { loaded: "1" })),
        ).toBeInTheDocument();
        expect(screen.queryByText(/21/)).toBeNull();
        expect(screen.getByText("pty_01 · atelier")).toBeInTheDocument();
        expect(screen.getByText("120")).toBeInTheDocument();
        expect(screen.getByText("101")).toBeInTheDocument();
        expect(screen.queryByRole("combobox", { name: t("adminCommon.sort") })).toBeNull();
    });

    it("opens a partnership through the URL and keeps the list filters", async () => {
        const onSearchChange = vi.fn();
        render(
            <AdminPartnershipsPage
                search={{ memberUserId: "usr_1" }}
                onSearchChange={onSearchChange}
            />,
        );
        await userEvent.click(
            screen.getByRole("button", {
                name: t("adminPartnerships.list.open", { name: "Atelier House" }),
            }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({
            memberUserId: "usr_1",
            partnership: "psh_01",
        });
    });

    it("opens the dialog from the URL without changing the list query", () => {
        render(
            <AdminPartnershipsPage
                search={{ partyId: "pty_01", partnership: "psh_01" }}
                onSearchChange={vi.fn()}
            />,
        );
        expect(mocks.list).toHaveBeenCalledWith({ partyId: "pty_01" });
        expect(mocks.dialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ partnershipId: "psh_01", summary }),
        );
    });

    it("filters by exact IDs from the panel and rejects overlong IDs", async () => {
        const user = userEvent.setup();
        const onSearchChange = vi.fn();
        render(<AdminPartnershipsPage search={{}} onSearchChange={onSearchChange} />);

        await user.click(screen.getByRole("button", { name: t("adminPartnerships.filters.byId") }));
        const organization = screen.getByLabelText(t("adminPartnerships.filters.organizationId"));
        await user.type(organization, "x".repeat(129));
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(onSearchChange).not.toHaveBeenCalled();
        expect(organization).toHaveAccessibleDescription(
            t("adminPartnerships.validation.idTooLong"),
        );

        await user.clear(organization);
        await user.type(organization, " pty_01 ");
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(onSearchChange).toHaveBeenCalledWith({ partyId: "pty_01" });
    });

    it("removes an ID filter through its chip", async () => {
        const onSearchChange = vi.fn();
        render(
            <AdminPartnershipsPage
                search={{ partyId: "pty_01", listingSourceId: "ls_1" }}
                onSearchChange={onSearchChange}
            />,
        );
        const label = `${t("adminPartnerships.filters.listingSourceId")}: ls_1`;
        await userEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", { filter: label }),
            }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({ partyId: "pty_01" });
    });

    it("offers Reset filters when nothing matches", async () => {
        const onSearchChange = vi.fn();
        mocks.list.mockReturnValue(listResult({ data: { pages: [{ items: [] }] } }));
        render(
            <AdminPartnershipsPage search={{ partyId: "pty_x" }} onSearchChange={onSearchChange} />,
        );
        expect(screen.getByText(t("adminPartnerships.noMatches"))).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({});
    });

    it("loads more while a cursor remains", async () => {
        const fetchNextPage = vi.fn();
        mocks.list.mockReturnValue(listResult({ hasNextPage: true, fetchNextPage }));
        render(<AdminPartnershipsPage search={{}} onSearchChange={vi.fn()} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminPartnerships.list.loadMorePartnerships") }),
        );
        expect(fetchNextPage).toHaveBeenCalled();
    });
});
