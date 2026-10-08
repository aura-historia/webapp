import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminOAuthClientFormDialog } from "../AdminOAuthClientFormDialog.tsx";

const api = vi.hoisted(() => ({
    create: vi.fn(),
    update: vi.fn(),
    createReset: vi.fn(),
    updateReset: vi.fn(),
}));
vi.mock("../../api/useAdminOAuthClients.ts", () => ({
    AdminOAuthClientRequestError: class extends Error {},
    useCreateAdminOAuthClient: () => ({
        mutateAsync: api.create,
        reset: api.createReset,
        isPending: false,
    }),
    useUpdateAdminOAuthClient: () => ({
        mutateAsync: api.update,
        reset: api.updateReset,
        isPending: false,
    }),
}));

function Harness() {
    const [open, setOpen] = useState(true);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Reopen
            </button>
            <AdminOAuthClientFormDialog mode="create" open={open} onOpenChange={setOpen} />
        </>
    );
}

const existingClient = {
    clientId: "oc_test123",
    clientName: "Cabinet integration",
    tosUri: "https://cabinet.example/terms",
    policyUri: "https://cabinet.example/privacy",
    clientUri: "https://cabinet.example",
    logoUri: "https://cabinet.example/logo.svg",
    redirectUris: ["https://cabinet.example/oauth/callback"],
    scopes: ["access-tokens:read"] as const,
    clientIdIssuedAt: 1_759_000_000,
};

function EditHarness() {
    const [open, setOpen] = useState(true);
    return (
        <AdminOAuthClientFormDialog
            mode="edit"
            client={existingClient}
            open={open}
            onOpenChange={setOpen}
        />
    );
}

describe("AdminOAuthClientFormDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.create.mockResolvedValue({
            clientId: "oc_test123",
            clientSecret: "plaintext-once",
        });
    });

    it("shows the create secret once and clears it when the dialog closes", async () => {
        render(<Harness />);

        const values: Record<string, string> = {
            [testI18n.t("adminOAuthClients.fields.name")]: "Cabinet integration",
            [testI18n.t("adminOAuthClients.fields.terms")]: "https://cabinet.example/terms",
            [testI18n.t("adminOAuthClients.fields.privacy")]: "https://cabinet.example/privacy",
            [testI18n.t("adminOAuthClients.fields.homepage")]: "https://cabinet.example",
            [testI18n.t("adminOAuthClients.fields.logo")]: "https://cabinet.example/logo.svg",
            [testI18n.t("adminOAuthClients.fields.redirectUris")]:
                "https://cabinet.example/oauth/callback",
        };
        for (const [label, value] of Object.entries(values)) {
            fireEvent.change(screen.getByLabelText(label), { target: { value } });
        }

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.create") }),
        );

        expect(await screen.findByText("plaintext-once")).toBeTruthy();
        expect(screen.getByText("oc_test123")).toBeTruthy();
        expect(api.create).toHaveBeenCalledTimes(1);
        const closeButtons = screen.getAllByRole("button", {
            name: testI18n.t("adminOAuthClients.actions.close"),
        });
        const closeButton = closeButtons.at(-1);
        if (!closeButton) throw new Error("Expected the dialog close action");
        fireEvent.click(closeButton);

        expect(screen.queryByText("plaintext-once")).toBeNull();
        expect(api.createReset).toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
        expect(
            await screen.findByRole("heading", {
                name: testI18n.t("adminOAuthClients.create.title"),
            }),
        ).toBeTruthy();
        expect(screen.queryByText("plaintext-once")).toBeNull();
    });

    it("omits untouched patch fields and keeps an empty scope list as an intentional change", async () => {
        render(<EditHarness />);

        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.fields.name")), {
            target: { value: "Updated cabinet integration" },
        });
        fireEvent.click(screen.getByDisplayValue("access-tokens:read"));
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.save") }),
        );

        await waitFor(() =>
            expect(api.update).toHaveBeenCalledWith({
                clientId: "oc_test123",
                patch: { clientName: "Updated cabinet integration", scopes: [] },
            }),
        );
    });
});
