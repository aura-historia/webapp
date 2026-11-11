import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminPartnershipDetails } from "@/data/internal/partnership/AdminPartnership.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartnershipDetailDialog } from "../AdminPartnershipDetailDialog.tsx";

type MutateOptions = { onSuccess?: () => void; onSettled?: () => void };

const mocks = vi.hoisted(() => ({
    detail: vi.fn(),
    listingSource: vi.fn(),
    dissolve: vi.fn(),
    grantListingSource: vi.fn(),
    grantMembership: vi.fn(),
    revokeListingSource: vi.fn(),
    revokeMembership: vi.fn(),
    errors: {} as Record<string, Error | null>,
    toastSuccess: vi.fn(),
}));

function mutation(name: string, fn: (input: unknown) => unknown) {
    return () => ({
        mutateAsync: fn,
        mutate: (input: unknown, options?: MutateOptions) => {
            fn(input);
            if (!mocks.errors[name]) options?.onSuccess?.();
            options?.onSettled?.();
        },
        isPending: false,
        error: mocks.errors[name] ?? null,
        reset: vi.fn(),
    });
}

vi.mock("../../api/useAdminPartnerships.ts", () => ({
    AdminPartnershipRequestError: class extends Error {
        constructor(
            message: string,
            readonly status: number,
        ) {
            super(message);
        }
    },
    useAdminPartnership: mocks.detail,
    useDissolveAdminPartnership: mutation("dissolve", mocks.dissolve),
    useGrantAdminPartnershipListingSource: mutation("grantListingSource", mocks.grantListingSource),
    useGrantAdminPartnershipMembership: mutation("grantMembership", mocks.grantMembership),
    useRevokeAdminPartnershipListingSource: mutation(
        "revokeListingSource",
        mocks.revokeListingSource,
    ),
    useRevokeAdminPartnershipMembership: mutation("revokeMembership", mocks.revokeMembership),
}));

vi.mock("@/features/admin/listing-source-management/api/useAdminListingSources.ts", () => ({
    useAdminListingSource: mocks.listingSource,
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        className,
        params,
    }: {
        children: ReactNode;
        className?: string;
        params: (previous: Record<string, string>) => Record<string, string>;
    }) => (
        <a href={`/admin/parties/${params({}).partyId}`} className={className}>
            {children}
        </a>
    ),
}));

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

const detail: AdminPartnershipDetails = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
    memberCount: 120,
    listingSourceGrantCount: 1,
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
    memberUserIds: ["usr_1", "usr_2"],
    listingSourceIds: ["ls_1"],
};

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

function renderDialog(onClose = vi.fn()) {
    const user = userEvent.setup();
    render(<AdminPartnershipDetailDialog partnershipId="psh_01" onClose={onClose} />);
    return { user, dialog: screen.getByRole("dialog"), onClose };
}

function listingSourceResult(partyId: string) {
    return {
        data: { listingSourceId: "ls_new", name: "Atelier Online", operator: { partyId } },
        isPending: false,
        isFetching: false,
        error: null,
    };
}

