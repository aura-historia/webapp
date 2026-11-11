import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { AdminOAuthClient } from "@/data/internal/admin/AdminOAuthClient.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ACCESS_TOKEN_SCOPE_GROUPS,
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminOAuthClientFormDialog } from "../AdminOAuthClientFormDialog.tsx";

const api = vi.hoisted(() => ({
    create: vi.fn(),
    update: vi.fn(),
    createReset: vi.fn(),
    updateReset: vi.fn(),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
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

function EditHarness({ client = existingClient }: { readonly client?: AdminOAuthClient }) {
    const [open, setOpen] = useState(true);
    return (
        <AdminOAuthClientFormDialog
            mode="edit"
            client={client}
            open={open}
            onOpenChange={setOpen}
        />
    );
}

function ReopenEditHarness() {
    const [open, setOpen] = useState(true);
    const [client, setClient] = useState<AdminOAuthClient>(existingClient);
    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setClient({ ...existingClient, clientName: "Renamed cabinet integration" });
                    setOpen(true);
                }}
            >
                Reopen latest
            </button>
            <AdminOAuthClientFormDialog
                mode="edit"
                client={client}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}

async function createClient() {
    const values: Record<string, string> = {
        [testI18n.t("adminOAuthClients.fields.name")]: "Cabinet integration",
        [testI18n.t("adminOAuthClients.fields.termsShort")]: "https://cabinet.example/terms",
        [testI18n.t("adminOAuthClients.fields.privacyShort")]: "https://cabinet.example/privacy",
        [testI18n.t("adminOAuthClients.fields.homepageShort")]: "https://cabinet.example",
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
    await screen.findByDisplayValue("plaintext-once");
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
            [testI18n.t("adminOAuthClients.fields.termsShort")]: "https://cabinet.example/terms",
            [testI18n.t("adminOAuthClients.fields.privacyShort")]:
                "https://cabinet.example/privacy",
            [testI18n.t("adminOAuthClients.fields.homepageShort")]: "https://cabinet.example",
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

        expect(await screen.findByDisplayValue("plaintext-once")).toBeTruthy();
        expect(screen.getByDisplayValue("oc_test123")).toBeTruthy();
        expect(api.create).toHaveBeenCalledTimes(1);
        expect(
            screen.getByRole("heading", { name: testI18n.t("adminOAuthClients.secret.title") }),
        ).toBeTruthy();
        // The secret panel has no close button; only Done dismisses it.
        expect(screen.queryByRole("button", { name: testI18n.t("adminCommon.close") })).toBeNull();
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        expect(screen.getByDisplayValue("plaintext-once")).toBeTruthy();
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.done") }),
        );

        expect(screen.queryByDisplayValue("plaintext-once")).toBeNull();
        expect(api.createReset).toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
        expect(
            await screen.findByRole("heading", {
                name: testI18n.t("adminOAuthClients.form.newTitle"),
            }),
        ).toBeTruthy();
        expect(screen.queryByDisplayValue("plaintext-once")).toBeNull();
    });

    it("offers every supported scope grouped, labelled and unselected by default", () => {
        render(<Harness />);

        for (const group of ACCESS_TOKEN_SCOPE_GROUPS) {
            expect(screen.getByText(testI18n.t(group.label))).toBeTruthy();
        }
        for (const scope of ACCESS_TOKEN_SCOPES) {
            const checkbox = screen.getByDisplayValue(scope) as HTMLInputElement;
            expect(checkbox.checked).toBe(false);
            expect(
                checkbox
                    .closest("label")
                    ?.textContent?.includes(testI18n.t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)),
            ).toBe(true);
        }
    });

    it("creates a client with exactly the selected new scopes", async () => {
        render(<Harness />);

        const values: Record<string, string> = {
            [testI18n.t("adminOAuthClients.fields.name")]: "Cabinet integration",
            [testI18n.t("adminOAuthClients.fields.termsShort")]: "https://cabinet.example/terms",
            [testI18n.t("adminOAuthClients.fields.privacyShort")]:
                "https://cabinet.example/privacy",
            [testI18n.t("adminOAuthClients.fields.homepageShort")]: "https://cabinet.example",
            [testI18n.t("adminOAuthClients.fields.logo")]: "https://cabinet.example/logo.svg",
            [testI18n.t("adminOAuthClients.fields.redirectUris")]:
                "https://cabinet.example/oauth/callback",
        };
        for (const [label, value] of Object.entries(values)) {
            fireEvent.change(screen.getByLabelText(label), { target: { value } });
        }
        fireEvent.click(screen.getByDisplayValue("search-filters:write"));
        fireEvent.click(screen.getByDisplayValue("auctions:read"));
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.create") }),
        );

        await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
        expect([...api.create.mock.calls[0][0].scopes].sort()).toEqual([
            "auctions:read",
            "search-filters:write",
        ]);
    });

    it("adds and removes new scopes without touching unrelated fields", async () => {
        render(
            <EditHarness
                client={{ ...existingClient, scopes: ["access-tokens:read", "notifications:read"] }}
            />,
        );

        fireEvent.click(screen.getByDisplayValue("notifications:read"));
        fireEvent.click(screen.getByDisplayValue("partnerships:write"));
        fireEvent.click(screen.getByRole("button", { name: testI18n.t("adminCommon.save") }));

        await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1));
        const { clientId, patch } = api.update.mock.calls[0][0];
        expect(clientId).toBe("oc_test123");
        expect(Object.keys(patch)).toEqual(["scopes"]);
        expect([...patch.scopes].sort()).toEqual(["access-tokens:read", "partnerships:write"]);
    });

    it("omits untouched patch fields and keeps an empty scope list as an intentional change", async () => {
        render(<EditHarness />);

        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.fields.name")), {
            target: { value: "Updated cabinet integration" },
        });
        fireEvent.click(screen.getByDisplayValue("access-tokens:read"));
        fireEvent.click(screen.getByRole("button", { name: testI18n.t("adminCommon.save") }));

        await waitFor(() =>
            expect(api.update).toHaveBeenCalledWith({
                clientId: "oc_test123",
                patch: { clientName: "Updated cabinet integration", scopes: [] },
            }),
        );
    });

    it("resets to the latest client when the same client is edited again", async () => {
        render(<ReopenEditHarness />);
        const nameLabel = testI18n.t("adminOAuthClients.fields.name");
        expect(screen.getByLabelText(nameLabel)).toHaveProperty("value", "Cabinet integration");

        fireEvent.click(screen.getByRole("button", { name: testI18n.t("adminCommon.cancel") }));
        fireEvent.click(screen.getByRole("button", { name: "Reopen latest" }));

        await waitFor(() =>
            expect(screen.getByLabelText(nameLabel)).toHaveProperty(
                "value",
                "Renamed cabinet integration",
            ),
        );
    });

    it("describes redirect URI requirements before and after validation fails", async () => {
        render(<Harness />);
        const textarea = screen.getByLabelText(testI18n.t("adminOAuthClients.fields.redirectUris"));
        expect(textarea).toHaveAccessibleDescription(
            testI18n.t("adminOAuthClients.fields.redirectUrisHint"),
        );

        fireEvent.change(textarea, { target: { value: "http://insecure.example#fragment" } });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.create") }),
        );

        expect(
            await screen.findByText(testI18n.t("adminOAuthClients.validation.redirectInvalid")),
        ).toBeTruthy();
        expect(textarea).toHaveAccessibleDescription(
            `${testI18n.t("adminOAuthClients.fields.redirectUrisHint")} ${testI18n.t("adminOAuthClients.validation.redirectInvalid")}`,
        );
        expect(api.create).not.toHaveBeenCalled();
    });

    it("shows a safe request error when saving fails", async () => {
        api.update.mockRejectedValue(new Error("raw backend detail"));
        render(<EditHarness />);

        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.fields.name")), {
            target: { value: "Updated cabinet integration" },
        });
        fireEvent.click(screen.getByRole("button", { name: testI18n.t("adminCommon.save") }));

        expect(
            await screen.findByText(testI18n.t("adminOAuthClients.errors.requestFailed")),
        ).toBeTruthy();
        expect(screen.queryByText("raw backend detail")).toBeNull();
    });

    it("copies the client secret and reports a clipboard failure", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        render(<Harness />);
        await createClient();

        const secretLabel = testI18n.t("adminOAuthClients.fields.clientSecret");
        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminOAuthClients.secret.copyNamed", { field: secretLabel }),
            }),
        );
        await waitFor(() => expect(writeText).toHaveBeenCalledWith("plaintext-once"));
        expect(
            await screen.findByRole("button", { name: testI18n.t("adminCommon.copied") }),
        ).toBeTruthy();

        writeText.mockRejectedValue(new Error("denied"));
        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminOAuthClients.secret.copyNamed", {
                    field: testI18n.t("adminOAuthClients.fields.clientId"),
                }),
            }),
        );
        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                testI18n.t("adminOAuthClients.secret.copyFailed"),
            ),
        );
    });
});
