import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyLocationAccessSection } from "../AdminPartyLocationAccessSection.tsx";

type MutateOptions = { onSuccess?: () => void; onSettled?: () => void };

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    reset: vi.fn(),
    state: { isPending: false, error: null as Error | null },
}));
vi.mock("../../api/usePartyLocationManagementGrant.ts", () => ({
    useSetPartyLocationManagementGrant: () => ({
        mutate: mocks.mutate,
        reset: mocks.reset,
        ...mocks.state,
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

describe("AdminPartyLocationAccessSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.state = { isPending: false, error: null };
    });

    it("explains the grant's independence and never claims a current state or manager list", () => {
        render(<AdminPartyLocationAccessSection party={party} />);

        expect(
            screen.getByText(
                t("adminParties.locationAccess.description", { name: "Atelier Bleu" }),
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(t("adminParties.locationAccess.noList"))).toBeInTheDocument();
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.queryByRole("list")).toBeNull();
        expect(
            screen.getByRole("button", { name: t("adminParties.locationAccess.grant") }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: t("adminParties.locationAccess.revoke") }),
        ).toBeDisabled();
    });

    it("grants only after confirmation and reports the confirmed action", () => {
        mocks.mutate.mockImplementation((_input: unknown, options: MutateOptions) => {
            options.onSuccess?.();
            options.onSettled?.();
        });
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

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

    it("revokes only the explicit grant and keeps partnership access out of the claim", () => {
        mocks.mutate.mockImplementation((_input: unknown, options: MutateOptions) => {
            options.onSuccess?.();
            options.onSettled?.();
        });
        render(<AdminPartyLocationAccessSection party={party} />);
        selectUser();

        fireEvent.click(
            screen.getByRole("button", { name: t("adminParties.locationAccess.revoke") }),
        );
        expect(
            screen.getByText(
                t("adminParties.locationAccess.confirmRevoke", {
                    user: "Ada",
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
            { partyId: "pty_1", userId: "usr_1", granted: false },
            expect.any(Object),
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            t("adminParties.locationAccess.revoked", { user: "Ada", name: "Atelier Bleu" }),
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
