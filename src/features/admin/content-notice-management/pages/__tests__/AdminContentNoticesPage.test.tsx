import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminContentNoticeSummary } from "@/data/internal/content-notice/AdminContentNotice.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminContentNoticeRequestError } from "../../api/useAdminContentNotices.ts";
import { AdminContentNoticesPage } from "../AdminContentNoticesPage.tsx";

const mocks = vi.hoisted(() => ({ list: vi.fn(), dialog: vi.fn() }));
vi.mock("../../api/useAdminContentNotices.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../api/useAdminContentNotices.ts")>()),
    useAdminContentNotices: mocks.list,
}));
vi.mock("../../components/AdminContentNoticeDialog.tsx", () => ({
    AdminContentNoticeDialog: (props: { noticeId?: string; summary?: unknown }) => {
        mocks.dialog(props);
        return null;
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const listingNotice: AdminContentNoticeSummary = {
    id: "ntc_1",
    state: "SUBMITTED",
    created: new Date("2026-11-21T16:42:00Z"),
    target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "pl_1" },
    listingSourceName: "Galerie Lenbach",
    productListingTitle: "Biedermeier secretary",
    partner: true,
    role: "RIGHTS_HOLDER",
    reason: "RIGHTS_INFRINGEMENT",
    submitterName: "Anna Keller",
    submitterEmail: "anna@example.com",
};
const anonymousSourceNotice: AdminContentNoticeSummary = {
    id: "ntc_2",
    state: "SUBMITTED",
    created: new Date("2026-11-20T08:14:00Z"),
    target: { type: "LISTING_SOURCE", listingSourceId: "ls_2" },
    listingSourceName: "Casa d’Aste Bellini",
    partner: false,
    role: "ILLEGAL_CONTENT_REPORTER",
    reason: "ILLEGAL_CONTENT",
};

function listResult(overrides: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items: [listingNotice, anonymousSourceNotice] }] },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        ...overrides,
    };
}

function renderPage(search = {}, onSearchChange = vi.fn()) {
    render(
        <AdminContentNoticesPage search={search} language="en" onSearchChange={onSearchChange} />,
    );
    return onSearchChange;
}

describe("AdminContentNoticesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockReturnValue(listResult());
    });

    it("lists notices with the content, reason, notifier and the loaded count", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminContentNotices.pageTitle") }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminCommon.result.loaded", { loaded: "2" })),
        ).toBeInTheDocument();
        // Phone card and desktop cells both render; CSS shows one of them.
        expect(screen.getAllByText("Biedermeier secretary").length).toBeGreaterThan(0);
        expect(
            screen.getAllByText(
                `${t("adminContentNotices.list.listingFrom", { source: "Galerie Lenbach" })} · ${t("adminContentNotices.list.partner")}`,
            ).length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText(t("adminContentNotices.reasons.rightsInfringement")).length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("Anna Keller").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Casa d’Aste Bellini").length).toBeGreaterThan(0);
        expect(screen.getAllByText(t("adminContentNotices.list.anonymous")).length).toBeGreaterThan(
            0,
        );
        expect(screen.getByText(t("adminContentNotices.list.end"))).toBeInTheDocument();
        expect(mocks.list).toHaveBeenCalledWith({});
    });

    it("opens a notice through the URL without changing the list filters", async () => {
        const onSearchChange = renderPage({ reason: "ILLEGAL_CONTENT" });

        await userEvent.click(
            screen.getByRole("button", {
                name: t("adminContentNotices.list.open", { name: "Biedermeier secretary" }),
            }),
        );

        expect(onSearchChange).toHaveBeenCalledWith({ reason: "ILLEGAL_CONTENT", notice: "ntc_1" });
        expect(mocks.list).toHaveBeenCalledWith({ reason: "ILLEGAL_CONTENT" });
    });

    it("passes the open notice and its row to the dialog", () => {
        renderPage({ notice: "ntc_2" });
        expect(mocks.dialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ noticeId: "ntc_2", summary: anonymousSourceNotice }),
        );
    });

    it("shows active filters as chips and resets them, keeping the sort", async () => {
        const onSearchChange = renderPage({ role: "PROVIDER", sourceId: "ls_9", order: "asc" });

        expect(
            screen.getByText(`${t("adminContentNotices.filters.listingSourceId")}: ls_9`),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminCommon.filters.clearAll") }),
        );

        expect(onSearchChange).toHaveBeenCalledWith({ order: "asc" });
    });

    it("says when there are no notices yet", () => {
        mocks.list.mockReturnValue(listResult({ data: { pages: [{ items: [] }] } }));
        renderPage();
        expect(
            screen.getByRole("heading", { name: t("adminContentNotices.emptyTitle") }),
        ).toBeInTheDocument();
    });

    it("offers to reset filters when none match", async () => {
        mocks.list.mockReturnValue(listResult({ data: { pages: [{ items: [] }] } }));
        const onSearchChange = renderPage({ reason: "OTHER" });
        expect(
            screen.getByRole("heading", { name: t("adminContentNotices.noMatches") }),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getAllByRole("button", { name: t("adminCommon.filters.clearSearch") })[0],
        );
        expect(onSearchChange).toHaveBeenCalledWith({});
    });

    it("offers Try again when the list fails", async () => {
        const refetch = vi.fn();
        mocks.list.mockReturnValue(
            listResult({
                data: undefined,
                error: new AdminContentNoticeRequestError("Failed", 500),
                refetch,
            }),
        );
        renderPage();
        expect(screen.getByRole("alert")).toHaveTextContent(t("adminContentNotices.loadFailed"));
        await userEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("explains a rejected filter and resets it", async () => {
        mocks.list.mockReturnValue(
            listResult({
                data: undefined,
                error: new AdminContentNoticeRequestError("Bad", 400),
            }),
        );
        const onSearchChange = renderPage({ sourceId: "not-an-id" });
        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminContentNotices.errors.filterRejected"),
        );
        await userEvent.click(
            screen.getAllByRole("button", { name: t("adminCommon.filters.clearSearch") })[0],
        );
        expect(onSearchChange).toHaveBeenCalledWith({});
    });
});
