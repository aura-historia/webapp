import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type {
    AdminPartnershipDetails,
    AdminPartnershipSummary,
} from "@/data/internal/partnership/AdminPartnership.ts";
import { AdminPartnershipsPage } from "../../pages/AdminPartnershipsPage.tsx";

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    dissolve: vi.fn(),
    grantListingSource: vi.fn(),
    grantMembership: vi.fn(),
    revokeListingSource: vi.fn(),
    revokeMembership: vi.fn(),
}));

vi.mock("../../api/useAdminPartnerships.ts", () => ({
    useAdminPartnerships: mocks.list,
    useAdminPartnership: mocks.detail,
    useDissolveAdminPartnership: () => ({
        mutateAsync: mocks.dissolve,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
    useGrantAdminPartnershipListingSource: () => ({
        mutateAsync: mocks.grantListingSource,
        mutate: mocks.grantListingSource,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
    useGrantAdminPartnershipMembership: () => ({
        mutateAsync: mocks.grantMembership,
        mutate: mocks.grantMembership,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
    useRevokeAdminPartnershipListingSource: () => ({
        mutateAsync: mocks.revokeListingSource,
        mutate: mocks.revokeListingSource,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
    useRevokeAdminPartnershipMembership: () => ({
        mutateAsync: mocks.revokeMembership,
        mutate: mocks.revokeMembership,
        isPending: false,
        error: null,
        reset: vi.fn(),
    }),
}));

vi.mock("@/features/admin/listing-source-management/api/useAdminListingSources.ts", () => ({
    useAdminListingSource: () => ({
        data: undefined,
        isPending: false,
        isFetching: false,
        error: null,
    }),
}));

const summary: AdminPartnershipSummary = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier", name: "Atelier House" },
    memberCount: 120,
    listingSourceGrantCount: 101,
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

const detail: AdminPartnershipDetails = {
    ...summary,
    memberUserIds: Array.from({ length: 100 }, (_, index) => `usr_${index}`),
    listingSourceIds: Array.from({ length: 100 }, (_, index) => `ls_${index}`),
};

describe("admin Partnership management page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockReturnValue({
            data: { pages: [{ items: [summary], pageSize: 21 }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
        mocks.detail.mockReturnValue({ data: detail, isPending: false, error: null });
        mocks.dissolve.mockResolvedValue(undefined);
        mocks.grantListingSource.mockResolvedValue(undefined);
        mocks.grantMembership.mockResolvedValue(undefined);
        mocks.revokeListingSource.mockResolvedValue(undefined);
        mocks.revokeMembership.mockResolvedValue(undefined);
    });

    it("shows loaded result length separately from backend membership and grant counts", async () => {
        const user = userEvent.setup();
        render(<AdminPartnershipsPage />);

        expect(
            screen.getByText(testI18n.t("adminPartnerships.list.loaded", { count: 1 })),
        ).toBeInTheDocument();
        expect(
            screen.getByText(testI18n.t("adminPartnerships.list.members", { count: 120 })),
        ).toBeInTheDocument();
        expect(
            screen.getByText(testI18n.t("adminPartnerships.list.listingSources", { count: 101 })),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(testI18n.t("adminPartnerships.list.loaded", { count: 21 })),
        ).toBeNull();

        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminPartnerships.actions.details") }),
        );
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByText(
                testI18n.t("adminPartnerships.detail.members", { count: 120 }),
            ),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                testI18n.t("adminPartnerships.detail.referencesShown", { shown: 100, count: 120 }),
            ),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                testI18n.t("adminPartnerships.detail.referencesShown", { shown: 100, count: 101 }),
            ),
        ).toBeInTheDocument();
        expect(within(dialog).getByText("120")).toBeInTheDocument();
        expect(within(dialog).getByText("101")).toBeInTheDocument();
    });

    it("requires a source party check before allowing a grant", async () => {
        const user = userEvent.setup();
        render(<AdminPartnershipsPage />);
        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminPartnerships.actions.details") }),
        );
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByRole("button", {
                name: testI18n.t("adminPartnerships.actions.grantSource"),
            }),
        ).toBeDisabled();
        expect(mocks.grantListingSource).not.toHaveBeenCalled();
    });
});
