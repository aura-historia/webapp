import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyFormDialog } from "../AdminPartyFormDialog.tsx";

const api = vi.hoisted(() => ({
    useCreateAdminParty: vi.fn(),
    useUpdateAdminParty: vi.fn(),
}));
vi.mock("../../api/useAdminParties.ts", () => api);

const idleMutation = { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null };

function Harness() {
    const [open, setOpen] = useState(true);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                reopen
            </button>
            <AdminPartyFormDialog open={open} onOpenChange={setOpen} />
        </>
    );
}

describe("AdminPartyFormDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.useCreateAdminParty.mockReturnValue(idleMutation);
        api.useUpdateAdminParty.mockReturnValue(idleMutation);
    });

    it("clears abandoned values before the dialog reopens", () => {
        render(<Harness />);
        const nameLabel = testI18n.t("adminParties.fields.name");

        fireEvent.change(screen.getByLabelText(nameLabel), {
            target: { value: "Atelier Bleu" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminParties.actions.cancel") }),
        );
        fireEvent.click(screen.getByRole("button", { name: "reopen" }));

        expect((screen.getByLabelText(nameLabel) as HTMLInputElement).value).toBe("");
    });
});
