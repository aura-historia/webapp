import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { AdminPartnershipDetails } from "@/data/internal/partnership/AdminPartnership.ts";
import { AdminPartnershipDetailDialog } from "../AdminPartnershipDetailDialog.tsx";

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

function mutation(name: string, fn: ReturnType<typeof vi.fn>) {
    return () => ({
        mutateAsync: fn,
        mutate: fn,
        isPending: false,
        error: mocks.errors[name] ?? null,
        reset: vi.fn(),
    });
}

vi.mock("../../api/useAdminPartnerships.ts", () => ({
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

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

const detail: AdminPartnershipDetails = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
    memberCount: 2,
    listingSourceGrantCount: 1,
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
    memberUserIds: ["usr_1", "usr_2"],
    listingSourceIds: ["ls_1"],
};

const t = testI18n.t.bind(testI18n);

function renderDialog(onDissolved = vi.fn()) {
    const user = userEvent.setup();
    render(
        <AdminPartnershipDetailDialog
            partnershipId="psh_01"
            open
            onOpenChange={vi.fn()}
            onDissolved={onDissolved}
        />,
    );
    return { user, dialog: screen.getByRole("dialog"), onDissolved };
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
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.actions.retry") }),
        );
        expect(refetch).toHaveBeenCalled();
    });

    it("shows a loading state while details are pending", () => {
        mocks.detail.mockReturnValue({ data: undefined, isPending: true, error: null });
        const { dialog } = renderDialog();

        expect(within(dialog).getByText(t("adminPartnerships.loadingDetail"))).toBeInTheDocument();
    });

    it("uses a localized close label and target-specific revoke names", () => {
        const { dialog } = renderDialog();

        expect(
            within(dialog).getByRole("button", { name: t("adminPartnerships.detail.close") }),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeMemberFor", { id: "usr_2" }),
            }),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeSourceFor", { id: "ls_1" }),
            }),
        ).toBeInTheDocument();
    });

    it("revokes listed memberships and source grants", async () => {
        const { user, dialog } = renderDialog();

        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeMemberFor", { id: "usr_1" }),
            }),
        );
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeSourceFor", { id: "ls_1" }),
            }),
        );

        expect(mocks.revokeMembership).toHaveBeenCalledWith(
            { partnershipId: "psh_01", userId: "usr_1" },
            expect.anything(),
        );
        expect(mocks.revokeListingSource).toHaveBeenCalledWith(
            { partnershipId: "psh_01", listingSourceId: "ls_1" },
            expect.anything(),
        );
    });

    it("links a member ID validation error to its input", async () => {
        const { user, dialog } = renderDialog();

        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantMembership"),
            }),
        );

        const input = within(dialog).getByLabelText(t("adminPartnerships.members.userId"));
        const error = await within(dialog).findByText(t("adminPartnerships.validation.requiredId"));
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", error.id);
        expect(error).toHaveAttribute("role", "alert");
        expect(mocks.grantMembership).not.toHaveBeenCalled();
    });

    it("grants and revokes a membership by user ID", async () => {
        const { user, dialog } = renderDialog();
        const input = within(dialog).getByLabelText(t("adminPartnerships.members.userId"));

        await user.type(input, " usr_new ");
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantMembership"),
            }),
        );
        expect(mocks.grantMembership).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            userId: "usr_new",
        });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
            t("adminPartnerships.success.memberGranted"),
        );

        await user.type(input, "usr_old");
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeMembership"),
            }),
        );
        expect(mocks.revokeMembership).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            userId: "usr_old",
        });
    });

    it("shows membership mutation errors", () => {
        mocks.errors.grantMembership = new Error("Membership failed");
        const { dialog } = renderDialog();

        expect(within(dialog).getByText("Membership failed")).toHaveAttribute("role", "alert");
    });

    it("grants a listing source after confirming it belongs to the same party", async () => {
        mocks.listingSource.mockImplementation((id?: string) =>
            id ? listingSourceResult("pty_01") : { isPending: true, isFetching: false },
        );
        const { user, dialog } = renderDialog();
        const grant = within(dialog).getByRole("button", {
            name: t("adminPartnerships.actions.grantSource"),
        });

        await user.type(
            within(dialog).getByLabelText(t("adminPartnerships.sources.listingSourceId")),
            "ls_new",
        );
        expect(grant).toBeDisabled();
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.sources.check") }),
        );

        expect(
            within(dialog).getByText(
                t("adminPartnerships.sources.sameParty", {
                    name: "Atelier Online",
                    listingSourceId: "ls_new",
                }),
            ),
        ).toBeInTheDocument();
        expect(grant).toBeEnabled();
        await user.click(grant);
        expect(mocks.grantListingSource).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            listingSourceId: "ls_new",
        });
    });

    it("blocks a listing source grant for a different party", async () => {
        mocks.listingSource.mockImplementation((id?: string) =>
            id ? listingSourceResult("pty_other") : { isPending: true, isFetching: false },
        );
        const { user, dialog } = renderDialog();

        await user.type(
            within(dialog).getByLabelText(t("adminPartnerships.sources.listingSourceId")),
            "ls_new",
        );
        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.sources.check") }),
        );

        expect(
            within(dialog).getByText(t("adminPartnerships.errors.partyConflict")),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.grantSource"),
            }),
        ).toBeDisabled();
    });

    it("revokes a listing source grant by ID", async () => {
        const { user, dialog } = renderDialog();

        await user.type(
            within(dialog).getByLabelText(t("adminPartnerships.sources.listingSourceId")),
            "ls_1",
        );
        await user.click(
            within(dialog).getByRole("button", {
                name: t("adminPartnerships.actions.revokeSource"),
            }),
        );

        expect(mocks.revokeListingSource).toHaveBeenCalledWith({
            partnershipId: "psh_01",
            listingSourceId: "ls_1",
        });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
            t("adminPartnerships.success.listingSourceRevoked"),
        );
    });

    it("dissolves the partnership after confirmation", async () => {
        const { user, dialog, onDissolved } = renderDialog();

        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.actions.dissolve") }),
        );
        const confirm = await screen.findByRole("alertdialog");
        await user.click(
            within(confirm).getByRole("button", {
                name: t("adminPartnerships.actions.confirmDissolve"),
            }),
        );

        expect(mocks.dissolve).toHaveBeenCalledWith({ partnershipId: "psh_01" });
        expect(onDissolved).toHaveBeenCalled();
    });

    it("keeps the confirmation open when dissolution fails", async () => {
        mocks.dissolve.mockRejectedValue(new Error("Dissolve failed"));
        const { user, dialog, onDissolved } = renderDialog();

        await user.click(
            within(dialog).getByRole("button", { name: t("adminPartnerships.actions.dissolve") }),
        );
        const confirm = await screen.findByRole("alertdialog");
        await user.click(
            within(confirm).getByRole("button", {
                name: t("adminPartnerships.actions.confirmDissolve"),
            }),
        );

        expect(onDissolved).not.toHaveBeenCalled();
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
});
