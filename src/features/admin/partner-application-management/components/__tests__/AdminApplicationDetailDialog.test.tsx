import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    AdminPartnershipApplication,
    AdminPartnershipApplicationSummary,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminApplicationDetailDialog } from "../AdminApplicationDetailDialog.tsx";

const mocks = vi.hoisted(() => ({
    detail: vi.fn(),
    markInReview: vi.fn(),
    decide: vi.fn(),
    decideError: null as Error | null,
}));
vi.mock("../../api/useAdminPartnershipApplications.ts", () => ({
    AdminApplicationRequestError: class extends Error {
        constructor(
            message: string,
            readonly status: number,
        ) {
            super(message);
        }
    },
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
        error: mocks.decideError,
        reset: vi.fn(),
    }),
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        className,
        to,
        search,
    }: {
        children: ReactNode;
        className?: string;
        to: string;
        search?: Record<string, string>;
    }) => (
        <a href={`${to}?${new URLSearchParams(search).toString()}`} className={className}>
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
        party: { name: "Galerie Lenbach GmbH", email: "office@lenbach.example" },
        listingSource: {
            name: "Galerie Lenbach",
            listingSourceType: "DEALER",
            url: "https://www.galerie-lenbach.example",
            requestedIngestionMethods: ["WEB_CRAWL", "PARTNER_API"],
        },
    },
};
const summary: AdminPartnershipApplicationSummary = {
    ...detail,
    created: new Date("2026-11-03T14:08:00Z"),
    updated: new Date("2026-11-06T09:21:00Z"),
};

function renderDialog(
    application: AdminPartnershipApplication,
    openingSummary?: AdminPartnershipApplicationSummary,
) {
    mocks.detail.mockReturnValue({
        data: application,
        isPending: false,
        error: null,
        refetch: vi.fn(),
    });
    return render(
        <AdminApplicationDetailDialog
            applicationId={application.id}
            summary={openingSummary}
            onClose={vi.fn()}
        />,
    );
}

describe("AdminApplicationDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.decideError = null;
    });

    it("shows the read-only proposal and offers only Start review while submitted", async () => {
        renderDialog(detail);
        const dialog = screen.getByRole("dialog", { name: "Galerie Lenbach" });
        expect(
            within(dialog).getByText(t("adminApplications.detail.eyebrow.PROPOSED_LISTING_SOURCE")),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(t("adminApplications.state.SUBMITTED")),
        ).toBeInTheDocument();
        // The detail response has no timestamps; they only come from the opening row.
        expect(within(dialog).queryByText(t("adminApplications.fields.created"))).toBeNull();
        const type = within(dialog).getByText(t("adminApplications.proposal.type"));
        expect(type.nextElementSibling).toHaveTextContent(t("listingSourceTypes.DEALER"));
        expect(within(dialog).getByText("https://www.galerie-lenbach.example").tagName).toBe("DD");
        expect(within(dialog).queryByRole("link")).toBeNull();
        expect(within(dialog).queryByRole("textbox")).toBeNull();
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

    it("shows the opening row's timestamps", () => {
        renderDialog(detail, summary);
        expect(screen.getByText(t("adminApplications.fields.created"))).toBeInTheDocument();
        expect(screen.getByText(t("adminApplications.fields.updated"))).toBeInTheDocument();
    });

    it("confirms a rejection inline before sending it", async () => {
        renderDialog({ ...detail, state: "IN_REVIEW" });
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.markInReview") }),
        ).toBeNull();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.actions.REJECT") }),
        );
        expect(mocks.decide).not.toHaveBeenCalled();
        const confirm = screen.getByRole("group", {
            name: t("adminApplications.actions.confirmReject"),
        });
        expect(
            within(confirm).getByRole("button", { name: t("adminCommon.cancel") }),
        ).toHaveFocus();
        await userEvent.click(
            within(confirm).getByRole("button", { name: t("adminApplications.actions.REJECT") }),
        );
        expect(mocks.decide).toHaveBeenCalledWith(
            { id: "pa_1", decision: "REJECT" },
            expect.any(Object),
        );
    });

    it("returns focus to Approve when its confirmation is cancelled", async () => {
        renderDialog({ ...detail, state: "IN_REVIEW" });
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.actions.APPROVE") }),
        );
        expect(
            screen.getByRole("group", { name: t("adminApplications.actions.confirmApprove") }),
        ).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: t("adminCommon.cancel") }));
        expect(mocks.decide).not.toHaveBeenCalled();
        expect(
            screen.getByRole("button", { name: t("adminApplications.actions.APPROVE") }),
        ).toHaveFocus();
    });

    it("shows a conflict in place", async () => {
        const { AdminApplicationRequestError } = await import(
            "../../api/useAdminPartnershipApplications.ts"
        );
        mocks.decideError = new AdminApplicationRequestError(
            t("adminApplications.errors.conflictReloaded"),
            409,
        );
        renderDialog({ ...detail, state: "IN_REVIEW" });
        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminApplications.errors.conflictReloaded"),
        );
    });

    it("links the approved partnership and listing source and offers no transitions", () => {
        renderDialog({
            ...detail,
            state: "APPROVED",
            approvedPartnershipId: "pship_1",
            approvedListingSourceId: "ls_1",
        });
        expect(screen.getByText("pship_1")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminApplications.links.partnership") }),
        ).toHaveAttribute("href", "/$lng/admin/partnerships?partnership=pship_1");
        expect(
            screen.getByRole("link", { name: t("adminApplications.links.listingSource") }),
        ).toHaveAttribute("href", "/$lng/admin/listing-sources?source=ls_1");
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.APPROVE") }),
        ).toBeNull();
        expect(
            screen.queryByRole("button", { name: t("adminApplications.actions.markInReview") }),
        ).toBeNull();
    });

    it("titles an existing-provider application by its listing source ID", () => {
        renderDialog({
            ...detail,
            proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_existing" },
        });
        expect(screen.getByRole("dialog", { name: "ls_existing" })).toBeInTheDocument();
        expect(
            screen.getByText(t("adminApplications.detail.eyebrow.EXISTING_LISTING_SOURCE")),
        ).toBeInTheDocument();
    });
});
