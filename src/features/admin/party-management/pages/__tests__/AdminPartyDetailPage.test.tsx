import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyDetailPage } from "../AdminPartyDetailPage.tsx";

const mocks = vi.hoisted(() => ({
    useAdminParty: vi.fn(),
    deleteParty: vi.fn(),
    navigate: vi.fn(),
    workspace: vi.fn(),
}));
vi.mock("../../api/useAdminParties.ts", () => ({
    useAdminParty: mocks.useAdminParty,
    useDeleteAdminParty: () => ({
        mutate: mocks.deleteParty,
        reset: vi.fn(),
        isPending: false,
        error: null,
    }),
}));
vi.mock("../../components/AdminPartyFormDialog.tsx", () => ({
    AdminPartyFormDialog: ({ open, party }: { open: boolean; party: { name: string } }) =>
        open ? <div role="dialog">edit form for {party.name}</div> : null,
}));
vi.mock("../../components/AdminPartyLocationAccessSection.tsx", () => ({
    AdminPartyLocationAccessSection: ({ party }: { party: { name: string } }) => (
        <section>location access for {party.name}</section>
    ),
}));
vi.mock("@/features/party-locations/components/PartyLocationWorkspace.tsx", () => ({
    PartyLocationWorkspace: (props: { scope: unknown }) => {
        mocks.workspace(props.scope);
        return <section>locations</section>;
    },
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "admin-1" } }),
}));
vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mocks.navigate,
    Link: ({ children }: { children: ReactNode }) => <a href="/en/admin/parties">{children}</a>,
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const party = {
    partyId: "pty_1",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: { email: "info@example.test" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

describe("AdminPartyDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useAdminParty.mockReturnValue({ data: party, isPending: false, error: null });
    });

    it("shows the organization and its locations on one page", () => {
        render(<AdminPartyDetailPage partyId="pty_1" language="en" />);

        expect(screen.getByRole("heading", { level: 1, name: "Atelier Bleu" })).toBeInTheDocument();
        expect(screen.getByText("info@example.test")).toBeInTheDocument();
        expect(screen.getByText("atelier-bleu")).toBeInTheDocument();
        expect(screen.getByText("locations")).toBeInTheDocument();
        expect(screen.getByText("location access for Atelier Bleu")).toBeInTheDocument();
        expect(mocks.workspace).toHaveBeenCalledWith({
            viewerCacheKey: "admin-1",
            partyId: "pty_1",
        });

        fireEvent.click(screen.getByRole("button", { name: t("adminParties.actions.edit") }));
        expect(screen.getByRole("dialog")).toHaveTextContent("edit form for Atelier Bleu");
    });

    it("keeps editing the organization as it was when editing began", () => {
        const view = render(<AdminPartyDetailPage partyId="pty_1" language="en" />);
        fireEvent.click(screen.getByRole("button", { name: t("adminParties.actions.edit") }));

        // A background refetch must not replace the draft the form was opened with.
        const renamed = { ...party, name: "Atelier Rouge", updated: new Date("2026-09-03") };
        mocks.useAdminParty.mockReturnValue({ data: renamed, isPending: false, error: null });
        view.rerender(<AdminPartyDetailPage partyId="pty_1" language="en" />);

        expect(
            screen.getByRole("heading", { level: 1, name: "Atelier Rouge" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("dialog")).toHaveTextContent("edit form for Atelier Bleu");
    });

    it("deletes only after confirmation and returns to the organization list", () => {
        mocks.deleteParty.mockImplementation((_id: string, options: { onSuccess: () => void }) =>
            options.onSuccess(),
        );
        render(<AdminPartyDetailPage partyId="pty_1" language="en" />);

        fireEvent.click(screen.getByRole("button", { name: t("adminParties.actions.delete") }));
        expect(
            screen.getByText(t("adminParties.page.deleteTitle", { name: "Atelier Bleu" })),
        ).toBeInTheDocument();
        expect(mocks.deleteParty).not.toHaveBeenCalled();
        fireEvent.click(
            screen.getByRole("button", { name: t("adminParties.actions.confirmDeleteButton") }),
        );

        expect(mocks.deleteParty).toHaveBeenCalledWith("pty_1", expect.any(Object));
        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/admin/parties",
            params: { lng: "en" },
        });
    });

    it("does not load locations when the organization is unavailable", () => {
        mocks.useAdminParty.mockReturnValue({
            data: undefined,
            isPending: false,
            error: new Error(t("adminParties.errors.missing")),
            refetch: vi.fn(),
        });
        render(<AdminPartyDetailPage partyId="pty_1" language="en" />);

        expect(screen.getByText(t("adminParties.errors.missing"))).toBeInTheDocument();
        expect(mocks.workspace).not.toHaveBeenCalled();
        expect(screen.queryByText(/location access for/)).toBeNull();
    });
});
