import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type {
    AdminPartnershipApplication,
    AdminPartnershipApplicationSummary,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { AdminPartnershipApplicationsSection } from "../AdminPartnershipApplicationsSection.tsx";
import { AdminApplicationDetailDialog } from "../AdminApplicationDetailDialog.tsx";

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    markInReview: vi.fn(),
    decide: vi.fn(),
}));
vi.mock("../../api/useAdminPartnershipApplications.ts", () => ({
    useAdminPartnershipApplications: mocks.list,
    useAdminPartnershipApplication: mocks.detail,
    useMarkAdminApplicationInReview: () => ({
        mutate: mocks.markInReview,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
    useDecideAdminApplication: () => ({
        mutate: mocks.decide,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, className }: { children: ReactNode; className?: string }) => (
        <a href="/admin/listing-sources" className={className}>
            {children}
        </a>
    ),
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const detail: AdminPartnershipApplication = {
    id: "pa_1",
    applicantUserId: "user_1",
    state: "SUBMITTED",
    proposal: {
        type: "PROPOSED_LISTING_SOURCE",
        party: { name: "Atelier Operator", email: "contact@example.com" },
        listingSource: { name: "Atelier Source", requestedIngestionMethods: ["WEB_CRAWL"] },
    },
};
const summary: AdminPartnershipApplicationSummary = {
    ...detail,
    created: new Date("2026-09-01T10:00:00Z"),
    updated: new Date("2026-09-02T10:00:00Z"),
};

function renderDialog(application: AdminPartnershipApplication, timestamps?: object) {
    mocks.detail.mockReturnValue({ data: application, isPending: false, error: null });
    return render(
        <AdminApplicationDetailDialog
            applicationId={application.id}
            timestamps={timestamps}
            open
            onOpenChange={vi.fn()}
        />,
    );
}

describe("admin partnership application review", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.detail.mockReturnValue({ data: undefined, isPending: true, error: null });
        mocks.list.mockReturnValue({
            data: { pages: [{ items: [summary], total: 1 }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
    });

    it("renders summaries with timestamps and applies filters", async () => {
        const onFiltersChange = vi.fn();
        render(
            <AdminPartnershipApplicationsSection filters={{}} onFiltersChange={onFiltersChange} />,
        );
        expect(screen.getByText("Atelier Source")).toBeInTheDocument();
        expect(
            screen.getByText(t("adminApplications.list.total", { count: 1 })),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("checkbox", { name: t("adminApplications.state.IN_REVIEW") }),
        );
        await userEvent.type(
            screen.getByLabelText(t("adminApplications.filters.applicantUserId")),
            "user_1",
        );
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.filters.apply") }),
        );
        expect(onFiltersChange).toHaveBeenCalledWith({
            states: ["IN_REVIEW"],
            applicantUserId: "user_1",
        });
    });

    it("offers a load-more action while a cursor remains", async () => {
        const fetchNextPage = vi.fn();
        mocks.list.mockReturnValue({
            data: { pages: [{ items: [summary] }] },
            isPending: false,
            error: null,
            hasNextPage: true,
            fetchNextPage,
        });
        render(<AdminPartnershipApplicationsSection filters={{}} onFiltersChange={vi.fn()} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.list.loadMore") }),
        );
        expect(fetchNextPage).toHaveBeenCalled();
    });

    it("renders detail without timestamps and offers only the review transition", async () => {
        renderDialog(detail);
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Atelier Source" })).toBeInTheDocument();
        expect(within(dialog).queryByText(t("adminApplications.fields.created"))).toBeNull();
        expect(within(dialog).queryByText(t("adminApplications.fields.updated"))).toBeNull();
        expect(within(dialog).queryByRole("textbox")).toBeNull();
        expect(within(dialog).queryByRole("combobox")).toBeNull();
        expect(
            within(dialog).queryByRole("button", { name: t("adminApplications.actions.APPROVE") }),
        ).toBeNull();

        await userEvent.click(
            within(dialog).getByRole("button", {
                name: t("adminApplications.actions.markInReview"),
            }),
        );
        expect(mocks.markInReview).toHaveBeenCalledWith("pa_1", expect.any(Object));
    });

    it("shows summary timestamps when available", () => {
        renderDialog(detail, { created: summary.created, updated: summary.updated });
        expect(screen.getByText(t("adminApplications.fields.created"))).toBeInTheDocument();
    });

    it("confirms decisions for applications in review", async () => {
        renderDialog({ ...detail, state: "IN_REVIEW" });
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.markInReview") }),
        ).toBeNull();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.actions.REJECT") }),
        );
        expect(mocks.decide).not.toHaveBeenCalled();
        expect(screen.getByText(t("adminApplications.actions.confirm.REJECT"))).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.actions.REJECT") }),
        );
        expect(mocks.decide).toHaveBeenCalledWith(
            { id: "pa_1", decision: "REJECT" },
            expect.any(Object),
        );
    });

    it("links approved resources and offers no further transitions", () => {
        renderDialog({
            ...detail,
            state: "APPROVED",
            approvedPartnershipId: "pship_1",
            approvedListingSourceId: "ls_1",
        });
        expect(screen.getByText("pship_1")).toBeInTheDocument();
        expect(screen.getByText("ls_1")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminApplications.links.listingSources") }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.APPROVE") }),
        ).toBeNull();
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.markInReview") }),
        ).toBeNull();
    });
});
