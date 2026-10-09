import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyDetailDialog } from "../AdminPartyDetailDialog.tsx";

const api = vi.hoisted(() => ({
    useAdminParty: vi.fn(),
    useDeleteAdminParty: vi.fn(),
}));
vi.mock("../../api/useAdminParties.ts", () => api);

const party = {
    partyId: "party_canonical_1",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: {},
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

function Harness() {
    const [partyId, setPartyId] = useState<string>();
    return (
        <>
            <button type="button" onClick={() => setPartyId(party.partyId)}>
                open
            </button>
            <AdminPartyDetailDialog
                partyId={partyId}
                open={Boolean(partyId)}
                onOpenChange={(open) => {
                    if (!open) setPartyId(undefined);
                }}
                onEdit={vi.fn()}
            />
        </>
    );
}

describe("AdminPartyDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.useAdminParty.mockReturnValue({ data: party, isPending: false, error: null });
        api.useDeleteAdminParty.mockReturnValue({
            mutate: (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
            reset: vi.fn(),
            isPending: false,
            error: null,
        });
    });

    it("clears the delete confirmation after a successful deletion closes the dialog", () => {
        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "open" }));
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminParties.actions.delete") }),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminParties.actions.confirmDeleteButton"),
            }),
        );
        fireEvent.click(screen.getByRole("button", { name: "open" }));

        expect(screen.queryByText(testI18n.t("adminParties.actions.confirmDelete"))).toBeNull();
        expect(
            screen.getByRole("button", { name: testI18n.t("adminParties.actions.delete") }),
        ).toBeTruthy();
    });
});
