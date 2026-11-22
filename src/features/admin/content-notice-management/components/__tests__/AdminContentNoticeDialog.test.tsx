import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminContentNotice } from "@/data/internal/content-notice/AdminContentNotice.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminContentNoticeDialog, safeExternalUrl } from "../AdminContentNoticeDialog.tsx";

const mocks = vi.hoisted(() => ({ detail: vi.fn() }));
vi.mock("../../api/useAdminContentNotices.ts", () => ({
    AdminContentNoticeRequestError: class extends Error {
        constructor(
            message: string,
            readonly status: number,
        ) {
            super(message);
        }
    },
    useAdminContentNotice: mocks.detail,
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        className,
        to,
        params,
        search,
    }: {
        children: ReactNode;
        className?: string;
        to: string;
        params?: Record<string, string>;
        search?: Record<string, string>;
    }) => {
        const path = Object.entries(params ?? {}).reduce(
            (href, [key, value]) => href.replace(`$${key}`, value),
            to,
        );
        const query = new URLSearchParams(search).toString();
        return (
            <a href={query ? `${path}?${query}` : path} className={className}>
                {children}
            </a>
        );
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const notice: AdminContentNotice = {
    id: "ntc_1",
    state: "SUBMITTED",
    created: new Date("2026-11-21T16:42:00Z"),
    updated: new Date("2026-11-21T16:43:00Z"),
    target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "pl_1" },
    snapshot: {
        listingSourceName: "Galerie Lenbach",
        listingSourceUrl: "https://lenbach.example",
        partner: true,
        productListingTitle: "Biedermeier secretary",
        productListingUrl: "https://lenbach.example/gl-1",
    },
    current: {
        listingSource: {
            exists: true,
            name: "Galerie Lenbach",
            slugId: "galerie-lenbach",
            ingestionMethods: ["WEB_CRAWL"],
            partner: true,
        },
        productListing: { exists: true, lifecycle: "ACTIVE" },
    },
    role: "RIGHTS_HOLDER",
    reason: "RIGHTS_INFRINGEMENT",
    explanation: "The photos are mine.\nThey were never licensed.",
    additionalUrls: ["https://photos.example/1", "javascript:alert(1)"],
    submitter: { name: "Anna Keller", email: "anna@example.com", language: "de" },
    receipt: { status: "DELIVERED", attempts: 1, deliveredAt: new Date("2026-11-21T16:43:00Z") },
};

function renderDialog(value: Partial<Record<string, unknown>> = {}) {
    mocks.detail.mockReturnValue({
        data: notice,
        isPending: false,
        error: null,
        refetch: vi.fn(),
        ...value,
    });
    render(<AdminContentNoticeDialog noticeId="ntc_1" language="en" onClose={vi.fn()} />);
    return screen.getByRole("dialog");
}

describe("AdminContentNoticeDialog", () => {
    beforeEach(() => vi.clearAllMocks());

    it("shows the notice, the reported content then and now, and the notifier", () => {
        const dialog = renderDialog();

        expect(
            within(dialog).getByRole("heading", { name: "Biedermeier secretary" }),
        ).toBeVisible();
        expect(
            within(dialog).getByText(t("adminContentNotices.detail.eyebrowListing")),
        ).toBeVisible();
        expect(within(dialog).getByText("ntc_1")).toBeVisible();
        expect(within(dialog).getByText(t("adminContentNotices.roles.rightsHolder"))).toBeVisible();
        expect(within(dialog).getByText(/The photos are mine\./)).toBeVisible();
        expect(within(dialog).getByText(t("adminContentNotices.content.active"))).toBeVisible();
        expect(within(dialog).getByText("anna@example.com")).toHaveAttribute(
            "href",
            "mailto:anna@example.com",
        );
        expect(within(dialog).getByText(t("adminContentNotices.receipt.delivered"))).toBeVisible();
        expect(
            within(dialog).getByRole("link", {
                name: t("adminContentNotices.content.openListing"),
            }),
        ).toHaveAttribute("href", "/en/admin/product-listings/pl_1");
        expect(
            within(dialog).getByRole("link", { name: t("adminContentNotices.content.openSource") }),
        ).toHaveAttribute("href", "/en/admin/listing-sources?source=ls_1");
        expect(
            within(dialog).getByRole("link", {
                name: t("adminContentNotices.content.moreAbout", { source: "Galerie Lenbach" }),
            }),
        ).toHaveAttribute("href", "/en/admin/content-notices?sourceId=ls_1");
    });

    it("links notifier URLs safely and never links a non-web address", () => {
        const dialog = renderDialog();
        const link = within(dialog).getByRole("link", { name: /photos\.example\/1/ });
        expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
        expect(link).toHaveAttribute("target", "_blank");
        expect(within(dialog).getByText("javascript:alert(1)").closest("a")).toBeNull();
    });

    it("says an anonymous notifier cannot be answered and offers no e-mail", () => {
        const dialog = renderDialog({
            data: {
                ...notice,
                submitter: { language: "it" },
                receipt: undefined,
                role: "ILLEGAL_CONTENT_REPORTER",
                reason: "ILLEGAL_CONTENT",
            },
        });
        expect(within(dialog).getByText(t("adminContentNotices.notifier.anonymous"))).toBeVisible();
        expect(
            within(dialog).queryByRole("link", { name: t("adminContentNotices.notifier.write") }),
        ).toBeNull();
    });

    it("marks a gone listing and source and drops their buttons", () => {
        const dialog = renderDialog({
            data: {
                ...notice,
                current: {
                    listingSource: { exists: false },
                    productListing: { exists: false },
                },
            },
        });
        expect(within(dialog).getAllByText(t("adminContentNotices.content.gone"))).toHaveLength(2);
        expect(
            within(dialog).queryByRole("link", {
                name: t("adminContentNotices.content.openListing"),
            }),
        ).toBeNull();
        expect(
            within(dialog).queryByRole("link", {
                name: t("adminContentNotices.content.openSource"),
            }),
        ).toBeNull();
    });

    it("tells the admin to answer from the mailbox when the receipt failed", () => {
        const dialog = renderDialog({
            data: { ...notice, receipt: { status: "FAILED", attempts: 3 } },
        });
        expect(
            within(dialog).getByText(t("adminContentNotices.receipt.failedNote", { count: 3 })),
        ).toBeVisible();
    });

    it("flags a changed partner status", () => {
        const dialog = renderDialog({
            data: {
                ...notice,
                current: {
                    ...notice.current,
                    listingSource: { ...notice.current.listingSource, partner: false },
                },
            },
        });
        expect(
            within(dialog).getByText(t("adminContentNotices.content.partnerNowNo")),
        ).toBeVisible();
    });

    it("explains a notice that does not exist", async () => {
        const { AdminContentNoticeRequestError } = await import(
            "../../api/useAdminContentNotices.ts"
        );
        const dialog = renderDialog({
            data: undefined,
            error: new AdminContentNoticeRequestError("missing", 404),
        });
        expect(
            within(dialog).getByRole("heading", { name: t("adminContentNotices.errors.missing") }),
        ).toBeVisible();
    });
});

describe("AdminContentNoticeDialog states", () => {
    beforeEach(() => vi.clearAllMocks());

    it("shows the row's header while the record loads", () => {
        mocks.detail.mockReturnValue({
            data: undefined,
            isPending: true,
            error: null,
            refetch: vi.fn(),
        });
        render(
            <AdminContentNoticeDialog
                noticeId="ntc_2"
                language="en"
                onClose={vi.fn()}
                summary={{
                    id: "ntc_2",
                    state: "SUBMITTED",
                    created: new Date("2026-11-20T08:14:00Z"),
                    target: { type: "LISTING_SOURCE", listingSourceId: "ls_2" },
                    listingSourceName: "Casa d’Aste Bellini",
                    partner: false,
                    role: "OTHER",
                    reason: "OTHER",
                }}
            />,
        );
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Casa d’Aste Bellini" })).toBeVisible();
        expect(
            within(dialog).getByText(t("adminContentNotices.detail.eyebrowSource")),
        ).toBeVisible();
        expect(within(dialog).getByText(t("adminContentNotices.loadingDetail"))).toBeVisible();
    });

    it("offers Try again when the record fails to load", async () => {
        const refetch = vi.fn();
        mocks.detail.mockReturnValue({
            data: undefined,
            isPending: false,
            error: new Error("Request failed"),
            refetch,
        });
        render(<AdminContentNoticeDialog noticeId="ntc_1" language="en" onClose={vi.fn()} />);
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Request failed")).toBeVisible();
        expect(
            within(dialog).getByRole("heading", {
                name: t("adminContentNotices.detail.fallbackTitle"),
            }),
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("closes from the not-found state", async () => {
        const { AdminContentNoticeRequestError } = await import(
            "../../api/useAdminContentNotices.ts"
        );
        const onClose = vi.fn();
        mocks.detail.mockReturnValue({
            data: undefined,
            isPending: false,
            error: new AdminContentNoticeRequestError("missing", 404),
            refetch: vi.fn(),
        });
        render(<AdminContentNoticeDialog noticeId="ntc_x" language="en" onClose={onClose} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminContentNotices.detail.back") }),
        );
        expect(onClose).toHaveBeenCalled();
    });

    it("shows an untitled listing, a withdrawn listing and receipts still on their way", () => {
        for (const status of ["PENDING", "PROCESSING"] as const) {
            mocks.detail.mockReturnValue({
                data: {
                    ...notice,
                    snapshot: { ...notice.snapshot, productListingTitle: undefined },
                    current: {
                        ...notice.current,
                        productListing: { exists: true, lifecycle: "WITHDRAWN" },
                    },
                    explanation: undefined,
                    additionalUrls: [],
                    submitter: { name: undefined, email: "x@example.com", language: "fr" },
                    receipt: { status, attempts: 0 },
                },
                isPending: false,
                error: null,
                refetch: vi.fn(),
            });
            const { unmount } = render(
                <AdminContentNoticeDialog noticeId="ntc_1" language="en" onClose={vi.fn()} />,
            );
            const dialog = screen.getByRole("dialog");
            expect(
                within(dialog).getAllByText(t("adminContentNotices.list.untitled")).length,
            ).toBeGreaterThan(0);
            expect(
                within(dialog).getByText(t("adminContentNotices.content.withdrawn")),
            ).toBeVisible();
            expect(
                within(dialog).getByText(t("adminContentNotices.notice.noExplanation")),
            ).toBeVisible();
            expect(
                within(dialog).getByText(t("adminContentNotices.notifier.noName")),
            ).toBeVisible();
            expect(
                within(dialog).getByText(
                    t(
                        status === "PENDING"
                            ? "adminContentNotices.receipt.pending"
                            : "adminContentNotices.receipt.processing",
                    ),
                ),
            ).toBeVisible();
            unmount();
        }
    });

    it("says no receipt was sent to a named notifier without e-mail", () => {
        mocks.detail.mockReturnValue({
            data: {
                ...notice,
                current: {
                    listingSource: { ...notice.current.listingSource, ingestionMethods: [] },
                },
                target: { type: "LISTING_SOURCE", listingSourceId: "ls_1" },
                submitter: { name: "Lena Holm", language: "de" },
                receipt: undefined,
            },
            isPending: false,
            error: null,
            refetch: vi.fn(),
        });
        render(<AdminContentNoticeDialog noticeId="ntc_1" language="en" onClose={vi.fn()} />);
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText(t("adminContentNotices.notifier.noEmail"))).toBeVisible();
        expect(within(dialog).getByText(t("adminContentNotices.receipt.noneNote"))).toBeVisible();
        expect(
            within(dialog).getAllByText(t("adminContentNotices.content.noIngestion")).length,
        ).toBeGreaterThan(0);
        expect(
            within(dialog).queryByRole("link", { name: t("adminContentNotices.notifier.write") }),
        ).toBeNull();
    });
});

describe("safeExternalUrl", () => {
    it("accepts web addresses only", () => {
        expect(safeExternalUrl("https://a.example/x")).toBe("https://a.example/x");
        expect(safeExternalUrl("http://a.example")).toBe("http://a.example/");
        expect(safeExternalUrl("javascript:alert(1)")).toBeUndefined();
        expect(safeExternalUrl("not a url")).toBeUndefined();
    });
});