describe("AdminPartnershipDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.errors = {};
        mocks.detail.mockReturnValue({ data: detail, isPending: false, error: null });
        mocks.listingSource.mockReturnValue({
            data: undefined,
            isPending: true,
            isFetching: false,
            error: null,
        });
        for (const fn of [
            mocks.dissolve,
            mocks.grantListingSource,
            mocks.grantMembership,
            mocks.revokeListingSource,
            mocks.revokeMembership,
        ]) {
            fn.mockResolvedValue(undefined);
        }
    });

    it("shows a retry action when the detail request fails", async () => {
        const refetch = vi.fn();
        mocks.detail.mockReturnValue({
            data: undefined,
            isPending: false,
            error: new Error("Detail failed"),
            refetch,
        });
        const { user, dialog } = renderDialog();

        expect(within(dialog).getByRole("alert")).toHaveTextContent("Detail failed");
        await user.click(within(dialog).getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("shows the organization, its link and complete counts beside the shown IDs", () => {
        const { dialog } = renderDialog();
        expect(within(dialog).getByRole("heading", { name: "Atelier House" })).toBeInTheDocument();
        expect(
            within(dialog).getByRole("link", {
                name: t("adminPartnerships.detail.organizationLink"),
            }),
        ).toHaveAttribute("href", "/admin/parties/pty_01");
        expect(within(dialog).getByText("120")).toBeInTheDocument();
        expect(
            within(dialog).getByText(t("adminPartnerships.detail.shown", { shown: 2, count: 120 })),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(t("adminPartnerships.detail.shown", { shown: 1, count: 1 })),
        ).toBeInTheDocument();
    });

    it("revokes a listed membership only after confirming in its row", async () => {
        const { user, dialog } = renderDialog();
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeMemberFor", { id: "usr_1" }),
            }),
        );
        expect(mocks.revokeMembership).not.toHaveBeenCalled();
        const confirm = within(dialog).getByRole("group", {
            name: t("adminPartnerships.members.confirmRevoke"),
        });
        expect(
            within(confirm).getByRole("button", { name: t("adminCommon.cancel") }),
        ).toHaveFocus();
        await user.click(
            within(confirm).getByRole("button", { name: t("adminPartnerships.actions.revoke") }),
        );
        expect(mocks.revokeMembership).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            userId: "usr_1",
        });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
            t("adminPartnerships.success.memberRevoked"),
        );
    });

    it("returns focus to the row's Revoke when its confirmation is cancelled", async () => {
        const { user, dialog } = renderDialog();
        const revoke = within(dialog).getByRole("button", {
            name: t("adminPartnerships.actions.revokeSourceFor", { id: "ls_1" }),
        });
        await user.click(revoke);
        await user.click(within(dialog).getByRole("button", { name: t("adminCommon.cancel") }));
        expect(mocks.revokeListingSource).not.toHaveBeenCalled();
        expect(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeSourceFor", { id: "ls_1" }),
            }),
        ).toHaveFocus();
    });

    it("links a member ID validation error to its input", async () => {
        const { user, dialog } = renderDialog();
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantMembership"),
            }),
        );
        const input = within(dialog).getByLabelText(t("adminPartnerships.members.userId"));
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription(t("adminPartnerships.validation.requiredId"));
        expect(mocks.grantMembership).not.toHaveBeenCalled();
    });

    it("grants and revokes a membership by user ID", async () => {
        const { user, dialog } = renderDialog();
        const input = within(dialog).getByLabelText(t("adminPartnerships.members.userId"));
        await user.type(input, " usr_3 ");
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantMembership"),
            }),
        );
        expect(mocks.grantMembership).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            userId: "usr_3",
        });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
            t("adminPartnerships.success.memberGranted"),
        );

        await user.type(input, "usr_2");
        const form = input.closest("form") as HTMLFormElement;
        await user.click(
            within(form).getByRole("button", { name: t("adminPartnerships.actions.revoke") }),
        );
        expect(mocks.revokeMembership).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            userId: "usr_2",
        });
    });

    it("shows membership mutation errors", () => {
        mocks.errors.grantMembership = new Error("Membership failed");
        const { dialog } = renderDialog();
        expect(within(dialog).getByRole("alert")).toHaveTextContent("Membership failed");
    });

    it("grants a listing source after checking it belongs to the same organization", async () => {
        const { user, dialog } = renderDialog();
        await user.type(
            within(dialog).getByLabelText(t("adminPartnerships.sources.listingSourceId")),
            "ls_new",
        );
        mocks.listingSource.mockReturnValue(listingSourceResult("pty_01"));
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.sources.check") }),
        );
        expect(mocks.listingSource).toHaveBeenLastCalledWith("ls_new", true);
        expect(
            within(dialog).getByText(
                t("adminPartnerships.sources.sameOrganization", { name: "Atelier Online" }),
            ),
        ).toBeInTheDocument();
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantSource"),
            }),
        );
        expect(mocks.grantListingSource).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            listingSourceId: "ls_new",
        });
    });

    it("blocks a listing source grant for another organization", async () => {
        const { user, dialog } = renderDialog();
        await user.type(
            within(dialog).getByLabelText(t("adminPartnerships.sources.listingSourceId")),
            "ls_new",
        );
        mocks.listingSource.mockReturnValue(listingSourceResult("pty_other"));
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.sources.check") }),
        );
        expect(within(dialog).getByRole("alert")).toHaveTextContent(
            t("adminPartnerships.sources.otherOrganization"),
        );
        expect(
            within(dialog).queryByRole("button", {
                name: t("adminPartnerships.actions.grantSource"),
            }),
        ).toBeNull();
        expect(mocks.grantListingSource).not.toHaveBeenCalled();
    });

    it("dissolves the partnership after confirmation", async () => {
        const { user, dialog, onClose } = renderDialog();
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.actions.dissolve") }),
        );
        const confirm = await screen.findByRole("alertdialog", {
            name: t("adminPartnerships.dissolution.confirmQuestion"),
        });
        expect(confirm).toHaveTextContent(
            t("adminPartnerships.dissolution.removes", {
                memberships: t("adminPartnerships.dissolution.memberships", { count: 120 }),
                grants: t("adminPartnerships.dissolution.grants", { count: 1 }),
            }),
        );
        expect(mocks.dissolve).not.toHaveBeenCalled();
        await user.click(
            within(confirm).getByRole("button", {
                name: t("adminPartnerships.actions.confirmDissolve"),
            }),
        );
        expect(mocks.dissolve).toHaveBeenCalledWith({ partnershipId: "psh_01" });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(t("adminPartnerships.success.dissolved"));
        expect(onClose).toHaveBeenCalled();
    });

    it("keeps the confirmation open when dissolution fails", async () => {
        mocks.errors.dissolve = new Error("Dissolution failed");
        const { user, dialog, onClose } = renderDialog();
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.actions.dissolve") }),
        );
        const confirm = await screen.findByRole("alertdialog");
        await user.click(
            within(confirm).getByRole("button", {
                name: t("adminPartnerships.actions.confirmDissolve"),
            }),
        );
        expect(screen.getByRole("alertdialog")).toHaveTextContent("Dissolution failed");
        expect(onClose).not.toHaveBeenCalled();
    });
});
