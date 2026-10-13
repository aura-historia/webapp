import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationManager } from "@/data/internal/geography/PartyLocationManager.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyLocationAccessSection } from "../AdminPartyLocationAccessSection.tsx";

type MutateOptions = { onSuccess?: () => void; onSettled?: () => void };

const explicitManager: PartyLocationManager = {
    userId: "usr_explicit",
    email: "grace@example.test",
    firstName: "Grace",
    lastName: "Hopper",
    hasExplicitGrant: true,
    partnershipIds: [],
};
const memberManager: PartyLocationManager = {
    userId: "usr_member",
    email: "member@example.test",
    hasExplicitGrant: false,
    partnershipIds: ["psh_1", "psh_2"],
};

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    reset: vi.fn(),
    refetch: vi.fn(),
    state: { isPending: false, error: null as Error | null },
    list: {
        isPending: false,
        error: null as Error | null,
        managers: [] as PartyLocationManager[],
    },
    selected: {
        isPending: false,
        error: null as Error | null,
        data: null as PartyLocationManager | null,
    },
}));
vi.mock("../../api/usePartyLocationManagers.ts", () => ({
    useSetPartyLocationManagementGrant: () => ({
        mutate: mocks.mutate,
        reset: mocks.reset,
        ...mocks.state,
    }),
    usePartyLocationManagers: () => ({
        isPending: mocks.list.isPending,
        error: mocks.list.error,
        data: { pages: [{ items: mocks.list.managers }] },
        hasNextPage: false,
        refetch: mocks.refetch,
    }),
    usePartyLocationManager: (_partyId: string, userId?: string) => ({
        ...mocks.selected,
        data: userId ? mocks.selected.data : undefined,
        isFetching: false,
        refetch: mocks.refetch,
    }),
}));
vi.mock("@/features/admin/user-management/components/AdminUserPicker.tsx", () => ({
    adminUserDisplayName: (user: { firstName?: string; lastName?: string; email: string }) =>
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    AdminUserPicker: ({
        label,
        onSelect,
    }: {
        label: string;
        onSelect: (user?: { userId: string; email: string; firstName?: string }) => void;
    }) => (
        <button
            type="button"
            onClick={() =>
                onSelect({ userId: "usr_1", email: "ada@example.test", firstName: "Ada" })
            }
        >
            {label}
        </button>
    ),
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const party = {
    partyId: "pty_1",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: {},
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

function selectUser() {
    fireEvent.click(
        screen.getByRole("button", { name: t("adminParties.locationAccess.userLabel") }),
    );
}

function succeedOnMutate() {
    mocks.mutate.mockImplementation((_input: unknown, options: MutateOptions) => {
        options.onSuccess?.();
        options.onSettled?.();
    });
}

describe("AdminPartyLocationAccessSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.state = { isPending: false, error: null };
        mocks.list = { isPending: false, error: null, managers: [] };
        mocks.selected = { isPending: false, error: null, data: null };
    });

    it("lists current managers with each independent access reason", () => {
        mocks.list.managers = [explicitManager, memberManager];
        render(<AdminPartyLocationAccessSection party={party} />);

        expect(
            screen.getByText(
                t("adminParties.locationAccess.description", { name: "Atelier Bleu" }),
            ),
        ).toBeInTheDocument();
        const [grace, member] = screen.getAllByRole("listitem");
        expect(within(grace).getByText("Grace Hopper")).toBeInTheDocument();
        expect(
            within(grace).getByText(t("adminParties.locationAccess.access.explicit")),
        ).toBeInTheDocument();
        expect(
            within(grace).getByRole("button", {
                name: t("adminParties.locationAccess.revokeFor", { user: "Grace Hopper" }),
            }),
        ).toBeInTheDocument();

        expect(within(member).getByText("member@example.test")).toBeInTheDocument();
        expect(
            within(member).getByText(t("adminParties.locationAccess.access.partnership")),
        ).toBeInTheDocument();
        expect(within(member).getByText("psh_1, psh_2")).toBeInTheDocument();
        // Partnership access is managed on the partnership, never revoked from here.
        expect(within(member).queryByRole("button")).toBeNull();
    });

    it("states when nobody can manage the locations", () => {
        render(<AdminPartyLocationAccessSection party={party} />);
        expect(screen.getByText(t("adminParties.locationAccess.empty"))).toBeInTheDocument();
    });

    it("shows a failed manager read with a retry", () => {
        mocks.list.error = new Error(t("adminParties.locationAccess.errors.readFailed"));
        render(<AdminPartyLocationAccessSection party={party} />);

        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(t("adminParties.locationAccess.errors.readFailed"));
        fireEvent.click(
            within(alert).getByRole("button", { name: t("adminParties.actions.retry") }),
        );
        expect(mocks.refetch).toHaveBeenCalled();
    });

    it("grants a selected user without access only after confirmation", () => {
        succeedOnMutate();
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

        expect(
            screen.getByText(t("adminParties.locationAccess.state.none", { user: "Ada" })),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("adminParties.locationAccess.revoke") }),
        ).toBeNull();
        fireEvent.click(
            screen.getByRole("button", { name: t("adminParties.locationAccess.grant") }),
        );
        expect(
            screen.getByText(
                t("adminParties.locationAccess.confirmGrant", {
                    user: "Ada",
                    name: "Atelier Bleu",
                }),
            ),
        ).toBeInTheDocument();
        expect(mocks.mutate).not.toHaveBeenCalled();

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminParties.locationAccess.confirmGrantButton"),
            }),
        );

        expect(mocks.mutate).toHaveBeenCalledWith(
            { partyId: "pty_1", userId: "usr_1", granted: true },
            expect.any(Object),
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            t("adminParties.locationAccess.granted", { user: "Ada", name: "Atelier Bleu" }),
        );
    });

    it("explains partnership access before offering an explicit grant", () => {
        mocks.selected.data = { ...memberManager, userId: "usr_1", email: "ada@example.test" };
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

        expect(
            screen.getByText(t("adminParties.locationAccess.state.partnership", { user: "Ada" })),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: t("adminParties.locationAccess.grant") }),
        ).toBeEnabled();
    });

    it("offers only revocation to a selected user with an explicit grant", () => {
        succeedOnMutate();
        mocks.selected.data = {
            ...explicitManager,
            userId: "usr_1",
            partnershipIds: ["psh_1"],
        };
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

        expect(
            screen.getByText(t("adminParties.locationAccess.state.both", { user: "Ada" })),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("adminParties.locationAccess.grant") }),
        ).toBeNull();
        fireEvent.click(
            screen.getByRole("button", { name: t("adminParties.locationAccess.revoke") }),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminParties.locationAccess.confirmRevokeButton"),
            }),
        );

        expect(mocks.mutate).toHaveBeenCalledWith(
            { partyId: "pty_1", userId: "usr_1", granted: false },
            expect.any(Object),
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            t("adminParties.locationAccess.revoked", { user: "Ada", name: "Atelier Bleu" }),
        );
    });

    it("revokes a listed explicit grant after confirmation", () => {
        succeedOnMutate();
        mocks.list.managers = [explicitManager];
        render(<AdminPartyLocationAccessSection party={party} />);

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminParties.locationAccess.revokeFor", { user: "Grace Hopper" }),
            }),
        );
        expect(
            screen.getByText(
                t("adminParties.locationAccess.confirmRevoke", {
                    user: "Grace Hopper",
                    name: "Atelier Bleu",
                }),
            ),
        ).toBeInTheDocument();
        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminParties.locationAccess.confirmRevokeButton"),
            }),
        );

        expect(mocks.mutate).toHaveBeenCalledWith(
            { partyId: "pty_1", userId: "usr_explicit", granted: false },
            expect.any(Object),
        );
    });

    it("does not send anything when the confirmation is cancelled", () => {
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

        fireEvent.click(
            screen.getByRole("button", { name: t("adminParties.locationAccess.grant") }),
        );
        fireEvent.click(screen.getByRole("button", { name: t("adminParties.actions.cancel") }));

        expect(mocks.mutate).not.toHaveBeenCalled();
        expect(screen.queryByRole("status")).toBeNull();
    });

    it("shows a failed change without reporting a result", () => {
        mocks.state = {
            isPending: false,
            error: new Error(t("adminParties.locationAccess.errors.conflict")),
        };
        render(<AdminPartyLocationAccessSection party={party} />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            t("adminParties.locationAccess.errors.conflict"),
        );
        expect(screen.queryByRole("status")).toBeNull();
    });
});
